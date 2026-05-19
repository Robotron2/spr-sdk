# Examples and Usage Patterns

This guide provides practical, copy-paste ready examples of how to use the Stellar Payment Router SDK (`spr-sdk`) in various real-world scenarios.

## Table of Contents
1. [Basic Routing](#basic-routing)
2. [Wallet Integration](#wallet-integration)
3. [React Integration](#react-integration)
4. [Error Handling Patterns](#error-handling-patterns)
5. [Advanced Patterns](#advanced-patterns)
6. [Performance Tips](#performance-tips)

---

## Basic Routing

### 1. Simple Route Finding
The most common use case is finding a path from Asset A to Asset B.

```typescript
import { SprClient } from '@stellar-payment-router/sdk';

const client = new SprClient({
  baseUrl: 'https://api.testnet.spr.example.com',
  network: 'testnet'
});

async function findOptimalPath() {
  try {
    const route = await client.findRoute({
      sourceAsset: 'XLM',
      destinationAsset: 'USDC', // Note: You would typically use full asset format "USDC:IssuerGAddress" for custom assets
      amount: '500',
      maxSlippage: 0.5 // 0.5% max slippage
    });

    console.log(`Swap 500 XLM for ~${route.estimatedOutput} USDC`);
    console.log(`Path involves ${route.path.length} hops`);
    
    // Inspect the route hops
    route.path.forEach((hop, index) => {
      console.log(`Hop ${index + 1}: Swap ${hop.sourceAsset} to ${hop.destinationAsset} at rate ${hop.rate}`);
    });
    
  } catch (err) {
    console.error('Routing failed:', err);
  }
}
```

### 2. Getting Account and Liquidity Info
You can query network state directly through the client.

```typescript
async function fetchNetworkData() {
  // Fetch account balances and sequence
  const account = await client.getAccount('GAI3XY...');
  console.log('XLM Balance:', account.balance);
  
  // Fetch platform liquidity snapshot
  const liquidity = await client.getLiquidity();
  console.log(`Total SDK TVL: $${liquidity.totalLiquidity}`);
}
```

---

## Wallet Integration

### 1. Using FreighterSigner (Browser/Frontend)
Integrating with the Freighter browser extension is seamless.

```typescript
import { SprClient, FreighterSigner, WalletNotAvailableError } from '@stellar-payment-router/sdk';

async function executeWithFreighter(route) {
  const signer = new FreighterSigner();
  
  try {
    // 1. Ensure wallet is installed
    if (!(await signer.isAvailable())) {
      alert("Please install Freighter wallet!");
      return;
    }

    // 2. Get user's public key
    const publicKey = await signer.getPublicKey();
    
    // 3. Simulate the transaction first (Best Practice)
    const client = new SprClient({ baseUrl: '...', network: 'testnet' });
    const simulated = await client.simulateRoute({
      route,
      sourceAccount: publicKey
    });
    
    // 4. Generate the XDR string required for signing.
    // In a real application, you might use the Stellar SDK to build this, 
    // or the backend might return the unsigned XDR during simulation.
    const unsignedXdr = "AAAAA..."; 
    
    // 5. Prompt user to sign
    const signedXdr = await signer.signTransaction(unsignedXdr);
    
    // 6. Execute
    const result = await client.executeRoute({
      route: simulated,
      sourceAccount: publicKey,
      destinationAccount: publicKey, // Self-payment swap
      signature: signedXdr
    });
    
    console.log('Success! TxHash:', result.hash);
    
  } catch (err) {
    if (err instanceof WalletNotAvailableError) {
      console.log('User cancelled or wallet locked.');
    } else {
      console.error('Execution failed:', err);
    }
  }
}
```

### 2. Using CustomSigner (Node.js/Backend)
For server-side execution (e.g., a trading bot), use the `CustomSigner` combined with the `@stellar/stellar-sdk`.

```typescript
import { SprClient, CustomSigner } from '@stellar-payment-router/sdk';
import { Keypair, TransactionBuilder, Networks } from '@stellar/stellar-sdk';

async function serverSideExecution(route) {
  // Load secret from environment variables!
  const botKeypair = Keypair.fromSecret(process.env.BOT_SECRET_KEY);
  
  const serverSigner = new CustomSigner(
    botKeypair.publicKey(),
    async (unsignedXdr) => {
      // Logic to sign XDR using stellar-sdk
      const tx = TransactionBuilder.fromXDR(unsignedXdr, Networks.TESTNET);
      tx.sign(botKeypair);
      return tx.toXDR();
    }
  );

  // ... proceed to execute using serverSigner.signTransaction()
}
```

---

## React Integration

Building UI components with the SDK often involves custom hooks.

### `useRoute` Hook Pattern
```typescript
import { useState, useEffect } from 'react';
import { SprClient, RouteNotFoundError } from '@stellar-payment-router/sdk';

// Initialize client outside component to avoid recreation
const client = new SprClient({ baseUrl: '...', network: 'testnet' });

export function useRoute(sourceAsset, destAsset, amount) {
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Basic debounce logic
    const timer = setTimeout(async () => {
      if (!amount || Number(amount) <= 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const foundRoute = await client.findRoute({
          sourceAsset,
          destinationAsset: destAsset,
          amount
        });
        setRoute(foundRoute);
      } catch (err) {
        if (err instanceof RouteNotFoundError) {
          setError("No path available with current liquidity.");
        } else {
          setError("Failed to calculate route.");
        }
        setRoute(null);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [sourceAsset, destAsset, amount]);

  return { route, isLoading, error };
}
```

---

## Error Handling Patterns

Robust error handling is crucial when dealing with financial transactions. 

```typescript
import { 
  SprClient, 
  RouteNotFoundError, 
  InvalidParamsError,
  ApiError,
  TransactionError 
} from '@stellar-payment-router/sdk';

async function safeSwap(client: SprClient, params: FindRouteParams) {
  try {
    const route = await client.findRoute(params);
    return route;
  } catch (error) {
    // 1. Handle validation errors (User Error)
    if (error instanceof InvalidParamsError) {
      showToast('Please enter a valid amount greater than 0.', 'warning');
      return null;
    }
    
    // 2. Handle liquidity issues (Market State)
    if (error instanceof RouteNotFoundError) {
      showToast('Insufficient liquidity to complete this swap.', 'error');
      return null;
    }
    
    // 3. Handle network/backend issues (Infrastructure)
    if (error instanceof ApiError) {
      // Check HTTP status codes if needed
      if (error.statusCode === 429) {
        showToast('Too many requests. Please slow down.', 'warning');
      } else {
        showToast('Our routing servers are temporarily offline.', 'error');
      }
      return null;
    }
    
    // Fallback
    console.error("Unknown error:", error);
    throw error;
  }
}
```

---

## Advanced Patterns

### Caching Routes (Memoization)
For applications displaying real-time quotes, caching identical requests within a short timeframe saves bandwidth and prevents flickering UIs.

```typescript
const routeCache = new Map<string, { route: Route, timestamp: number }>();
const CACHE_TTL_MS = 10000; // 10 seconds

async function getCachedRoute(client, params) {
  const cacheKey = `${params.sourceAsset}-${params.destinationAsset}-${params.amount}`;
  const cached = routeCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.route; // Return cached result
  }
  
  // Cache miss or expired, fetch new route
  const route = await client.findRoute(params);
  routeCache.set(cacheKey, { route, timestamp: Date.now() });
  
  return route;
}
```

---

## Performance Tips

1. **Debounce User Input:** Never call `findRoute` on every keystroke. Use a debounce timer (300-500ms) as shown in the React hook example.
2. **Reuse the Client:** Instantiate `SprClient` once at the application level and pass it down via Context (in React) or dependency injection. Do not create a `new SprClient()` on every function call, as this prevents Axios from utilizing TCP connection pooling.
3. **Simulate Only When Ready:** `simulateRoute` incurs backend load and latency. Only call it when the user clicks "Review Trade" or "Confirm", not dynamically as they type the amount.
