import { IAIProvider, AIRequest, AIResponse } from '../types';
import { logger } from '../utils/logger';
import { ProviderError } from '../utils/errors';

export abstract class BaseAIProvider implements IAIProvider {
  abstract name: string;
  protected apiKey?: string;
  protected endpoint?: string;
  protected model?: string;
  protected timeout: number = 60000; // 60 seconds default

  constructor(apiKey?: string, endpoint?: string, model?: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.model = model;
  }

  abstract isAvailable(): boolean;
  abstract generate(request: AIRequest): Promise<AIResponse>;
  abstract generateStream(request: AIRequest): AsyncGenerator<string>;

  protected getDefaultModel(): string {
    return this.model || 'default';
  }

  protected async fetchWithTimeout(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderError(`Request timeout after ${this.timeout}ms`, this.name);
      }
      throw error;
    }
  }

  protected handleError(error: unknown, context: string): never {
    logger.error(`${this.name} error in ${context}`, error);
    
    if (error instanceof ProviderError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ProviderError(`${context} failed: ${message}`, this.name);
  }

  protected logRequest(method: string, params?: any): void {
    logger.debug(`${this.name}.${method} called`, params);
  }

  protected logResponse(method: string, response: any): void {
    logger.debug(`${this.name}.${method} completed`, {
      model: response.model,
      usage: response.usage,
    });
  }
}

