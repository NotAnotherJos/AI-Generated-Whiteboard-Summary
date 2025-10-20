const userService = require('../../../src/services/userService');
const { createTestUser, createTestImage, cleanupTestUser, cleanupTestImage } = require('../../helpers/testData');
const { redis } = require('../../../config/database');

describe('UserService Unit Tests', () => {
  let testUserId;

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

  describe('checkOrCreateUser', () => {
    describe('Happy Path', () => {
      test('should return true when creating a new user', async () => {
        const newUserId = 'new-user-' + Date.now();
        
        const result = await userService.checkOrCreateUser(newUserId);
        
        expect(result).toBe(true);
        
        // Cleanup
        await cleanupTestUser(newUserId);
      });

      test('should return true when user already exists', async () => {
        // First call should create the user
        const result1 = await userService.checkOrCreateUser(testUserId);
        expect(result1).toBe(true);

        // Second call should handle existing user
        const result2 = await userService.checkOrCreateUser(testUserId);
        expect(result2).toBe(true);
      });

      test('should handle special characters in user ID', async () => {
        const specialUserId = 'user:with@special.chars-123';
        
        const result = await userService.checkOrCreateUser(specialUserId);
        
        expect(result).toBe(true);
        
        // Cleanup
        await cleanupTestUser(specialUserId);
      });

      test('should handle long user IDs', async () => {
        const longUserId = 'a'.repeat(255); // Very long user ID
        
        const result = await userService.checkOrCreateUser(longUserId);
        
        expect(result).toBe(true);
        
        // Cleanup
        await cleanupTestUser(longUserId);
      });
    });

    describe('Sad Path', () => {
      test('should handle null user ID gracefully', async () => {
        await expect(userService.checkOrCreateUser(null))
          .rejects
          .toThrow();
      });

      test('should handle undefined user ID gracefully', async () => {
        await expect(userService.checkOrCreateUser(undefined))
          .rejects
          .toThrow();
      });

      test('should handle empty string user ID gracefully', async () => {
        // Current implementation treats empty string as a valid ID and resolves true
        await expect(userService.checkOrCreateUser(''))
          .resolves
          .toBe(true);
      });
    });
  });

  describe('getUserImages', () => {
    describe('Happy Path', () => {
      test('should return empty array for user with no images', async () => {
        const result = await userService.getUserImages(testUserId);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      test('should return user images when they exist', async () => {
        // Create test images for the user
        const image1 = await createTestImage(testUserId, { 
          status: 'completed',
          summary: 'First test image analysis'
        });
        const image2 = await createTestImage(testUserId, { 
          status: 'pending',
          summary: null
        });

        const result = await userService.getUserImages(testUserId);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);

        // Check that images are sorted by created_at desc (newest first)
        expect(new Date(result[0].created_at) >= new Date(result[1].created_at)).toBe(true);

        // Check image structure
        result.forEach(image => {
          expect(image).toHaveProperty('status');
          expect(image).toHaveProperty('summary');
          expect(image).toHaveProperty('image_id');
          expect(image).toHaveProperty('image_url');
          expect(image).toHaveProperty('created_at');
          expect(image).toHaveProperty('model_name');
          
          // Should not include sensitive fields like prompt
          expect(image).not.toHaveProperty('prompt');
          expect(image).not.toHaveProperty('id'); // Should be image_id instead
        });

        // Cleanup
        await cleanupTestImage(image1.id);
        await cleanupTestImage(image2.id);
      });

      test('should handle user with many images', async () => {
        // Create multiple test images
        const imagePromises = [];
        for (let i = 0; i < 5; i++) {
          imagePromises.push(createTestImage(testUserId, {
            status: i % 2 === 0 ? 'completed' : 'pending',
            summary: `Test image ${i} analysis`
          }));
        }
        const images = await Promise.all(imagePromises);

        const result = await userService.getUserImages(testUserId);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(5);

        // Verify sorting (newest first)
        for (let i = 0; i < result.length - 1; i++) {
          expect(new Date(result[i].created_at) >= new Date(result[i + 1].created_at)).toBe(true);
        }

        // Cleanup
        for (const image of images) {
          await cleanupTestImage(image.id);
        }
      });

      test('should only return images for specific user', async () => {
        // Create another test user
        const otherUserId = await createTestUser();
        
        // Create images for both users
        const userImage = await createTestImage(testUserId, { summary: 'User 1 image' });
        const otherUserImage = await createTestImage(otherUserId, { summary: 'User 2 image' });

        const result = await userService.getUserImages(testUserId);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(1);
        expect(result[0].image_id).toBe(userImage.id);

        // Cleanup
        await cleanupTestImage(userImage.id);
        await cleanupTestImage(otherUserImage.id);
        await cleanupTestUser(otherUserId);
      });
    });

    describe('Sad Path', () => {
      test('should return empty array for non-existent user', async () => {
        const nonExistentUserId = 'non-existent-user-12345';
        
        const result = await userService.getUserImages(nonExistentUserId);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      test('should handle null user ID gracefully', async () => {
        // Current implementation returns empty array for invalid userId
        const result = await userService.getUserImages(null);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      test('should handle undefined user ID gracefully', async () => {
        const result = await userService.getUserImages(undefined);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      test('should handle empty string user ID gracefully', async () => {
        const result = await userService.getUserImages('');
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      test('should handle malformed user ID gracefully', async () => {
        const malformedUserId = '///invalid:::user:::id///';
        
        const result = await userService.getUserImages(malformedUserId);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });
    });
  });
});
