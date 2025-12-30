# Coda Protocol API Documentation

This document provides detailed API documentation for the Coda protocol.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required for local deployment. API keys for AI providers are configured server-side via environment variables.

## Endpoints

### Health Check

Check the API server health and configuration status.

**Endpoint:** `GET /health`

**Response:**

```typescript
{
  status: 'ok',
  version: string,
  enabledProviders: string[],
  solanaNetwork: 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet'
}
```

**Example:**

```bash
curl http://localhost:3000/api/health
```

**Response:**

```json
{
  "status": "ok",
  "version": "0.1.0",
  "enabledProviders": ["openai", "anthropic"],
  "solanaNetwork": "devnet"
}
```

### List Providers

Get a list of all configured AI providers and their availability.

**Endpoint:** `GET /providers`

**Response:**

```typescript
{
  providers: Array<{
    name: string,
    available: boolean,
    model?: string
  }>
}
```

**Example:**

```bash
curl http://localhost:3000/api/providers
```

**Response:**

```json
{
  "providers": [
    {
      "name": "openai",
      "available": true,
      "model": "gpt-4-turbo-preview"
    },
    {
      "name": "anthropic",
      "available": true,
      "model": "claude-3-opus-20240229"
    }
  ]
}
```

### Get Available Providers

Get only the providers that are currently available.

**Endpoint:** `GET /providers/available`

**Response:**

```typescript
{
  providers: Array<{
    name: string,
    available: boolean
  }>
}
```

### Generate Code

Generate Solana program code based on requirements.

**Endpoint:** `POST /generate`

**Request Body:**

```typescript
{
  projectType: 'anchor' | 'typescript-sdk' | 'native-rust',
  description: string,
  features?: string[],
  customInstructions?: string,
  provider?: string  // optional, uses default if not specified
}
```

**Response:**

```typescript
{
  success: boolean,
  result: {
    files: Array<{
      path: string,
      content: string,
      language: 'rust' | 'typescript' | 'toml' | 'json' | 'markdown'
    }>,
    instructions: string,
    nextSteps: string[]
  },
  provider: string
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "A simple SPL token minting program with admin controls",
    "features": [
      "Token minting",
      "Admin-only minting",
      "Configurable supply cap"
    ],
    "provider": "openai"
  }'
```

**Response:**

```json
{
  "success": true,
  "result": {
    "files": [
      {
        "path": "programs/token-minter/src/lib.rs",
        "content": "use anchor_lang::prelude::*;\n\n...",
        "language": "rust"
      },
      {
        "path": "programs/token-minter/Cargo.toml",
        "content": "[package]\nname = \"token-minter\"\n...",
        "language": "toml"
      }
    ],
    "instructions": "Build and deploy using Anchor CLI...",
    "nextSteps": [
      "Install Rust and Solana CLI",
      "Build the program: anchor build",
      "Deploy: anchor deploy"
    ]
  },
  "provider": "openai"
}
```

### Generate Code (Streaming)

Generate code with streaming response for better UX.

**Endpoint:** `POST /generate/stream`

**Request Body:** Same as `/generate`

**Response:** Server-Sent Events (SSE)

**Event Types:**

```typescript
// Start event
{
  type: 'start',
  provider: string
}

// Complete event
{
  type: 'complete',
  result: GenerationResult
}

// Error event
{
  type: 'error',
  error: string
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/generate/stream \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "Token program"
  }'
```

**Response:**

```
data: {"type":"start","provider":"openai"}

data: {"type":"complete","result":{...}}
```

## Request Validation

All requests are validated using Zod schemas. Invalid requests will return a 400 error with details.

### Common Validation Errors

**Missing required fields:**

```json
{
  "error": "Validation error: description is required"
}
```

**Invalid project type:**

```json
{
  "error": "Invalid project type"
}
```

**Provider not available:**

```json
{
  "error": "AI provider anthropic is not available"
}
```

## Error Responses

### 400 Bad Request

Invalid input or validation error.

```json
{
  "error": "Error message describing the issue"
}
```

### 500 Internal Server Error

Server-side error during processing.

```json
{
  "error": "Error message describing the issue"
}
```

## Rate Limiting

Rate limiting is determined by the AI provider being used:

- OpenAI: Subject to OpenAI API rate limits
- Anthropic: Subject to Anthropic API rate limits
- Google: Subject to Google AI rate limits
- xAI: Subject to xAI rate limits
- Local: No rate limits (depends on local setup)

## Usage Examples

### Node.js/TypeScript

```typescript
import fetch from 'node-fetch';

interface GenerateRequest {
  projectType: 'anchor' | 'typescript-sdk' | 'native-rust';
  description: string;
  features?: string[];
  provider?: string;
}

async function generateCode(request: GenerateRequest) {
  const response = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// Usage
const result = await generateCode({
  projectType: 'anchor',
  description: 'NFT minting program',
  features: ['Mint NFTs', 'Collection support'],
  provider: 'anthropic',
});

console.log(result.result.files);
```

### Python

```python
import requests

def generate_code(project_type, description, features=None, provider=None):
    url = 'http://localhost:3000/api/generate'
    
    payload = {
        'projectType': project_type,
        'description': description,
    }
    
    if features:
        payload['features'] = features
    if provider:
        payload['provider'] = provider
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    return response.json()

# Usage
result = generate_code(
    project_type='anchor',
    description='Token staking program',
    features=['Stake tokens', 'Earn rewards'],
    provider='openai'
)

for file in result['result']['files']:
    print(f"{file['path']}:\n{file['content']}\n")
```

### cURL

```bash
# Generate Anchor program
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "anchor",
    "description": "DAO voting program",
    "features": ["Create proposals", "Vote on proposals", "Execute proposals"]
  }'

# Check health
curl http://localhost:3000/api/health

# List providers
curl http://localhost:3000/api/providers
```

## Best Practices

### Request Design

1. **Be specific in descriptions**: Provide clear, detailed requirements
2. **Use features array**: Break down complex requirements into features
3. **Specify provider**: Choose the best provider for your use case
4. **Handle errors**: Always implement proper error handling

### Response Handling

1. **Validate generated code**: Always review AI-generated code
2. **Test thoroughly**: Test on devnet before mainnet
3. **Save generated files**: Store the complete result for future reference
4. **Follow next steps**: Execute the provided deployment instructions

### Performance

1. **Use streaming**: For better user experience with long generations
2. **Implement timeouts**: AI providers can take 10-30 seconds
3. **Cache results**: Cache similar requests to reduce API calls
4. **Retry logic**: Implement retry for transient failures

## Versioning

Current API version: `0.1.0`

The API version is available via the health endpoint. Breaking changes will result in a major version bump.

## Support

For API issues or questions:
1. Check this documentation
2. Review examples in the repository
3. Open an issue on GitHub

