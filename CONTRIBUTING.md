# Stellar Payment Router SDK

TypeScript SDK for interacting with the Stellar Payment Router API.

## Features

- **Route Finding** — Discover optimal payment paths between assets
- **Transaction Building** — Construct and sign transactions
- **Wallet Integration** — Freighter and custom signer support
- **Liquidity Insights** — Query pool and liquidity data
- **Type Safe** — Full TypeScript support

## Installation

```bash
npm install @stellar-payment-router/sdk
```

## Quick Start

### Basic Usage

**TypeScript**

```typescript
import { SprClient } from '@stellar-payment-router/sdk';

const client = new SprClient({
  baseUrl: 'http://localhost:4000/api/v1',
  network: 'testnet',
});

// Find a route
const route = await client.findRoute({
  sourceAsset: 'native',
  destinationAsset: 'USDC:GBUQWP3BOUZX34ULNQG23RQ6F4BFSRJ5UL3QC6MFQEPJDD7W2QC5X4XY',
  amount: '100',
  maxSlippage: 0.5,
});

console.log(route);
```

### Wallet Integration (Freighter)

**TypeScript**

```typescript
import { SprClient, FreighterSigner } from '@stellar-payment-router/sdk';

const signer = new FreighterSigner();
const isAvailable = await signer.isAvailable();

if (isAvailable) {
  const publicKey = await signer.getPublicKey();
  console.log('Connected:', publicKey);
}
```

### Custom Signer

**TypeScript**

```typescript
import { SprClient, CustomSigner } from '@stellar-payment-router/sdk';

const customSigner = new CustomSigner(
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  async (tx) => {
    // Your signing logic here
    return signedTx;
  }
);
```

## API Reference

### SprClient

#### Constructor

**TypeScript**

```typescript
new SprClient(config: SprClientConfig)
```

**Config Options:**

- baseUrl (string) — API base URL
- network ('testnet' | 'mainnet') — Stellar network
- apiKey? (string) — Optional API key
- timeout? (number) — Request timeout in ms (default: 30000)

#### Methods

**findRoute(params: FindRouteParams): Promise<Route>**
Find the best route between two assets.

```typescript
const route = await client.findRoute({
  sourceAsset: 'native',
  destinationAsset: 'USDC:...',
  amount: '100',
  maxSlippage: 0.5,
});
```

**simulateRoute(params: SimulateRouteParams): Promise<Route>**
Simulate route execution without submitting.

**executeRoute(params: ExecuteRouteParams): Promise<TransactionResult>**
Execute a route transaction.

**getAccount(accountId: string): Promise<AccountInfo>**
Get account information.

**getLiquidity(): Promise<LiquidityInfo>**
Get liquidity pool data.

**getTransactionStatus(transactionId: string): Promise<TransactionResult>**
Get transaction status.

## Error Handling

**TypeScript**

```typescript
import { SprError, RouteNotFoundError, InvalidParamsError } from '@stellar-payment-router/sdk';

try {
  const route = await client.findRoute({...});
} catch (error) {
  if (error instanceof RouteNotFoundError) {
    console.log('No route found');
  } else if (error instanceof InvalidParamsError) {
    console.log('Invalid parameters');
  } else if (error instanceof SprError) {
    console.log('SDK error:', error.message);
  }
}
```

## Testing

```bash
npm test
npm run test:coverage
```

## Building

```bash
npm run build
```

Output in dist/ directory.

## Contributing

See CONTRIBUTING.md

## License

MIT - See LICENSE

---

# Contributing to SPR SDK

