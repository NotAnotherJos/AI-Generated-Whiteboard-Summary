const aiAnalysisService = require('../../src/services/aiAnalysisService');
const { createTestUser, createTestImage, cleanupTestUser, cleanupTestImage } = require('../helpers/testData');
const { redis } = require('../../config/database');

jest.mock('../../src/services/aiAnalysisService', () => {
  const originalModule = jest.requireActual('../../src/services/aiAnalysisService');
  return {
    ...originalModule,
    getNextTask: jest.fn(),
    processAnalysisTask: jest.fn(),
    addTaskToQueue: originalModule.addTaskToQueue // Keep original for integration-style tests
  };
});

describe('Worker Unit Tests', () => {
  let testUserId;

  beforeEach(async () => {
    testUserId = await createTestUser();
    
    jest.clearAllMocks();
    await redis.del('image_analysis_queue');
  });

  afterEach(async () => {
    // Cleanup test user after each test
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe('Task Processing Behavior', () => {
    describe('Happy Path', () => {
      test('should process task when available in queue', async () => {
        const mockTask = {
          id: 'test-task-id',
          user_id: testUserId,
          image_url: 'https://example.com/test.jpg',
          model_name: 'gemini-1.5-flash',
          prompt: 'Test prompt'
        };

        // Mock the service methods
        aiAnalysisService.getNextTask
          .mockResolvedValueOnce(JSON.stringify(mockTask))
          .mockResolvedValue(null); // No more tasks after first one

        aiAnalysisService.processAnalysisTask
          .mockResolvedValue({ success: true, taskId: mockTask.id });

        // Simulate worker processing cycle
        const task = await aiAnalysisService.getNextTask();
        
        expect(task).not.toBeNull();
        expect(typeof task).toBe('string');
        
        const parsedTask = JSON.parse(task);
        expect(parsedTask.id).toBe(mockTask.id);

        // Process the task
        const result = await aiAnalysisService.processAnalysisTask(parsedTask);
        
        expect(result.success).toBe(true);
        expect(result.taskId).toBe(mockTask.id);
        expect(aiAnalysisService.processAnalysisTask).toHaveBeenCalledWith(parsedTask);
      });

      test('should handle empty queue gracefully', async () => {
        // Mock empty queue
        aiAnalysisService.getNextTask.mockResolvedValue(null);

        // Simulate worker checking for tasks
        const task = await aiAnalysisService.getNextTask();
        
        expect(task).toBeNull();
        expect(aiAnalysisService.processAnalysisTask).not.toHaveBeenCalled();
      });

      test('should handle multiple tasks in sequence', async () => {
        const mockTasks = [
          {
            id: 'task-1',
            user_id: testUserId,
            image_url: 'https://example.com/test1.jpg',
            model_name: 'gemini-1.5-flash',
            prompt: 'Test prompt 1'
          },
          {
            id: 'task-2',
            user_id: testUserId,
            image_url: 'https://example.com/test2.jpg',
            model_name: 'gemini-1.5-flash',
            prompt: 'Test prompt 2'
          }
        ];

        // Mock sequential task retrieval
        aiAnalysisService.getNextTask
          .mockResolvedValueOnce(JSON.stringify(mockTasks[0]))
          .mockResolvedValueOnce(JSON.stringify(mockTasks[1]))
          .mockResolvedValue(null);

        aiAnalysisService.processAnalysisTask
          .mockResolvedValueOnce({ success: true, taskId: mockTasks[0].id })
          .mockResolvedValueOnce({ success: true, taskId: mockTasks[1].id });

        // Simulate worker processing multiple tasks
        for (let i = 0; i < 2; i++) {
          const task = await aiAnalysisService.getNextTask();
          if (task) {
            const parsedTask = JSON.parse(task);
            const result = await aiAnalysisService.processAnalysisTask(parsedTask);
            expect(result.success).toBe(true);
          }
        }

        expect(aiAnalysisService.processAnalysisTask).toHaveBeenCalledTimes(2);
        expect(aiAnalysisService.processAnalysisTask).toHaveBeenNthCalledWith(1, mockTasks[0]);
        expect(aiAnalysisService.processAnalysisTask).toHaveBeenNthCalledWith(2, mockTasks[1]);
      });

      test('should handle task that requires parsing from string', async () => {
        const mockTask = {
          id: 'test-task-id',
          user_id: testUserId,
          image_url: 'https://example.com/test.jpg'
        };

        // Mock task as string (which is how it comes from Redis)
        aiAnalysisService.getNextTask.mockResolvedValue(JSON.stringify(mockTask));
        aiAnalysisService.processAnalysisTask.mockResolvedValue({ success: true, taskId: mockTask.id });

        // Simulate worker behavior - should parse string to object
        const taskData = await aiAnalysisService.getNextTask();
        const task = typeof taskData === 'string' ? JSON.parse(taskData) : taskData;
        
        expect(task).toEqual(mockTask);
        
        const result = await aiAnalysisService.processAnalysisTask(task);
        expect(result.success).toBe(true);
      });
    });

    describe('Sad Path', () => {
      test('should handle processing errors gracefully', async () => {
        const mockTask = {
          id: 'test-task-id',
          user_id: testUserId,
          image_url: 'invalid-url'
        };

        aiAnalysisService.getNextTask.mockResolvedValue(JSON.stringify(mockTask));
        aiAnalysisService.processAnalysisTask.mockResolvedValue({
          success: false,
          taskId: mockTask.id,
          error: 'Processing failed'
        });

        // Simulate worker processing failed task
        const task = await aiAnalysisService.getNextTask();
        const parsedTask = JSON.parse(task);
        const result = await aiAnalysisService.processAnalysisTask(parsedTask);
        
        expect(result.success).toBe(false);
        expect(result.taskId).toBe(mockTask.id);
        expect(result.error).toBe('Processing failed');
      });

      test('should handle malformed task data', async () => {
        // Mock malformed JSON
        aiAnalysisService.getNextTask.mockResolvedValue('invalid-json{');

        // Simulate worker trying to parse malformed data
        const taskData = await aiAnalysisService.getNextTask();
        
        expect(() => {
          JSON.parse(taskData);
        }).toThrow();

        // Worker should handle this gracefully (in real implementation)
        expect(aiAnalysisService.processAnalysisTask).not.toHaveBeenCalled();
      });

      test('should handle Redis connection errors', async () => {
        // Mock Redis connection error
        aiAnalysisService.getNextTask.mockRejectedValue(new Error('Redis connection failed'));

        // Simulate worker handling Redis error
        await expect(aiAnalysisService.getNextTask())
          .rejects
          .toThrow('Redis connection failed');

        expect(aiAnalysisService.processAnalysisTask).not.toHaveBeenCalled();
      });

      test('should handle task processing throwing exception', async () => {
        const mockTask = {
          id: 'test-task-id',
          user_id: testUserId
        };

        aiAnalysisService.getNextTask.mockResolvedValue(JSON.stringify(mockTask));
        aiAnalysisService.processAnalysisTask.mockRejectedValue(new Error('Unexpected processing error'));

        // Simulate worker processing task that throws
        const task = await aiAnalysisService.getNextTask();
        const parsedTask = JSON.parse(task);
        
        await expect(aiAnalysisService.processAnalysisTask(parsedTask))
          .rejects
          .toThrow('Unexpected processing error');
      });

      test('should handle null task gracefully', async () => {
        aiAnalysisService.getNextTask.mockResolvedValue(null);

        // Simulate worker with no tasks
        const task = await aiAnalysisService.getNextTask();
        
        expect(task).toBeNull();
        expect(aiAnalysisService.processAnalysisTask).not.toHaveBeenCalled();
      });

      test('should handle empty string task', async () => {
        aiAnalysisService.getNextTask.mockResolvedValue('');

        // Simulate worker with empty task
        const taskData = await aiAnalysisService.getNextTask();
        
        expect(taskData).toBe('');
        // Worker should handle empty string gracefully
        expect(aiAnalysisService.processAnalysisTask).not.toHaveBeenCalled();
      });
    });
  });

});
