import { Signer } from '../types';
import { InvalidParamsError } from '../errors';

/**
 * Custom signer implementation for server-side signing
 */
export class CustomSigner implements Signer {
  constructor(
    private publicKey: string,
    private signFn: (tx: string) => Promise<string>
  ) {}

  /**
   * Get the public key
   */
  async getPublicKey(): Promise<string> {
    return this.publicKey;
  }

  /**
   * Sign a transaction
   */
  async signTransaction(tx: string): Promise<string> {
    if (!tx || typeof tx !== 'string') {
      throw new InvalidParamsError('Invalid transaction');
    }

    return await this.signFn(tx);
  }

  /**
   * Check if signer is available
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }
}
