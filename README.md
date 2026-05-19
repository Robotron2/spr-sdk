# Stellar Payment Router SDK (spr-sdk)

[![npm version](https://img.shields.io/npm/v/@stellar-payment-router/sdk.svg)](https://www.npmjs.com/package/@stellar-payment-router/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![CI Status](https://img.shields.io/github/workflow/status/stellar-payment-router/spr-sdk/CI)](https://github.com/stellar-payment-router/spr-sdk/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Seamlessly find, simulate, and execute the most optimal payment routes across the Stellar network.

## The Problem

Navigating the complex decentralized exchange (DEX) landscape and Automated Market Makers (AMMs) on the Stellar network is challenging. Developers building wallets, payment applications, or trading bots often struggle to determine the most cost-effective path to swap one asset for another. 

Manually fetching pool data, calculating liquidity, estimating slippage, and constructing the right sequence of trades is not only tedious but also prone to errors. Furthermore, the volatility of liquidity pools means that a route calculated seconds ago might no longer be valid when the transaction is finally submitted to the network.

## The Solution

The **Stellar Payment Router SDK (spr-sdk)** abstraction layer simplifies interacting with Stellar's complex liquidity landscape. Our SDK provides a robust, developer-friendly interface to instantly find the best payment paths between any two assets, optimizing for the lowest fees and the highest return. 

By abstracting away the heavy lifting of graph traversal and pathfinding algorithms, the SDK allows you to focus on building your core product. It features built-in simulation tools to predict transaction outcomes safely, integrated wallet support for popular signers like Freighter, and structured error handling to ensure your applications remain stable even when the network is volatile.

## Quick Start

```typescript
import { SprClient, FreighterSigner } from '@stellar-payment-router/sdk';

const client = new SprClient({ baseUrl: 'https://api.spr.example.com', network: 'mainnet' });
const route = await client.findRoute({ sourceAsset: 'XLM', destinationAsset: 'USDC', amount: '100' });
const result = await client.executeRoute({ route, sourceAccount: 'G...', destinationAccount: 'G...', signature: '...' });
```

## Key Features

* **Optimal Pathfinding:** Discover the most efficient multi-hop routes across all Stellar AMMs and orderbooks.
* **Transaction Simulation:** Dry-run your trades before execution to prevent unexpected slippage and failed transactions.
* **Seamless Wallet Integration:** Out-of-the-box support for Freighter, plus an extensible interface for custom or server-side signers.
* **Lightning Fast:** Optimized API communications and intelligent caching for near-instant route discovery.
* **Fully Typed:** Written entirely in TypeScript, providing excellent autocomplete and compile-time safety.
* **Modular Design:** Use only what you need. Swap out the default HTTP client or signers with your own implementations.

## Installation

```bash
npm install @stellar-payment-router/sdk
```

## Basic Usage

Here is a simple example showing how to initialize the client, retrieve an optimal route, and log the estimated output.

```typescript
import { SprClient } from '@stellar-payment-router/sdk';

async function main() {
  // 1. Initialize the client
  const client = new SprClient({
    baseUrl: 'https://api.spr.example.com',
    network: 'mainnet'
  });

  try {
    // 2. Find the best route to swap 50 XLM to USDC
    const route = await client.findRoute({
      sourceAsset: 'XLM',
      destinationAsset: 'USDC',
      amount: '50',
      maxSlippage: 0.5 // Optional: limit slippage to 0.5%
    });

    console.log(`Optimal route found!`);
    console.log(`Estimated output: ${route.estimatedOutput} USDC`);
    console.log(`Total fees: ${route.totalFee}`);
    
  } catch (error) {
    console.error('Failed to find route:', error.message);
  }
}

main();
```

## Technology Stack

The `spr-sdk` is built to be a lightweight, robust, and modern TypeScript library. It relies on the official `@stellar/stellar-sdk` for parsing and structuring Stellar primitives, ensuring that all blockchain interactions strictly follow Stellar network standards. 

For reliable HTTP communications with the payment routing backend, it uses `axios`. The entire project is configured with strict TypeScript checks, Jest for comprehensive unit and integration testing, and ESLint/Prettier to guarantee a consistent, readable codebase. The final outputs are commonJS and ES module compatible, offering seamless integration whether you are building a Node.js backend or a React frontend.

## Documentation Links

Dive deeper into the SDK with our comprehensive documentation:

* [Full Architecture](docs/ARCHITECTURE.md) - Understand the system design, core components, and data flow.
* [API Reference](docs/API_REFERENCE.md) - Complete documentation for all classes, methods, and types.
* [Examples & Patterns](docs/EXAMPLES.md) - Practical use cases, React integration, and advanced routing strategies.
* [Building & Deployment](docs/DEPLOYMENT.md) - Guide for building, testing, and distributing the SDK.
* [Troubleshooting](docs/TROUBLESHOOTING.md) - Solutions for common installation, runtime, and API errors.
* [Contributing](CONTRIBUTING.md) - Learn how you can contribute to the spr-sdk project.

## Quick Links

- [GitHub Repository](https://github.com/stellar-payment-router/spr-sdk)
- [Issue Tracker](https://github.com/stellar-payment-router/spr-sdk/issues)
- [Developer Discord](https://discord.gg/example)

## Roadmap

* **Q3 2026:** Introduce support for Soroban smart contract-based AMMs.
* **Q4 2026:** Add WebSocket subscriptions for real-time liquidity and route updates.
* **Q1 2027:** Implement batch transaction building for multi-destination payouts.
* **Q2 2027:** Provide official React and Vue wrapper hooks libraries.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
