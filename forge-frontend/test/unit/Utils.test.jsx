import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, parseSummary, mapLanguageToBackend } from '../imports.js';

describe('api', () => {
  it('1. exports axios instance', () => {
    expect(api).toBeDefined();
    expect(typeof api).toBe('function');
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.put).toBe('function');
    expect(typeof api.delete).toBe('function');
  });

  it('2. has correct default configuration', () => {
    expect(api.defaults.baseURL).toBe('https://f.a2a.ing');
    expect(api.defaults.timeout).toBe(30000);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('3. has request interceptors configured', () => {
    expect(api.interceptors.request.handlers).toBeDefined();
    expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
  });

  it('4. has response interceptors configured', () => {
    expect(api.interceptors.response.handlers).toBeDefined();  
    expect(api.interceptors.response.handlers.length).toBeGreaterThan(0);
  });

  it('5. response interceptor extracts data from response', async () => {
    const mockResponse = {
      data: { message: 'success', result: 'test data' },
      status: 200,
      headers: {},
    };

    const responseHandler = api.interceptors.response.handlers[0];
    
    if (responseHandler && responseHandler.fulfilled) {
      const result = responseHandler.fulfilled(mockResponse);
      expect(result).toEqual({ message: 'success', result: 'test data' });
    }
  });

  it('6. can make HTTP requests', async () => {
    expect(api.request).toBeDefined();
    expect(typeof api.request).toBe('function');
    
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.put).toBe('function');
    expect(typeof api.patch).toBe('function');
    expect(typeof api.delete).toBe('function');
  });
});

describe('mapLanguageToBackend', () => {
  it('1. correctly maps language codes to display names', () => {
    expect(mapLanguageToBackend('en')).toBe('English');
    expect(mapLanguageToBackend('zh')).toBe('中文');
    expect(mapLanguageToBackend('ja')).toBe('日本語');
    expect(mapLanguageToBackend('fr')).toBe('Français');
    expect(mapLanguageToBackend('es')).toBe('Español');
    expect(mapLanguageToBackend('it')).toBe('Italiano');
  });

  it('2. returns default English for unknown language codes', () => {
    expect(mapLanguageToBackend('unknown')).toBe('English');
    expect(mapLanguageToBackend('xyz')).toBe('English');
    expect(mapLanguageToBackend('')).toBe('English');
    expect(mapLanguageToBackend(null)).toBe('English');
    expect(mapLanguageToBackend(undefined)).toBe('English');
  });
});

describe('parseSummary', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.fetch = mockFetch;
    
    window.FileReader = vi.fn().mockImplementation(() => {
      const instance = {
        readAsDataURL: vi.fn(),
        result: null,
        onloadend: null,
        onerror: null,
      };
      
      instance.readAsDataURL = vi.fn(() => {
        instance.result = 'data:image/jpeg;base64,mockBase64String';
        if (instance.onloadend) {
          queueMicrotask(() => instance.onloadend());
        }
      });
      
      return instance;
    });
    
    window.AbortController = vi.fn(() => ({
      abort: vi.fn(),
      signal: { aborted: false }
    }));
    
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15 10:30:45'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('1. parses valid JSON summary and processes image', async () => {
    const validJsonSummary = JSON.stringify({
      title: 'Test Analysis',
      content: 'This is test content'
    });
    const imageUrl = 'https://example.com/object/image123.jpg';

    const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      blob: () => Promise.resolve(mockBlob)
    });

    const result = await parseSummary(validJsonSummary, imageUrl);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/render/image/image123.jpg?width=300&resize=contain',
      expect.objectContaining({
        signal: expect.any(Object)
      })
    );

    expect(result).toEqual({
      title: expect.stringContaining('Test Analysis - 2024-01-15 10:30:45'),
      content: expect.stringContaining('<p><img src="data:image/jpeg;base64,mockBase64String"'),
    });
    expect(result.content).toContain('This is test content');
  });

  it('2. handles invalid JSON and falls back to default structure', async () => {
    const invalidSummary = 'This is not JSON';
    const imageUrl = 'https://example.com/object/test.jpg';

    const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      blob: () => Promise.resolve(mockBlob)
    });

    const result = await parseSummary(invalidSummary, imageUrl);

    expect(result.title).toContain('Generated Title - 2024-01-15 10:30:45');
    expect(result.content).toContain('This is not JSON');
  });

  it('3. handles image fetch failure and falls back to original URL', async () => {
    const validJsonSummary = JSON.stringify({
      title: 'Test',
      content: 'Content'
    });
    const imageUrl = 'https://example.com/object/image.jpg';

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await parseSummary(validJsonSummary, imageUrl);

    expect(result.content).toContain('<p><img src="https://example.com/render/image/image.jpg?width=300&resize=contain"');
  });

  it('4. handles invalid inputs and returns error messages', async () => {
    let result = await parseSummary(null, 'https://example.com/object/test.jpg');
    expect(result.title).toBe('Error - Invalid Summary');
    expect(result.content).toBe('Summary cannot be null or undefined.');

    result = await parseSummary(undefined, 'https://example.com/object/test.jpg');
    expect(result.title).toBe('Error - Invalid Summary');
    expect(result.content).toBe('Summary cannot be null or undefined.');

    result = await parseSummary('valid summary', null);
    expect(result.title).toBe('Error - Invalid Image URL');
    expect(result.content).toBe('A valid image URL is required for processing.');

    result = await parseSummary(null, null);
    expect(result.title).toBe('Error - No Input Provided');
    expect(result.content).toBe('Both summary and imageUrl are required but were not provided.');
  });

  it('5. handles empty summary input', async () => {
    const emptySummary = '';
    const imageUrl = 'https://example.com/object/empty.jpg';

    const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      blob: () => Promise.resolve(mockBlob)
    });

    const result = await parseSummary(emptySummary, imageUrl);

    expect(result.title).toContain('Generated Title - 2024-01-15 10:30:45');
    expect(result.content).toContain('No content returned');
  });
});
