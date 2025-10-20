import { useState } from 'react';
import { requestConfluence, view } from '@forge/bridge';

// Hook for creating Confluence pages
export const usePageCreation = () => {
  const [creationLoading, setLoading] = useState(false);
  const [creationResult, setResult] = useState(null);

  // Create a page
  const createPage = async (pageTitle, contentHtml) => {
    if (!pageTitle || !contentHtml) {
      setResult({ success: false, error: 'Missing page title or content' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Get extension context to retrieve space key and site base URL
      const context = await view.getContext();
      const space = context.extension?.space;
      const siteUrl = context.siteUrl;

      if (!space?.id) {
        throw new Error('Cannot determine space ID from context');
      }

      const spaceId = space.id;

      // Create page
      const createResp = await requestConfluence('/wiki/api/v2/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          spaceId,
          status: 'current',
          title: pageTitle,
          body: {
            representation: 'storage',
            value: contentHtml,
          },
        }),
      });

      if (!createResp.ok) {
        const errorText = await createResp.text();
        throw new Error(`Failed: ${createResp.status} ${createResp.statusText} ${errorText}`);
      }

      const createdPage = await createResp.json();
      const relativePath = createdPage._links?.webui || '';
      const fullUrl = `${siteUrl}/wiki${relativePath}`;

      setResult({
        success: true,
        pageId: createdPage.id,
        pageTitle,
        pageUrl: fullUrl,
      });

    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetCreation = () => {
    setResult(null);
  };

  return {
    creationLoading,
    creationResult,
    createPage,
    resetCreation
  };
};
