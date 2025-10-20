const { db } = require('../../config/drizzle');
const { users } = require('../models/users');
const { images } = require('../models/images');
const { eq, desc } = require('drizzle-orm');
const userService = require('../services/userService');

// Check if user exists, create if not
exports.checkOrCreateUser = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    await userService.checkOrCreateUser(id);
    res.status(200).json({ message: 'User checked or created successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user's image history
exports.getUserImages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userService.getUserImages(userId);
    res.status(200).json(result || []);
  } catch (error) {
    next(error);
  }
}; 
