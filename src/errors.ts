/**
 * Base error class for SPR SDK
 */
export class SprError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    Object.setPrototypeOf(this, SprError.prototype);
  }
}

/**
 * Error thrown when route is not found
 */
export class RouteNotFoundError extends SprError {
  constructor(message: string = 'No route found') {
    super(message, 'ROUTE_NOT_FOUND', 404);
    Object.setPrototypeOf(this, RouteNotFoundError.prototype);
  }
}

/**
 * Error thrown when invalid parameters are provided
 */
export class InvalidParamsError extends SprError {
  constructor(message: string = 'Invalid parameters') {
    super(message, 'INVALID_PARAMS', 400);
    Object.setPrototypeOf(this, InvalidParamsError.prototype);
  }
}

/**
 * Error thrown when wallet is not available
 */
export class WalletNotAvailableError extends SprError {
  constructor(message: string = 'Wallet not available') {
    super(message, 'WALLET_NOT_AVAILABLE', 400);
    Object.setPrototypeOf(this, WalletNotAvailableError.prototype);
  }
}

/**
 * Error thrown when API request fails
 */
export class ApiError extends SprError {
  constructor(message: string = 'API request failed', statusCode: number = 500) {
    super(message, 'API_ERROR', statusCode);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Error thrown when transaction fails
 */
export class TransactionError extends SprError {
  constructor(message: string = 'Transaction failed') {
    super(message, 'TRANSACTION_ERROR', 500);
    Object.setPrototypeOf(this, TransactionError.prototype);
  }
}
