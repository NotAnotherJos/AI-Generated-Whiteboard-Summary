const { db } = require('../../config/drizzle');
const { users } = require('../models/users');
const { images } = require('../models/images');
const { eq, desc } = require('drizzle-orm');

// Check if user exists, create if not
async function checkOrCreateUser(id) {
  const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (existingUser.length === 0) {
    await db.insert(users).values({ id });
  }
  return true;
}

// Get user's image history
async function getUserImages(userId) {
  return await db
    .select({
      status: images.status,
      summary: images.summary,
      image_id: images.id,
      image_url: images.image_url,
      created_at: images.created_at,
      model_name: images.model_name
    })
    .from(images)
    .where(eq(images.user_id, userId))
    .orderBy(desc(images.created_at));
}

module.exports = { checkOrCreateUser, getUserImages }; 
