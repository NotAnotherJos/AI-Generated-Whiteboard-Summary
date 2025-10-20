const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// POST /api/images – create image analysis task (upload + queue)
router.post('/', imageController.upload.single('imageFile'), imageController.createImageAnalysisTask);

// GET /api/images/capabilities – get supported AI models and prompt types
router.get('/capabilities', imageController.getAICapabilities);

// GET /api/images/:imageId – get image analysis result
router.get('/:imageId', imageController.getImageAnalysisResult);

// DELETE /api/images/:imageId – delete image analysis record (storage + DB)
router.delete('/:imageId', imageController.deleteImageTask);

module.exports = router; 
