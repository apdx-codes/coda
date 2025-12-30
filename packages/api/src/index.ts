import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConfigManager } from '@coda/core';
import { generatorRouter } from './routes/generator';
import { providerRouter } from './routes/provider';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/logger';

dotenv.config();

class Server {
  private app: Application;
  private config = ConfigManager.getInstance().getConfig();

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Coda Protocol API',
        version: '0.1.0',
        documentation: '/api/health',
      });
    });

    this.app.use('/api/health', healthRouter);
    this.app.use('/api/providers', providerRouter);
    this.app.use('/api/generate', generatorRouter);

    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    const PORT = this.config.server.port;
    const HOST = this.config.server.host;

    this.app.listen(PORT, HOST, () => {
      console.log('\n=================================');
      console.log('🚀 Coda Protocol API Server');
      console.log('=================================');
      console.log(`Server: http://${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Solana Network: ${this.config.solana.network}`);
      
      const enabledProviders = ConfigManager.getInstance().getEnabledProviders();
      if (enabledProviders.length > 0) {
        console.log(`AI Providers: ${enabledProviders.join(', ')}`);
      } else {
        console.log('⚠️  Warning: No AI providers configured');
      }
      console.log('=================================\n');
    });
  }
}

const server = new Server();
server.start();

