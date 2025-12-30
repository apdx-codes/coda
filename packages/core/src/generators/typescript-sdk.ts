import { ICodeGenerator, GenerationRequest, GenerationResult, IAIProvider, GeneratedFile } from '../types';
import { TYPESCRIPT_SDK_SYSTEM_PROMPT, buildGenerationPrompt } from './prompts';

export class TypeScriptSDKGenerator implements ICodeGenerator {
  async generate(request: GenerationRequest, aiProvider: IAIProvider): Promise<GenerationResult> {
    const userPrompt = buildGenerationPrompt(
      request.description,
      request.features || [],
      request.customInstructions
    );

    const response = await aiProvider.generate({
      messages: [
        { role: 'system', content: TYPESCRIPT_SDK_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      maxTokens: 8000,
    });

    const files = this.parseGeneratedCode(response.content);
    const instructions = this.extractInstructions(response.content);
    const nextSteps = this.generateNextSteps();

    return {
      files,
      instructions,
      nextSteps,
    };
  }

  private parseGeneratedCode(content: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const fileRegex = /(?:File|Path):\s*([^\n]+)\n```(\w+)?\n([\s\S]+?)```/gi;
    let match;

    while ((match = fileRegex.exec(content)) !== null) {
      const path = match[1].trim();
      const language = this.inferLanguage(path, match[2]);
      const fileContent = match[3].trim();

      files.push({
        path,
        content: fileContent,
        language,
      });
    }

    if (files.length === 0) {
      files.push(...this.createDefaultSDKProject(content));
    }

    return files;
  }

  private createDefaultSDKProject(generatedContent: string): GeneratedFile[] {
    const tsCodeMatch = generatedContent.match(/```(?:typescript|ts)\n([\s\S]+?)```/);
    
    return [
      {
        path: 'src/index.ts',
        content: tsCodeMatch ? tsCodeMatch[1].trim() : this.getDefaultIndexTs(),
        language: 'typescript',
      },
      {
        path: 'src/client.ts',
        content: this.getDefaultClientTs(),
        language: 'typescript',
      },
      {
        path: 'src/types.ts',
        content: this.getDefaultTypesTs(),
        language: 'typescript',
      },
      {
        path: 'package.json',
        content: this.getDefaultPackageJson(),
        language: 'json',
      },
      {
        path: 'tsconfig.json',
        content: this.getDefaultTsConfig(),
        language: 'json',
      },
    ];
  }

  private getDefaultIndexTs(): string {
    return `export * from './client';
export * from './types';
`;
  }

  private getDefaultClientTs(): string {
    return `import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';

export class ProgramClient {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection, programId: PublicKey) {
    this.connection = connection;
    this.programId = programId;
  }

  async initialize(): Promise<string> {
    // Implement your program interaction logic here
    throw new Error('Not implemented');
  }
}
`;
  }

  private getDefaultTypesTs(): string {
    return `import { PublicKey } from '@solana/web3.js';

export interface ProgramAccount {
  publicKey: PublicKey;
  account: any;
}

export interface InitializeParams {
  // Add your parameters here
}
`;
  }

  private getDefaultPackageJson(): string {
    return JSON.stringify({
      name: 'solana-sdk',
      version: '0.1.0',
      description: 'TypeScript SDK for Solana program',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        test: 'jest',
      },
      dependencies: {
        '@solana/web3.js': '^1.87.6',
        '@coral-xyz/anchor': '^0.29.0',
      },
      devDependencies: {
        typescript: '^5.3.3',
        '@types/node': '^20.10.6',
      },
    }, null, 2);
  }

  private getDefaultTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        declaration: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    }, null, 2);
  }

  private inferLanguage(path: string, declaredLang?: string): GeneratedFile['language'] {
    if (declaredLang) {
      if (declaredLang === 'typescript' || declaredLang === 'ts') return 'typescript';
      if (declaredLang === 'json') return 'json';
      if (declaredLang === 'markdown' || declaredLang === 'md') return 'markdown';
    }

    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'json') return 'json';
    if (ext === 'md') return 'markdown';

    return 'typescript';
  }

  private extractInstructions(content: string): string {
    const instructionsMatch = content.match(/(?:Instructions|How to use|Usage):([\s\S]+?)(?=\n##|$)/i);
    if (instructionsMatch) {
      return instructionsMatch[1].trim();
    }
    return 'Install dependencies and build the SDK.';
  }

  private generateNextSteps(): string[] {
    return [
      'Install Node.js and npm if not already installed',
      'Install dependencies: npm install',
      'Build the SDK: npm run build',
      'Import and use in your project',
    ];
  }
}

