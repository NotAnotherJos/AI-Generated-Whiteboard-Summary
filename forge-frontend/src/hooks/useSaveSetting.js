import { useState, useEffect, useCallback } from 'react';

const defaultSettings = {
  theme: 'default',
  language: 'en',
};

const SETTINGS_KEY = 'forge_user_settings';

export function useSettings(userId) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  const getStorageKey = useCallback(() => {
    return userId ? `${SETTINGS_KEY}_${userId}` : SETTINGS_KEY;
  }, [userId]);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem(getStorageKey());
        if (saved) {
          setSettings({ ...defaultSettings, ...JSON.parse(saved) });
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, [getStorageKey]);

  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [getStorageKey]);

  const updateSetting = useCallback((key, value) => {
    const updated = { ...settings, [key]: value };
    saveSettings(updated);
  }, [settings, saveSettings]);

  return { settings, updateSetting, isLoaded };
}