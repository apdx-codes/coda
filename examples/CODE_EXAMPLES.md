# Coda Protocol - Code Examples

Complete code examples for building Solana DApps with Rust and TypeScript.

## Table of Contents

1. [Counter Program - Full Stack](#counter-program)
2. [Token Staking Program](#staking-program)
3. [TypeScript SDK Patterns](#typescript-patterns)
4. [React Integration](#react-integration)
5. [Testing Examples](#testing-examples)

## Counter Program

### Rust Program (Anchor)

Complete counter program with all CRUD operations:

```rust
use anchor_lang::prelude::*;

declare_id!("CounterProgram11111111111111111111111111111");

#[program]
pub mod counter_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.authority.key();
        counter.count = 0;
        counter.bump = *ctx.bumps.get("counter").unwrap();
        msg!("Counter initialized");
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        require!(counter.count < u64::MAX, CounterError::Overflow);
        counter.count = counter.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        require!(counter.count > 0, CounterError::Underflow);
        counter.count = counter.count.checked_sub(1).unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Counter::INIT_SPACE,
        seeds = [b"counter", authority.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump = counter.bump,
        has_one = authority
    )]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
    pub bump: u8,
}

#[error_code]
pub enum CounterError {
    #[msg("Counter overflow")]
    Overflow,
    #[msg("Counter underflow")]
    Underflow,
}
```

### TypeScript SDK

```typescript
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';

export class CounterClient {
  constructor(
    private program: Program,
    private provider: AnchorProvider
  ) {}

  async initialize(): Promise<string> {
    const [counterPDA] = this.getCounterAddress(this.provider.wallet.publicKey);

    return await this.program.methods
      .initialize()
      .accounts({
        counter: counterPDA,
        authority: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async increment(): Promise<string> {
    const [counterPDA] = this.getCounterAddress(this.provider.wallet.publicKey);

    return await this.program.methods
      .increment()
      .accounts({
        counter: counterPDA,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  async getCounter(authority: PublicKey): Promise<{
    authority: PublicKey;
    count: BN;
    bump: number;
  }> {
    const [counterPDA] = this.getCounterAddress(authority);
    return await this.program.account.counter.fetch(counterPDA);
  }

  private getCounterAddress(authority: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('counter'), authority.toBuffer()],
      this.program.programId
    );
  }
}
```

### React Hook

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';
import { CounterClient } from './counter-client';

export function useCounter() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const client = useMemo(() => {
    if (!wallet.publicKey) return null;
    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(IDL, PROGRAM_ID, provider);
    return new CounterClient(program, provider);
  }, [connection, wallet]);

  const increment = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    try {
      const tx = await client.increment();
      console.log('Incremented:', tx);
      return tx;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { increment, loading, client };
}
```

### React Component

```typescript
export function CounterDisplay() {
  const { increment, client, loading } = useCounter();
  const [count, setCount] = useState(0);
  const wallet = useWallet();

  useEffect(() => {
    if (!client || !wallet.publicKey) return;

    const fetchCount = async () => {
      const data = await client.getCounter(wallet.publicKey);
      setCount(data.count.toNumber());
    };

    fetchCount();
    const interval = setInterval(fetchCount, 2000);
    return () => clearInterval(interval);
  }, [client, wallet.publicKey]);

  return (
    <div className="card">
      <div className="text-4xl font-bold text-center mb-4">
        {count}
      </div>
      <button
        onClick={increment}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Processing...' : 'Increment'}
      </button>
    </div>
  );
}
```

## Staking Program

See `examples/staking-program/program.rs` for the complete implementation featuring:

- Token staking with lock periods
- Reward calculation and distribution
- Compound staking support
- Authority management

Key features:
- Checked math for overflow protection
- PDA-based account management
- CPI for token transfers
- Time-based reward calculation

## TypeScript Patterns

### Connection Management

```typescript
export class SolanaConnection {
  private connection: Connection;

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint, 'confirmed');
  }

  async getLatestBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    return await this.connection.getLatestBlockhash();
  }

  async confirmTransaction(signature: string): Promise<void> {
    const { blockhash, lastValidBlockHeight } = await this.getLatestBlockhash();
    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });
  }
}
```

### Transaction Builder

```typescript
export class TransactionBuilder {
  private instructions: TransactionInstruction[] = [];

  addInstruction(instruction: TransactionInstruction): this {
    this.instructions.push(instruction);
    return this;
  }

