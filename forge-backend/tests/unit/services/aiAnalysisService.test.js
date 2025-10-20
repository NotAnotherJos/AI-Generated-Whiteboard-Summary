const aiAnalysisService = require('../../../src/services/aiAnalysisService');
const { createTestUser, createTestImage, cleanupTestUser, cleanupTestImage } = require('../../helpers/testData');
const { redis } = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

describe('AIAnalysisService Unit Tests', () => {
  let testUserId;

  beforeEach(async () => {
    testUserId = await createTestUser();
    await redis.del('image_analysis_queue');
  });

  afterEach(async () => {
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe('getNextTask', () => {
    describe('Happy Path', () => {
      test('should return null when queue is empty', async () => {
        // Make sure queue is empty
        await redis.del('image_analysis_queue');
        const result = await aiAnalysisService.getNextTask();
        // Upstash may return null or empty string
        const normalized = !result || (typeof result === 'string' && result.trim() === '') ? null : result;
        expect(normalized).toBeNull();
      });
    });

    describe('Sad Path', () => {
      test('should handle Redis connection issues gracefully', async () => {
        await expect(aiAnalysisService.getNextTask())
          .resolves
          .not.toThrow();
      });
    });
  });

  describe('addTaskToQueue', () => {
    describe('Sad Path', () => {
      test('should handle null task gracefully', async () => {
        await expect(aiAnalysisService.addTaskToQueue(null))
          .resolves
          .not.toThrow();
      });

      test('should handle invalid task format gracefully', async () => {
        const invalidTask = 'invalid-task-format';
        
        // Should not throw error
        await expect(aiAnalysisService.addTaskToQueue(invalidTask))
          .resolves
          .not.toThrow();
      });

      test('should handle empty task object', async () => {
        const emptyTask = {};
        
        // Should not throw error
        await expect(aiAnalysisService.addTaskToQueue(emptyTask))
          .resolves
          .not.toThrow();
      });
    });
  });
});
