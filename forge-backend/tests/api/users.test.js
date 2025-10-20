const request = require('supertest');
const app = require('../../src/app');
const { createTestUser, cleanupTestUser, getFixedTestUserId } = require('../helpers/testData');

describe('User API Tests', () => {
  let testUserId;
  const fixedUserId = getFixedTestUserId();

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

  describe('POST /api/users', () => {
    describe('Happy Path', () => {
      test('should create a new user successfully', async () => {
        const newUserId = 'new-test-user-' + Date.now();
        
        const response = await request(app)
          .post('/api/users')
          .send({ id: newUserId })
          .expect(200);

        expect(response.body).toEqual({
          message: 'User checked or created successfully'
        });

        // Cleanup the created user
        await cleanupTestUser(newUserId);
      });

      test('should handle existing user gracefully', async () => {
        // First create a user
        const response1 = await request(app)
          .post('/api/users')
          .send({ id: testUserId })
          .expect(200);

        expect(response1.body.message).toBe('User checked or created successfully');

        // Try to create the same user again
        const response2 = await request(app)
          .post('/api/users')
          .send({ id: testUserId })
          .expect(200);

        expect(response2.body.message).toBe('User checked or created successfully');
      });

      test('should work with fixed test user ID', async () => {
        const response = await request(app)
          .post('/api/users')
          .send({ id: fixedUserId })
          .expect(200);

        expect(response.body).toEqual({
          message: 'User checked or created successfully'
        });
      });
    });

    describe('Sad Path', () => {
      test('should return 400 when user ID is missing', async () => {
        const response = await request(app)
          .post('/api/users')
          .send({})
          .expect(400);

        expect(response.body).toEqual({
          error: 'User ID is required'
        });
      });

      test('should return 400 when user ID is null', async () => {
        const response = await request(app)
          .post('/api/users')
          .send({ id: null })
          .expect(400);

        expect(response.body).toEqual({
          error: 'User ID is required'
        });
      });

      test('should return 400 when user ID is empty string', async () => {
        const response = await request(app)
          .post('/api/users')
          .send({ id: '' })
          .expect(400);

        expect(response.body).toEqual({
          error: 'User ID is required'
        });
      });

      test('should handle invalid request body format', async () => {
        const response = await request(app)
          .post('/api/users')
          .send('invalid json')
          .expect(400);

        // Should get some kind of error response
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('GET /api/users/:userId/images', () => {
    describe('Happy Path', () => {
      test('should return empty array for user with no images', async () => {
        const response = await request(app)
          .get(`/api/users/${encodeURIComponent(testUserId)}/images`)
          .expect(200);

        expect(response.body).toEqual([]);
      });

      test('should return user images when they exist', async () => {
        // Use fixed test user ID which should have images in database
        const response = await request(app)
          .get(`/api/users/${encodeURIComponent(fixedUserId)}/images`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        
        // If there are images, check their structure
        if (response.body.length > 0) {
          const image = response.body[0];
          expect(image).toHaveProperty('status');
          expect(image).toHaveProperty('summary');
          expect(image).toHaveProperty('image_id');
          expect(image).toHaveProperty('image_url');
          expect(image).toHaveProperty('created_at');
          expect(image).toHaveProperty('model_name');
        }
      });

      test('should handle URL encoded user IDs', async () => {
        const userIdWithSpecialChars = 'test:user@domain.com';
        await createTestUser(userIdWithSpecialChars);
        
        const response = await request(app)
          .get(`/api/users/${encodeURIComponent(userIdWithSpecialChars)}/images`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        
        // Cleanup
        await cleanupTestUser(userIdWithSpecialChars);
      });
    });

    describe('Sad Path', () => {
      test('should return empty array for non-existent user', async () => {
        const nonExistentUserId = 'non-existent-user-12345';
        
        const response = await request(app)
          .get(`/api/users/${encodeURIComponent(nonExistentUserId)}/images`)
          .expect(200);

        expect(response.body).toEqual([]);
      });

      test('should handle malformed user IDs gracefully', async () => {
        const malformedUserId = '///invalid:::user:::id///';
        
        const response = await request(app)
          .get(`/api/users/${encodeURIComponent(malformedUserId)}/images`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });
});
