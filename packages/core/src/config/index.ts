import { z } from 'zod';
import { logger } from '../utils/logger';
import { ConfigurationError } from '../utils/errors';
import { validateApiKey, validateUrl } from '../utils/validation';

export const AIProviderSchema = z.enum(['openai', 'anthropic', 'google', 'xai', 'local']);
export type AIProvider = z.infer<typeof AIProviderSchema>;

export const ConfigSchema = z.object({
  aiProviders: z.record(AIProviderSchema, z.object({
    apiKey: z.string().optional(),
    endpoint: z.string().optional(),
    model: z.string().optional(),
    enabled: z.boolean().default(false),
  })),
  solana: z.object({
    rpcUrl: z.string().default('https://api.devnet.solana.com'),
    network: z.enum(['mainnet-beta', 'testnet', 'devnet', 'localnet']).default('devnet'),
  }),
  server: z.object({
    port: z.number().default(3000),
    host: z.string().default('localhost'),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private validateConfig(): void {
    const enabledProviders = this.getEnabledProviders();
    
    if (enabledProviders.length === 0) {
      logger.warn('No AI providers configured. Please add at least one API key.');
    }

    // Validate Solana RPC URL
    if (!validateUrl(this.config.solana.rpcUrl)) {
      throw new ConfigurationError(`Invalid Solana RPC URL: ${this.config.solana.rpcUrl}`);
    }

    // Validate port
    if (this.config.server.port < 1 || this.config.server.port > 65535) {
      throw new ConfigurationError(`Invalid port number: ${this.config.server.port}`);
    }

    logger.info('Configuration validated successfully', {
      enabledProviders: enabledProviders.length,
      network: this.config.solana.network,
    });
  }

  private loadConfig(): Config {
    const aiProviders: Config['aiProviders'] = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        enabled: !!process.env.OPENAI_API_KEY,
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        enabled: !!process.env.ANTHROPIC_API_KEY,
      },
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        model: process.env.GOOGLE_AI_MODEL || 'gemini-pro',
        enabled: !!process.env.GOOGLE_AI_API_KEY,
      },
      xai: {
        apiKey: process.env.XAI_API_KEY,
        model: process.env.XAI_MODEL || 'grok-beta',
        enabled: !!process.env.XAI_API_KEY,
      },
      local: {
        endpoint: process.env.LOCAL_AI_ENDPOINT || 'http://localhost:8080',
        model: process.env.LOCAL_AI_MODEL,
        enabled: !!process.env.LOCAL_AI_ENDPOINT,
      },
    };

    return ConfigSchema.parse({
      aiProviders,
      solana: {
        rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        network: (process.env.SOLANA_NETWORK as any) || 'devnet',
      },
      server: {
        port: parseInt(process.env.PORT || '3000'),
        host: process.env.HOST || 'localhost',
      },
    });
  }

  getConfig(): Config {
    return this.config;
  }

  getEnabledProviders(): AIProvider[] {
    return Object.entries(this.config.aiProviders)
      .filter(([_, config]) => config.enabled)
      .map(([provider]) => provider as AIProvider);
  }

  getProviderConfig(provider: AIProvider) {
    return this.config.aiProviders[provider];
  }
}

