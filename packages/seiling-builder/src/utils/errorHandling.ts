/**
 * Error handling utilities for Seiling Builder
 */

export interface FriendlyError {
  title: string;
  message: string;
  code?: string;
  suggestion?: string;
}

/**
 * Convert error to user-friendly message
 */
export function getFriendlyError(error: unknown): FriendlyError {
  const errorString = error instanceof Error ? error.message : String(error);

  // Common wallet errors
  if (errorString.includes('User rejected') || errorString.includes('user rejected')) {
    return {
      title: 'Transaction Rejected',
      message: 'You rejected the transaction in your wallet.',
      code: 'USER_REJECTED',
      suggestion: 'Please approve the transaction if you want to proceed.',
    };
  }

  if (errorString.includes('insufficient funds') || errorString.includes('Insufficient')) {
    return {
      title: 'Insufficient Funds',
      message: 'You do not have enough SEI to complete this transaction.',
      code: 'INSUFFICIENT_FUNDS',
      suggestion: 'Please add more SEI to your wallet.',
    };
  }

  if (errorString.includes('network') || errorString.includes('Network')) {
    return {
      title: 'Network Error',
      message: 'There was a problem connecting to the network.',
      code: 'NETWORK_ERROR',
      suggestion: 'Please check your internet connection and try again.',
    };
  }

  if (errorString.includes('nonce') || errorString.includes('replacement')) {
    return {
      title: 'Transaction Nonce Error',
      message: 'A transaction with this nonce already exists.',
      code: 'NONCE_ERROR',
      suggestion: 'Please wait a moment and try again.',
    };
  }

  if (errorString.includes('gas') || errorString.includes('Gas')) {
    return {
      title: 'Gas Error',
      message: 'There was a problem with gas estimation or execution.',
      code: 'GAS_ERROR',
      suggestion: 'Try increasing gas limit or check network status.',
    };
  }

  if (errorString.includes('revert') || errorString.includes('Revert')) {
    return {
      title: 'Transaction Reverted',
      message: 'The transaction was reverted by the contract.',
      code: 'REVERTED',
      suggestion: 'The contract may have rejected the transaction. Check the contract logic or parameters.',
    };
  }

  if (errorString.includes('invalid address') || errorString.includes('Invalid address')) {
    return {
      title: 'Invalid Address',
      message: 'The provided address is not valid.',
      code: 'INVALID_ADDRESS',
      suggestion: 'Please check the address format and try again.',
    };
  }

  if (errorString.includes('ABI') || errorString.includes('abi')) {
    return {
      title: 'ABI Error',
      message: 'There was a problem with the contract ABI.',
      code: 'ABI_ERROR',
      suggestion: 'Please verify the ABI is correct and matches the contract.',
    };
  }

  // Generic error
  return {
    title: 'Error',
    message: errorString || 'An unexpected error occurred',
    code: 'UNKNOWN',
    suggestion: 'Please try again. If the problem persists, check the console for more details.',
  };
}

/**
 * Format error for display in notifications
 */
export function formatErrorForNotification(error: unknown): { title: string; message: string } {
  const friendly = getFriendlyError(error);
  return {
    title: friendly.title,
    message: friendly.suggestion ? `${friendly.message} ${friendly.suggestion}` : friendly.message,
  };
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  const friendly = getFriendlyError(error);
  const nonRecoverableCodes = ['INVALID_ADDRESS', 'ABI_ERROR'];
  return !nonRecoverableCodes.includes(friendly.code || '');
}

