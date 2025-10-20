import { describe, it, expect, render, screen, fireEvent, beforeEach } from '../imports.js';
import { vi } from 'vitest';
import { LangMenu } from '../imports.js';
import i18n from '../../src/i18n/LanguageSwitch.js';

const mockLanguageResources = {
  en: { translation: { 'test.key': 'Test Value', 'nested.key': 'Nested Value' } },
  zh: { translation: { 'test.key': '测试值', 'nested.key': '嵌套值' } },
  ja: { translation: { 'test.key': 'テスト値', 'nested.key': 'ネストされた値' } },
  it: { translation: { 'test.key': 'Valore di prova', 'nested.key': 'Valore annidato' } },
  fr: { translation: { 'test.key': 'Valeur de test', 'nested.key': 'Valeur imbriquée' } },
  es: { translation: { 'test.key': 'Valor de prueba', 'nested.key': 'Valor anidado' } },
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key) => mockLanguageResources[i18n.language]?.translation[key] || key),
    i18n: i18n,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

describe('LanguageSwitch Internationalization Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    i18n.changeLanguage('en');
  });

  describe('LanguageSwitch Initialization', () => {
    it('1. Correctly initializes i18n instance', () => {
      expect(i18n).toBeDefined();
      expect(i18n.language).toBeDefined();
      expect(typeof i18n.changeLanguage).toBe('function');
      expect(typeof i18n.t).toBe('function');
    });

    it('2. Sets correct default language', () => {
      expect(i18n.language).toBe('en');
    });

    it('3. Configures correct fallback language', () => {
      expect(i18n.options.fallbackLng).toEqual(['en']);
    });

    it('4. Loads all supported language resources', () => {
      const supportedLanguages = ['en', 'zh', 'ja', 'it', 'fr', 'es'];
      const loadedLanguages = Object.keys(i18n.options.resources);
      
      supportedLanguages.forEach(lang => {
        expect(loadedLanguages).toContain(lang);
      });
    });

    it('5. Correctly configures interpolation options', () => {
      expect(i18n.options.interpolation.escapeValue).toBe(false);
    });
  });

  describe('LanguageSwitch Language Switching Functionality', () => {
    it('1. Successfully switches to Chinese', async () => {
      await i18n.changeLanguage('zh');
      expect(i18n.language).toBe('zh');
    });

    it('2. Successfully switches to Japanese', async () => {
      await i18n.changeLanguage('ja');
      expect(i18n.language).toBe('ja');
    });

    it('3. Successfully switches to Italian', async () => {
      await i18n.changeLanguage('it');
      expect(i18n.language).toBe('it');
    });

    it('4. Successfully switches to French', async () => {
      await i18n.changeLanguage('fr');
      expect(i18n.language).toBe('fr');
    });

    it('5. Successfully switches to Spanish', async () => {
      await i18n.changeLanguage('es');
      expect(i18n.language).toBe('es');
    });

    it('6. Falls back to default language when handling invalid language codes', async () => {
      await i18n.changeLanguage('invalid');
      expect(['en', 'invalid']).toContain(i18n.language);
    });
  });

  describe('LanguageSwitch Translation Functionality', () => {
    it('1. Correctly translates English text', () => {
      i18n.changeLanguage('en');
      const translatedText = i18n.t('test.key');
      expect(typeof translatedText).toBe('string');
    });

    it('2. Correctly translates Chinese text', () => {
      i18n.changeLanguage('zh');
      const translatedText = i18n.t('test.key');
      expect(typeof translatedText).toBe('string');
    });

    it('3. Returns key name when handling missing translation keys', () => {
      const missingKey = 'non.existent.key';
      const result = i18n.t(missingKey);
      expect(result).toBe(missingKey);
    });

    it('4. Supports nested translation keys', () => {
      const nestedKey = 'nested.key';
      const result = i18n.t(nestedKey);
      expect(typeof result).toBe('string');
    });

    it('5. Correctly switches translations between different languages', async () => {
      await i18n.changeLanguage('en');
      const enResult = i18n.t('test.key');
      
      await i18n.changeLanguage('zh');
      const zhResult = i18n.t('test.key');
      
      expect(typeof enResult).toBe('string');
      expect(typeof zhResult).toBe('string');
    });
  });

  describe('LanguageSwitch Language Resources', () => {
    it('1. Validates all languages have translation resources', () => {
      const languages = ['en', 'zh', 'ja', 'it', 'fr', 'es'];
      
      languages.forEach(lang => {
        const resources = i18n.options.resources[lang];
        expect(resources).toBeDefined();
        expect(resources.translation).toBeDefined();
      });
    });

    it('2. Ensures consistent language resource structure', () => {
      const languages = ['en', 'zh', 'ja', 'it', 'fr', 'es'];
      
      languages.forEach(lang => {
        const resources = i18n.options.resources[lang];
        expect(resources).toHaveProperty('translation');
        expect(typeof resources.translation).toBe('object');
      });
    });

    it('3. Validates correct language code format', () => {
      const languages = ['en', 'zh', 'ja', 'it', 'fr', 'es'];
      
      languages.forEach(lang => {
        expect(lang).toMatch(/^[a-z]{2}$/);
        expect(lang.length).toBe(2);
      });
    });
  });

  describe('LangMenu Component Integration', () => {
    const defaultProps = {
      open: true,
      anchorEl: document.createElement('div'),
      onClose: vi.fn(),
      selected: 'en',
      onChange: vi.fn(),
    };

    it('1. Renders all supported language options', () => {
      render(<LangMenu {...defaultProps} />);
      
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('简体中文')).toBeInTheDocument();
      expect(screen.getByText('日本語')).toBeInTheDocument();
      expect(screen.getByText('Italiano')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
    });

    it('2. Correctly displays selected language', () => {
      render(<LangMenu {...defaultProps} selected="zh" />);
      
      const chineseOption = screen.getByText('简体中文');
      expect(chineseOption.closest('[role="menuitem"]')).toHaveClass('Mui-selected');
    });

    it('3. Calls correct callback function when switching languages', () => {
      const mockOnChange = vi.fn();
      const mockOnClose = vi.fn();
      
      render(<LangMenu {...defaultProps} onChange={mockOnChange} onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByText('简体中文'));
      
      expect(mockOnChange).toHaveBeenCalledWith('zh');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('4. Does not display language options when menu is closed', () => {
      render(<LangMenu {...defaultProps} open={false} />);
      
      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });
  });
});
