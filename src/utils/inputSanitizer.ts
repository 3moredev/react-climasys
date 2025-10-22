/**
 * Input sanitization utilities for XSS prevention and data validation
 */

export interface SanitizationOptions {
  maxLength?: number;
  allowSpecialChars?: boolean;
  allowHtml?: boolean;
  trimWhitespace?: boolean;
}

export class InputSanitizer {
  // HTML entities mapping for XSS prevention
  private static readonly HTML_ENTITIES: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '&': '&amp;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  // Dangerous patterns for XSS prevention
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /vbscript:/gi,
    /data:text\/html/gi
  ];

  /**
   * Sanitize text input to prevent XSS attacks
   */
  static sanitizeText(
    input: string, 
    options: SanitizationOptions = {}
  ): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Trim whitespace if requested
    if (options.trimWhitespace !== false) {
      sanitized = sanitized.trim();
    }

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        console.warn('🚨 Dangerous pattern detected in input:', sanitized);
        return ''; // Return empty string for dangerous input
      }
    }

    // Escape HTML entities if HTML is not allowed
    if (options.allowHtml !== true) {
      sanitized = this.escapeHtml(sanitized);
    }

    // Remove special characters if not allowed
    if (options.allowSpecialChars !== true) {
      sanitized = this.removeSpecialCharacters(sanitized);
    }

    // Limit length
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
      console.warn(`⚠️ Input truncated to ${options.maxLength} characters`);
    }

    return sanitized;
  }

  /**
   * Sanitize search query with specific rules for patient search
   */
  static sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    // Remove dangerous patterns
    let sanitized = query.trim();
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(sanitized)) {
        console.warn('🚨 SQL injection pattern detected:', sanitized);
        return ''; // Return empty for SQL injection attempts
      }
    }

    // Limit length for search queries
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }

    // Escape HTML but allow basic search characters
    sanitized = this.escapeHtml(sanitized);

    return sanitized;
  }

  /**
   * Sanitize patient data with medical record specific rules
   */
  static sanitizePatientData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Different sanitization rules for different fields
        if (key.includes('name') || key.includes('Name')) {
          sanitized[key] = this.sanitizeText(value, { 
            maxLength: 100, 
            allowSpecialChars: false 
          });
        } else if (key.includes('contact') || key.includes('mobile') || key.includes('phone')) {
          sanitized[key] = this.sanitizeContactNumber(value);
        } else if (key.includes('email')) {
          sanitized[key] = this.sanitizeEmail(value);
        } else {
          sanitized[key] = this.sanitizeText(value, { maxLength: 500 });
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize contact number - only allow digits and basic formatting
   */
  private static sanitizeContactNumber(contact: string): string {
    if (!contact) return '';
    
    // Remove all non-digit characters except + at the beginning
    let sanitized = contact.replace(/[^\d+]/g, '');
    
    // Ensure + is only at the beginning
    if (sanitized.includes('+') && !sanitized.startsWith('+')) {
      sanitized = sanitized.replace(/\+/g, '');
    }
    
    // Limit length
    if (sanitized.length > 15) {
      sanitized = sanitized.substring(0, 15);
    }
    
    return sanitized;
  }

  /**
   * Sanitize email address
   */
  private static sanitizeEmail(email: string): string {
    if (!email) return '';
    
    // Basic email validation and sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.trim().toLowerCase();
    
    if (!emailRegex.test(sanitized)) {
      console.warn('⚠️ Invalid email format:', email);
      return '';
    }
    
    // Limit length
    if (sanitized.length > 254) {
      return sanitized.substring(0, 254);
    }
    
    return sanitized;
  }

  /**
   * Escape HTML entities
   */
  private static escapeHtml(text: string): string {
    return text.replace(/[<>&"'`=\/]/g, (char) => {
      return this.HTML_ENTITIES[char] || char;
    });
  }

  /**
   * Remove special characters while preserving basic text
   */
  private static removeSpecialCharacters(text: string): string {
    // Allow letters, numbers, spaces, basic punctuation
    return text.replace(/[^a-zA-Z0-9\s.,!?-]/g, '');
  }

  /**
   * Validate appointment data before sending to API
   */
  static validateAppointmentData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data) {
      errors.push('Appointment data is required');
      return { isValid: false, errors };
    }

    // Validate required fields
    const requiredFields = ['patientId', 'doctorId', 'clinicId', 'visitDate'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    }

    // Validate date format
    if (data.visitDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.visitDate)) {
        errors.push('Invalid date format. Expected YYYY-MM-DD');
      }
    }

    // Validate time format
    if (data.visitTime) {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(data.visitTime)) {
        errors.push('Invalid time format. Expected HH:MM');
      }
    }

    // Validate numeric fields
    const numericFields = ['shiftId', 'patientVisitNo', 'statusId'];
    for (const field of numericFields) {
      if (data[field] !== undefined && data[field] !== null) {
        const num = Number(data[field]);
        if (isNaN(num) || num < 0) {
          errors.push(`${field} must be a positive number`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export convenience functions
export const sanitizeText = InputSanitizer.sanitizeText;
export const sanitizeSearchQuery = InputSanitizer.sanitizeSearchQuery;
export const sanitizePatientData = InputSanitizer.sanitizePatientData;
export const validateAppointmentData = InputSanitizer.validateAppointmentData;
