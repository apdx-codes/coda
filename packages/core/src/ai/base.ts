import { IAIProvider, AIRequest, AIResponse } from '../types';

export abstract class BaseAIProvider implements IAIProvider {
  abstract name: string;
  protected apiKey?: string;
  protected endpoint?: string;
  protected model?: string;

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
}

