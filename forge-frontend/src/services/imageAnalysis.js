import { useState } from 'react';
import { imageService, userService } from '../services';
import { parseSummary, mapLanguageToBackend } from '../utils';


export function useBackend(userId = 'default-user') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyzeImage = async (
    file,
    model = 'gemini-2.5-flash',
    prompt = '',
    promptType = 'general',
    language = 'en'
  ) => {
    setLoading(true);
    setError(null);

    // Convert i18n language code to backend format
    const backendLanguage = mapLanguageToBackend(language);

    try {
      await userService.checkOrCreate(userId);
      const { image_id, image_url, status } = await imageService.upload(
        file, 
        userId, 
        model, 
        prompt,
        promptType,
        backendLanguage
      );

      let taskResult = { status };
      for (let retry = 0; retry < 30 && ['pending', 'processing'].includes(taskResult.status); retry++) {
        await new Promise(res => setTimeout(res, 2000));
        taskResult = await imageService.getResult(image_id);
      }

      const parsed = await parseSummary(taskResult.summary, image_url);

      const finalResult = {
        imageId: image_id,
        imageUrl: image_url,
        title: parsed.title,
        content: parsed.content,
        status: taskResult.status,
      };

      setResult(finalResult);
      return finalResult;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return {
    loading,
    error,
    result,
    analyzeImage,
    reset,
    setResult,
  };
}
