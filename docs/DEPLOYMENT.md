# Building and Deployment Guide

This guide covers how to build, test, version, and publish the Stellar Payment Router SDK (`spr-sdk`) to npm. It is intended for core maintainers and contributors preparing a release.

---

## 1. Build Process

The `spr-sdk` is written in TypeScript. Before it can be consumed by regular Node.js or browser environments, it must be compiled down to standard JavaScript and type definition (`.d.ts`) files.

### Compiling the Code
To generate the production build, run:

```bash
npm run build
```

This command invokes the TypeScript compiler (`tsc`) using the configuration specified in `tsconfig.json`. 

### Output Structure
The build process generates artifacts in the `dist/` directory.

```
spr-sdk/
├── src/            # Original TypeScript source
└── dist/           # Compiled output (ignored by git, published to npm)
    ├── index.js    # Compiled JavaScript
    ├── index.d.ts  # Type declarations for TypeScript users
    ├── client.js   
    ├── errors.js   
    └── ...
```

---

## 2. Testing Before Release

Before any code is built for a release, you must ensure that all tests pass and coverage requirements are met.

### Running the Test Suite
Run the standard Jest test suite:

```bash
npm run test
```

### Coverage Requirements
For release validation, run the coverage command:

```bash
npm run test:coverage
```

**Policy:** The CI pipeline will automatically reject any PR where statement coverage falls below 85%. Review the generated `coverage/lcov-report/index.html` file to identify untested branches or functions.

---

## 3. Versioning Strategy

The `spr-sdk` strictly adheres to [Semantic Versioning (SemVer)](https://semver.org/).

Given a version number `MAJOR.MINOR.PATCH`:
1. **MAJOR** version when you make incompatible API changes (e.g., renaming `SprClient.findRoute` to `SprClient.getRoute`, changing constructor signatures).
2. **MINOR** version when you add functionality in a backward-compatible manner (e.g., adding a new `CustomSigner` implementation).
3. **PATCH** version when you make backward-compatible bug fixes (e.g., fixing a logic error in slippage calculation).

### Updating the Version
Do not edit `package.json` manually. Instead, use the npm version command:

```bash
npm version patch  # For bug fixes
npm version minor  # For new features
npm version major  # For breaking changes
```
This command automatically updates `package.json`, creates a Git commit, and tags the release.

---

## 4. Publishing to npm

Once the code is built, tested, and versioned, it is ready for npm.

### Prerequisites
1. You must be authenticated with npm: `npm login`
2. You must have publish rights to the `@stellar-payment-router` npm organization.

### Publishing Command
To publish the package:

```bash
npm publish --access public
```

*Note: The `package.json` relies on the `"files": ["dist/"]` directive (if configured) or `.npmignore` to ensure only the compiled output, documentation, and metadata are pushed to the registry, not the raw `src/` files.*

---

## 5. Artifacts

When published, the package contains the following critical artifacts:
* **`dist/index.js`**: The main entry point defined by `"main": "dist/index.js"` in `package.json`.
* **`dist/index.d.ts`**: The TypeScript declaration file defined by `"types": "dist/index.d.ts"`. This is what provides IDE autocomplete for users.

---

## 6. CI/CD Integration

The repository uses GitHub Actions for continuous integration.

### Automated Builds & Testing
Every push to `main` and every Pull Request triggers the `CI` workflow. This workflow:
1. Installs dependencies (`npm ci`).
2. Checks code formatting (`npm run format:check`).
3. Runs the linter (`npm run lint`).
4. Executes the test suite with coverage (`npm run test:coverage`).

### Automated Publishing (Optional Setup)
You can configure a CD pipeline to automatically publish to npm upon creating a GitHub Release.
1. Create an `NPM_TOKEN` secret in GitHub Repository settings.
2. The deployment workflow should trigger on `release` events, run `npm run build`, and execute `npm publish` using the token.

---

## 7. Verification

After publishing a new version, it is crucial to verify the integrity of the published package.

### Local Installation Testing
In a separate, empty project directory, run:

```bash
mkdir sdk-test && cd sdk-test
npm init -y
npm install @stellar-payment-router/sdk@latest
```

### Integration Check
Create a simple `test.js` file to ensure the package exports correctly:

```javascript
const { SprClient } = require('@stellar-payment-router/sdk');

const client = new SprClient({ baseUrl: 'https://api.test.com', network: 'testnet' });
console.log("Client instantiated successfully:", !!client);
```

Run `node test.js`. If it executes without throwing `Cannot find module` or syntax errors, the deployment was successful.
