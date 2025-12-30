import { BaseAIProvider } from './base';
import { AIRequest, AIResponse } from '../types';

export class LocalAIProvider extends BaseAIProvider {
  name = 'local';

  isAvailable(): boolean {
    return !!this.endpoint;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!this.endpoint) {
      throw new Error('Local AI endpoint not configured');
    }

    const url = `${this.endpoint}/v1/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      throw new Error(`Local AI error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      } : undefined,
      model: data.model || this.getDefaultModel(),
      provider: this.name,
    };
  }

  async *generateStream(request: AIRequest): AsyncGenerator<string> {
    if (!this.endpoint) {
      throw new Error('Local AI endpoint not configured');
    }

    const url = `${this.endpoint}/v1/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      throw new Error(`Local AI error: ${error}`);
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
    return this.model || 'local-model';
  }
}

