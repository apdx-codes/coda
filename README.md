# Coda Protocol

## Contract Address (CA)

```
6BkC3K5v1FtzsJVs7xq6YjAAhpr2W492LPq3iRG8pump
```

## Donation Addresses

**Solana:**
```
DzWyLM6bz2dVGoh7t4fGoBpVkhewhuYrdGug6JQ3uhMg
```

**Ethereum / Base:**
```
0x4171c7F8d20747A3e0f1b904364bC963bb58E927
```

---

Coda is a Web3 no-code builder protocol for Solana blockchain development. It enables developers to generate production-ready Solana programs, Rust code, and TypeScript SDKs using AI assistance from multiple providers (OpenAI, Anthropic, Google, xAI, or local AI models).

## Features

- Multi-AI Provider Support: OpenAI, Anthropic Claude, Google Gemini, xAI Grok, and local AI
- Solana Program Generation: Anchor framework, native Rust programs
- TypeScript SDK Generation: Complete client SDKs for Solana programs
- Local Deployment: Run entirely on your machine with just API keys
- Modern Web UI: Clean, intuitive interface for code generation
- REST API: Programmatic access to all generation capabilities

## Architecture

```
coda/
├── packages/
│   ├── core/          # Core protocol and AI providers
│   ├── api/           # REST API server
│   └── web/           # Next.js web interface
├── docs/              # Documentation
└── examples/          # Example projects
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- At least one AI provider API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coda
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp env.example .env
```

4. Edit `.env` and add your API keys:
```
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_key
XAI_API_KEY=your_xai_key
```

5. Start the development servers:
```bash
npm run dev
```

The API server will start on `http://localhost:3000` and the web UI on `http://localhost:3001`.

## Usage

### Web Interface

1. Navigate to `http://localhost:3001`
2. Select your project type (Anchor, Native Rust, or TypeScript SDK)
3. Describe your project requirements
4. Click "Generate Code"
5. Download the generated files

### API Usage

#### Generate Code

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "A simple token minting program",
    "features": ["Token minting", "Access control"],
    "provider": "openai"
  }'
```

#### Check Provider Status

```bash
curl http://localhost:3000/api/providers
```

#### Health Check

```bash
curl http://localhost:3000/api/health
```

## Project Types

### Anchor Program

Generates a complete Anchor framework project with:
- Program logic in Rust
- Cargo.toml configuration
- Anchor.toml setup
- Deployment instructions

### Native Rust Program

Generates a native Solana program without Anchor:
- lib.rs main entry point
- instruction.rs for instruction definitions
- processor.rs for instruction processing
- state.rs for account structures
- error.rs for custom errors

### TypeScript SDK

Generates a TypeScript SDK for interacting with Solana programs:
- Client class for program interaction
- Type definitions
- Helper utilities
- Complete package setup

## AI Providers

### OpenAI

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
```

### Anthropic Claude

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229
```

### Google Gemini

```
GOOGLE_AI_API_KEY=...
GOOGLE_AI_MODEL=gemini-pro
```

### xAI Grok

```
XAI_API_KEY=...
XAI_MODEL=grok-beta
```

### Local AI

```
LOCAL_AI_ENDPOINT=http://localhost:8080
LOCAL_AI_MODEL=your-local-model
```

For local AI, ensure you have a compatible OpenAI-compatible API endpoint running (e.g., llama.cpp, LocalAI, Ollama with OpenAI compatibility).

## Configuration

### Solana Network

Configure the Solana network in `.env`:

```
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

Supported networks: `mainnet-beta`, `testnet`, `devnet`, `localnet`

### Server Settings

```
PORT=3000
NODE_ENV=development
```

## Development

### Project Structure

```
packages/core/src/
├── config/           # Configuration management
├── types/            # TypeScript type definitions
├── ai/               # AI provider implementations
│   ├── base.ts       # Base provider class
│   ├── openai.ts     # OpenAI provider
│   ├── anthropic.ts  # Anthropic provider
│   ├── google.ts     # Google AI provider
│   ├── xai.ts        # xAI provider
│   ├── local.ts      # Local AI provider
│   └── factory.ts    # Provider factory
└── generators/       # Code generators
    ├── anchor.ts     # Anchor program generator
    ├── typescript-sdk.ts  # TypeScript SDK generator
    └── native-rust.ts     # Native Rust generator
```

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

## API Reference

### POST /api/generate

Generate code based on requirements.

Request Body:
```typescript
{
  projectType: 'anchor' | 'typescript-sdk' | 'native-rust',
  description: string,
  features?: string[],
  customInstructions?: string,
  provider?: string  // optional, defaults to first available
}
```

Response:
```typescript
{
  success: boolean,
  result: {
    files: Array<{
      path: string,
      content: string,
      language: string
    }>,
    instructions: string,
    nextSteps: string[]
  },
  provider: string
}
```

### GET /api/providers

List all configured AI providers.

Response:
```typescript
{
  providers: Array<{
    name: string,
    available: boolean,
    model?: string
  }>
}
```

### GET /api/health

Check API health and configuration.

Response:
```typescript
{
  status: 'ok',
  version: string,
  enabledProviders: string[],
  solanaNetwork: string
}
```

## Examples

See the `examples/` directory for complete project examples:

- `examples/token-program/` - Token minting program
- `examples/nft-marketplace/` - NFT marketplace
- `examples/dao-governance/` - DAO governance system

## Security Considerations

- Never commit API keys to version control
- Use environment variables for sensitive configuration
- Review generated code before deployment
- Test thoroughly on devnet before mainnet deployment
- Follow Solana security best practices
- Implement proper access controls and validation

## Contributing

Contributions are welcome. Please ensure:

1. Code follows TypeScript best practices
2. All tests pass
3. Documentation is updated
4. Security considerations are addressed

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.

