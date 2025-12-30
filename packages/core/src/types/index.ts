import { z } from 'zod';

export const MessageRoleSchema = z.enum(['system', 'user', 'assistant']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const AIRequestSchema = z.object({
  messages: z.array(MessageSchema),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().optional(),
  stream: z.boolean().default(false),
});
export type AIRequest = z.infer<typeof AIRequestSchema>;

export const AIResponseSchema = z.object({
  content: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }).optional(),
  model: z.string(),
  provider: z.string(),
});
export type AIResponse = z.infer<typeof AIResponseSchema>;

export const ProjectTypeSchema = z.enum(['anchor', 'native-rust', 'typescript-sdk']);
export type ProjectType = z.infer<typeof ProjectTypeSchema>;

export const GenerationRequestSchema = z.object({
  projectType: ProjectTypeSchema,
  description: z.string(),
  features: z.array(z.string()).optional(),
  customInstructions: z.string().optional(),
});
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

export const GeneratedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  language: z.enum(['rust', 'typescript', 'toml', 'json', 'markdown']),
});
export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;

export const GenerationResultSchema = z.object({
  files: z.array(GeneratedFileSchema),
  instructions: z.string(),
  nextSteps: z.array(z.string()),
});
export type GenerationResult = z.infer<typeof GenerationResultSchema>;

export interface IAIProvider {
  name: string;
  isAvailable(): boolean;
  generate(request: AIRequest): Promise<AIResponse>;
  generateStream(request: AIRequest): AsyncGenerator<string>;
}

export interface ICodeGenerator {
  generate(request: GenerationRequest, aiProvider: IAIProvider): Promise<GenerationResult>;
}

