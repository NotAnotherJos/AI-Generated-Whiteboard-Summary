const { v4: uuidv4 } = require('uuid');
const { db } = require('../../config/drizzle');
const { images } = require('../models/images');
const { eq, asc, count } = require('drizzle-orm');
const { redis } = require('../../config/database');
const { supabase } = require('../../config/storage');
const { buildFinalPrompt } = require('../ai/prompts');

// Upload image to Supabase
async function uploadToSupabaseStorage(fileBuffer, mimeType, fileName) {
  const uniqueFileName = `${Date.now()}-${uuidv4()}`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(uniqueFileName, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600'
    });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);
  return publicUrl;
}

// Keep only last 10 history records for a user
async function enforceHistoryLimit(userId) {
  try {
    // Query the total number of user's history records
    const [{ total }] = await db
      .select({ total: count() })
      .from(images)
      .where(eq(images.user_id, userId));

    if (total <= 10) {
      return;
    }

    const amountToDelete = total - 10;

    const recordsToDelete = await db
      .select({
        id: images.id,
        image_url: images.image_url
      })
      .from(images)
      .where(eq(images.user_id, userId))
      .orderBy(asc(images.created_at))
      .limit(amountToDelete);

    if (recordsToDelete.length === 0) {
      return;
    }

    const deleteTasks = recordsToDelete.map(async (record) => {
      try {
        const imageUrl = record.image_url;
        const match = imageUrl.match(/\/object\/public\/images\/(.+)$/);
        const objectPath = match ? match[1] : null;

        if (objectPath) {
          const { error: removeError } = await supabase.storage
            .from('images')
            .remove([objectPath]);
          if (removeError) {
            console.error(`[HistoryLimit] Failed to delete file from storage: ${objectPath}`, removeError);
          }
        }

        return record.id;
      } catch (error) {
        console.error(`[HistoryLimit] Error processing record ${record.id}:`, error);
        return record.id; 
      }
    });

    
    const deletedRecordIds = await Promise.allSettled(deleteTasks);
    const recordIdsToDelete = deletedRecordIds
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    
    if (recordIdsToDelete.length > 0) {
      await db.transaction(async (tx) => {
        for (const recordId of recordIdsToDelete) {
          await tx.delete(images).where(eq(images.id, recordId));
        }
      });
    }

    console.log(`[HistoryLimit] Successfully enforced history limit for user ${userId}. Deleted ${recordIdsToDelete.length} old records.`);

  } catch (error) {
    console.error(`[HistoryLimit] Failed to enforce history limit for user ${userId}:`, error);
  }
}

// Create new image analysis task
async function createImageAnalysisTask({ file, user_id, model_name, customText, prompt_type, language }) {
  const imageUrl = await uploadToSupabaseStorage(
    file.buffer,
    file.mimetype,
    file.originalname
  );

  const finalPrompt = buildFinalPrompt({
    promptType: prompt_type || 'general',
    customText,
    language: language || 'English'
  });

  const imageId = uuidv4();
  const task = {
    id: imageId,
    user_id,
    image_url: imageUrl,
    model_name,
    prompt_type: prompt_type || 'general',
    prompt: finalPrompt, 
    customText: customText || '', 
    language: language || 'English', 
    status: 'pending',
  };

  await db.insert(images).values(task);
  await redis.lpush('image_analysis_queue', JSON.stringify(task));
  
  enforceHistoryLimit(user_id).catch(err => {
    console.error(`[HistoryLimit] Failed to enforce history limit for user ${user_id}`, err);
  });
  
  return {
    message: 'Image uploaded and analysis task created successfully',
    image_id: imageId,
    image_url: imageUrl,
    status: 'pending'
  };
}

// Get analysis result by image ID
async function getImageAnalysisResult(imageId) {
  try {
    const result = await db.select().from(images).where(eq(images.id, imageId)).limit(1);
    if (!result || result.length === 0) {
      return null;
    }
    const { id, prompt, /*parameters,*/ ...rest } = result[0];
    return { image_id: id, ...rest };
  } catch (error) {
    // Handle UUID format errors
    if (error.code === '22P02') {
      return null;
    }
    throw error;
  }
}

// Delete image analysis record (and storage file)
async function deleteImageTask(imageId, user_id) {
  let result;
  try {
    result = await db
      .select({ user_id: images.user_id, image_url: images.image_url })
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);

    if (!result || result.length === 0) {
      return { error: 'Image analysis task not found', status: 404 };
    }
  } catch (error) {
    // Handle UUID format errors
    if (error.code === '22P02') {
      return { error: 'Image analysis task not found', status: 404 };
    }
    throw error;
  }

  if (result[0].user_id !== user_id) {
    return { error: 'Forbidden', status: 403 };
  }

  // Delete image file from storage bucket
  const imageUrl = result[0].image_url;
  const match = imageUrl.match(/\/object\/public\/images\/(.+)$/);
  const objectPath = match ? match[1] : null;

  if (objectPath) {
    const { error: removeError } = await supabase.storage.from('images').remove([objectPath]);
    if (removeError) {
      console.error('Failed to delete file from storage:', removeError);
    }
  }

  await db.delete(images).where(eq(images.id, imageId));
  return { success: true };
}

module.exports = {
  createImageAnalysisTask,
  getImageAnalysisResult,
  deleteImageTask,
  enforceHistoryLimit
}; 
