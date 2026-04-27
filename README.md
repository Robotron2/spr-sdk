# Stellar Payment Router SDK

[![npm version](https://img.shields.io/npm/v/@stellar-payment-router/sdk.svg)](https://www.npmjs.com/package/@stellar-payment-router/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/StellarPaymentRouter/spr-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/StellarPaymentRouter/spr-sdk/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Type-safe TypeScript SDK for Stellar Payment Router**

The SPR SDK provides a comprehensive, easy-to-use interface for discovering optimal payment routes, building transactions, and integrating wallet signing into your Stellar applications.

---

## The Problem

Developers building on Stellar struggle with:

- **Complex Route Finding** — Manual integration with multiple DEXes
- **Type Safety** — JavaScript lacks type information for Stellar operations
- **Wallet Integration** — Handling different signer implementations
- **Error Handling** — Unclear error messages and recovery strategies
- **API Inconsistency** — Different APIs for different providers
- **Transaction Building** — Error-prone manual transaction construction

## The Solution

**SPR SDK** provides:

- **Type-Safe Client** — Full TypeScript support with IntelliSense
- **Route Discovery** — One-line route finding
- **Wallet Agnostic** — Support for Freighter and custom signers
- **Error Types** — Specific, actionable error classes
- **Consistent API** — Unified interface across operations
- **Zero Dependencies** — Minimal bundle size

---

## Installation

```bash
npm install @stellar-payment-router/sdk
```

or with yarn:

```bash
yarn add @stellar-payment-router/sdk
```

---

## Quick Start

### Basic Route Finding

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

console.log(`Output: ${route.estimatedOutput} ${route.destinationAsset}`);
```

### With Freighter Wallet

```typescript
import { SprClient, FreighterSigner } from '@stellar-payment-router/sdk';

// Initialize signer
const signer = new FreighterSigner();

// Check availability
if (!(await signer.isAvailable())) {
  throw new Error('Freighter wallet not installed');
}

// Get public key
const publicKey = await signer.getPublicKey();
console.log('Connected:', publicKey);

// Sign transaction
const signedTx = await signer.signTransaction(txEnvelope);
```

---

## Architecture

```
┌─────────────────────────────────────┐
│    Your Application                 │
├─────────────────────────────────────┤
│    SPR SDK (TypeScript)             │
├─────────────────────────────────────┤
│  SprClient (Main entry point)       │
│  - findRoute()                      │
│  - getAccount()                     │
│  - simulateRoute()                  │
│  - executeRoute()                   │
├─────────────────────────────────────┤
│  Signers (Wallet Integration)       │
│  - FreighterSigner                  │
│  - CustomSigner                     │
│  - Signer interface                 │
├─────────────────────────────────────┤
│  Error Types                        │
│  - RouteNotFoundError               │
│  - InvalidParamsError               │
│  - WalletNotAvailableError          │
├─────────────────────────────────────┤
│  HTTP Client (Axios)                │
├─────────────────────────────────────┤
│  SPR Core API                       │
└─────────────────────────────────────┘
```

---

## API Reference

### SprClient

#### Constructor

```typescript
new SprClient(config: SprClientConfig)
```

**Configuration:**

```typescript
interface SprClientConfig {
  baseUrl: string; // API endpoint
  network: 'testnet' | 'mainnet'; // Stellar network
  apiKey?: string; // Optional API key
  timeout?: number; // Request timeout (ms)
}
```

**Example:**

```typescript
const client = new SprClient({
  baseUrl: 'https://api.spr.stellar.org',
  network: 'mainnet',
  apiKey: 'sk_live_...',
  timeout: 30000,
});
```

#### Methods

##### `findRoute(params: FindRouteParams): Promise<Route>`

Discover the best route between two assets.

```typescript
const route = await client.findRoute({
  sourceAsset: 'native',
  destinationAsset: 'USDC:...',
  amount: '100',
  maxSlippage: 0.5,
});

// Use route
console.log(`Path: ${route.path.length} hops`);
console.log(`Output: ${route.estimatedOutput}`);
console.log(`Fee: ${route.totalFee}`);
```

**Parameters:**

```typescript
interface FindRouteParams {
  sourceAsset: string; // Source asset
  destinationAsset: string; // Destination asset
  amount: string; // Amount to route
  maxSlippage?: number; // Max slippage %
}
```

**Response:**

```typescript
interface Route {
  sourceAsset: string;
  destinationAsset: string;
  amount: string;
  minReceived: string;
  path: Hop[];
  totalFee: string;
  estimatedOutput: string;
  timestamp: number;
}
```

##### `simulateRoute(params: SimulateRouteParams): Promise<Route>`

Simulate route execution without committing.

```typescript
const simulated = await client.simulateRoute({
  route: existingRoute,
  sourceAccount: 'GBUQWP3...',
});
```

##### `executeRoute(params: ExecuteRouteParams): Promise<TransactionResult>`

Execute a route transaction.

```typescript
const result = await client.executeRoute({
  route,
  sourceAccount,
  destinationAccount,
  signature: signedTx,
});

console.log(`Transaction: ${result.id}`);
```

##### `getAccount(accountId: string): Promise<AccountInfo>`

Get account information.

```typescript
const account = await client.getAccount('GBUQWP3...');
console.log(`Balance: ${account.balance}`);
```

##### `getLiquidity(): Promise<LiquidityInfo>`

Get liquidity pool data.

```typescript
const liquidity = await client.getLiquidity();
console.log(`Pools: ${liquidity.pools.length}`);
console.log(`Total Liquidity: ${liquidity.totalLiquidity}`);
```

##### `getTransactionStatus(txId: string): Promise<TransactionResult>`

Check transaction status.

```typescript
const status = await client.getTransactionStatus('tx_id');
if (status.status === 'success') {
  console.log('Transaction completed!');
}
```

---

## Wallet Integration

### Freighter Signer

```typescript
import { FreighterSigner } from '@stellar-payment-router/sdk';

const signer = new FreighterSigner();

// Check if available
const available = await signer.isAvailable();

// Get public key
const publicKey = await signer.getPublicKey();

// Sign transaction
const signed = await signer.signTransaction(txEnvelope);
```

### Custom Signer

For server-side or custom implementations:

```typescript
import { CustomSigner } from '@stellar-payment-router/sdk';

const customSigner = new CustomSigner(
  'GBUQWP3BOUZX34ULNQG23RQ6F4BFSRJ5UL3QC6MFQEPJDD7W2QC5X4XY',
  async (tx) => {
    // Your signing logic here
    const signed = signTransaction(tx, secretKey);
    return signed;
  }
);

const publicKey = await customSigner.getPublicKey();
```

---

## Error Handling

The SDK provides specific error types for better error handling:

```typescript
import {
  SprError,
  RouteNotFoundError,
  InvalidParamsError,
  WalletNotAvailableError,
  ApiError,
  TransactionError,
} from '@stellar-payment-router/sdk';

try {
  const route = await client.findRoute({
    sourceAsset: 'native',
    destinationAsset: 'USDC:...',
    amount: '100',
  });
} catch (error) {
  if (error instanceof RouteNotFoundError) {
    console.log('No route found between these assets');
  } else if (error instanceof InvalidParamsError) {
    console.log('Invalid parameters:', error.message);
  } else if (error instanceof ApiError) {
    console.log(`API error: ${error.statusCode}`);
  } else if (error instanceof SprError) {
    console.log(`SPR error (${error.code}):`, error.message);
  }
}
```

### Error Types

| Error                     | Description                  | Resolution                              |
| ------------------------- | ---------------------------- | --------------------------------------- |
| `RouteNotFoundError`      | No route available           | Use different assets or check liquidity |
| `InvalidParamsError`      | Invalid input parameters     | Validate input format                   |
| `WalletNotAvailableError` | Wallet not found/installed   | Install Freighter or check setup        |
| `ApiError`                | Backend API error            | Check API availability                  |
| `TransactionError`        | Transaction execution failed | Check account balance and sequence      |

---

## Examples

### Complete Example: Find and Execute Route

```typescript
import { SprClient, FreighterSigner, InvalidParamsError } from '@stellar-payment-router/sdk';

async function executePayment() {
  try {
    // 1. Initialize client
    const client = new SprClient({
      baseUrl: 'http://localhost:4000/api/v1',
      network: 'testnet',
    });

    // 2. Check wallet
    const signer = new FreighterSigner();
    if (!(await signer.isAvailable())) {
      throw new Error('Freighter not installed');
    }

    // 3. Get connected account
    const sourceAccount = await signer.getPublicKey();

    // 4. Find route
    const route = await client.findRoute({
      sourceAsset: 'native',
      destinationAsset: 'USDC:GBUQWP3...',
      amount: '100',
      maxSlippage: 0.5,
    });

    console.log(`Route found: ${route.path.length} hops`);
    console.log(`Expected output: ${route.estimatedOutput}`);

    // 5. Simulate before executing
    const simulated = await client.simulateRoute({
      route,
      sourceAccount,
    });

    // 6. Sign transaction
    const signature = await signer.signTransaction(route.txEnvelope);

    // 7. Execute
    const result = await client.executeRoute({
      route,
      sourceAccount,
      destinationAccount: 'GBXXXXXXX...',
      signature,
    });

    console.log(` Transaction ${result.id} completed!`);
    return result;
  } catch (error) {
    if (error instanceof InvalidParamsError) {
      console.error('Invalid parameters:', error.message);
    } else {
      console.error('Execution failed:', error);
    }
    throw error;
  }
}

executePayment();
```

### React Hook Example

```typescript
import { useState } from 'react';
import { SprClient, FreighterSigner } from '@stellar-payment-router/sdk';

export function useRoute() {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const client = new SprClient({
    baseUrl: process.env.REACT_APP_SPR_API_URL,
    network: process.env.REACT_APP_STELLAR_NETWORK,
  });

  const findRoute = async (source, dest, amount) => {
    setLoading(true);
    try {
      const result = await client.findRoute({
        sourceAsset: source,
        destinationAsset: dest,
        amount,
      });
      setRoute(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setRoute(null);
    } finally {
      setLoading(false);
    }
  };

  return { route, loading, error, findRoute };
}

// Usage
function RouteFinderComponent() {
  const { route, loading, findRoute } = useRoute();

  return (
    <div>
      <button onClick={() => findRoute('native', 'USDC:...', '100')}>
        {loading ? 'Searching...' : 'Find Route'}
      </button>
      {route && <p>Output: {route.estimatedOutput}</p>}
    </div>
  );
}
```

---

## Configuration

### Environment Variables

```typescript
// .env
REACT_APP_SPR_API_URL=http://localhost:4000/api/v1
REACT_APP_STELLAR_NETWORK=testnet
REACT_APP_API_KEY=your-api-key
```

### TypeScript Configuration

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## Performance Tips

### Caching

```typescript
// Cache routes for improved UX
const routeCache = new Map();

async function findRouteCached(source, dest, amount) {
  const key = `${source}-${dest}-${amount}`;
  if (routeCache.has(key)) {
    return routeCache.get(key);
  }

  const route = await client.findRoute({ source, dest, amount });
  routeCache.set(key, route);
  return route;
}
```

### Batching

```typescript
// Batch account lookups
const accounts = await Promise.all([client.getAccount(account1), client.getAccount(account2)]);
```

---

## Testing

```bash
# Install dependencies
npm install

# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage
```

### Writing Tests

```typescript
import { SprClient } from '@stellar-payment-router/sdk';

describe('SprClient', () => {
  let client: SprClient;

  beforeEach(() => {
    client = new SprClient({
      baseUrl: 'http://localhost:4000/api/v1',
      network: 'testnet',
    });
  });

  it('should find route', async () => {
    const route = await client.findRoute({
      sourceAsset: 'native',
      destinationAsset: 'USDC:...',
      amount: '100',
    });

    expect(route).toBeDefined();
    expect(route.path.length).toBeGreaterThan(0);
  });
});
```

---

## Building

```bash
# TypeScript to JavaScript
npm run build

# Output: dist/
# - JavaScript files
# - Type definitions (.d.ts)
# - Source maps

# Watch mode
npm run dev
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/spr-sdk.git
cd spr-sdk
npm install
npm test
```

---

## Browser Support

| Browser | Min Version |
| ------- | ----------- |
| Chrome  | 90+         |
| Firefox | 88+         |
| Safari  | 14+         |
| Edge    | 90+         |

---

## License

MIT License © 2026 Stellar Payment Router Contributors

See [LICENSE](LICENSE) for details.

---

## Support

- [Full Documentation](https://docs.spr.stellar.org)
- [GitHub Discussions](https://github.com/StellarPaymentRouter/spr-sdk/discussions)
- [Report Issues](https://github.com/StellarPaymentRouter/spr-sdk/issues)
- Email: [support@stellarpaymentrouter.dev](mailto:support@stellarpaymentrouter.dev)

---

## Roadmap

- [ ] Additional wallet support (Albedo, Lobstr)
- [ ] Advanced route filtering
- [ ] Batch transactions
- [ ] Real-time updates (WebSocket)
- [ ] Offline mode
- [ ] Mobile SDK (React Native)

---
