import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('localhost'),
  
  // AI Providers
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  
  // Local AI
  LOCAL_AI_ENDPOINT: z.string().optional(),
  LOCAL_AI_MODEL: z.string().optional(),
  
  // Solana
  SOLANA_RPC_URL: z.string().default('https://api.devnet.solana.com'),
  SOLANA_NETWORK: z.enum(['mainnet-beta', 'testnet', 'devnet', 'localnet']).default('devnet'),
  
  // CORS
  CORS_ORIGIN: z.string().default('*'),
  
  // Logging
  LOG_LEVEL: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(): Environment {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('\n');
      
      throw new Error(`Environment validation failed:\n${issues}`);
    }
    throw error;
  }
}

