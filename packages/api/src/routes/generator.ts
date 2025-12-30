import { Router, Request, Response, NextFunction } from 'express';
import { 
  AIProviderFactory, 
  AnchorGenerator, 
  TypeScriptSDKGenerator, 
  NativeRustGenerator,
  GenerationRequestSchema,
  IAIProvider,
  ICodeGenerator,
} from '@coda/core';

export const generatorRouter = Router();

function getGenerator(projectType: string): ICodeGenerator {
  switch (projectType) {
    case 'anchor':
      return new AnchorGenerator();
    case 'typescript-sdk':
      return new TypeScriptSDKGenerator();
    case 'native-rust':
      return new NativeRustGenerator();
    default:
      throw new Error(`Invalid project type: ${projectType}`);
  }
}

function getAIProvider(providerName?: string): IAIProvider {
  if (!providerName || providerName === 'default') {
    return AIProviderFactory.getDefaultProvider();
  }
  
  const provider = AIProviderFactory.createProvider(providerName as any);
  
  if (!provider.isAvailable()) {
    throw new Error(`AI provider ${providerName} is not available`);
  }
  
  return provider;
}

generatorRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = GenerationRequestSchema.parse(req.body);
    const providerName = req.body.provider;

    const aiProvider = getAIProvider(providerName);
    const generator = getGenerator(request.projectType);

    console.log(`Generating ${request.projectType} using ${aiProvider.name}...`);

    const result = await generator.generate(request, aiProvider);

    res.json({
      success: true,
      result,
      metadata: {
        provider: aiProvider.name,
        projectType: request.projectType,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else {
      next(error);
    }
  }
});

generatorRouter.post('/stream', async (req, res) => {
  try {
    const request = GenerationRequestSchema.parse(req.body);
    const providerName = req.body.provider || 'default';

    let aiProvider;
    if (providerName === 'default') {
      aiProvider = AIProviderFactory.getDefaultProvider();
    } else {
      aiProvider = AIProviderFactory.createProvider(providerName);
    }

    if (!aiProvider.isAvailable()) {
      return res.status(400).json({
        error: `AI provider ${aiProvider.name} is not available`,
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const generator = new AnchorGenerator();
    
    res.write(`data: ${JSON.stringify({ type: 'start', provider: aiProvider.name })}\n\n`);

    const result = await generator.generate(request, aiProvider);
    
    res.write(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Stream generation error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })}\n\n`);
    res.end();
  }
});

