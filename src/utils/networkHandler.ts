import api from '../services/api';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface NetworkError {
  type: 'timeout' | 'connection' | 'server' | 'unknown';
  message: string;
  retryable: boolean;
  statusCode?: number;
}

export class NetworkHandler {
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  };

  private static isOnline = navigator.onLine;
  private static networkStatusListeners: Set<(isOnline: boolean) => void> = new Set();

  static {
    // Monitor network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.networkStatusListeners.forEach(listener => listener(true));
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.networkStatusListeners.forEach(listener => listener(false));
    });
  }

  /**
   * Execute API call with retry logic and network error handling
   */
  static async executeWithRetry<T>(
    apiCall: () => Promise<T>,
    operationName: string,
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<T> {
    const config = { ...this.DEFAULT_RETRY_CONFIG, ...retryConfig };
    let lastError: any;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Check network status before making request
        if (!this.isOnline) {
          throw new Error('Network is offline');
        }

        const result = await apiCall();
        console.log(`✅ ${operationName} succeeded on attempt ${attempt + 1}`);
        return result;

      } catch (error: any) {
        lastError = error;
        const networkError = this.classifyError(error);
        
        console.warn(`⚠️ ${operationName} failed on attempt ${attempt + 1}:`, networkError.message);

        // Don't retry if error is not retryable or we've exhausted retries
        if (!networkError.retryable || attempt === config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        console.log(`🔄 Retrying ${operationName} in ${delay}ms...`);
        await this.delay(delay);
      }
    }

    // All retries failed
    console.error(`❌ ${operationName} failed after ${config.maxRetries + 1} attempts`);
    throw this.createNetworkError(lastError);
  }

  /**
   * Classify error type and determine if retryable
   */
  private static classifyError(error: any): NetworkError {
    if (!error.response) {
      // Network error (no response)
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        return {
          type: 'timeout',
          message: 'Request timed out. Please check your connection.',
          retryable: true
        };
      } else if (error.message === 'Network Error' || !this.isOnline) {
        return {
          type: 'connection',
          message: 'Network connection lost. Please check your internet connection.',
          retryable: true
        };
      } else {
        return {
          type: 'unknown',
          message: 'An unexpected network error occurred.',
          retryable: false
        };
      }
    }

    const status = error.response.status;
    
    // Server errors (5xx) are usually retryable
    if (status >= 500) {
      return {
        type: 'server',
        message: 'Server error occurred. Please try again.',
        retryable: true,
        statusCode: status
      };
    }

    // Client errors (4xx) are usually not retryable
    if (status >= 400) {
      return {
        type: 'server',
        message: this.getClientErrorMessage(status),
        retryable: false,
        statusCode: status
      };
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred.',
      retryable: false,
      statusCode: status
    };
  }

  /**
   * Get user-friendly error message for client errors
   */
  private static getClientErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission for this action.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return `Request failed with status ${status}.`;
    }
  }

  /**
   * Create standardized network error
   */
  private static createNetworkError(originalError: any): NetworkError {
    const classified = this.classifyError(originalError);
    
    return {
      ...classified,
      message: `${classified.message} (${originalError.message || 'Unknown error'})`
    };
  }

  /**
   * Delay execution for specified milliseconds
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if network is online
   */
  static isNetworkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add network status listener
   */
  static addNetworkStatusListener(listener: (isOnline: boolean) => void): () => void {
    this.networkStatusListeners.add(listener);
    
    // Return cleanup function
    return () => {
      this.networkStatusListeners.delete(listener);
    };
  }

  /**
   * Show network status notification to user
   */
  static showNetworkStatusNotification(isOnline: boolean): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      z-index: 10000;
      transition: all 0.3s ease;
      ${isOnline 
        ? 'background: #4caf50;' 
        : 'background: #f44336;'
      }
    `;
    
    notification.textContent = isOnline 
      ? '✅ Network connection restored' 
      : '❌ Network connection lost';
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Enhanced API wrapper with network handling
   */
  static async apiCall<T>(
    apiCall: () => Promise<T>,
    operationName: string,
    options: {
      showLoading?: boolean;
      showError?: boolean;
      retryConfig?: Partial<RetryConfig>;
    } = {}
  ): Promise<T> {
    const { showLoading = true, showError = true, retryConfig } = options;
    
    try {
      if (showLoading) {
        this.showLoadingIndicator(operationName);
      }

      const result = await this.executeWithRetry(apiCall, operationName, retryConfig);
      
      if (showLoading) {
        this.hideLoadingIndicator();
      }
      
      return result;

    } catch (error: any) {
      if (showLoading) {
        this.hideLoadingIndicator();
      }
      
      if (showError) {
        this.showErrorNotification(error, operationName);
      }
      
      throw error;
    }
  }

  /**
   * Show loading indicator
   */
  private static showLoadingIndicator(operationName: string): void {
    // Remove existing indicator
    this.hideLoadingIndicator();
    
    const indicator = document.createElement('div');
    indicator.id = 'network-loading-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      z-index: 10000;
    `;
    indicator.textContent = `⏳ ${operationName}...`;
    
    document.body.appendChild(indicator);
  }

  /**
   * Hide loading indicator
   */
  private static hideLoadingIndicator(): void {
    const indicator = document.getElementById('network-loading-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Show error notification
   */
  private static showErrorNotification(error: NetworkError, operationName: string): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">
        ❌ ${operationName} Failed
      </div>
      <div style="font-size: 12px;">
        ${error.message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Export convenience functions
export const executeWithRetry = NetworkHandler.executeWithRetry;
export const apiCall = NetworkHandler.apiCall;
export const isNetworkOnline = NetworkHandler.isNetworkOnline;
export const addNetworkStatusListener = NetworkHandler.addNetworkStatusListener;
