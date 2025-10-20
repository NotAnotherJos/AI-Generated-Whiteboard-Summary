import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePageCreation, useSettings, useToolbar } from '../imports.js';

const SETTINGS_KEY = 'forge_user_settings';
const defaultSettings = { theme: 'default', language: 'en' };

const TOOLBAR_KEY = 'forge_toolbar_settings';
const defaultToolbar = {
  model: 'gpt-4.1',
  prompt: '',
  promptType: 'general',
  autoClear: false,
  edit: false,
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

let bridge;
beforeAll(async () => {
  bridge = await import('@forge/bridge');
});

describe('usePageCreation', () => {
  it('1. creates page successfully and returns page info', async () => {
    bridge.view.getContext.mockResolvedValueOnce({
      extension: {
        space: { id: 'SPACE123' }
      },
      siteUrl: 'https://example.atlassian.net'
    });

    bridge.requestConfluence.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '99999',
        _links: { webui: '/spaces/ABC/pages/99999/Page-Title' },
      }),
    });

    const { result } = renderHook(() => usePageCreation());

    await act(async () => {
      await result.current.createPage('My Title', '<p>hello</p>');
    });

    expect(result.current.creationLoading).toBe(false);

    await waitFor(() => {
      expect(result.current.creationResult).toEqual({
        success: true,
        pageId: '99999',
        pageTitle: 'My Title',
        pageUrl: 'https://example.atlassian.net/wiki/spaces/ABC/pages/99999/Page-Title',
      });
    });

    expect(bridge.view.getContext).toHaveBeenCalledTimes(1);
    expect(bridge.requestConfluence).toHaveBeenCalledWith(
      '/wiki/api/v2/pages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: expect.stringContaining('"spaceId":"SPACE123"')
      })
    );
  });

  it('2. sets error when title or content is missing', async () => {
    const { result } = renderHook(() => usePageCreation());

    await act(async () => {
      await result.current.createPage('', '');
    });

    await waitFor(() => {
      expect(result.current.creationResult).toEqual({
        success: false,
        error: 'Missing page title or content',
      });
    });

    expect(bridge.view.getContext).not.toHaveBeenCalled();
    expect(bridge.requestConfluence).not.toHaveBeenCalled();
  });
});

describe('useSettings', () => {
  it('1. loads defaults when no saved settings', async () => {
    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.settings).toEqual(defaultSettings);
  });

  it('2. merges saved settings with defaults on load', async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: 'night' }));

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.settings).toEqual({ theme: 'night', language: 'en' });
  });

  it('3. updateSetting updates state and persists to localStorage', async () => {
    const setItemSpy = vi.spyOn(localStorage.__proto__, 'setItem');

    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      result.current.updateSetting('theme', 'night');
    });

    expect(result.current.settings).toEqual({ theme: 'night', language: 'en' });
    expect(setItemSpy).toHaveBeenCalledWith(
      SETTINGS_KEY,
      JSON.stringify({ theme: 'night', language: 'en' })
    );
  });

  it('4. uses userId to namespace storage key', async () => {
    const userAKey = `${SETTINGS_KEY}_userA`;
    const userBKey = `${SETTINGS_KEY}_userB`;
    const setItemSpy = vi.spyOn(localStorage.__proto__, 'setItem');

    const a = renderHook(({ uid }) => useSettings(uid), { initialProps: { uid: 'userA' } });
    await waitFor(() => expect(a.result.current.isLoaded).toBe(true));

    await act(async () => a.result.current.updateSetting('theme', 'sea'));
    expect(setItemSpy).toHaveBeenCalledWith(
      userAKey,
      JSON.stringify({ theme: 'sea', language: 'en' })
    );

    const b = renderHook(({ uid }) => useSettings(uid), { initialProps: { uid: 'userB' } });
    await waitFor(() => expect(b.result.current.isLoaded).toBe(true));
    expect(b.result.current.settings).toEqual(defaultSettings);

    await act(async () => b.result.current.updateSetting('language', 'zh'));
    expect(setItemSpy).toHaveBeenCalledWith(
      userBKey,
      JSON.stringify({ theme: 'default', language: 'zh' })
    );
  });
});

describe('useToolbar', () => {
  it('1. loads defaults when no saved toolbar exists', async () => {
    const { result } = renderHook(() => useToolbar());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.toolbar).toEqual(defaultToolbar);
  });

  it('2. merges saved toolbar with defaults on load', async () => {
    localStorage.setItem(
      TOOLBAR_KEY,
      JSON.stringify({ model: 'my-model', autoClear: true })
    );

    const { result } = renderHook(() => useToolbar());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.toolbar).toEqual({
      ...defaultToolbar,
      model: 'my-model',
      autoClear: true,
    });
  });

  it('3. migrates legacy "directPublish" to "edit = !directPublish"', async () => {
    localStorage.setItem(
      TOOLBAR_KEY,
      JSON.stringify({ directPublish: true, promptType: 'summary' })
    );

    const { result } = renderHook(() => useToolbar());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.toolbar).toEqual({
      ...defaultToolbar,
      promptType: 'summary',
      edit: false,
    });
    expect('directPublish' in result.current.toolbar).toBe(false);
  });

  it('4. updateToolbar updates state and persists to localStorage', async () => {
    const setItemSpy = vi.spyOn(localStorage.__proto__, 'setItem');

    const { result } = renderHook(() => useToolbar());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      result.current.updateToolbar('model', 'gpt-4o');
    });

    expect(result.current.toolbar).toEqual({ ...defaultToolbar, model: 'gpt-4o' });
    expect(setItemSpy).toHaveBeenCalledWith(
      TOOLBAR_KEY,
      JSON.stringify({ ...defaultToolbar, model: 'gpt-4o' })
    );
  });

  it('5. resetToolbar restores defaults and persists', async () => {
    const setItemSpy = vi.spyOn(localStorage.__proto__, 'setItem');

    localStorage.setItem(TOOLBAR_KEY, JSON.stringify({ model: 'old', edit: true }));

    const { result } = renderHook(() => useToolbar());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => result.current.resetToolbar());

    expect(result.current.toolbar).toEqual(defaultToolbar);
    expect(setItemSpy).toHaveBeenLastCalledWith(
      TOOLBAR_KEY,
      JSON.stringify(defaultToolbar)
    );
  });

  it('6. respects userId namespacing so different users do not collide', async () => {
    const keyA = `${TOOLBAR_KEY}_userA`;
    const keyB = `${TOOLBAR_KEY}_userB`;
    const setItemSpy = vi.spyOn(localStorage.__proto__, 'setItem');

    const a = renderHook(({ uid }) => useToolbar(uid), { initialProps: { uid: 'userA' } });
    await waitFor(() => expect(a.result.current.isLoaded).toBe(true));

    await act(async () => a.result.current.updateToolbar('promptType', 'summary'));
    expect(setItemSpy).toHaveBeenCalledWith(
      keyA,
      JSON.stringify({ ...defaultToolbar, promptType: 'summary' })
    );

    const b = renderHook(({ uid }) => useToolbar(uid), { initialProps: { uid: 'userB' } });
    await waitFor(() => expect(b.result.current.isLoaded).toBe(true));
    expect(b.result.current.toolbar).toEqual(defaultToolbar);

    await act(async () => b.result.current.updateToolbar('edit', true));
    expect(setItemSpy).toHaveBeenCalledWith(
      keyB,
      JSON.stringify({ ...defaultToolbar, edit: true })
    );
  });
});