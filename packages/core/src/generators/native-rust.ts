import { ICodeGenerator, GenerationRequest, GenerationResult, IAIProvider, GeneratedFile } from '../types';
import { NATIVE_RUST_SYSTEM_PROMPT, buildGenerationPrompt } from './prompts';

export class NativeRustGenerator implements ICodeGenerator {
  async generate(request: GenerationRequest, aiProvider: IAIProvider): Promise<GenerationResult> {
    const userPrompt = buildGenerationPrompt(
      request.description,
      request.features || [],
      request.customInstructions
    );

    const response = await aiProvider.generate({
      messages: [
        { role: 'system', content: NATIVE_RUST_SYSTEM_PROMPT },
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
      files.push(...this.createDefaultNativeProject(content));
    }

    return files;
  }

  private createDefaultNativeProject(generatedContent: string): GeneratedFile[] {
    return [
      {
        path: 'src/lib.rs',
        content: this.getDefaultLibRs(),
        language: 'rust',
      },
      {
        path: 'src/instruction.rs',
        content: this.getDefaultInstructionRs(),
        language: 'rust',
      },
      {
        path: 'src/processor.rs',
        content: this.getDefaultProcessorRs(),
        language: 'rust',
      },
      {
        path: 'src/state.rs',
        content: this.getDefaultStateRs(),
        language: 'rust',
      },
      {
        path: 'src/error.rs',
        content: this.getDefaultErrorRs(),
        language: 'rust',
      },
      {
        path: 'Cargo.toml',
        content: this.getDefaultCargoToml(),
        language: 'toml',
      },
    ];
  }

  private getDefaultLibRs(): string {
    return `use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

pub mod instruction;
pub mod processor;
pub mod state;
pub mod error;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    processor::process_instruction(program_id, accounts, instruction_data)
}
`;
  }

  private getDefaultInstructionRs(): string {
    return `use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::program_error::ProgramError;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum ProgramInstruction {
    Initialize,
}

impl ProgramInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, _rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        
        Ok(match variant {
            0 => Self::Initialize,
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
`;
  }

  private getDefaultProcessorRs(): string {
    return `use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

use crate::instruction::ProgramInstruction;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = ProgramInstruction::unpack(instruction_data)?;

    match instruction {
        ProgramInstruction::Initialize => {
            msg!("Instruction: Initialize");
            process_initialize(program_id, accounts)
        }
    }
}

fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    msg!("Processing initialize instruction");
    Ok(())
}
`;
  }

  private getDefaultStateRs(): string {
    return `use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ProgramState {
    pub is_initialized: bool,
}

impl ProgramState {
    pub const LEN: usize = 1;
}
`;
  }

  private getDefaultErrorRs(): string {
    return `use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum ProgramErrorCode {
    #[error("Account not initialized")]
    NotInitialized,
    
    #[error("Account already initialized")]
    AlreadyInitialized,
}

impl From<ProgramErrorCode> for ProgramError {
    fn from(e: ProgramErrorCode) -> Self {
        ProgramError::Custom(e as u32)
    }
}
`;
  }

  private getDefaultCargoToml(): string {
    return `[package]
name = "native-solana-program"
version = "0.1.0"
edition = "2021"

[dependencies]
solana-program = "1.17"
borsh = "0.10.3"
thiserror = "1.0"

[lib]
crate-type = ["cdylib", "lib"]

[profile.release]
overflow-checks = true
lto = "fat"
codegen-units = 1

[profile.release.build-override]
opt-level = 3
incremental = false
codegen-units = 1
`;
  }

  private inferLanguage(path: string, declaredLang?: string): GeneratedFile['language'] {
    if (declaredLang) {
      if (declaredLang === 'rust' || declaredLang === 'rs') return 'rust';
      if (declaredLang === 'toml') return 'toml';
      if (declaredLang === 'markdown' || declaredLang === 'md') return 'markdown';
    }

    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'rs') return 'rust';
    if (ext === 'toml') return 'toml';
    if (ext === 'md') return 'markdown';

    return 'rust';
  }

  private extractInstructions(content: string): string {
    const instructionsMatch = content.match(/(?:Instructions|How to use|Build):([\s\S]+?)(?=\n##|$)/i);
    if (instructionsMatch) {
      return instructionsMatch[1].trim();
    }
    return 'Build and deploy the native Solana program.';
  }

  private generateNextSteps(): string[] {
    return [
      'Install Rust and Solana CLI',
      'Build the program: cargo build-bpf',
      'Deploy to devnet: solana program deploy target/deploy/program.so',
      'Test the program with your client',
    ];
  }
}

