import { Router } from 'express';
import { ConfigManager, AIProviderFactory } from '@coda/core';

export const providerRouter = Router();

providerRouter.get('/', (req, res) => {
  const configManager = ConfigManager.getInstance();
  const enabledProviders = configManager.getEnabledProviders();
  
  const providers = enabledProviders.map(name => {
    const provider = AIProviderFactory.createProvider(name);
    const config = configManager.getProviderConfig(name);
    
    return {
      name,
      available: provider.isAvailable(),
      model: config.model,
    };
  });

  res.json({ providers });
});

providerRouter.get('/available', (req, res) => {
  const providers = AIProviderFactory.getAvailableProviders();
  
  res.json({
    providers: providers.map(p => ({
      name: p.name,
      available: p.isAvailable(),
    })),
  });
});

