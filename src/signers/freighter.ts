import { Signer } from '../types';
import { WalletNotAvailableError } from '../errors';

interface FreighterApi {
  getPublicKey(): Promise<string>;
  signTransaction(tx: string, options?: { network?: string }): Promise<string>;
}

declare global {
  interface Window {
    freighter?: FreighterApi;
  }
}

/**
 * Freighter wallet signer implementation
 */
export class FreighterSigner implements Signer {
  /**
   * Check if Freighter wallet is available
   */
  async isAvailable(): Promise<boolean> {
    return typeof window.freighter !== 'undefined';
  }

  /**
   * Get the public key from Freighter
   */
  async getPublicKey(): Promise<string> {
    if (!(await this.isAvailable())) {
      throw new WalletNotAvailableError('Freighter wallet not installed');
    }

    try {
      const publicKey = await window.freighter!.getPublicKey();
      return publicKey;
    } catch (error) {
      throw new WalletNotAvailableError(
        `Failed to get public key: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sign a transaction with Freighter
   */
  async signTransaction(tx: string): Promise<string> {
    if (!(await this.isAvailable())) {
      throw new WalletNotAvailableError('Freighter wallet not installed');
    }

    try {
      const signedTx = await window.freighter!.signTransaction(tx, {
        network: 'testnet',
      });
      return signedTx;
    } catch (error) {
      throw new WalletNotAvailableError(
        `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
