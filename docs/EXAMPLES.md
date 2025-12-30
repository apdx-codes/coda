# Coda Protocol Examples

This document provides practical examples of using Coda to generate Solana programs.

## Example 1: SPL Token Program

Generate a simple SPL token minting program with admin controls.

### Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "SPL token program with minting capabilities",
    "features": [
      "Initialize token mint",
      "Mint tokens to specific accounts",
      "Admin-only minting authority",
      "Transfer authority capability"
    ]
  }'
```

### Use Cases

- Creating project tokens
- Reward systems
- In-game currencies
- Governance tokens

### Generated Structure

```
programs/token-program/
├── src/
│   └── lib.rs          # Main program logic
├── Cargo.toml          # Rust dependencies
└── Anchor.toml         # Anchor configuration
```

### Next Steps

1. Review the generated code
2. Customize token metadata
3. Build: `anchor build`
4. Deploy to devnet: `anchor deploy`
5. Test minting functionality

## Example 2: NFT Marketplace

Generate an NFT marketplace with listing and purchasing.

### Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "NFT marketplace for buying and selling NFTs",
    "features": [
      "List NFTs for sale",
      "Purchase listed NFTs",
      "Cancel listings",
      "Marketplace fee collection",
      "Escrow for secure transactions"
    ],
    "provider": "anthropic"
  }'
```

### Use Cases

- Digital art marketplaces
- Gaming item trading
- Collectibles platforms
- Domain name trading

### Key Components

- **Listing Account**: Stores NFT listing information
- **Escrow Account**: Holds NFT during sale
- **Purchase Instruction**: Handles NFT transfer and payment
- **Fee Collection**: Marketplace revenue mechanism

### Integration

After generation:
1. Connect to a frontend (React/Next.js)
2. Integrate with wallet adapters
3. Add metadata display
4. Implement search and filtering

## Example 3: DAO Governance

Generate a DAO governance system with proposal voting.

### Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "DAO governance system with proposals and voting",
    "features": [
      "Create governance proposals",
      "Token-weighted voting",
      "Proposal execution after passage",
      "Timelock for security",
      "Quorum requirements"
    ],
    "customInstructions": "Include council override mechanism for emergency actions"
  }'
```

### Use Cases

- Protocol governance
- Community decision-making
- Treasury management
- Parameter updates

### Governance Flow

1. **Proposal Creation**: Member submits proposal
2. **Voting Period**: Token holders vote
3. **Quorum Check**: Verify minimum participation
4. **Execution**: Execute passed proposals
5. **Timelock**: Delay for security

## Example 4: Staking Program

Generate a token staking program with rewards.

### Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "Token staking program with rewards distribution",
    "features": [
      "Stake tokens",
      "Unstake tokens",
      "Claim rewards",
      "Configurable reward rate",
      "Lock periods for higher rewards"
    ]
  }'
```

### Use Cases

- Liquidity mining
- Long-term holder incentives
- Network security (validator staking)
- Yield farming

### Staking Mechanics

- **Stake Account**: Tracks user stakes
- **Reward Calculation**: Based on time and amount
- **Lock Periods**: Optional for bonus rewards
- **Compound Staking**: Auto-restake rewards

## Example 5: TypeScript SDK

Generate a TypeScript SDK for your Solana program.

### Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "typescript-sdk",
    "description": "TypeScript SDK for interacting with a token staking program",
    "features": [
      "Connect to program",
      "Stake tokens function",
      "Unstake tokens function",
      "Fetch user stake info",
      "Calculate pending rewards"
    ]
  }'
```

### Generated SDK Structure

```
sdk/
├── src/
│   ├── index.ts        # Main exports
│   ├── client.ts       # Program client
│   ├── types.ts        # Type definitions
│   └── utils.ts        # Helper functions
├── package.json
└── tsconfig.json
```

### SDK Usage Example

```typescript
import { StakingClient } from './sdk';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();

const client = new StakingClient(connection, programId);

// Stake tokens
await client.stake(wallet, amount);

// Get stake info
const stakeInfo = await client.getStakeInfo(wallet.publicKey);

