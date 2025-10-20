const { v4: uuidv4 } = require('uuid');
const { db } = require('../../config/drizzle');
const { users } = require('../../src/models/users');
const { images } = require('../../src/models/images');
const { eq } = require('drizzle-orm');

async function createTestUser(customId = null) {
  const userId = customId || `test-user-${uuidv4()}`;
  
  try {
    await db.insert(users).values({ id: userId });
    return userId;
  } catch (error) {
    if (error.code === '23505') {
      return userId;
    }
    throw error;
  }
}

// Create a test image record
async function createTestImage(userId, overrides = {}) {
  const imageData = {
    id: uuidv4(),
    user_id: userId,
    image_url: 'https://example.com/test-image.jpg',
    model_name: 'gemini-1.5-flash',
    prompt_type: 'general',
    prompt: 'Test prompt',
    customText: 'Test custom text',
    language: 'English',
    status: 'completed',
    summary: 'Test analysis result',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  };

  await db.insert(images).values(imageData);
  return imageData;
}

// Clean up test user and their images
async function cleanupTestUser(userId) {
  try {
    await db.delete(images).where(eq(images.user_id, userId));
    await db.delete(users).where(eq(users.id, userId));
  } catch (error) {
    console.error('Error cleaning up test user:', error);
  }
}

// Clean up test image
async function cleanupTestImage(imageId) {
  try {
    await db.delete(images).where(eq(images.id, imageId));
  } catch (error) {
    console.error('Error cleaning up test image:', error);
  }
}

// Get a fixed test user ID for consistent testing
function getFixedTestUserId() {
  return '712020:7d7c92b6-e4a1-4a3d-b7c0-4feb30cf2ecc';
}

// Get a fixed test image ID for consistent testing
function getFixedTestImageId() {
  return 'd0b455ab-d8d4-4b85-b7e3-3e8e90edd9b8';
}

module.exports = {
  createTestUser,
  createTestImage,
  cleanupTestUser,
  cleanupTestImage,
  getFixedTestUserId,
  getFixedTestImageId
};
