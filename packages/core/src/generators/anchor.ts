import { ICodeGenerator, GenerationRequest, GenerationResult, IAIProvider, GeneratedFile } from '../types';
import { ANCHOR_SYSTEM_PROMPT, buildGenerationPrompt } from './prompts';

export class AnchorGenerator implements ICodeGenerator {
  async generate(request: GenerationRequest, aiProvider: IAIProvider): Promise<GenerationResult> {
    const userPrompt = buildGenerationPrompt(
      request.description,
      request.features || [],
      request.customInstructions
    );

    const response = await aiProvider.generate({
      messages: [
        { role: 'system', content: ANCHOR_SYSTEM_PROMPT },
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
      files.push(...this.createDefaultAnchorProject(content));
    }

    return files;
  }

  private createDefaultAnchorProject(generatedContent: string): GeneratedFile[] {
    const rustCodeMatch = generatedContent.match(/```rust\n([\s\S]+?)```/);
    const tomlCodeMatch = generatedContent.match(/```toml\n([\s\S]+?)```/);

    return [
      {
        path: 'programs/my-program/src/lib.rs',
        content: rustCodeMatch ? rustCodeMatch[1].trim() : this.getDefaultLibRs(),
        language: 'rust',
      },
      {
        path: 'programs/my-program/Cargo.toml',
        content: tomlCodeMatch ? tomlCodeMatch[1].trim() : this.getDefaultCargoToml(),
        language: 'toml',
      },
      {
        path: 'Anchor.toml',
        content: this.getDefaultAnchorToml(),
        language: 'toml',
      },
    ];
  }

  private getDefaultLibRs(): string {
    return `use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Program initialized!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
`;
  }

  private getDefaultCargoToml(): string {
    return `[package]
name = "my-program"
version = "0.1.0"
description = "Created with Coda"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "my_program"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.29.0"
`;
  }

  private getDefaultAnchorToml(): string {
    return `[features]
seeds = false
skip-lint = false

[programs.localnet]
my_program = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[programs.devnet]
my_program = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
`;
  }

  private inferLanguage(path: string, declaredLang?: string): GeneratedFile['language'] {
    if (declaredLang) {
      if (declaredLang === 'rust' || declaredLang === 'rs') return 'rust';
      if (declaredLang === 'typescript' || declaredLang === 'ts') return 'typescript';
      if (declaredLang === 'toml') return 'toml';
      if (declaredLang === 'json') return 'json';
      if (declaredLang === 'markdown' || declaredLang === 'md') return 'markdown';
    }

    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'rs') return 'rust';
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'toml') return 'toml';
    if (ext === 'json') return 'json';
    if (ext === 'md') return 'markdown';

    return 'rust';
  }

  private extractInstructions(content: string): string {
    const instructionsMatch = content.match(/(?:Instructions|How to use|Deployment):([\s\S]+?)(?=\n##|$)/i);
    if (instructionsMatch) {
      return instructionsMatch[1].trim();
    }
    return 'Build and deploy the program using Anchor CLI.';
  }

  private generateNextSteps(): string[] {
    return [
      'Install Rust and Solana CLI if not already installed',
      'Install Anchor CLI: cargo install --git https://github.com/coral-xyz/anchor avm --locked',
      'Initialize Solana wallet: solana-keygen new',
      'Set Solana cluster to devnet: solana config set --url devnet',
      'Build the program: anchor build',
      'Deploy the program: anchor deploy',
      'Run tests: anchor test',
    ];
  }
}