  async build(
    payer: PublicKey,
    connection: Connection
  ): Promise<Transaction> {
    const tx = new Transaction();
    tx.add(...this.instructions);
    tx.feePayer = payer;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    return tx;
  }

  async buildAndSign(
    payer: Keypair,
    connection: Connection
  ): Promise<Transaction> {
    const tx = await this.build(payer.publicKey, connection);
    tx.sign(payer);
    return tx;
  }
}
```

### Error Handling

```typescript
export class ProgramError extends Error {
  constructor(
    public code: number,
    public name: string,
    message: string
  ) {
    super(message);
  }

  static fromAnchorError(error: any): ProgramError {
    const code = error.error?.errorCode?.number || 0;
    const name = error.error?.errorCode?.code || 'Unknown';
    const message = error.error?.errorMessage || error.message;
    return new ProgramError(code, name, message);
  }
}

// Usage
try {
  await program.methods.initialize().rpc();
} catch (err) {
  const programError = ProgramError.fromAnchorError(err);
  console.error(`Error ${programError.code}: ${programError.message}`);
}
```

## React Integration

### Wallet Provider Setup

```typescript
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Custom Hooks Pattern

```typescript
export function useProgram<T extends Idl>(
  idl: T,
  programId: PublicKey
): Program<T> | null {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet.publicKey) return null;
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
    return new Program(idl, programId, provider);
  }, [connection, wallet, idl, programId]);
}
```

## Testing Examples

### Anchor Tests

```typescript
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { expect } from 'chai';

describe('counter-program', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CounterProgram as Program<CounterProgram>;
  let counterPDA: PublicKey;

  before(async () => {
    [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('counter'), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
  });

  it('Initializes the counter', async () => {
    await program.methods
      .initialize()
      .accounts({
        counter: counterPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const counter = await program.account.counter.fetch(counterPDA);
    expect(counter.count.toNumber()).to.equal(0);
  });

  it('Increments the counter', async () => {
    await program.methods
      .increment()
      .accounts({
        counter: counterPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const counter = await program.account.counter.fetch(counterPDA);
    expect(counter.count.toNumber()).to.equal(1);
  });

  it('Fails on overflow', async () => {
    // Set counter to max value
    const counter = await program.account.counter.fetch(counterPDA);
    // Manually set to max...

    try {
      await program.methods.increment().rpc();
      expect.fail('Should have thrown overflow error');
    } catch (err) {
      expect(err.error.errorCode.code).to.equal('Overflow');
    }
  });
});
```

### Integration Tests

```typescript
describe('Staking Integration', () => {
  let stakingClient: StakingClient;
  let userTokenAccount: PublicKey;

  beforeEach(async () => {
    // Setup
  });

  it('Complete staking flow', async () => {
    // 1. Initialize pool
    await stakingClient.initializePool(100, 86400);

    // 2. Stake tokens
    const stakeAmount = 1000;
    await stakingClient.stake(stakeAmount);

    // 3. Wait and check rewards
    await sleep(5000);
    const rewards = await stakingClient.calculateRewards();
    expect(rewards.toNumber()).to.be.greaterThan(0);

    // 4. Claim rewards
    await stakingClient.claimRewards();

    // 5. Unstake
    await sleep(86400000); // Wait for lock period
    await stakingClient.unstake(stakeAmount);
  });
});
```

## Best Practices

### Security

1. **Always use checked math**
```rust
let result = value.checked_add(amount).ok_or(ErrorCode::Overflow)?;
```

2. **Validate all inputs**
```rust
require!(amount > 0, ErrorCode::InvalidAmount);
require!(amount <= max, ErrorCode::ExceedsLimit);
```

3. **Check authority**
```rust
#[account(
    mut,
    has_one = authority @ ErrorCode::Unauthorized
)]
pub account: Account<'info, MyAccount>,
```

### Performance

1. **Use PDAs efficiently**
```rust
#[account(
    seeds = [b"prefix", key.as_ref()],
    bump
)]
```

2. **Minimize account size**
```rust
#[account]
#[derive(InitSpace)]
pub struct Optimized {
    pub value: u64,    // 8 bytes
    pub flag: bool,    // 1 byte
    pub bump: u8,      // 1 byte
}
```

3. **Batch operations**
```typescript
const tx = new Transaction();
tx.add(instruction1, instruction2, instruction3);
await sendAndConfirmTransaction(connection, tx, [payer]);
```

## Additional Resources

- Full examples in `examples/` directory
- Anchor documentation: https://book.anchor-lang.com
- Solana cookbook: https://solanacookbook.com

