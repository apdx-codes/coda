import { validateApiKey, validateUrl, sanitizeInput } from '../validation';

describe('Validation Utils', () => {
  describe('validateApiKey', () => {
    it('should validate OpenAI API key format', () => {
      expect(validateApiKey('sk-' + 'a'.repeat(48), 'openai')).toBe(true);
      expect(validateApiKey('invalid-key', 'openai')).toBe(false);
      expect(validateApiKey('', 'openai')).toBe(false);
      expect(validateApiKey(undefined, 'openai')).toBe(false);
    });

    it('should validate Anthropic API key format', () => {
      expect(validateApiKey('sk-ant-' + 'a'.repeat(95), 'anthropic')).toBe(true);
      expect(validateApiKey('invalid-key', 'anthropic')).toBe(false);
    });

    it('should accept any non-empty key for other providers', () => {
      expect(validateApiKey('any-key', 'google')).toBe(true);
      expect(validateApiKey('', 'google')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://api.openai.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('')).toBe(false);
      expect(validateUrl(undefined)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should limit length', () => {
      const long = 'a'.repeat(20000);
      expect(sanitizeInput(long, 100).length).toBe(100);
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });
});

