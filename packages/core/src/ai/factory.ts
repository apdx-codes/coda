import { IAIProvider, AIProvider } from '../types';
import { ConfigManager } from '../config';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { GoogleAIProvider } from './google';
import { XAIProvider } from './xai';
import { LocalAIProvider } from './local';

export class AIProviderFactory {
  private static providers: Map<AIProvider, IAIProvider> = new Map();

  static createProvider(provider: AIProvider): IAIProvider {
    if (this.providers.has(provider)) {
      return this.providers.get(provider)!;
    }

    const config = ConfigManager.getInstance().getProviderConfig(provider);
    let instance: IAIProvider;

    switch (provider) {
      case 'openai':
        instance = new OpenAIProvider(config.apiKey, config.endpoint, config.model);
        break;
      case 'anthropic':
        instance = new AnthropicProvider(config.apiKey, config.endpoint, config.model);
        break;
      case 'google':
        instance = new GoogleAIProvider(config.apiKey, config.endpoint, config.model);
        break;
      case 'xai':
        instance = new XAIProvider(config.apiKey, config.endpoint, config.model);
        break;
      case 'local':
        instance = new LocalAIProvider(config.apiKey, config.endpoint, config.model);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    this.providers.set(provider, instance);
    return instance;
  }

  static getAvailableProviders(): IAIProvider[] {
    const configManager = ConfigManager.getInstance();
    const enabledProviders = configManager.getEnabledProviders();
    
    return enabledProviders
      .map(provider => this.createProvider(provider))
      .filter(provider => provider.isAvailable());
  }

  static getDefaultProvider(): IAIProvider {
    const available = this.getAvailableProviders();
    if (available.length === 0) {
      throw new Error('No AI providers configured. Please add at least one API key.');
    }
    return available[0];
  }
}

