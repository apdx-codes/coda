import {
  CodaError,
  ValidationError,
  ProviderError,
  ConfigurationError,
  GenerationError,
  isOperationalError,
  formatErrorResponse,
} from '../errors';

describe('Error Utils', () => {
  describe('Custom Error Classes', () => {
    it('should create CodaError with correct properties', () => {
      const error = new CodaError('Test error', 'TEST_CODE', 400);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('CodaError');
    });

    it('should create ValidationError', () => {
      const error = new ValidationError('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should create ProviderError with provider name', () => {
      const error = new ProviderError('API failed', 'openai');
      expect(error.provider).toBe('openai');
      expect(error.code).toBe('PROVIDER_ERROR');
    });
  });

  describe('isOperationalError', () => {
    it('should identify CodaError as operational', () => {
      const error = new ValidationError('Test');
      expect(isOperationalError(error)).toBe(true);
    });

    it('should not identify standard Error as operational', () => {
      const error = new Error('Test');
      expect(isOperationalError(error)).toBe(false);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format CodaError correctly', () => {
      const error = new ValidationError('Invalid input');
      const formatted = formatErrorResponse(error);
      
      expect(formatted.error).toBe('Invalid input');
      expect(formatted.code).toBe('VALIDATION_ERROR');
      expect(formatted.statusCode).toBe(400);
    });

    it('should format generic Error as internal error', () => {
      const error = new Error('Something went wrong');
      const formatted = formatErrorResponse(error);
      
      expect(formatted.error).toBe('Internal server error');
      expect(formatted.code).toBe('INTERNAL_ERROR');
      expect(formatted.statusCode).toBe(500);
    });
  });
});

