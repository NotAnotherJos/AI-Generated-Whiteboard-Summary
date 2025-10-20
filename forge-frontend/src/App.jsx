import { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';

import { useTranslation } from 'react-i18next';
import './i18n/LanguageSwitch';
import { MyTheme } from './theme/ThemeSwitch';
import { useThemeContext } from './theme/useThemeContext';

import AppBackground from './components/common/AppBackground';
import AppHeader from './components/common/AppHeader';
import FloatingExit from './components/common/FloatingExit';
import Upload from './components/main/Upload';
import Settings from './components/main/Settings';
import Loading from './components/main/Loading';
import Result from './components/main/Result';
import Edit from './components/main/Edit';
import ToolBar from './components/main/ToolBar';
import UserHistory from './components/main/UserHistory';
import Tutorial from './components/setting/Tutorial';
import HelpCenter from './components/setting/HelpCenter';
import { useBackend, userService, imageService } from './services';
import { useToolbar, useSettings, usePageCreation } from './hooks';
import { parseSummary } from './utils';

function AppContent() {
  const { i18n } = useTranslation();
  const { setThemeName } = useThemeContext();

  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userError, setUserError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [runGuide, setRunGuide] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(true);

  const { toolbar, updateToolbar, resetToolbar } = useToolbar(userId);
  const { settings, updateSetting, isLoaded: settingsLoaded } = useSettings(userId);
  const { loading, error, result, analyzeImage, reset, setResult } = useBackend(userId);
  const { creationLoading, creationResult, createPage, resetCreation } = usePageCreation();

  const handleGuideCallback = data => {
    if (data.status === 'finished' || data.status === 'skipped') {
      setRunGuide(false);
    }
  };

  const handleStartTutorial = () => {
    setHelpOpen(false);
    setShowHistory(false);
    setToolbarExpanded(true);
    setTimeout(() => setRunGuide(true), 300);
  };

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const capabilities = await imageService.getCapabilities();
        setAiCapabilities(capabilities);
      } catch (error) {
        console.error('Failed to fetch AI capabilities:', error);
        setAiCapabilities({
          supportedModels: ['gemini-2.5-flash'],
          supportedPromptTypes: ['general', 'business'],
          outputSchema: {},
        });
      } finally {
        setCapabilitiesLoading(false);
      }
    };
    fetchCapabilities();
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (!user?.accountId) throw new Error('Invalid user data: missing accountId');
        setUserId(user.accountId);
      } catch (error) {
        console.error('Failed to load user:', error);
        setUserError(error.message);
      } finally {
        setUserLoading(false);
      }
    };
    initializeUser();
  }, []);

  useEffect(() => {
    if (settingsLoaded) {
      i18n.changeLanguage(settings.language);
      setThemeName(settings.theme);
    }
  }, [settingsLoaded, settings.language, settings.theme, i18n, setThemeName]);

  const [aiCapabilities, setAiCapabilities] = useState({
    supportedModels: [],
    supportedPromptTypes: [],
    outputSchema: {},
  });
  const [capabilitiesLoading, setCapabilitiesLoading] = useState(true);

  const handleCreatePage = useCallback(async (title, content, imageId) => {
    setIsCreatingPage(true);
    try {
      await createPage(title, content);
      if (toolbar.autoClear && imageId && userId) {
        try {
          await imageService.remove(imageId, userId);
        } catch (err) {
          console.error('Failed to delete current image record:', err);
        }
      }
    } finally {
      setIsCreatingPage(false);
    }
  }, [createPage, toolbar.autoClear, userId]);

  const handleUpload = async (file) => {
    if (!userId) return console.error('User ID not available');
    setSelectedFile(file);

    try {
      const analysis = await analyzeImage(
        file,
        toolbar.model,
        toolbar.prompt,
        toolbar.promptType || 'general',
        settings.language || 'en'
      );
      if (!analysis) return;

      const { title, content, imageId } = analysis;

      if (!toolbar.edit) {
        await handleCreatePage(title, content, imageId);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleHistoryRestore = async (item) => {
    const { title, content } = await parseSummary(item.summary, item.image_url);
    setSelectedFile({ name: 'restored.jpg', fromHistory: true });
    setShowHistory(false);
    if (!toolbar.edit) {
      await handleCreatePage(title, content, item.image_id);
      setResult(null);
    } else {
      setResult({
        imageId: item.image_id,
        imageUrl: item.image_url,
        title,
        content,
        status: item.status,
      });
    }
  };

  const handleHistoryReGenerate = async (item) => {
    try {
      const response = await fetch(item.image_url);
      const blob = await response.blob();
      const file = new File([blob], 'regenerated.jpg', { type: blob.type });
      setShowHistory(false);
      await handleUpload(file);
    } catch (err) {
      console.error('Regenerate failed:', err);
    }
  };

  const handleRetry = () => {
    setSelectedFile(null);
    reset();
    resetCreation();
  };

  return (
    <Box>
      
      {runGuide && <Tutorial run={runGuide} onCallback={handleGuideCallback} />}

      <Settings
        themeValue={settings.theme}
        language={settings.language}
        onLanguageChange={(lang) => {
          i18n.changeLanguage(lang);
          updateSetting('language', lang);
        }}
        onThemeChange={(theme) => {
          setThemeName(theme);
          updateSetting('theme', theme);
        }}
        onOpenHelpCenter={() => setHelpOpen(true)}
      />
      <HelpCenter
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onStartTutorial={handleStartTutorial}
      />

      {userLoading ? (
        <Loading />
      ) : userError ? (
        <Result result={{ success: false, error: userError }} />
      ) : (
        <>
          <ToolBar
            toolbar={toolbar}
            updateToolbar={updateToolbar}
            onResetDefaults={resetToolbar}
            aiCapabilities={aiCapabilities}
            capabilitiesLoading={capabilitiesLoading}
            expanded={toolbarExpanded}
            onExpandedChange={setToolbarExpanded}
            disabled={
              loading ||
              isCreatingPage ||
              creationLoading ||
              result
            }
          />

          <FloatingExit visible={!showHistory && !selectedFile && !result && !creationResult}>
            <Upload
              onUpload={handleUpload}
              disabled={loading}
              showHistory={showHistory}
              onToggleHistory={() => setShowHistory(true)}
            />
          </FloatingExit>

          {showHistory && (
            <UserHistory
              userId={userId}
              onClose={() => setShowHistory(false)}
              onRestore={handleHistoryRestore}
              onReGenerate={handleHistoryReGenerate}
            />
          )}

          <FloatingExit visible={loading}>
            <Loading type="analyze" />
          </FloatingExit>

          <FloatingExit visible={isCreatingPage}>
            <Loading />
          </FloatingExit>

          {error && <Result result={{ success: false, error }} onRetry={handleRetry} />}

          {result && !loading && !creationResult && toolbar.edit && !isCreatingPage && (
            <Edit
              result={result}
              onCreatePage={handleCreatePage}
              onRetry={handleRetry}
              loading={creationLoading}
            />
          )}

          {!isCreatingPage && creationResult && <Result result={creationResult} onRetry={handleRetry} />}
        </>
      )}
    </Box>
  );
}

function App() {
  return (
    <MyTheme>
      <AppBackground>
        <AppHeader />
        <AppContent />
      </AppBackground>
    </MyTheme>
  );
}

export default App;
