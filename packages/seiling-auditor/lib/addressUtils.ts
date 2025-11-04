// Note: Sei uses EVM-compatible addresses (0x format)
// Address validation for Sei blockchain

export interface AddressValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

/**
 * Validates and normalizes a Sei address to 0x format (EVM-compatible)
 */
export function validateAndNormalizeAddress(address: string): AddressValidationResult {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      error: 'Address is required and must be a string'
    };
  }

  const trimmedAddress = address.trim();

  // Ensure it starts with 0x
  if (!trimmedAddress.startsWith('0x')) {
    return {
      isValid: false,
      error: 'Address must start with 0x (EVM format)'
    };
  }

  // Basic format validation (0x followed by 40 hex characters)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(trimmedAddress)) {
    return {
      isValid: false,
      error: 'Invalid Ethereum address format (must be 0x followed by 40 hex characters)'
    };
  }

  // Return normalized address (lowercase for consistency)
  // Sei uses EVM-compatible addresses, lowercase is acceptable
  return {
    isValid: true,
    normalized: trimmedAddress.toLowerCase()
  };
}

/**
 * Checks if an address is a valid Ethereum address (0x format)
 */
export function isValidEthereumAddress(address: string): boolean {
  return validateAndNormalizeAddress(address).isValid;
}

/**
 * Converts an address to lowercase for database storage
 */
export function normalizeAddressForStorage(address: string): string {
  const validation = validateAndNormalizeAddress(address);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid address');
  }
  return validation.normalized!.toLowerCase();
}

/**
 * Address validation middleware for API routes
 */
export function createAddressValidationError(address: string): { error: string; status: number } {
  const validation = validateAndNormalizeAddress(address);
  
  if (!validation.isValid) {
    return {
      error: validation.error || 'Invalid address format',
      status: 400
    };
  }

  // Additional length check
  if (address.length < 10) {
    return {
      error: 'Address appears to be too short',
      status: 400
    };
  }

  // This shouldn't happen if validation passed, but just in case
  return {
    error: 'Unknown address validation error',
    status: 400
  };
}

