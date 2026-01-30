/**
 * Utility functions for input validation across the application.
 */

export interface ValidationResult {
    allowed: boolean;
    error: string;
}

/**
 * Validates address input length.
 * Usage:
 * const { allowed, error } = validateAddressInput(newValue, 150);
 * if (allowed) {
 *     setValue(newValue);
 *     setError(error);
 * }
 * 
 * @param value The new input value to validate
 * @param maxLength The maximum allowed characters (default: 150)
 * @param fieldName The name of the field for the error message (default: 'Address')
 * @returns Object containing 'allowed' boolean and 'error' message string
 */
export const validateAddressInput = (value: string, maxLength: number = 150, fieldName: string = 'Address'): ValidationResult => {
    // strict length check
    if (value.length > maxLength) {
        return { allowed: false, error: '' };
    }

    // error message check
    let error = '';
    if (value.length === maxLength) {
        error = `${fieldName} cannot exceed ${maxLength} characters`;
    }

    return { allowed: true, error };
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
export const validateNameInput = (value: string, maxLength: number = 50, fieldName: string = 'Name'): ValidationResult => {
    // strict length check - block input beyond maxLength
    if (value.length > maxLength) {
        return { allowed: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
    }

    // Character restriction check: Allow alphabets, spaces, dots, hyphens, and apostrophes only. Block numbers.
    if (value.length > 0 && !/^[a-zA-Z\s\-\'.]*$/.test(value)) {
        return { allowed: false, error: `${fieldName} can only contain alphabets` };
    }

    // error message check - show warning when at limit
    let error = '';
    if (value.length === maxLength) {
        error = `${fieldName} cannot exceed ${maxLength} characters`;
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
    // strict length check - block input beyond maxLength
    if (value.length > maxLength) {
        return { allowed: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
    }

    // error message check - show warning when at limit
    let error = '';
    if (value.length === maxLength) {
        error = `${fieldName} cannot exceed ${maxLength} characters`;
    }

    return { allowed: true, error };
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
export const validateDescriptionInput = (value: string, maxLength: number = 150, fieldName: string = 'Description'): ValidationResult => {
    // strict length check
    if (value.length > maxLength) {
        return { allowed: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
    }

    // error message check
    let error = '';
    if (value.length === maxLength) {
        error = `${fieldName} cannot exceed ${maxLength} characters`;
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
