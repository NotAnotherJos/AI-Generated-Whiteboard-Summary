const { z } = require('zod');

// main schema
const whiteboardAnalysisSchema = z.object({
  title: z.string().describe('A concise title summarizing the main topic of the whiteboard content'),
  content: z.string().describe('A detailed analysis of the whiteboard content, output in structured HTML format, must not contain image tags, and must include a textual summary of the image')
});

module.exports = {
  whiteboardAnalysisSchema,
}; 
