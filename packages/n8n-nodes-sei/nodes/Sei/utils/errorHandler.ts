import { NodeOperationError } from 'n8n-workflow';

/**
 * Extracts a user-friendly error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    if (errorObj.message) {
      return String(errorObj.message);
    }
    if (errorObj.error) {
      return String(errorObj.error);
    }
    if (errorObj.reason) {
      return String(errorObj.reason);
    }
  }
  return 'Unknown error occurred';
}

/**
 * Extracts transaction revert reason from error
 */
export function extractRevertReason(error: unknown): string | null {
  const errorMessage = extractErrorMessage(error);
  
  // Common patterns for revert reasons
  const revertPatterns = [
    /revert\s+(.+)/i,
    /execution reverted:\s*(.+)/i,
    /revert\s*\((.+)\)/i,
    /Error:\s*(.+)/i,
  ];

  for (const pattern of revertPatterns) {
    const match = errorMessage.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Check if error object has revert reason
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    if (errorObj.revertReason) {
      return String(errorObj.revertReason);
    }
    if (errorObj.data?.message) {
      return String(errorObj.data.message);
    }
  }

  return null;
}

/**
 * Creates a user-friendly error message for protocol operations
 */
export function formatProtocolError(
  protocol: string,
  action: string,
  error: unknown
): string {
  const baseMessage = `${protocol} ${action} failed`;
  const errorMessage = extractErrorMessage(error);
  const revertReason = extractRevertReason(error);

  if (revertReason) {
    return `${baseMessage}: ${revertReason}`;
  }

  if (errorMessage && !errorMessage.includes('Unknown error')) {
    return `${baseMessage}: ${errorMessage}`;
  }

  return baseMessage;
}

/**
 * Wraps an error in NodeOperationError for n8n
 */
export function wrapNodeError(
  node: any,
  message: string,
  error?: unknown
): NodeOperationError {
  let fullMessage = message;
  
  if (error) {
    const errorMsg = extractErrorMessage(error);
    if (errorMsg && !message.includes(errorMsg)) {
      fullMessage = `${message}: ${errorMsg}`;
    }
  }

  return new NodeOperationError(node, fullMessage);
}

/**
 * Checks if error is related to insufficient balance
 */
export function isInsufficientBalanceError(error: unknown): boolean {
  const errorMessage = extractErrorMessage(error).toLowerCase();
  return (
    errorMessage.includes('insufficient') ||
    errorMessage.includes('balance') ||
    errorMessage.includes('not enough')
  );
}

/**
 * Checks if error is related to transaction revert
 */
export function isRevertError(error: unknown): boolean {
  const errorMessage = extractErrorMessage(error).toLowerCase();
  return (
    errorMessage.includes('revert') ||
    errorMessage.includes('execution reverted') ||
    errorMessage.includes('transaction failed')
  );
}

