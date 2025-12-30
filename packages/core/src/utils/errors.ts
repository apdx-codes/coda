export class CodaError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'CodaError';
  }
}

export class ValidationError extends CodaError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class ProviderError extends CodaError {
  constructor(message: string, public provider: string) {
    super(message, 'PROVIDER_ERROR', 500);
    this.name = 'ProviderError';
  }
}

export class ConfigurationError extends CodaError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 500);
    this.name = 'ConfigurationError';
  }
}

export class GenerationError extends CodaError {
  constructor(message: string) {
    super(message, 'GENERATION_ERROR', 500);
    this.name = 'GenerationError';
  }
}

export function isOperationalError(error: Error): boolean {
  if (error instanceof CodaError) {
    return true;
  }
  return false;
}

export function formatErrorResponse(error: Error) {
  if (error instanceof CodaError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  return {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}

