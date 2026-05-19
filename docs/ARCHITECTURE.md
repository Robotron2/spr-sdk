# System Architecture

This document provides an in-depth look at the architecture of the Stellar Payment Router SDK (`spr-sdk`). It explains the design decisions, core components, data flow, type system, and the strategies used for error handling, performance optimization, and security.

## 1. Overview

The `spr-sdk` is designed as a lightweight abstraction layer that sits between your application and the complex decentralized exchange (DEX) ecosystem of the Stellar network. Its primary goal is to provide a clean, predictable, and fully-typed interface for discovering payment routes, simulating transactions, and securely signing and executing trades.

The SDK strictly adheres to the Single Responsibility Principle, separating the API communication (`SprClient`), transaction signing (`Signer`), and domain modeling (`types.ts`). This modularity ensures that developers can easily mock dependencies for testing or swap out specific components (like the signer) without rewriting their application logic.

## 2. Architecture Diagram

The following diagram illustrates the layered architecture of the SDK and how it interacts with external systems.

```text
+-------------------------------------------------------------+
|                     Your Application                        |
|        (React frontend, Node.js backend, Node script)       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                 SPR SDK (TypeScript)                        |
|                                                             |
|   +-------------------+             +-------------------+   |
|   |                   |             |                   |   |
|   |    SprClient      | <---------> |      Signers      |   |
|   |  (Main Entry)     |             | (Wallet / Custom) |   |
|   |                   |             |                   |   |
|   +-------------------+             +-------------------+   |
|            |                                                |
|            v                                                |
|   +-------------------+                                     |
|   |                   |                                     |
|   |  HTTP Layer       |                                     |
|   |  (Axios)          |                                     |
|   |                   |                                     |
|   +-------------------+                                     |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                  SPR Core API Backend                       |
|   (Pathfinding, Liquidity Aggregation, Network Broadcast)   |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                  Stellar Blockchain                         |
|             (Orderbooks & AMM Liquidity Pools)              |
+-------------------------------------------------------------+
```

## 3. Core Components

### SprClient
The `SprClient` is the primary entry point to the SDK. It is responsible for orchestrating requests to the SPR backend API. 
* **Purpose:** Abstracts HTTP calls and parameter validation.
* **Instantiation:** It should be instantiated once per network configuration (e.g., one instance for Mainnet, one for Testnet) and shared across your application.
* **Responsibilities:** Routing requests (`findRoute`, `simulateRoute`, `executeRoute`), fetching network state (`getAccount`, `getLiquidity`, `getTransactionStatus`), and handling API responses.

### Signers
The `Signer` interface abstracts the process of signing Stellar transactions. This decoupling is crucial because transaction signing mechanisms differ drastically depending on the environment (e.g., browser extension vs. secure server).
* **Interface Design:** It mandates three core methods: `isAvailable()`, `getPublicKey()`, and `signTransaction()`.
* **Implementations:** The SDK provides a `FreighterSigner` for browser-based dApps and a `CustomSigner` for server-side or proprietary wallet integrations.

### HTTP Layer
The HTTP layer is built on top of `axios`.
* **Configuration:** Configured internally by the `SprClient` using the provided `SprClientConfig`.
* **Responsibilities:** Managing headers (including API keys), handling connection timeouts, and parsing JSON responses. It forms the bridge between the synchronous/asynchronous TypeScript world and the external REST API.

### Error System
The SDK implements a robust, hierarchical error system extending the native JavaScript `Error` class.
* **Purpose:** To provide deterministic error types that developers can catch and handle programmatically, rather than relying on string matching.
* **Structure:** All errors inherit from `SprError`, which includes standard error codes and HTTP status codes to facilitate debugging.

## 4. Data Flow

Understanding the lifecycle of a typical request helps clarify how the components interact. Below is the step-by-step data flow for finding and executing a route.

