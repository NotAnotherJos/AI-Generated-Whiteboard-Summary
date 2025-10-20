async function parseSummary(summary, imageUrl) {
  // Input validation
  if (!summary && !imageUrl) {
    return {
      title: 'Error - No Input Provided',
      content: 'Both summary and imageUrl are required but were not provided.',
    };
  }

  if (!imageUrl || typeof imageUrl !== 'string') {
    return {
      title: 'Error - Invalid Image URL',
      content: 'A valid image URL is required for processing.',
    };
  }

  // Handle null, undefined, or non-string summary
  if (summary === null || summary === undefined) {
    return {
      title: 'Error - Invalid Summary',
      content: 'Summary cannot be null or undefined.',
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(summary);
  } catch {
    parsed = {
      title: 'Generated Title',
      content: summary || 'No content returned',
    };
  }

  const dateStr = new Date().toLocaleString('sv-SE', {
    hour12: false,
    timeZoneName: 'short',
  }).replace(',', '');

  const finalTitle = `${parsed.title} - ${dateStr}`;

  const makeThumbnailUrl = (imageUrl, width = 300) => {
    return imageUrl
      .replace('/object/', '/render/image/')
      .concat(`?width=${width}&resize=contain`);
  };
  const thumbUrl = makeThumbnailUrl(imageUrl, 300);

  console.log("URL:",thumbUrl)

  const getBase64Image = async (url) => {
    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Add timeout to FileReader
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        const readerTimeout = setTimeout(() => {
          reject(new Error('FileReader timeout'));
        }, 2000); // 2 second timeout for FileReader

        reader.onloadend = () => {
          clearTimeout(readerTimeout);
          resolve(reader.result);
        };
        reader.onerror = () => {
          clearTimeout(readerTimeout);
          reject(new Error('FileReader error'));
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Image base64 conversion failed:', err);
      return url;
    }
  };

  const base64Image = await getBase64Image(thumbUrl);

  return {
    title: finalTitle,
    content: `<p><img src="${base64Image}" alt="image"/></p>\n${parsed.content || 'No content returned'}`,
  };
}

export default parseSummary;