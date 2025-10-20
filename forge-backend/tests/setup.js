require('dotenv').config();

// Set test environment variables if needed
process.env.NODE_ENV = 'test';

// Verify required environment variables for testing
const requiredEnvVars = [
  'DATABASE_URL',
  'UPSTASH_REDIS_REST_URL', 
  'UPSTASH_REDIS_REST_TOKEN'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn(`Missing environment variables for testing: ${missingVars.join(', ')}`);
  console.warn('Some tests may fail due to missing configuration.');
}

// Global test timeout
jest.setTimeout(30000);
