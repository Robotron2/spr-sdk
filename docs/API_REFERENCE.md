# API Reference

This document provides a comprehensive reference for all classes, interfaces, and types exposed by the Stellar Payment Router SDK (`spr-sdk`).

---

## Table of Contents

1. [Configuration](#configuration)
2. [SprClient Class](#sprclient-class)
3. [Signers](#signers)
    * [Signer Interface](#signer-interface)
    * [FreighterSigner](#freightersigner-class)
    * [CustomSigner](#customsigner-class)
4. [Type Definitions](#type-definitions)
5. [Error Classes](#error-classes)

---

## Configuration

Before instantiating the client, you must configure it using the `SprClientConfig` interface.

### `SprClientConfig`

| Property | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `baseUrl` | `string` | Yes | - | The base URL of the SPR Core API backend. |
| `network` | `'testnet' \| 'mainnet'` | Yes | - | The Stellar network to operate on. |
| `apiKey` | `string` | No | `undefined` | Optional authentication token for premium API tiers. |
| `timeout` | `number` | No | `30000` | HTTP request timeout in milliseconds. |

**Example:**
```typescript
import { SprClientConfig } from '@stellar-payment-router/sdk';

const config: SprClientConfig = {
  baseUrl: 'https://api.testnet.spr.example.com',
  network: 'testnet',
  timeout: 5000 // 5 seconds
};
```

---

## SprClient Class

The `SprClient` is the main entry point for interacting with the SDK.

### Constructor
```typescript
constructor(config: SprClientConfig)
```
Initializes a new instance of the `SprClient`.

---

### `findRoute`
Find the best and most cost-effective route between a source asset and a destination asset.

```typescript
async findRoute(params: FindRouteParams): Promise<Route>
```

#### Parameters
* `params` (`FindRouteParams`): The routing parameters. See [FindRouteParams](#findrouteparams).

#### Returns
* Promise resolving to a [`Route`](#route) object.

#### Errors Thrown
* `InvalidParamsError`: If the input parameters are missing or malformed (e.g., negative amount).
* `RouteNotFoundError`: If no viable liquidity path exists.
* `ApiError`: If the backend fails to process the request.

#### Example
```typescript
try {
  const route = await client.findRoute({
    sourceAsset: 'XLM',
    destinationAsset: 'USDC',
    amount: '100',
    maxSlippage: 1.0 // 1%
  });
  console.log('Path found with estimated output:', route.estimatedOutput);
} catch (error) {
  console.error('Routing failed:', error);
}
```

---

### `simulateRoute`
Simulate the execution of a previously discovered route without broadcasting a transaction to the network.

```typescript
async simulateRoute(params: SimulateRouteParams): Promise<Route>
```

#### Parameters
* `params` (`SimulateRouteParams`): The simulation parameters. See [SimulateRouteParams](#simulaterouteparams).

#### Returns
* Promise resolving to a simulated [`Route`](#route) object.

#### Errors Thrown
* `ApiError`: If the simulation fails due to network conditions.

#### Example
```typescript
const simulatedRoute = await client.simulateRoute({
  route: previouslyFoundRoute,
  sourceAccount: 'G...'
});
```

---

### `executeRoute`
Execute a fully signed transaction based on a route.

```typescript
async executeRoute(params: ExecuteRouteParams): Promise<TransactionResult>
```

#### Parameters
* `params` (`ExecuteRouteParams`): Execution parameters containing the signed XDR. See [ExecuteRouteParams](#executerouteparams).

#### Returns
* Promise resolving to a [`TransactionResult`](#transactionresult).

#### Errors Thrown
* `TransactionError`: If the Stellar network rejects the transaction.
* `ApiError`: If the backend fails to broadcast.

#### Example
```typescript
const result = await client.executeRoute({
  route: myRoute,
  sourceAccount: 'G_SOURCE...',
  destinationAccount: 'G_DEST...',
  signature: 'signed_xdr_string'
});
console.log('Tx status:', result.status);
```

---

### `getAccount`
Retrieve account information and balances from the Stellar network.

```typescript
async getAccount(accountId: string): Promise<AccountInfo>
```

#### Parameters
* `accountId` (`string`): The public Stellar G-address of the account.

#### Returns
* Promise resolving to [`AccountInfo`](#accountinfo).

---

### `getLiquidity`
Fetch aggregated liquidity information across all tracked AMMs and orderbooks.

```typescript
async getLiquidity(): Promise<LiquidityInfo>
```

#### Returns
* Promise resolving to [`LiquidityInfo`](#liquidityinfo).

---

### `getTransactionStatus`
Query the final status of an executed transaction using its ID.

```typescript
async getTransactionStatus(transactionId: string): Promise<TransactionResult>
```

#### Parameters
* `transactionId` (`string`): The unique ID of the transaction.

#### Returns
* Promise resolving to a [`TransactionResult`](#transactionresult).

---

## Signers

The SDK provides mechanisms to abstract away how transactions are cryptographically signed.

### Signer Interface
All signers must implement this base interface.

```typescript
export interface Signer {
  getPublicKey(): Promise<string>;
  signTransaction(tx: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}
```

---

### FreighterSigner Class
An implementation of `Signer` designed to work with the [Freighter browser extension](https://www.freighter.app/).

#### Constructor
```typescript
constructor()
```

#### Methods
* **`isAvailable(): Promise<boolean>`**
  Checks if the `window.freighter` object is injected in the browser environment.
* **`getPublicKey(): Promise<string>`**
  Prompts the user to expose their public key.
* **`signTransaction(tx: string): Promise<string>`**
  Prompts the user to sign the provided base64 XDR transaction string.

#### Example
```typescript
import { FreighterSigner } from '@stellar-payment-router/sdk';

const signer = new FreighterSigner();
if (await signer.isAvailable()) {
  const pubKey = await signer.getPublicKey();
  const signedTx = await signer.signTransaction('unsigned_xdr_data');
}
```

---

### CustomSigner Class
An implementation of `Signer` designed for environments where you manage keys directly (e.g., backend Node.js servers).

#### Constructor
```typescript
constructor(publicKey: string, signFn: (tx: string) => Promise<string>)
```
* `publicKey`: The public key of the account doing the signing.
* `signFn`: A closure that takes an unsigned XDR string and returns a signed XDR string.

#### Methods
* **`isAvailable(): Promise<boolean>`** (Always returns `true`)
* **`getPublicKey(): Promise<string>`** (Returns the provided key)
* **`signTransaction(tx: string): Promise<string>`** (Invokes the `signFn`)

#### Example
```typescript
import { CustomSigner } from '@stellar-payment-router/sdk';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('S...');
const signer = new CustomSigner(
  keypair.publicKey(),
  async (txXdr) => {
    // Custom signing logic using Stellar SDK
    return mySigningFunction(txXdr, keypair);
  }
);
```

---

## Type Definitions

### `FindRouteParams`
Parameters required to query a new route.

| Field | Type | Description |
| :--- | :--- | :--- |
| `sourceAsset` | `string` | Asset code to sell (e.g., 'XLM'). |
| `destinationAsset` | `string` | Asset code to buy (e.g., 'USDC'). |
| `amount` | `string` | The amount to swap as a string. |
| `maxSlippage` | `number` | *(Optional)* Maximum allowed slippage percentage. Defaults to 0.5. |

### `Hop`
A single step in a multi-asset route.

| Field | Type | Description |
| :--- | :--- | :--- |
| `sourceAsset` | `string` | Asset swapped from. |
| `destinationAsset` | `string` | Asset swapped to. |
| `rate` | `string` | The exchange rate for this specific hop. |
| `fee` | `string` | The network/pool fee taken for this hop. |

### `Route`
The complete path returned by the routing engine.

| Field | Type | Description |
| :--- | :--- | :--- |
| `sourceAsset` | `string` | Original asset. |
| `destinationAsset` | `string` | Target asset. |
| `amount` | `string` | Initial amount. |
| `minReceived` | `string` | Minimum amount guaranteed based on slippage. |
| `path` | `Hop[]` | Ordered array of intermediate swaps. |
| `totalFee` | `string` | Sum of all fees across hops. |
| `estimatedOutput` | `string` | The expected output amount. |
| `timestamp` | `number` | Unix epoch when the route was calculated. |

### `SimulateRouteParams`
| Field | Type | Description |
| :--- | :--- | :--- |
| `route` | `Route` | The route object to simulate. |
| `sourceAccount` | `string` | The public key initiating the simulation. |

### `ExecuteRouteParams`
| Field | Type | Description |
| :--- | :--- | :--- |
| `route` | `Route` | The route object to execute. |
| `sourceAccount` | `string` | The public key initiating the transaction. |
| `destinationAccount` | `string` | The public key receiving the final asset. |
| `signature` | `string` | The fully signed transaction XDR. |

### `TransactionResult`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Backend tracking ID. |
| `status` | `'success' \| 'pending' \| 'failed'` | Final status of the network broadcast. |
| `hash` | `string` | The Stellar network transaction hash. |
| `timestamp` | `number` | Execution completion time. |
| `details` | `Record<string, unknown>` | Additional context (e.g., ledger number). |

### `AccountInfo`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Stellar Account ID. |
| `balance` | `string` | Native XLM balance. |
| `sequenceNumber`| `string` | Current account sequence number. |
| `subentryCount` | `number` | Number of trustlines, offers, etc. |

### `LiquidityInfo`
| Field | Type | Description |
| :--- | :--- | :--- |
| `pools` | `PoolInfo[]` | Array of AMM pool summaries. |
| `totalLiquidity` | `string` | Total value locked (in USD equivalent). |
| `timestamp` | `number` | Data snapshot time. |

---

## Error Classes

All SDK errors inherit from the base `SprError` class, which exposes `code` and `statusCode` properties.

| Error Class | HTTP Status | Code | Description |
| :--- | :---: | :--- | :--- |
| `RouteNotFoundError` | 404 | `ROUTE_NOT_FOUND` | No viable liquidity path could be found. |
| `InvalidParamsError` | 400 | `INVALID_PARAMS` | Input validation failed locally or remotely. |
| `WalletNotAvailableError`| 400 | `WALLET_NOT_AVAILABLE`| The requested Signer (e.g., Freighter) is missing or locked. |
| `ApiError` | 500+ | `API_ERROR` | The backend API is unreachable or returned a server error. |
| `TransactionError` | 500 | `TRANSACTION_ERROR` | Transaction failed during Stellar network execution. |
