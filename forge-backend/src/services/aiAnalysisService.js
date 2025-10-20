const { redis } = require('../../config/database');
const { db } = require('../../config/drizzle');
const { images } = require('../models/images');
const { eq } = require('drizzle-orm');
const { generateWhiteboardAnalysis } = require('../ai/core');
const { validateUserInput, logSecurityEvent } = require('../ai/security');

// Run AI analysis on an image
const analyzeImageWithAI = async (task) => {
  const modelName = task.modelName || task.model_name || 'gemini-1.5-flash'; // Default to gemini-1.5-flash for compatibility
  const promptText = task.prompt; // Use the final complete prompt in the task
  const imageUrl = task.image_url;
  const userCustomText = task.customText || task.custom_text || ''; // User custom text

  // Security check on user input
  if (userCustomText) {
    const securityCheck = validateUserInput(userCustomText, {
      maxLength: 500,
      strictMode: false
    });

    if (!securityCheck.isValid) {
      logSecurityEvent('BLOCKED_INJECTION_ATTEMPT', {
        taskId: task.id,
        reason: securityCheck.reason,
        matchedKeywords: securityCheck.matchedKeywords,
        originalInput: userCustomText,
        userAgent: task.userAgent || 'unknown',
        timestamp: new Date().toISOString()
      });

      const errorMessage = securityCheck.reason === 'HIGH_RISK_KEYWORDS_DETECTED' 
        ? `Your request contains potentially harmful content and has been blocked. Detected keywords: ${securityCheck.matchedKeywords.join(', ')}`
        : `Your request has been blocked for security reasons: ${securityCheck.reason}`;
      
      throw new Error(errorMessage);
    }

    if (securityCheck.sanitizedText !== userCustomText) {
      logSecurityEvent('INPUT_SANITIZED', {
        taskId: task.id,
        originalInput: userCustomText,
        sanitizedInput: securityCheck.sanitizedText,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Use the unified AI SDK interface for analysis
  const result = await generateWhiteboardAnalysis({
    modelName,
    promptText,
    imageUrl
  });

  // Remove markdown/code wrappers from result
  const formattedResult = formatResult(result);

  return formattedResult;
};

// Format the result, remove ```json ``` and similar characters
const formatResult = (result) => {
  if (typeof result === 'string') {
    return result.replace(/```json/g, '').replace(/```/g, '');
  } else if (typeof result === 'object' && result !== null) {
    console.log('result:');
    console.log(result);
    return JSON.stringify(result);
  }
  return String(result);
};


// Update DB task status 
const updateTaskInDB = async (taskId, dataToUpdate) => {
  await db
    .update(images)
    .set({ ...dataToUpdate, updated_at: new Date() })
    .where(eq(images.id, taskId));
};

// Process 1 task
const processAnalysisTask = async (task) => {
  try {
    console.log(`Processing task: ${task.id}`);
    await updateTaskInDB(task.id, { status: 'processing' });
    const summary = await analyzeImageWithAI(task);
    await updateTaskInDB(task.id, { status: 'completed', summary });
    console.log(`Task completed: ${task.id}`);
    return { success: true, taskId: task.id };
  } catch (error) {
    console.error(`Error processing task ${task.id}:`, error.message);
    await updateTaskInDB(task.id, { status: 'failed', summary: error.message });
    return { success: false, taskId: task.id, error: error.message };
  }
};

// Get the next task from redis
const getNextTask = async () => {
  return await redis.rpop('image_analysis_queue');
};

// push to redis queue
const addTaskToQueue = async (task) => {
  await redis.lpush('image_analysis_queue', JSON.stringify(task));
};

module.exports = {
  processAnalysisTask,
  getNextTask,
  addTaskToQueue,
  analyzeImageWithAI
}; 
