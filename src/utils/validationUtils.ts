/**
 * Utility functions for input validation across the application.
 */

import { getFieldConfig } from './fieldValidationConfig';

export interface ValidationResult {
    allowed: boolean;
    error: string;
}

/**
 * Validates input based on field configuration.
 * Automatically looks up max length from field configuration.
 * 
 * @param fieldName The field name (e.g., 'firstName', 'doctorAddress')
 * @param value The new input value to validate
 * @param customMaxLength Optional override for max length
 * @param customFieldLabel Optional override for field label in error message
 * @param entity Optional entity scope (e.g., 'labMaster', 'patient')
 * @returns Object containing 'allowed' boolean and 'error' message string
 */
export const validateField = (
    fieldName: string,
    value: any,
    customMaxLength?: number,
    customFieldLabel?: string,
    entity?: any // Should be keyof typeof FIELD_CONFIG but avoid circular dependency if possible
): ValidationResult => {
    // Get field config
    const config = (getFieldConfig as any)(fieldName, entity);
    const maxLength = customMaxLength ?? config?.maxLength;
    const fieldLabel = customFieldLabel ?? config?.fieldName ?? fieldName;

    // Normalize value to string (handle null/undefined/boolean)
    const strValue = (value !== null && value !== undefined) ? value.toString() : '';

    // If no max length defined, allow all input
    if (!maxLength) {
        return { allowed: true, error: '' };
    }

    // Strict length check - but preserve range errors if they exist
    if (strValue.length > maxLength) {
        // Check if the value (truncated to maxLength) has a range error
        // If so, show that instead of the length error
        if (config?.type === 'number' && config?.min !== undefined && config?.max !== undefined) {
            const truncatedValue = strValue.substring(0, maxLength);
            const numValue = parseFloat(truncatedValue);
            if (!isNaN(numValue)) {
                if (numValue < config.min || numValue > config.max) {
                    return { allowed: false, error: `${fieldLabel} must be between ${config.min} and ${config.max}` };
                }
            }
        }
        return { allowed: false, error: `${fieldLabel} cannot exceed ${maxLength} characters` };
    }

    // Pattern check
    if (config?.pattern) {
        if (!config.pattern.test(strValue)) {
            return { allowed: false, error: 'Invalid format' };
        }
    } else if (config?.type === 'number') {
        // Default number check if no pattern specified (only digits)
        if (!/^\d*$/.test(strValue)) {
            return { allowed: false, error: 'Only numbers are allowed' };
        }
    }

    // Error messages accumulation (doesn't block input but shows warning)
    let error = '';

    // Range check for numbers (accumulate error, don't block input to allow typing)
    if (config?.type === 'number' && strValue.length > 0) {
        const numValue = parseFloat(strValue);
        if (!isNaN(numValue)) {
            if (config.min !== undefined && numValue < config.min) {
                error = `${fieldLabel} must be between ${config.min} and ${config.max}`;
            } else if (config.max !== undefined && numValue > config.max) {
                error = `${fieldLabel} must be between ${config.min} and ${config.max}`;
            }
        }
    }

    // Length warning - only show if no other error (like range error) exists
    if (strValue.length === maxLength && !error) {
        error = `${fieldLabel} cannot exceed ${maxLength} characters`;
    }

    // Email format check
    if (config?.type === 'email' && strValue.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(strValue)) {
            error = 'Invalid email format';
        }
    }

    // Mobile number 10-digit check (specific to fields named mobileNumber or mobile1/2 if they have 10 digit limit)
    if ((fieldName === 'mobileNumber' || fieldName === 'mobile1' || fieldName === 'mobile2') &&
        maxLength === 10 && strValue.length > 0 && strValue.length < 10) {
        error = 'Mobile number must be 10 digits';
    }

    // Format pattern check (for real-time feedback that doesn't block typing)
    if (config?.formatPattern && strValue.length > 0) {
        if (!config.formatPattern.test(strValue)) {
            error = config.formatErrorMessage || 'Invalid format';
        }
    }

    return { allowed: true, error };
};

/**
 * Legacy function for backward compatibility.
 * Validates address input length.
 * 
 * @deprecated Use validateField instead
 */
export const validateAddressInput = (value: string, maxLength: number = 150, fieldName: string = 'Address'): ValidationResult => {
    return validateField('address', value, maxLength, fieldName);
};

/**
 * Get max length for a field from configuration
 */
export const getMaxLength = (fieldName: string, entity?: any): number | undefined => {
    const config = getFieldConfig(fieldName, entity);
    return config?.maxLength;
};

/**
 * Get field label for error messages
 */
