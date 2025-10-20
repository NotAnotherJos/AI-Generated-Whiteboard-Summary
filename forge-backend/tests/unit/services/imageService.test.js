const path = require('path');
const fs = require('fs');
const imageService = require('../../../src/services/imageService');
const { redis } = require('../../../config/database');
const { createTestUser, createTestImage, cleanupTestUser, cleanupTestImage } = require('../../helpers/testData');

describe('ImageService Unit Tests', () => {
  let testUserId;
  const testImagePath = path.join(__dirname, '../../fixtures/test.png');

  beforeEach(async () => {
    testUserId = await createTestUser();
    await redis.del('image_analysis_queue');
  });

  afterEach(async () => {
    // Cleanup test user after each test
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe('createImageAnalysisTask', () => {
    describe('Happy Path', () => {
      test('should create image analysis task successfully with all fields', async () => {
        if (!fs.existsSync(testImagePath)) {
          console.warn('Test image not found, skipping createImageAnalysisTask test');
          return;
        }

        const fileBuffer = fs.readFileSync(testImagePath);
        const mockFile = {
          buffer: fileBuffer,
          mimetype: 'image/png',
          originalname: 'test.png'
        };

        const taskData = {
          file: mockFile,
          user_id: testUserId,
          model_name: 'gemini-1.5-flash',
          customText: 'Analyze this whiteboard',
          prompt_type: 'general',
          language: 'English'
        };

        const result = await imageService.createImageAnalysisTask(taskData);

        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('image_id');
        expect(result).toHaveProperty('image_url');
        expect(result).toHaveProperty('status');
        expect(result.status).toBe('pending');
        expect(result.message).toBe('Image uploaded and analysis task created successfully');
        expect(typeof result.image_id).toBe('string');
        expect(result.image_url).toMatch(/^https?:/);

        // Cleanup the created image
        await cleanupTestImage(result.image_id);
      });

      test('should create task with minimal required fields', async () => {
        if (!fs.existsSync(testImagePath)) {
          console.warn('Test image not found, skipping createImageAnalysisTask test');
          return;
        }

        const fileBuffer = fs.readFileSync(testImagePath);
        const mockFile = {
          buffer: fileBuffer,
          mimetype: 'image/png',
          originalname: 'test.png'
        };

        const taskData = {
          file: mockFile,
          user_id: testUserId,
          model_name: 'gemini-1.5-flash'
        };

        const result = await imageService.createImageAnalysisTask(taskData);

        expect(result).toHaveProperty('image_id');
        expect(result.status).toBe('pending');

        // Cleanup
        await cleanupTestImage(result.image_id);
      });

      test('should handle different image formats', async () => {
        if (!fs.existsSync(testImagePath)) {
          console.warn('Test image not found, skipping createImageAnalysisTask test');
          return;
        }

        const fileBuffer = fs.readFileSync(testImagePath);
        const mockFile = {
          buffer: fileBuffer,
          mimetype: 'image/jpeg', // Different format
          originalname: 'test.jpg'
        };

        const taskData = {
          file: mockFile,
          user_id: testUserId,
          model_name: 'gemini-1.5-flash'
        };

        const result = await imageService.createImageAnalysisTask(taskData);

        expect(result).toHaveProperty('image_id');
        expect(result.status).toBe('pending');

        // Cleanup
        await cleanupTestImage(result.image_id);
      });
    });

    describe('Sad Path', () => {
      test('should handle missing file gracefully', async () => {
        const taskData = {
          file: null,
          user_id: testUserId,
          model_name: 'gemini-1.5-flash'
        };

        await expect(imageService.createImageAnalysisTask(taskData))
          .rejects
          .toThrow();
      });

      test('should handle missing user_id gracefully', async () => {
        if (!fs.existsSync(testImagePath)) {
          console.warn('Test image not found, skipping test');
          return;
        }

        const fileBuffer = fs.readFileSync(testImagePath);
        const mockFile = {
          buffer: fileBuffer,
          mimetype: 'image/png',
          originalname: 'test.png'
        };

        const taskData = {
          file: mockFile,
          user_id: null,
          model_name: 'gemini-1.5-flash'
        };

        await expect(imageService.createImageAnalysisTask(taskData))
          .rejects
          .toThrow();
      });

      test('should handle missing model_name gracefully', async () => {
        if (!fs.existsSync(testImagePath)) {
          console.warn('Test image not found, skipping test');
          return;
        }

        const fileBuffer = fs.readFileSync(testImagePath);
        const mockFile = {
          buffer: fileBuffer,
          mimetype: 'image/png',
          originalname: 'test.png'
        };

        const taskData = {
          file: mockFile,
          user_id: testUserId,
          model_name: null
        };

        await expect(imageService.createImageAnalysisTask(taskData))
          .rejects
          .toThrow();
      });
    });
  });

  describe('getImageAnalysisResult', () => {
    let testImageData;

    beforeEach(async () => {
      // Create a test image for each test
      testImageData = await createTestImage(testUserId, {
        status: 'completed',
        summary: 'Test analysis result'
      });
    });

    afterEach(async () => {
      // Cleanup test image
      if (testImageData) {
        await cleanupTestImage(testImageData.id);
      }
    });

    describe('Happy Path', () => {
      test('should return image analysis result when it exists', async () => {
        const result = await imageService.getImageAnalysisResult(testImageData.id);

        expect(result).not.toBeNull();
        expect(result).toHaveProperty('image_id');
        expect(result).toHaveProperty('user_id');
        expect(result).toHaveProperty('image_url');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('model_name');
        expect(result).toHaveProperty('created_at');
        expect(result.image_id).toBe(testImageData.id);
        expect(result.user_id).toBe(testUserId);
        
        // Should not include sensitive fields like prompt
        expect(result).not.toHaveProperty('prompt');
      });

      test('should include summary for completed analysis', async () => {
        const result = await imageService.getImageAnalysisResult(testImageData.id);

        expect(result.status).toBe('completed');
        expect(result).toHaveProperty('summary');
        expect(result.summary).toBe('Test analysis result');
      });

      test('should return pending status for unfinished analysis', async () => {
        // Create a pending image
        const pendingImage = await createTestImage(testUserId, {
          status: 'pending',
          summary: null
        });

        const result = await imageService.getImageAnalysisResult(pendingImage.id);

        expect(result.status).toBe('pending');
        expect(result.summary).toBeNull();

        // Cleanup
        await cleanupTestImage(pendingImage.id);
      });
    });

    describe('Sad Path', () => {
      test('should return null for non-existent image', async () => {
        const nonExistentImageId = 'non-existent-image-12345';
        
        const result = await imageService.getImageAnalysisResult(nonExistentImageId);
        
        expect(result).toBeNull();
      });

      test('should handle null imageId gracefully', async () => {
        const result = await imageService.getImageAnalysisResult(null);
        
        expect(result).toBeNull();
      });

      test('should handle undefined imageId gracefully', async () => {
        const result = await imageService.getImageAnalysisResult(undefined);
        
        expect(result).toBeNull();
      });

      test('should handle malformed imageId gracefully', async () => {
        const malformedImageId = 'invalid-uuid-format';
        
        const result = await imageService.getImageAnalysisResult(malformedImageId);
        
        expect(result).toBeNull();
      });
    });
  });

  describe('deleteImageTask', () => {
    let testImageData;

    beforeEach(async () => {
      // Create a test image for each test
      testImageData = await createTestImage(testUserId);
    });

    afterEach(async () => {
      // Cleanup test image if it still exists
      if (testImageData) {
        await cleanupTestImage(testImageData.id).catch(() => {
          // Ignore errors if already deleted
        });
      }
    });

    describe('Happy Path', () => {
      test('should delete image successfully with correct user_id', async () => {
        const result = await imageService.deleteImageTask(testImageData.id, testUserId);

        expect(result).toEqual({ success: true });

        // Verify image is deleted
        const getResult = await imageService.getImageAnalysisResult(testImageData.id);
        expect(getResult).toBeNull();

        // Mark as null so afterEach doesn't try to clean it up
        testImageData = null;
      });
    });

    describe('Sad Path', () => {
      test('should return 404 error for non-existent image', async () => {
        const nonExistentImageId = 'non-existent-image-12345';
        
        const result = await imageService.deleteImageTask(nonExistentImageId, testUserId);
        
        expect(result).toEqual({
          error: 'Image analysis task not found',
          status: 404
        });
      });

      test('should return 403 error when user_id does not match', async () => {
        const otherUserId = 'other-user-id';
        
        const result = await imageService.deleteImageTask(testImageData.id, otherUserId);
        
        expect(result).toEqual({
          error: 'Forbidden',
          status: 403
        });

        // Image should still exist
        const getResult = await imageService.getImageAnalysisResult(testImageData.id);
        expect(getResult).not.toBeNull();
      });

      test('should handle null imageId gracefully', async () => {
        const result = await imageService.deleteImageTask(null, testUserId);
        
        expect(result).toEqual({
          error: 'Image analysis task not found',
          status: 404
        });
      });

      test('should handle null user_id gracefully', async () => {
        const result = await imageService.deleteImageTask(testImageData.id, null);
        
        expect(result).toEqual({
          error: 'Forbidden',
          status: 403
        });
      });
    });
  });

  describe('enforceHistoryLimit', () => {
    describe('Happy Path', () => {
      test('should not delete anything when user has <= 10 images', async () => {
        // Create 5 test images
        const images = [];
        for (let i = 0; i < 5; i++) {
          images.push(await createTestImage(testUserId));
        }

        // Should not throw error and should not delete anything
        await expect(imageService.enforceHistoryLimit(testUserId))
          .resolves
          .toBeUndefined();

        // All images should still exist
        for (const image of images) {
          const result = await imageService.getImageAnalysisResult(image.id);
          expect(result).not.toBeNull();
        }

        // Cleanup
        for (const image of images) {
          await cleanupTestImage(image.id);
        }
      });

      test('should handle user with no images', async () => {
        // Should not throw error
        await expect(imageService.enforceHistoryLimit(testUserId))
          .resolves
          .toBeUndefined();
      });

      test('should handle non-existent user gracefully', async () => {
        const nonExistentUserId = 'non-existent-user-12345';
        
        // Should not throw error
        await expect(imageService.enforceHistoryLimit(nonExistentUserId))
          .resolves
          .toBeUndefined();
      });
    });

    describe('Sad Path', () => {
      test('should handle null user_id gracefully', async () => {
        // Should not throw error
        await expect(imageService.enforceHistoryLimit(null))
          .resolves
          .toBeUndefined();
      });

      test('should handle undefined user_id gracefully', async () => {
        // Should not throw error
        await expect(imageService.enforceHistoryLimit(undefined))
          .resolves
          .toBeUndefined();
      });
    });
  });
});
