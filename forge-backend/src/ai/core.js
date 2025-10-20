const { generateObject } = require('ai');
const { getModel } = require('./models');
const { whiteboardAnalysisSchema } = require('./schemas');

/**
 * whiteboard analysis
 * @param {Object} options 
 * @param {string} options.modelName - like 'gpt-4.1-nano' 
 * @param {string} options.promptText 
 * @param {string} options.imageUrl 
 * @returns {Promise<Object>}  {title, content}
 */
async function generateWhiteboardAnalysis({ modelName, promptText, imageUrl }) {
  const FALLBACK_MODEL_NAME = 'gpt-4.1-nano';
  
  // Build common generateObject parameters
  const generateParams = {
    schema: whiteboardAnalysisSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: promptText,
          },
          {
            type: 'image',
            image: imageUrl,
          },
        ],
      },
    ],
    temperature: 0.1,
    // maxTokens: 4096,
  };

  try {
    // Get the original model instance
    const model = getModel(modelName);
    
    // Use Vercel AI SDK's generateObject for structured output
    const { object } = await generateObject({
      model,
      ...generateParams
    });

    return object;
  } catch (error) {
    console.error(`AI analysis failed (${modelName}):`, error);
    
    // 429 on Gemini  try fallback
    const isRateLimitError = String(error.message).includes('429') || 
                           String(error.status).includes('429') ||
                           String(error.code).includes('429');
    const isGeminiModel = modelName.toLowerCase().includes('gemini');
    
    if (isRateLimitError && isGeminiModel) {
      console.warn(`[AI RETRY] Gemini model ${modelName} encountered 429 rate limit error, trying fallback model ${FALLBACK_MODEL_NAME}...`);
      
      // Prevent infinite retry: if the original model is already the fallback, throw error directly
      if (modelName === FALLBACK_MODEL_NAME) {
        console.error(`[AI RETRY] Fallback model ${FALLBACK_MODEL_NAME} also failed, stopping retry`);
        throw new Error(`AI analysis failed: ${error.message}`);
      }
      
      try {
        // Get fallback model instance
        const fallbackModel = getModel(FALLBACK_MODEL_NAME);
        
        // Retry with fallback model, using exactly the same parameters
        const { object: fallbackObject } = await generateObject({
          model: fallbackModel,
          ...generateParams
        });
        
        console.log(`[AI RETRY] Fallback with ${FALLBACK_MODEL_NAME} succeeded`);
        return fallbackObject;
      } catch (retryError) {
        console.error(`[AI RETRY] Fallback model ${FALLBACK_MODEL_NAME} also failed:`, retryError);
        throw new Error(`AI analysis failed (original model: ${modelName}, fallback model: ${FALLBACK_MODEL_NAME}): ${retryError.message}`);
      }
    }
    
    // no retry path bubble up
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

module.exports = {
  generateWhiteboardAnalysis,
}; 
