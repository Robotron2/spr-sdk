import { InvalidParamsError } from '../errors';

/**
 * Validate Stellar asset format
 */
export function validateAsset(asset: string): boolean {
  if (!asset || typeof asset !== 'string') {
    throw new InvalidParamsError('Invalid asset format');
  }

  // Check if native asset
  if (asset === 'native' || asset === 'XLM') {
    return true;
  }

  // Check if custom asset (CODE:ISSUER)
  const parts = asset.split(':');
  if (parts.length === 2) {
    const [code, issuer] = parts;
    if (code.length > 0 && code.length <= 12 && issuer.startsWith('G')) {
      return true;
    }
  }

  throw new InvalidParamsError('Asset must be "native" or in format "CODE:ISSUER"');
}

/**
 * Validate Stellar account ID
 */
export function validateAccountId(accountId: string): boolean {
  if (!accountId || typeof accountId !== 'string') {
    throw new InvalidParamsError('Invalid account ID');
  }

  if (!accountId.startsWith('G') || accountId.length !== 56) {
    throw new InvalidParamsError('Invalid Stellar account ID');
  }

  return true;
}

/**
 * Validate amount
 */
export function validateAmount(amount: string): boolean {
  if (!amount || typeof amount !== 'string') {
    throw new InvalidParamsError('Invalid amount');
  }

  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    throw new InvalidParamsError('Amount must be a positive number');
  }

  return true;
}

/**
 * Validate slippage percentage
 */
export function validateSlippage(slippage: number): boolean {
  if (typeof slippage !== 'number' || slippage < 0 || slippage > 100) {
    throw new InvalidParamsError('Slippage must be between 0 and 100');
  }

  return true;
}
