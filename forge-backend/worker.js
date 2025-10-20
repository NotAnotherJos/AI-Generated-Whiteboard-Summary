require('dotenv').config();

const aiAnalysisService = require('./src/services/aiAnalysisService');

const POLLING_INTERVAL = 7000;  // check for new tasks every 7s

// Main worker loop
const startWorker = async () => {
  console.log('Worker started, polling for tasks...');

  while (true) {
    try {
      const taskData = await aiAnalysisService.getNextTask();

      if (taskData) {
        const task = typeof taskData === 'string' ? JSON.parse(taskData) : taskData;
        await aiAnalysisService.processAnalysisTask(task);
      } else {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
      }
    } catch (error) {
      console.error('Worker error:', error.message);
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    }
  }
};

// shutdown
process.on('SIGINT', () => {
  console.log('Worker shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Worker shutting down...');
  process.exit(0);
});

startWorker(); 