// Claim rewards
await client.claimRewards(wallet);
```

## Example 6: Native Rust Program

Generate a native Solana program without Anchor framework.

### Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "native-rust",
    "description": "Simple counter program that increments a value",
    "features": [
      "Initialize counter account",
      "Increment counter",
      "Reset counter"
    ]
  }'
```

### Use Cases

- Maximum performance requirements
- Learning Solana internals
- Custom serialization needs
- Fine-grained control

### Native Program Structure

```
src/
├── lib.rs              # Entry point
├── instruction.rs      # Instruction definitions
├── processor.rs        # Instruction processing
├── state.rs           # Account structures
└── error.rs           # Error definitions
```

## Example 7: Escrow Program

Generate an escrow program for secure trades.

### Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "Escrow program for peer-to-peer token swaps",
    "features": [
      "Initialize escrow",
      "Deposit tokens",
      "Complete swap",
      "Cancel escrow and refund",
      "Timelock expiration"
    ]
  }'
```

### Use Cases

- P2P token swaps
- Atomic transactions
- Conditional payments
- Trust-minimized trading

### Escrow Flow

1. **Initialize**: Create escrow account
2. **Deposit**: Lock tokens in escrow
3. **Accept**: Counterparty accepts and deposits
4. **Execute**: Automatic swap completion
5. **Timeout**: Refund after expiration

## Example 8: Multi-Signature Wallet

Generate a multi-sig wallet program.

### Request

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "Multi-signature wallet requiring M-of-N approvals",
    "features": [
      "Create multi-sig wallet",
      "Submit transactions",
      "Approve transactions",
      "Execute approved transactions",
      "Configurable threshold"
    ]
  }'
```

### Use Cases

- Treasury management
- Shared custody
- Corporate accounts
- Security-critical operations

## Integration Examples

### Frontend Integration

```typescript
// React component using generated SDK
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgramClient } from './hooks/useProgramClient';

function StakingUI() {
  const wallet = useWallet();
  const client = useProgramClient();

  const handleStake = async (amount: number) => {
    if (!wallet.publicKey) return;
    
    const tx = await client.stake(wallet.publicKey, amount);
    await wallet.sendTransaction(tx);
  };

  return (
    <button onClick={() => handleStake(100)}>
      Stake 100 Tokens
    </button>
  );
}
```

### CLI Tool Integration

```typescript
// CLI tool using generated SDK
import { Command } from 'commander';
import { StakingClient } from './sdk';

const program = new Command();

program
  .command('stake <amount>')
  .description('Stake tokens')
  .action(async (amount) => {
    const client = new StakingClient(connection, programId);
    await client.stake(wallet, parseFloat(amount));
    console.log(`Staked ${amount} tokens`);
  });

program.parse();
```

### Backend Integration

```typescript
// Express API using generated SDK
import express from 'express';
import { StakingClient } from './sdk';

const app = express();

app.post('/api/stake', async (req, res) => {
  const { amount, userPublicKey } = req.body;
  
  const client = new StakingClient(connection, programId);
  const tx = await client.stake(userPublicKey, amount);
  
  res.json({ transaction: tx });
});
```

## Testing Generated Code

### Unit Testing

```typescript
import { expect } from 'chai';
import { StakingClient } from './sdk';

describe('Staking Client', () => {
  it('should stake tokens', async () => {
    const amount = 100;
    await client.stake(wallet.publicKey, amount);
    
    const info = await client.getStakeInfo(wallet.publicKey);
    expect(info.amount).to.equal(amount);
  });
});
```

### Integration Testing

```bash
# Test on localnet
anchor test

# Test on devnet
anchor test --provider.cluster devnet
```

## Best Practices

### Code Review

1. Review all generated code before deployment
2. Check for security vulnerabilities
3. Verify business logic correctness
4. Test edge cases

### Customization

1. Start with generated code as a template
2. Customize to specific requirements
3. Add additional validations
4. Implement custom error handling

### Deployment

1. Test thoroughly on localnet
2. Deploy to devnet for testing
3. Conduct security audit for mainnet
4. Use upgrade authority carefully

## Additional Resources

- Solana Documentation: https://docs.solana.com
- Anchor Book: https://book.anchor-lang.com
- Solana Cookbook: https://solanacookbook.com
- Security Best Practices: https://github.com/coral-xyz/sealevel-attacks

