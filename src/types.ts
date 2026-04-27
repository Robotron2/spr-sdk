/**
 * Represents a single hop in a payment route
 */
export interface Hop {
  sourceAsset: string;
  destinationAsset: string;
  rate: string;
  fee: string;
}

/**
 * Represents a complete payment route
 */
export interface Route {
  sourceAsset: string;
  destinationAsset: string;
  amount: string;
  minReceived: string;
  path: Hop[];
  totalFee: string;
  estimatedOutput: string;
  timestamp: number;
}

/**
 * Parameters for finding a route
 */
export interface FindRouteParams {
  sourceAsset: string;
  destinationAsset: string;
  amount: string;
  maxSlippage?: number;
}

/**
 * Parameters for simulating a route
 */
export interface SimulateRouteParams {
  route: Route;
  sourceAccount: string;
}

/**
 * Parameters for executing a route
 */
export interface ExecuteRouteParams {
  route: Route;
  sourceAccount: string;
  destinationAccount: string;
  signature: string;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  id: string;
  status: 'success' | 'pending' | 'failed';
  hash: string;
  timestamp: number;
  details: Record<string, unknown>;
}

/**
 * SDK Client configuration
 */
export interface SprClientConfig {
  baseUrl: string;
  network: 'testnet' | 'mainnet';
  apiKey?: string;
  timeout?: number;
}

/**
 * Signer interface for transaction signing
 */
export interface Signer {
  getPublicKey(): Promise<string>;
  signTransaction(tx: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}

/**
 * Account information
 */
export interface AccountInfo {
  id: string;
  balance: string;
  sequenceNumber: string;
  subentryCount: number;
}

/**
 * Pool information
 */
export interface PoolInfo {
  id: string;
  asset1: string;
  asset2: string;
  reserve1: string;
  reserve2: string;
  fee: string;
  totalShares: string;
}

/**
 * Liquidity information
 */
export interface LiquidityInfo {
  pools: PoolInfo[];
  totalLiquidity: string;
  timestamp: number;
}
