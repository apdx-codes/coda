# Token Program Example

This example demonstrates generating a simple SPL token minting program using Coda.

## Overview

This token program allows:
- Initializing a new token mint
- Minting tokens to specific accounts
- Admin-only minting authority
- Transfer of minting authority

## Generation Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "SPL token program with controlled minting",
    "features": [
      "Initialize token mint with decimals configuration",
      "Mint tokens to specified recipient",
      "Only admin can mint tokens",
      "Transfer minting authority to new admin"
    ]
  }'
```

## Expected Output Structure

```
programs/token-minter/
├── src/
│   └── lib.rs
├── Cargo.toml
└── Anchor.toml
```

## Key Features

### Initialize Mint

```rust
pub fn initialize_mint(
    ctx: Context<InitializeMint>,
    decimals: u8,
) -> Result<()>
```

Creates a new token mint with the specified decimal places.

### Mint Tokens

```rust
pub fn mint_tokens(
    ctx: Context<MintTokens>,
    amount: u64,
) -> Result<()>
```

Mints tokens to a recipient account. Only callable by the admin.

### Transfer Authority

```rust
pub fn transfer_authority(
    ctx: Context<TransferAuthority>,
    new_admin: Pubkey,
) -> Result<()>
```

Transfers minting authority to a new admin address.

## Build and Deploy

1. Build the program:
```bash
anchor build
```

2. Get the program ID:
```bash
anchor keys list
```

3. Update `Anchor.toml` and `lib.rs` with the program ID

4. Deploy to devnet:
```bash
anchor deploy --provider.cluster devnet
```

## Testing

Create a test file `tests/token-minter.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenMinter } from "../target/types/token_minter";

describe("token-minter", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenMinter as Program<TokenMinter>;

  it("Initializes the mint", async () => {
    const tx = await program.methods
      .initializeMint(9)
      .rpc();
    
    console.log("Transaction signature:", tx);
  });

  it("Mints tokens", async () => {
    const amount = new anchor.BN(1000000000); // 1 token with 9 decimals
    
    const tx = await program.methods
      .mintTokens(amount)
      .rpc();
    
    console.log("Minted tokens:", tx);
  });
});
```

Run tests:
```bash
anchor test
```

## Integration Example

### Frontend Integration

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

function MintTokens() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const mintTokens = async (amount: number) => {
    if (!wallet.publicKey) return;

    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(IDL, PROGRAM_ID, provider);

    await program.methods
      .mintTokens(new BN(amount))
      .rpc();
  };

  return (
    <button onClick={() => mintTokens(1000000000)}>
      Mint Tokens
    </button>
  );
}
```

### CLI Tool

```typescript
import { Command } from 'commander';
import { Connection, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';

const program = new Command();

program
  .command('mint <amount>')
  .description('Mint tokens')
  .action(async (amount) => {
    const connection = new Connection('https://api.devnet.solana.com');
    const wallet = loadKeypair();
    
    const provider = new AnchorProvider(connection, wallet, {});
    const programInstance = new Program(IDL, PROGRAM_ID, provider);

    const tx = await programInstance.methods
      .mintTokens(new BN(amount))
      .rpc();

    console.log('Minted tokens:', tx);
  });

program.parse();
```

## Security Considerations

1. **Admin Validation**: Always verify the signer is the admin
2. **Overflow Protection**: Use checked arithmetic for amounts
3. **Authority Transfer**: Implement timelock for authority changes
4. **Supply Cap**: Consider implementing maximum supply
5. **Freeze Authority**: Optionally implement token freezing

## Customization Ideas

1. **Supply Cap**: Add maximum supply limit
```rust
pub struct MintConfig {
    pub max_supply: u64,
    pub current_supply: u64,
}
```

2. **Minting Fee**: Charge fee for minting
```rust
pub fn mint_tokens(
    ctx: Context<MintTokens>,
    amount: u64,
    fee: u64,
) -> Result<()>
```

3. **Whitelist**: Restrict minting to whitelisted addresses
```rust
#[account]
pub struct Whitelist {
    pub addresses: Vec<Pubkey>,
}
```

4. **Vesting Schedule**: Implement token vesting
```rust
pub struct VestingSchedule {
    pub start_time: i64,
    pub end_time: i64,
    pub amount: u64,
}
```

## Common Issues

### Issue: Insufficient Funds

**Solution**: Ensure the payer account has enough SOL:
```bash
solana airdrop 2 <your-address> --url devnet
```

### Issue: Account Already Initialized

**Solution**: Use different account or add update functionality

### Issue: Invalid Authority

**Solution**: Verify the correct admin keypair is signing

## Resources

- Anchor Documentation: https://book.anchor-lang.com
- SPL Token Program: https://spl.solana.com/token
- Solana Cookbook: https://solanacookbook.com

