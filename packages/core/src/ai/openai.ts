import { BaseAIProvider } from './base';
import { AIRequest, AIResponse } from '../types';

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai';

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    this.logRequest('generate', { temperature: request.temperature });

    const response = await this.fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.getDefaultModel(),
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.handleError(new Error(error), 'generate');
    }

    const data = await response.json();

    const result: AIResponse = {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      model: data.model,
      provider: this.name,
    };

    this.logResponse('generate', result);
    return result;
  }

  async *generateStream(request: AIRequest): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.getDefaultModel(),
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  protected getDefaultModel(): string {
    return this.model || 'gpt-4-turbo-preview';
  }
}

