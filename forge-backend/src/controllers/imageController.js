const imageService = require('../services/imageService');
const { getAvailableModels } = require('../ai/models');
const { getAvailablePromptTypes } = require('../ai/prompts');
const multer = require('multer');

// Upload config 10MB limit
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } 
});

//Create image analysis task
async function createImageAnalysisTask(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { user_id, model_name, prompt, prompt_type, language } = req.body;
    if (!user_id || !model_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await imageService.createImageAnalysisTask({
      file: req.file,
      user_id,
      model_name,
      customText: prompt, 
      prompt_type: prompt_type || 'general', 
      language: language || 'English' 
    });
    res.status(202).json(result);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: `File upload error: ${error.message}` });
    }
    next(error);
  }
}

// Get analysis result by imageId
async function getImageAnalysisResult(req, res, next) {
  try {
    const { imageId } = req.params;
    const result = await imageService.getImageAnalysisResult(imageId);
    
    if (!result) {
      return res.status(404).json({ error: 'Image analysis task not found' });
    }
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// Delete image analysis record
async function deleteImageTask(req, res, next) {
  try {
    const { imageId } = req.params;
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id parameter is required' });
    }
    
    const result = await imageService.deleteImageTask(imageId, user_id);
    
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// Return supported AI models & prompt types
async function getAICapabilities(req, res, next) {
  try {
    const capabilities = {
      supportedModels: getAvailableModels(),
      supportedPromptTypes: getAvailablePromptTypes(),
      outputSchema: {
        title: 'string - Concise title of whiteboard content',
        content: 'string - Detailed analysis content in structured HTML format',
      },
    };
    res.status(200).json(capabilities);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upload,
  createImageAnalysisTask,
  getImageAnalysisResult,
  deleteImageTask,
  getAICapabilities
}; 
