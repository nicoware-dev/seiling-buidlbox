import { validate as validateUuid } from 'uuid';

/**
 * ID validation utilities to support both UUID and cuid formats
 */

export interface IdValidationResult {
  isValid: boolean;
  type?: 'uuid' | 'cuid';
  error?: string;
}

/**
 * Simple cuid validation (checking format)
 * For a more robust implementation, consider using @paralleldrive/cuid2
 */
function isCuid(id: string): boolean {
  // CUID format: starts with 'c', followed by 24 alphanumeric characters
  // Format: c[24 alphanumeric chars] or cl[22 alphanumeric chars] for cuid2
  const cuidRegex = /^c[a-z0-9]{24}$/;
  const cuid2Regex = /^cl[a-z0-9]{22}$/;
  return cuidRegex.test(id) || cuid2Regex.test(id);
}

/**
 * Validates an ID and determines its format (UUID or cuid)
 */
export function validateId(id: string): IdValidationResult {
  if (!id || typeof id !== 'string') {
    return {
      isValid: false,
      error: 'ID is required and must be a string'
    };
  }

  const trimmedId = id.trim();

  // Check if it's a valid UUID
  if (validateUuid(trimmedId)) {
    return {
      isValid: true,
      type: 'uuid'
    };
  }

  // Check if it's a valid cuid
  if (isCuid(trimmedId)) {
    return {
      isValid: true,
      type: 'cuid'
    };
  }

  return {
    isValid: false,
    error: 'ID must be a valid UUID or cuid format'
  };
}

/**
 * Validates that an ID is either UUID or cuid
 */
export function isValidId(id: string): boolean {
  return validateId(id).isValid;
}

/**
 * Creates a validation error response for invalid IDs
 */
export function createIdValidationError(id: string): { error: string; status: number } {
  const validation = validateId(id);
  
  if (!validation.isValid) {
    return {
      error: validation.error || 'Invalid ID format',
      status: 400
    };
  }

  // This shouldn't happen if validation passed
  return {
    error: 'Unknown ID validation error',
    status: 400
  };
}

/**
 * Sanitizes an ID for database queries (removes any potential injection attempts)
 */
export function sanitizeId(id: string): string {
  const validation = validateId(id);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid ID format');
  }
  return id.trim();
}

