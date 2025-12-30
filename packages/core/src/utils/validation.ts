import { z } from 'zod';

export function validateApiKey(key: string | undefined, providerName: string): boolean {
  if (!key) return false;
  
  const trimmed = key.trim();
  if (trimmed.length === 0) return false;
  
  // Basic validation patterns
  const patterns: Record<string, RegExp> = {
    openai: /^sk-[a-zA-Z0-9]{48,}$/,
    anthropic: /^sk-ant-[a-zA-Z0-9-]{95,}$/,
  };
  
  const pattern = patterns[providerName];
  if (pattern) {
    return pattern.test(trimmed);
  }
  
  // For other providers, just check it's not empty
  return true;
}

export function validateUrl(url: string | undefined): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string, maxLength: number = 10000): string {
  return input.trim().slice(0, maxLength);
}

export function validateGenerationRequest(data: unknown) {
  const schema = z.object({
    projectType: z.enum(['anchor', 'typescript-sdk', 'native-rust']),
    description: z.string().min(10).max(5000),
    features: z.array(z.string()).optional(),
    customInstructions: z.string().max(2000).optional(),
  });
  
  return schema.parse(data);
}