export const getFieldLabel = (fieldName: string): string => {
    const config = getFieldConfig(fieldName);
    return config?.fieldName ?? fieldName;
};

/**
 * Validates name input length.
 * Usage:
 * const { allowed, error } = validateNameInput(newValue);
 * if (allowed) {
 *     setValue(newValue);
 *     setError(error);
 * }
 * 
 * @param value The new input value to validate
 * @param maxLength The maximum allowed characters (default: 50)
 * @param fieldName The name of the field for the error message (default: 'Name')
 * @returns Object containing 'allowed' boolean and 'error' message string
 */
export const validateNameInput = (value: string, maxLength?: number, fieldName: string = 'Name'): ValidationResult => {
    const effectiveMaxLength = maxLength ?? getMaxLength('firstName') ?? 50;

    // strict length check - block input beyond effectiveMaxLength
    if (value.length > effectiveMaxLength) {
        return { allowed: false, error: `${fieldName} cannot exceed ${effectiveMaxLength} characters` };
    }

    // Character restriction check: Allow alphabets, spaces, dots, hyphens, and apostrophes only. Block numbers.
    if (value.length > 0 && !/^[a-zA-Z\s\-\'.]*$/.test(value)) {
        return { allowed: false, error: `${fieldName} can only contain alphabets` };
    }

    // error message check - show warning when at limit
    let error = '';
    if (value.length === effectiveMaxLength) {
        error = `${fieldName} cannot exceed ${effectiveMaxLength} characters`;
    }

    return { allowed: true, error };
};

/**
 * Validates email input length.
 * Usage:
 * const { allowed, error } = validateEmailInput(newValue);
 * if (allowed) {
 *     setValue(newValue);
 *     setError(error);
 * }
 * 
 * @param value The new input value to validate
 * @param maxLength The maximum allowed characters (default: 50)
 * @param fieldName The name of the field for the error message (default: 'Email')
 * @returns Object containing 'allowed' boolean and 'error' message string
 */
export const validateEmailInput = (value: string, maxLength: number = 50, fieldName: string = 'Email'): ValidationResult => {
    return validateField('email', value, maxLength, fieldName);
};

/**
 * Validates description input length.
 * Usage:
 * const { allowed, error } = validateDescriptionInput(newValue, 150);
 * 
 * @param value The new input value to validate
 * @param maxLength The maximum allowed characters (default: 150)
 * @param fieldName The name of the field for the error message (default: 'Description')
 * @returns Object containing 'allowed' boolean and 'error' message string
 */
export const validateDescriptionInput = (value: string, maxLength?: number, fieldName: string = 'Description'): ValidationResult => {
    const effectiveMaxLength = maxLength ?? 150;

    // strict length check
    if (value.length > effectiveMaxLength) {
        return { allowed: false, error: `${fieldName} cannot exceed ${effectiveMaxLength} characters` };
    }

    // error message check
    let error = '';
    if (value.length === effectiveMaxLength) {
        error = `${fieldName} cannot exceed ${effectiveMaxLength} characters`;
    }

    return { allowed: true, error };
};

/**
 * Validates generic text input with character restrictions.
 */
export const validateTextInput = (value: string, maxLength: number, fieldName: string, pattern?: RegExp): ValidationResult => {
    if (value.length > maxLength) {
        return { allowed: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
    }

    if (pattern && !pattern.test(value)) {
        return { allowed: false, error: `Invalid characters in ${fieldName}` };
    }

    let error = '';
    if (value.length === maxLength) {
        error = `${fieldName} cannot exceed ${maxLength} characters`;
    }

    return { allowed: true, error };
};

/**
 * Filters input to allow only digits and at most one decimal point.
 * 
 * @param value The raw input value
 * @param allowDecimal Whether to allow a decimal point (default: true)
 * @returns Filtered string
 */
export const filterNumericInput = (value: string, allowDecimal: boolean = true): string => {
    if (value === null || value === undefined) return '';

    let processedValue = String(value);

    if (allowDecimal) {
        // Allow digits and at most one dot
        processedValue = processedValue.replace(/[^0-9.]/g, '');
        const parts = processedValue.split('.');
        if (parts.length > 2) {
            processedValue = parts[0] + '.' + parts.slice(1).join('');
        }
    } else {
        // Digits only
        processedValue = processedValue.replace(/[^0-9]/g, '');
    }

    return processedValue;
};

/**
 * Validates if a string is a valid numeric input (digits and at most one dot).
 * Useful for blocking non-numeric input in onChange handlers.
 */
export const isValidNumericInput = (value: string): boolean => {
    if (!value) return true;
    return /^\d*\.?\d*$/.test(value);
};
