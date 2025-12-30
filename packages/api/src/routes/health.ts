import { Router } from 'express';
import { ConfigManager } from '@coda/core';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  const config = ConfigManager.getInstance();
  const enabledProviders = config.getEnabledProviders();

  res.json({
    status: 'ok',
    version: '0.1.0',
    enabledProviders,
    solanaNetwork: config.getConfig().solana.network,
  });
});

