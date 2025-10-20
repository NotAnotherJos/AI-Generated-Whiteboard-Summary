import { useState, useEffect, useCallback } from 'react';

//  New default configuration
const defaultToolbar = {
  model: 'gpt-4.1',
  prompt: '',
  promptType: 'general',
  autoClear: false,
  edit: false,
};

const TOOLBAR_KEY = 'forge_toolbar_settings';

export function useToolbar(userId) {
  const [toolbar, setToolbar] = useState(defaultToolbar);
  const [isLoaded, setIsLoaded] = useState(false);

  const getUserToolbarKey = useCallback(() => {
    return userId ? `${TOOLBAR_KEY}_${userId}` : TOOLBAR_KEY;
  }, [userId]);

  useEffect(() => {
    const loadToolbar = () => {
      try {
        const userKey = getUserToolbarKey();
        const saved = localStorage.getItem(userKey);
        if (saved) {
          const parsed = JSON.parse(saved);

          if ('directPublish' in parsed) {
            parsed.edit = !parsed.directPublish;
            delete parsed.directPublish;
          }

          setToolbar({ ...defaultToolbar, ...parsed });
        } else {
          setToolbar(defaultToolbar);
        }
      } catch (err) {
        console.error('Failed to load Toolbar:', err);
        setToolbar(defaultToolbar);
      } finally {
        setIsLoaded(true);
      }
    };
    loadToolbar();
  }, [getUserToolbarKey]);

  // Save complete configuration
  const saveToolbar = useCallback(
    (newToolbar) => {
      setToolbar(newToolbar);
      try {
        localStorage.setItem(getUserToolbarKey(), JSON.stringify(newToolbar));
      } catch (err) {
        console.error('Failed to save Toolbar:', err);
      }
    },
    [getUserToolbarKey]
  );

  //  Update single field
  const updateToolbar = useCallback(
    (key, value) => {
      const updated = { ...toolbar, [key]: value };
      saveToolbar(updated);
    },
    [toolbar, saveToolbar]
  );

  //  Reset settings
  const resetToolbar = useCallback(() => {
    saveToolbar(defaultToolbar);
  }, [saveToolbar]);

  return {
    toolbar,
    isLoaded,
    updateToolbar,
    saveToolbar,
    resetToolbar,
  };
}
