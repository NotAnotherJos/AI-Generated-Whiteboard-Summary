const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../src/app');
const { createTestUser, createTestImage, cleanupTestUser, cleanupTestImage, getFixedTestUserId, getFixedTestImageId } = require('../helpers/testData');

describe('Image API Tests', () => {
  let testUserId;
  const fixedUserId = getFixedTestUserId();
  const fixedImageId = getFixedTestImageId();
  const testImagePath = path.join(__dirname, '../fixtures/test.png');

  beforeEach(async () => {
    // Create a test user for each test
    testUserId = await createTestUser();
  });

  afterEach(async () => {
    // Cleanup test user after each test
    if (testUserId) {
      await cleanupTestUser(testUserId);
    }
  });

  describe('GET /api/images/capabilities', () => {
    describe('Happy Path', () => {
      test('should return AI capabilities', async () => {
        const response = await request(app)
          .get('/api/images/capabilities')
          .expect(200);

        expect(response.body).toHaveProperty('supportedModels');
        expect(response.body).toHaveProperty('supportedPromptTypes');
        expect(response.body).toHaveProperty('outputSchema');
        
        expect(Array.isArray(response.body.supportedModels)).toBe(true);
        expect(Array.isArray(response.body.supportedPromptTypes)).toBe(true);
        expect(typeof response.body.outputSchema).toBe('object');
      });

      test('should include expected model types', async () => {
        const response = await request(app)
          .get('/api/images/capabilities')
          .expect(200);

        const models = response.body.supportedModels;
        expect(models.length).toBeGreaterThan(0);
        
        // Models are returned as array of strings, not objects
        models.forEach(model => {
          expect(typeof model).toBe('string');
          expect(model.length).toBeGreaterThan(0);
        });
      });

      test('should include expected prompt types', async () => {
        const response = await request(app)
          .get('/api/images/capabilities')
          .expect(200);

        const promptTypes = response.body.supportedPromptTypes;
        expect(promptTypes.length).toBeGreaterThan(0);
        
        // Prompt types are returned as array of strings, not objects
        promptTypes.forEach(promptType => {
          expect(typeof promptType).toBe('string');
          expect(promptType.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('POST /api/images', () => {
    describe('Happy Path', () => {
      test('should create image analysis task successfully', async () => {
        // Check if test image exists
        if (!fs.existsSync(testImagePath)) {
          console.warn('Test image not found, skipping file upload test');
          return;
        }

        const response = await request(app)
          .post('/api/images')
          .field('user_id', testUserId)
          .field('model_name', 'gemini-1.5-flash')
          .field('prompt', 'Analyze this whiteboard')
          .field('prompt_type', 'general')
          .field('language', 'English')
          .attach('imageFile', testImagePath)
          .expect(202);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('image_id');
        expect(response.body).toHaveProperty('image_url');
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toBe('pending');
        expect(response.body.message).toBe('Image uploaded and analysis task created successfully');

        // Cleanup the created image
        if (response.body.image_id) {
          await cleanupTestImage(response.body.image_id);
        }
      });

      test('should work with minimal required fields', async () => {
        if (!fs.existsSync(testImagePath)) {
          console.warn('Test image not found, skipping file upload test');
          return;
        }

        const response = await request(app)
          .post('/api/images')
          .field('user_id', testUserId)
          .field('model_name', 'gemini-1.5-flash')
          .attach('imageFile', testImagePath)
          .expect(202);

        expect(response.body).toHaveProperty('image_id');
        expect(response.body.status).toBe('pending');

        // Cleanup
        if (response.body.image_id) {
          await cleanupTestImage(response.body.image_id);
        }
      });
    });

    describe('Sad Path', () => {
      test('should return 400 when no file is uploaded', async () => {
        const response = await request(app)
          .post('/api/images')
          .field('user_id', testUserId)
          .field('model_name', 'gemini-1.5-flash')
          .expect(400);

        expect(response.body).toEqual({
          error: 'No file uploaded'
        });
      });

      test('should return 400 when user_id is missing', async () => {
        if (!fs.existsSync(testImagePath)) {
          console.warn('Test image not found, skipping file upload test');
          return;
        }

        const response = await request(app)
          .post('/api/images')
          .field('model_name', 'gemini-1.5-flash')
          .attach('imageFile', testImagePath)
          .expect(400);

        expect(response.body).toEqual({
          error: 'Missing required fields'
        });
      });

      test('should return 400 when model_name is missing', async () => {
        if (!fs.existsSync(testImagePath)) {
          console.warn('Test image not found, skipping file upload test');
          return;
        }

        const response = await request(app)
          .post('/api/images')
          .field('user_id', testUserId)
          .attach('imageFile', testImagePath)
          .expect(400);

        expect(response.body).toEqual({
          error: 'Missing required fields'
        });
      });
    });
  });

  describe('GET /api/images/:imageId', () => {
    describe('Happy Path', () => {
      test('should return image analysis result when it exists', async () => {
        const response = await request(app)
          .get(`/api/images/${fixedImageId}`)
          .expect(200);

        expect(response.body).toHaveProperty('image_id');
        expect(response.body).toHaveProperty('user_id');
        expect(response.body).toHaveProperty('image_url');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('model_name');
        expect(response.body).toHaveProperty('created_at');
        expect(response.body.image_id).toBe(fixedImageId);
      });

      test('should include analysis summary if completed', async () => {
        const response = await request(app)
          .get(`/api/images/${fixedImageId}`)
          .expect(200);

        // If status is completed, should have summary
        if (response.body.status === 'completed') {
          expect(response.body).toHaveProperty('summary');
          expect(typeof response.body.summary).toBe('string');
        }
      });
    });

    describe('Sad Path', () => {
      test('should return 404 for non-existent image', async () => {
        const nonExistentImageId = 'non-existent-image-12345';
        
        const response = await request(app)
          .get(`/api/images/${nonExistentImageId}`)
          .expect(404);

        expect(response.body).toEqual({
          error: 'Image analysis task not found'
        });
      });

      test('should handle malformed image IDs', async () => {
        const malformedImageId = 'invalid-uuid-format';
        
        const response = await request(app)
          .get(`/api/images/${malformedImageId}`)
          .expect(404);

        expect(response.body).toEqual({
          error: 'Image analysis task not found'
        });
      });
    });
  });

  describe('DELETE /api/images/:imageId', () => {
    let testImageData;

    beforeEach(async () => {
      // Create a test image for deletion tests
      testImageData = await createTestImage(testUserId);
    });

    afterEach(async () => {
      // Cleanup test image if still exists
      if (testImageData) {
        await cleanupTestImage(testImageData.id).catch(() => {
          // Ignore errors if already deleted
        });
      }
    });

    describe('Happy Path', () => {
      test('should delete image successfully with correct user_id', async () => {
        const response = await request(app)
          .delete(`/api/images/${testImageData.id}`)
          .query({ user_id: testUserId })
          .expect(200);

        expect(response.body).toEqual({
          message: 'Image deleted successfully'
        });

        // Verify image is deleted by trying to get it
        await request(app)
          .get(`/api/images/${testImageData.id}`)
          .expect(404);

        // Mark as null so afterEach doesn't try to clean it up
        testImageData = null;
      });
    });

    describe('Sad Path', () => {
      test('should return 400 when user_id parameter is missing', async () => {
        const response = await request(app)
          .delete(`/api/images/${testImageData.id}`)
          .expect(400);

        expect(response.body).toEqual({
          error: 'user_id parameter is required'
        });
      });

      test('should return 403 when user_id does not match image owner', async () => {
        const otherUserId = 'other-user-id';
        
        const response = await request(app)
          .delete(`/api/images/${testImageData.id}`)
          .query({ user_id: otherUserId })
          .expect(403);

        expect(response.body).toEqual({
          error: 'Forbidden'
        });
      });

      test('should return 404 for non-existent image', async () => {
        const nonExistentImageId = 'non-existent-image-12345';
        
        const response = await request(app)
          .delete(`/api/images/${nonExistentImageId}`)
          .query({ user_id: testUserId })
          .expect(404);

        expect(response.body).toEqual({
          error: 'Image analysis task not found'
        });
      });
    });
  });
});