1. **Initialization:** The user instantiates `SprClient` with a base URL and network configuration.
2. **Parameter Validation:** The user calls `client.findRoute(params)`. The `SprClient` first calls its internal `validateFindRouteParams` to ensure all inputs (source, destination, amount) are valid.
3. **HTTP Request:** If valid, the `SprClient` serializes the parameters and makes a GET request to the `/routes` endpoint via the Axios HTTP layer.
4. **Backend Processing:** The SPR Core API processes the request, traverses the Stellar graph, and returns the optimal route.
5. **Response Parsing:** The HTTP layer receives the JSON payload. `SprClient` validates the presence of data. If the data is empty, it throws a `RouteNotFoundError`.
6. **Return to Application:** The fully structured `Route` object is returned to the user's application.
7. **Signing Phase:** The user's application passes the required transaction XDR to a `Signer` (e.g., `FreighterSigner.signTransaction(tx)`).
8. **Execution:** The signed transaction is passed to `client.executeRoute()`, which forwards it to the backend for final network submission.

## 5. Type System

The `spr-sdk` is heavily typed to prevent runtime errors and provide excellent developer ergonomics. Key domain models include:

* **`FindRouteParams`**: Defines the inputs required to calculate a path. It strictly types the assets as strings and enforces an optional `maxSlippage` parameter.
* **`Hop`**: Represents a single step in a multi-hop payment route. It includes the `sourceAsset`, `destinationAsset`, intermediate exchange `rate`, and network `fee`.
* **`Route`**: The complete payment path. It aggregates an array of `Hop` objects, calculates the `totalFee`, determines the `minReceived` amount (based on slippage), and provides an `estimatedOutput`.
* **`TransactionResult`**: Used for reporting the outcome of a simulation or execution, detailing the `status` (success, pending, failed), transaction `hash`, and execution `timestamp`.

## 6. Wallet Integration

The SDK abstracts wallet interactions to ensure maximum compatibility across different hosting environments.

### The `Signer` Interface
By programming against the `Signer` interface, the `SprClient` doesn't need to know *how* a transaction is signed, only that it *will* be signed.

### `FreighterSigner` Implementation
This class interacts with the `window.freighter` object injected by the Freighter browser extension. It handles the asynchronous nature of prompting the user for approval. It explicitly checks for wallet availability via `isAvailable()` to prevent unhandled exceptions if the extension is not installed.

### `CustomSigner` Implementation
Designed for backend services (Node.js) or custom custody solutions. It takes a closure `signFn` during instantiation. When a transaction needs signing, it invokes this closure, allowing the developer to use their own Keypair logic or HSM (Hardware Security Module) securely.

## 7. Error Handling

A core architectural pillar is predictable failure. The SDK avoids generic "Something went wrong" errors in favor of a granular error hierarchy located in `src/errors.ts`.

* **`RouteNotFoundError`**: Thrown when the backend API returns a 404 or an empty dataset for a route request. Applications should handle this by informing the user that no liquidity path exists.
* **`InvalidParamsError`**: Thrown synchronously during local validation (e.g., negative amounts, missing asset codes). This prevents unnecessary network calls.
* **`WalletNotAvailableError`**: Thrown by signers when a requested wallet extension is missing or locked.
* **`ApiError`**: Thrown when the backend responds with a 500-level error or is unreachable. It includes the original HTTP status code for detailed logging.
* **`TransactionError`**: Thrown when the final execution on the Stellar network fails (e.g., due to sudden liquidity changes or insufficient balances).

## 8. Performance Considerations

While the SDK itself is relatively thin, it is architected to be highly performant:

* **Lightweight Dependencies:** The SDK carefully limits its external dependencies to `axios` and `@stellar/stellar-sdk` to keep bundle sizes small for frontend applications.
* **Connection Pooling:** Axios maintains connection pools, ensuring that multiple rapid requests to the SPR backend reuse the same underlying TCP connection.
* **Synchronous Validation:** By validating parameters locally before making network requests, the SDK saves bandwidth and reduces latency for malformed requests.

*Note: Developers are encouraged to implement application-level caching and debouncing (as detailed in the Examples documentation) to further optimize performance.*

## 9. Security Model

Security is handled at multiple levels within the architecture:

* **No Private Key Exposure:** The SDK is intentionally designed to **never** require or handle raw private keys directly. The `CustomSigner` expects a signing function, not a private key, ensuring the SDK cannot accidentally log or leak sensitive material.
* **Safe API Communication:** All HTTP communication defaults to HTTPS. The SDK supports Bearer token authentication via the `SprClientConfig.apiKey` parameter, ensuring authorized access to premium backend endpoints.
* **Immutability:** Configuration objects and domain models are treated as immutable to prevent unexpected side effects during concurrent route requests.
