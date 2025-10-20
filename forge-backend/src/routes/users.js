const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users  create or check if user exists
router.post('/', userController.checkOrCreateUser);

// GET /api/users/:userId/images  get image history for a user
router.get('/:userId/images', userController.getUserImages);

module.exports = router; 
