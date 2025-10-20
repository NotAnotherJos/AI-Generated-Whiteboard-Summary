import { api } from '../utils';

// Image service: handles upload, result query, and deletion
export const imageService = {
  // Get AI capabilities (supported models and prompt types)
  getCapabilities: () => api.get('/api/images/capabilities'),

  // Upload image and start analysis
  upload: (file, userId, modelName, prompt='', promptType='general', language='English') => {
    const form = new FormData();
    form.append('imageFile', file);
    form.append('user_id', userId);
    form.append('model_name', modelName);
    if (prompt) {
      form.append('prompt', prompt);
    }
    form.append('prompt_type', promptType);
    form.append('language', language);
    return api.post('/api/images', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get analysis result by image ID
  getResult: (imageId) => api.get(`/api/images/${imageId}`),

  // Delete image analysis record
  remove: (imageId, userId) =>
    api.delete(`/api/images/${imageId}`, {
      params: { user_id: userId },
    }),
};
