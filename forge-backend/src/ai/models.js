const { createOpenAI } = require('@ai-sdk/openai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');

// API keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let openai = null;
let google = null;

// OpenAI client
if (OPENAI_API_KEY) {
  openai = createOpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

// Google client
if (GEMINI_API_KEY) {
  google = createGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
  });
}

// Supported models
const supportedModels = {
  // OpenAI models
  'gpt-4.1': { provider: 'openai', model: 'gpt-4.1' },
  'gpt-4.1-mini': { provider: 'openai', model: 'gpt-4.1-mini' },
  'gpt-4.1-nano': { provider: 'openai', model: 'gpt-4.1-nano' },
  'gpt-4o': { provider: 'openai', model: 'gpt-4o' },
  'gpt-4o-mini': { provider: 'openai', model: 'gpt-4o-mini' },
  'o3': { provider: 'openai', model: 'o3' },
  'o4-mini': { provider: 'openai', model: 'o4-mini' },
  
  // Gemini models
  'gemini-2.5-pro': { provider: 'google', model: 'gemini-2.5-pro' },
  'gemini-2.5-flash': { provider: 'google', model: 'gemini-2.5-flash' },
  'gemini-2.5-flash-lite': { provider: 'google', model: 'gemini-2.5-flash-lite' },
  'gemini-2.0-flash': { provider: 'google', model: 'gemini-2.0-flash' },
  'gemini-1.5-flash': { provider: 'google', model: 'gemini-1.5-flash' },
};

// get model instance
function getModel(modelName) {
  const config = supportedModels[modelName];
  if (!config) {
    throw new Error(`Unsupported model: ${modelName}. Available models: ${Object.keys(supportedModels).join(', ')}`);
  }

  switch (config.provider) {
    case 'openai':
      if (!openai) {
        throw new Error('OpenAI API key is not configured');
      }
      return openai(config.model);
      
    case 'google':
      if (!google) {
        throw new Error('Google API key is not configured');
      }
      return google(config.model);
      
    default:
      throw new Error(`Unsupported model provider: ${config.provider}`);
  }
}

// list all available model names
function getAvailableModels() {
  return Object.keys(supportedModels).filter(modelName => isModelAvailable(modelName));
}

// check if model has API key
function isModelAvailable(modelName) {
  const config = supportedModels[modelName];
  if (!config) return false;
  
  switch (config.provider) {
    case 'openai':
      return !!OPENAI_API_KEY;
    case 'google':
      return !!GEMINI_API_KEY;
    default:
      return false;
  }
}

module.exports = {
  getModel,
  getAvailableModels,
  isModelAvailable,
}; 
