# Contributing to Coda Protocol

Thank you for your interest in contributing to Coda Protocol.

## Development Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/coda.git
cd coda
```

3. Install dependencies:
```bash
npm install
```

4. Create a branch:
```bash
git checkout -b feature/your-feature-name
```

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Follow existing code style
- Use strict type checking
- Add JSDoc comments for public APIs

### Code Style

```typescript
// Good
export async function generateCode(
  request: GenerationRequest,
  provider: IAIProvider
): Promise<GenerationResult> {
  // Implementation
}

// Add JSDoc for public APIs
/**
 * Generates code based on the provided request.
 * @param request - The generation request parameters
 * @param provider - The AI provider to use
 * @returns The generated code and metadata
 */
export async function generateCode(
  request: GenerationRequest,
  provider: IAIProvider
): Promise<GenerationResult> {
  // Implementation
}
```

### Naming Conventions

- Use PascalCase for classes and interfaces
- Use camelCase for functions and variables
- Use UPPER_CASE for constants
- Prefix interfaces with `I` (e.g., `IAIProvider`)

## Testing

### Unit Tests

Add tests for new features:

```typescript
describe('AnchorGenerator', () => {
  it('should generate valid Anchor program', async () => {
    const generator = new AnchorGenerator();
    const result = await generator.generate(request, provider);
    
    expect(result.files).toBeDefined();
    expect(result.files.length).toBeGreaterThan(0);
  });
});
```

### Running Tests

```bash
npm test
```

## Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Update the README if needed
5. Submit pull request with clear description

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests passing
```

## Adding New AI Providers

To add a new AI provider:

1. Create provider class in `packages/core/src/ai/`:

```typescript
import { BaseAIProvider } from './base';
import { AIRequest, AIResponse } from '../types';

export class NewProvider extends BaseAIProvider {
  name = 'new-provider';

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    // Implementation
  }

  async *generateStream(request: AIRequest): AsyncGenerator<string> {
    // Implementation
  }
}
```

2. Register in factory (`packages/core/src/ai/factory.ts`):

```typescript
case 'new-provider':
  instance = new NewProvider(config.apiKey, config.endpoint, config.model);
  break;
```

3. Update configuration schema:

```typescript
export const AIProviderSchema = z.enum([
  'openai',
  'anthropic',
  'google',
  'xai',
  'local',
  'new-provider'
]);
```

4. Add documentation
5. Add tests

## Adding New Generators

To add a new code generator:

1. Create generator in `packages/core/src/generators/`:

```typescript
import { ICodeGenerator } from '../types';

export class NewGenerator implements ICodeGenerator {
  async generate(request, aiProvider) {
    // Implementation
  }
}
```

2. Add to API routes
3. Update UI to include new generator option
4. Add documentation and examples

## Documentation

- Update README.md for user-facing changes
- Update ARCHITECTURE.md for architectural changes
- Add examples for new features
- Include JSDoc comments in code

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

### Review Criteria

- Code quality and style
- Test coverage
- Documentation
- Security considerations
- Performance impact

## Security

- Never commit API keys or secrets
- Validate all user inputs
- Follow security best practices
- Report security issues privately

## Questions

For questions or discussions, please open an issue on GitHub.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

