import axios, { AxiosInstance } from 'axios';
import {
  SprClientConfig,
  FindRouteParams,
  Route,
  SimulateRouteParams,
  ExecuteRouteParams,
  TransactionResult,
  AccountInfo,
  LiquidityInfo,
} from './types';
import { ApiError, InvalidParamsError, RouteNotFoundError } from './errors';

/**
 * Main Stellar Payment Router SDK client
 */
export class SprClient {
  private api: AxiosInstance;
  private config: SprClientConfig;

  constructor(config: SprClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    this.api = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    });
  }

  /**
   * Find the best route between two assets
   */
  async findRoute(params: FindRouteParams): Promise<Route> {
    try {
      this.validateFindRouteParams(params);

      const response = await this.api.get<Route>('/routes', {
        params: {
          sourceAsset: params.sourceAsset,
          destinationAsset: params.destinationAsset,
          amount: params.amount,
          maxSlippage: params.maxSlippage || 0.5,
        },
      });

      if (!response.data) {
        throw new RouteNotFoundError();
      }

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Simulate a route execution without submitting
   */
  async simulateRoute(params: SimulateRouteParams): Promise<Route> {
    try {
      const response = await this.api.post<Route>('/routes/simulate', params);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Execute a route transaction
   */
  async executeRoute(params: ExecuteRouteParams): Promise<TransactionResult> {
    try {
      const response = await this.api.post<TransactionResult>('/routes/execute', params);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccount(accountId: string): Promise<AccountInfo> {
    try {
      const response = await this.api.get<AccountInfo>(`/account/${accountId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get liquidity information
   */
  async getLiquidity(): Promise<LiquidityInfo> {
    try {
      const response = await this.api.get<LiquidityInfo>('/liquidity');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<TransactionResult> {
    try {
      const response = await this.api.get<TransactionResult>(`/transaction/${transactionId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Validate find route parameters
   */
  private validateFindRouteParams(params: FindRouteParams): void {
    if (!params.sourceAsset || typeof params.sourceAsset !== 'string') {
      throw new InvalidParamsError('Invalid sourceAsset');
    }

    if (!params.destinationAsset || typeof params.destinationAsset !== 'string') {
      throw new InvalidParamsError('Invalid destinationAsset');
    }

    if (!params.amount || typeof params.amount !== 'string') {
      throw new InvalidParamsError('Invalid amount');
    }

    const amountNum = parseFloat(params.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new InvalidParamsError('Amount must be a positive number');
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      throw new ApiError(message, status);
    }
  }
}
