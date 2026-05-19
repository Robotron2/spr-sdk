# Troubleshooting Guide

This guide provides solutions to common issues developers encounter when integrating and using the Stellar Payment Router SDK (`spr-sdk`).

---

## Table of Contents
1. [Installation Issues](#installation-issues)
2. [TypeScript Issues](#typescript-issues)
3. [Runtime Errors](#runtime-errors)
4. [Wallet Issues](#wallet-issues)
5. [API Connection Issues](#api-connection-issues)
6. [Performance Issues](#performance-issues)
7. [Build Issues](#build-issues)
8. [Debugging Guide](#debugging-guide)
9. [Getting Help](#getting-help)

---

## Installation Issues

### `npm install` failures or peer dependency warnings
**Problem:** Installation fails complaining about `@stellar/stellar-sdk` or `axios` versions.
**Why it occurs:** The SDK requires specific minimum versions of these peer dependencies. Your project might have older, incompatible versions installed.
**Solution:**
Ensure your project's dependencies satisfy the requirements. You can force an update of the underlying dependencies:
```bash
npm install @stellar-payment-router/sdk @stellar/stellar-sdk@^11.0.0 axios@^1.6.0
```
If using npm v7+, peer dependencies are installed automatically. If you encounter conflict errors, you can bypass them (not recommended) using `npm install --legacy-peer-deps`.

---

## TypeScript Issues

### "Cannot find module" or missing types
**Problem:** TypeScript throws errors stating it cannot find the module or its corresponding type declarations.
**Why it occurs:** The `tsconfig.json` in your project might not be set up to resolve node modules correctly, or the IDE hasn't refreshed.
**Solution:**
1. Ensure your `tsconfig.json` has `"moduleResolution": "node"` or `"moduleResolution": "bundler"`.
2. Restart your TypeScript server in your IDE (In VSCode: `Ctrl+Shift+P` -> `TypeScript: Restart TS server`).

---

## Runtime Errors

### `InvalidParamsError: Amount must be a positive number`
**Problem:** The `findRoute` method throws an `InvalidParamsError` immediately.
**Why it occurs:** The SDK performs local validation before hitting the API. The `amount` parameter must be a string representing a number greater than 0.
**Solution:**
Ensure you are not passing empty strings, undefined variables, or negative values.
```typescript
// Incorrect
client.findRoute({ amount: "", ... }) 
// Correct
client.findRoute({ amount: "10.5", ... })
```

### `RouteNotFoundError`
**Problem:** The SDK throws a `RouteNotFoundError`.
**Why it occurs:** There is simply no liquidity path between the source and destination assets you requested on the Stellar DEX.
**Solution:**
Handle this gracefully in your UI by informing the user that the trade is currently not possible due to lack of market liquidity.

---

## Wallet Issues

### `WalletNotAvailableError: Freighter wallet not installed`
**Problem:** Calling `isAvailable()` returns false, or `getPublicKey()` throws this error.
**Why it occurs:** The browser environment does not have the `window.freighter` object injected.
**Solution:**
1. Verify that the Freighter extension is installed and enabled in the browser.
2. Ensure you are calling this method from a client-side environment (the browser), not during Server-Side Rendering (SSR) in frameworks like Next.js.
```typescript
// Next.js workaround: Ensure execution only in browser
if (typeof window !== 'undefined') {
  const signer = new FreighterSigner();
}
```

---

## API Connection Issues

### `ApiError: API request failed` (Status 500+)
**Problem:** The SDK throws an `ApiError` with a 500-level status code.
**Why it occurs:** The SPR Core routing backend is experiencing downtime or processing failures.
**Solution:**
This is an infrastructure issue. Implement retry logic with exponential backoff for critical operations, and check the SPR Status Page.

### Network Timeouts
**Problem:** Requests hang and eventually fail with a timeout error.
**Why it occurs:** The default timeout is 30 seconds. Slow network connections or backend lag can trigger this.
**Solution:**
Increase the timeout when instantiating the client:
```typescript
const client = new SprClient({
  baseUrl: '...',
  network: 'mainnet',
  timeout: 60000 // Increase to 60 seconds
});
```

---

## Performance Issues

### Slow route finding or UI freezing
**Problem:** The application becomes unresponsive when typing amounts into a swap input.
**Why it occurs:** You are likely calling `findRoute` on every keystroke, overwhelming both the browser's network queue and the backend API.
**Solution:**
Implement Debouncing. Delay the API call until the user stops typing for ~500ms. See the [React Integration Examples](EXAMPLES.md#react-integration) for a copy-paste solution.

---

## Build Issues

### Compilation Errors (`tsc` fails)
**Problem:** Running `npm run build` results in TypeScript errors.
**Why it occurs:** Typically caused by modifying the source code and introducing type mismatches or syntax errors.
**Solution:**
Run `npm run typecheck` (`tsc --noEmit`) to see a clean output of all type errors. Fix the errors sequentially starting from the top. Ensure you haven't accidentally modified the `tsconfig.json`.

---

## Debugging Guide

When dealing with complex routing issues, you may need to inspect the raw network requests.

### Browser DevTools
1. Open the "Network" tab in your browser's Developer Tools.
2. Filter by `Fetch/XHR`.
3. Look for requests made to the `baseUrl` you provided (e.g., requests to `/routes`).
4. Inspect the `Payload` tab to see exactly what parameters the SDK sent, and the `Preview` tab to see the raw JSON response from the backend. This helps determine if the error is originating from the SDK's parsing logic or the backend's data.

---

## Getting Help

If you have exhausted the solutions in this guide and are still experiencing issues:

1. **Create a Minimal Reproducible Example:** Try to isolate the bug in a simple CodeSandbox or a single Node.js script. This drastically speeds up resolution times.
2. **Search Issues:** Check the [GitHub Issues](https://github.com/stellar-payment-router/spr-sdk/issues) page to see if someone else has reported the same problem.
3. **Report a Bug:** Open a new issue with your exact error message, SDK version, and the reproducible example.
