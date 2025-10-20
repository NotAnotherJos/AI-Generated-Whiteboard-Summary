import React from 'react';
import { expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);
afterEach(() => cleanup());

if (!globalThis.fetch) {
  globalThis.fetch = vi.fn();
}

const navigate = vi.fn();
const router = { navigate };
vi.mock('@forge/bridge', () => ({
  __esModule: true,

  router,
  invoke: vi.fn(),
  requestConfluence: vi.fn(),
  requestJira: vi.fn(),
  view: { getContext: vi.fn() },
  auth: { getToken: vi.fn() },
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    onChange: vi.fn(),
  },
  events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
  fetch: vi.fn(),

  default: { router },
}));

const stableChangeLanguageFunction = vi.fn(() => Promise.resolve());
const stableTranslateFunction = vi.fn((key, opts) => {

  if (/^tutorial\.steps\.\d+\.title$/.test(key)) {
    const idx = Number(key.match(/\d+/)[0]);
    return `Step ${idx + 1} Title`;
  }
  if (/^tutorial\.steps\.\d+\.content$/.test(key)) {
    const idx = Number(key.match(/\d+/)[0]);
    return `Step ${idx + 1} Content`;
  }

  if (key === 'help.title') return 'Help Center';
  if (key === 'help.intro') return 'Here you can find guides and tips.';
  if (key === 'help.tutorial') return 'Start Tutorial';
  if (key === 'help.sections' && opts && opts.returnObjects) {
    return [
      { title: 'Getting Started', content: 'Welcome to the app.\nHere is how to start.' },
      {
        title: 'Features',
        content: [
          { title: 'Upload',  description: 'You can upload images.' },
          { title: 'History', description: 'View and restore previous results.' },
        ],
      },
    ];
  }
  if (key === 'toolbar.edit') return 'Enable Editing';
  if (key === 'toolbar.auto_clear') return 'Auto Clear';
  if (key === 'toolbar.reset') return 'Reset';
  if (key === 'common.back') return 'Back';
  if (key === 'common.skip') return 'Skip';
  if (key === 'common.next') return 'Next';
  if (key === 'common.finish') return 'Finish';

  return key;
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableTranslateFunction,
    i18n: { changeLanguage: stableChangeLanguageFunction },
  }),
  Trans: ({ children }) => children,
  I18nextProvider: ({ children }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('@theme/useThemeContext', () => ({
  useThemeContext: (theme = {}) => ({
    themeName: theme.themeName ?? 'default',
    setThemeName: vi.fn(),
    mode: theme.mode ?? 'light',
  }),
}));

vi.mock('react-quill', () => ({
  default: ({ value, onChange, readOnly }) =>
    React.createElement('textarea', {
      'data-testid': 'editor',
      value: value || '',
      onChange: e => onChange(e.target.value),
      readOnly,
    }),
}));

vi.mock('@mui/icons-material', () => {
  const createMockIcon = (iconName) => {
    const MockIcon = React.forwardRef((props, ref) =>
      React.createElement('svg', {
        ...props,
        ref,
        'data-testid': iconName || 'mock-icon',
        className: `mock-icon ${props.className || ''}`,
        children: React.createElement('path', { d: 'M0,0 L24,24 M0,24 L24,0' }),
      })
    );
    MockIcon.displayName = iconName;
    return MockIcon;
  };
  return new Proxy({}, {
    get: (target, prop) => (typeof prop === 'string' ? createMockIcon(prop) : target[prop]),
  });
});

vi.mock('@mui/icons-material', () => {
  const createMockIcon = (iconName) => {
    const MockIcon = React.forwardRef((props, ref) =>
      React.createElement('svg', {
        ...props,
        ref,
        'data-testid': `${iconName}Icon`,
        className: `mock-icon ${props.className || ''}`,
        children: React.createElement('path', { d: 'M0,0 L24,24 M0,24 L24,0' }),
      })
    );
    MockIcon.displayName = `Mock${iconName}Icon`;
    return MockIcon;
  };

  return {
    ArrowBack: createMockIcon('ArrowBack'),
    ArrowForward: createMockIcon('ArrowForward'),
    Close: createMockIcon('Close'),
    SkipNext: createMockIcon('SkipNext'),

    Settings: createMockIcon('Settings'),
    Translate: createMockIcon('Translate'),
    Palette: createMockIcon('Palette'),
    HelpOutline: createMockIcon('HelpOutline'),

    __esModule: true,
    default: new Proxy({}, {
      get: (target, prop) => {
        if (typeof prop === 'string' && prop !== 'default') {
          return createMockIcon(prop);
        }
        return target[prop];
      },
    }),
  };
});

vi.mock('axios', () => {
  const createMockAxiosInstance = () => {
    const inst = vi.fn(() => Promise.resolve({ data: {} }));
    inst.get = vi.fn(() => Promise.resolve([]));
    inst.post = vi.fn(() => Promise.resolve({}));
    inst.put = vi.fn(() => Promise.resolve({}));
    inst.delete = vi.fn(() => Promise.resolve({}));
    inst.patch = vi.fn(() => Promise.resolve({}));
    inst.request = vi.fn(() => Promise.resolve({}));
    inst.defaults = {
      baseURL: 'https://f.a2a.ing',
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    };
    inst.interceptors = {
      request: { use: vi.fn(), eject: vi.fn(), handlers: [{ fulfilled: vi.fn(), rejected: vi.fn() }] },
      response: { use: vi.fn(), eject: vi.fn(), handlers: [{ fulfilled: vi.fn(r => r.data), rejected: vi.fn() }] },
    };
    return inst;
  };
  return {
    default: {
      create: vi.fn(() => createMockAxiosInstance()),
      get: vi.fn(() => Promise.resolve([])),
      post: vi.fn(() => Promise.resolve({})),
      put: vi.fn(() => Promise.resolve({})),
      delete: vi.fn(() => Promise.resolve({})),
    },
  };
});

vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef((p, r) => React.createElement('div', { ...p, ref: r })),
    span: React.forwardRef((p, r) => React.createElement('span', { ...p, ref: r })),
    p: React.forwardRef((p, r) => React.createElement('p', { ...p, ref: r })),
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
}));

const originalCreateElement = document.createElement;
global.document.createElement = vi.fn((tag) => originalCreateElement.call(document, tag));

if (!globalThis.TextEncoder) {
  const { TextEncoder, TextDecoder } = await import('util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

global.TEST_DEFAULTS = {
  userId: 'test-user-123',
  spaceId: 'test-space-456',
  siteUrl: 'https://test.atlassian.net',
};

afterEach(() => {
  vi.clearAllMocks();
});