Thank you for your interest in contributing to the Stellar Payment Router SDK. We welcome contributions of all kinds — new features, bug fixes, tests, documentation, and performance improvements.

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Building and Testing](#building-and-testing)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Code Standards](#code-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Getting Help](#getting-help)

## Ways to Contribute

We welcome:

- **New Features** — Additional SDK methods, wallet integrations, utilities
- **Bug Fixes** — Issues with existing functionality
- **Tests** — Unit tests, integration tests, edge case coverage
- **Documentation** — API docs, examples, guides, inline comments
- **Performance Improvements** — Optimization and efficiency enhancements
- **Type Definitions** — Better TypeScript types and interfaces
- **Error Handling** — Better error messages and handling

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/spr-sdk.git
cd spr-sdk

# Add upstream remote
git remote add upstream https://github.com/StellarPaymentRouter/spr-sdk.git
```

### Install Dependencies

```bash
npm install
```

### Verify Setup

```bash
# Build the SDK
npm run build

# Run tests
npm test

# Check TypeScript
npm run typecheck
```

## Development Workflow

### Create a Feature Branch

```bash
# Update main first
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feat/your-feature-name
```

### Make Your Changes

Write your code following the code standards below. Here's a typical workflow:

- Implement feature in src/
- Add tests in src/**tests**/
- Update types if needed in src/types.ts
- Update README if adding public API

### Build and Test Locally

```bash
# Build TypeScript
npm run build

# Run all tests
npm test

# Check specific test file
npm test -- src/__tests__/client.test.ts

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Full type check
npm run typecheck
```

### Commit Your Work

Write clear, descriptive commits following the guidelines below:

```bash
git add .
git commit -m "feat: add support for custom route parameters"
```

## Building and Testing

### Build

```bash
npm run build
```

Output is in dist/ directory with:

- Compiled JavaScript
- TypeScript declaration files (.d.ts)
- Source maps

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run dev

# Run tests for specific file
npm test -- account.test.ts

# Generate coverage
npm run test:coverage

# Run tests with verbose output
npm test -- --verbose
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## Submitting a Pull Request

### Before You Start

- Create an issue to discuss the change (for major features)
- Fork the repository
- Create a feature branch
- Make your changes
- Ensure all tests pass

### Creating the PR

Push your branch to your fork:

```bash
git push origin feat/your-feature-name
```

Open a PR on GitHub with a clear title and description

Fill in the PR template with:

- What does this PR do? — Clear description
- Why? — Motivation and use cases
- Changes — What was changed
- Tests — New or updated tests
- Checklist — Mark completed items

### PR Checklist

- Tests added/updated
- Code builds without errors (npm run build)
- All tests pass (npm test)
- TypeScript passes (npm run typecheck)
- Code is formatted (npm run format)
- No lint issues (npm run lint)
- Documentation updated (README, JSDoc comments)
- No breaking changes (or clearly documented)

### PR Review Process

- Automated Checks — GitHub Actions runs tests and linting
- Code Review — Maintainers review the code
- Feedback — Address any requested changes
- Merge — PR is merged when approved

## Code Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Use const/let (never var)
- Arrow functions preferred
- No any types (use unknown instead)
- Proper error handling with try/catch
- Async/await for async operations

### File Structure

```text
src/
├── index.ts           # Main exports
├── client.ts          # Client class
├── types.ts           # Type definitions
├── errors.ts          # Error classes
├── signers/           # Signer implementations
│   ├── freighter.ts
│   └── custom.ts
├── utils/             # Utility functions
│   └── validators.ts
└── __tests__/         # Tests (mirror src structure)
    ├── client.test.ts
    ├── errors.test.ts
    └── utils/
        └── validators.test.ts
```

### Classes and Functions

- Single Responsibility Principle
- Clear, descriptive names
- Proper input validation
- Comprehensive error handling
- JSDoc comments for public APIs

### Example Class

**TypeScript**

```typescript
/**
 * Manages payment routing
 */
export class RouteManager {
  /**
   * Find the best route
   * @param params - Route finding parameters
   * @returns The best route found
   * @throws {RouteNotFoundError} If no route is found
   * @throws {InvalidParamsError} If parameters are invalid
   */
  async findRoute(params: FindRouteParams): Promise<Route> {
    this.validateParams(params);
    // Implementation
  }

  private validateParams(params: FindRouteParams): void {
    // Validation logic
  }
}
```

### Functions

**TypeScript**

```typescript
/**
 * Validates a Stellar account ID
 * @param accountId - The account ID to validate
 * @returns True if valid
 * @throws {InvalidParamsError} If invalid
 */
export function validateAccountId(accountId: string): boolean {
  if (!accountId.startsWith('G')) {
    throw new InvalidParamsError('Invalid account ID');
  }
  return true;
}
```

## Tests

- Test file names: \*.test.ts
- Describe blocks for organization
- Clear test descriptions
- Test happy path, edge cases, and errors
- Minimum 80% code coverage

### Example Test

**TypeScript**

```typescript
describe('SprClient', () => {
  let client: SprClient;

  beforeEach(() => {
    client = new SprClient({
      baseUrl: 'http://localhost:4000/api/v1',
      network: 'testnet',
    });
  });

  describe('findRoute', () => {
    it('should return a route when valid params provided', async () => {
      // Test implementation
    });

    it('should throw InvalidParamsError for invalid amount', async () => {
      // Test error case
    });
  });
});
```

## Documentation

- JSDoc comments for all public APIs
- Clear parameter descriptions
- Return type documentation
- Example usage in comments
- Update README for new features

**TypeScript**

````typescript
/**
 * Find the best payment route between two assets
 *
 * @param params - Route finding parameters
 * @param params.sourceAsset - Source asset (e.g., 'native' or 'CODE:ISSUER')
 * @param params.destinationAsset - Destination asset
 * @param params.amount - Amount to transfer (as string)
 * @param params.maxSlippage - Maximum acceptable slippage (0-100)
 * @returns Promise resolving to the best route
 *
 * @example
 * ```typescript
 * const route = await client.findRoute({
 *   sourceAsset: 'native',
 *   destinationAsset: 'USDC:...',
 *   amount: '100',
 *   maxSlippage: 0.5,
 * });
 * ```
 *
 * @throws {RouteNotFoundError} If no route is found
 * @throws {InvalidParamsError} If parameters are invalid
 */
````

## Commit Message Guidelines

Use clear, descriptive commit messages:

### Format

```text
type: subject (max 72 characters)

Optional body (max 100 characters per line)

Optional footer
```

### Types

- feat — New feature
- fix — Bug fix
- docs — Documentation changes
- test — Test additions or updates
- refactor — Code refactoring without feature changes
- perf — Performance improvements
- style — Code style changes (formatting, semicolons)
- chore — Build, dependency, or tooling changes

### Examples

```text
feat: add FreighterSigner for wallet integration

Implements wallet signing using the Freighter browser extension.
Includes proper error handling for wallet availability.

Closes #42
```

```text
fix: handle null response from findRoute API

The API can return null when no route is found. Added proper
error handling to throw RouteNotFoundError.

Fixes #38
```

```text
test: add comprehensive test coverage for validators

Added tests for validateAsset, validateAccountId, and
validateAmount functions to cover edge cases.
```

## Getting Help

- GitHub Issues — For bug reports and feature requests
- GitHub Discussions — For questions and general help
- Pull Request Comments — For implementation questions

### Asking Questions

When asking for help:

- Be specific and provide context
- Include error messages or logs
- Share minimal code examples
- Describe what you've already tried

### Reporting Bugs

When reporting bugs:

- Include SDK version
- Describe steps to reproduce
- Provide error message and stack trace
- Share minimal reproducible example

## Recognition

Contributors are recognized in:

- README.md — Contributors section
- Release notes — For major contributions

Thank you for contributing to Stellar Payment Router!
