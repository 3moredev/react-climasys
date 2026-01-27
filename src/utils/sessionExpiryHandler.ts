
export interface SessionExpiryHandler {
  isOperationInProgress: boolean;
  pendingOperations: Set<string>;
  sessionExpired: boolean;
}

class SessionExpiryManager {
  private static instance: SessionExpiryManager;
  private isOperationInProgress = false;
  private pendingOperations = new Set<string>();
  private sessionExpired = false;
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;

  static getInstance(): SessionExpiryManager {
    if (!SessionExpiryManager.instance) {
      SessionExpiryManager.instance = new SessionExpiryManager();
    }
    return SessionExpiryManager.instance;
  }

  // Start operation tracking
  startOperation(operationId: string): void {
    this.isOperationInProgress = true;
    this.pendingOperations.add(operationId);    
  }

  // Complete operation tracking
  completeOperation(operationId: string): void {
    this.pendingOperations.delete(operationId);
    this.retryAttempts.delete(operationId);

    if (this.pendingOperations.size === 0) {
      this.isOperationInProgress = false;
    }
  }

  // Handle session expiry during operations
  async handleSessionExpiry(): Promise<boolean> {
    if (!this.isOperationInProgress) {
      return false;
    }

    // We cannot recover session without validate API, so assume expired
    this.sessionExpired = true;
    this.showSessionExpiredModal();
    return false;
  }

  // Retry operation with session recovery
  async retryOperation<T>(
    operationId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const attempts = this.retryAttempts.get(operationId) || 0;

    if (attempts >= this.maxRetries) {
      throw new Error(`Max retry attempts (${this.maxRetries}) exceeded for operation: ${operationId}`);
    }

    try {
      const result = await operation();
      this.completeOperation(operationId);
      return result;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Session expired during operation
        const recovered = await this.handleSessionExpiry();

        if (recovered) {
          // Retry the operation
          this.retryAttempts.set(operationId, attempts + 1);
          return this.retryOperation(operationId, operation);
        } else {
          throw new Error('Session expired and could not be recovered');
        }
      } else {
        throw error;
      }
    }
  }

  private showSessionExpiredModal(): void {
    // Dispatch event to let React components handle the UI
    const event = new CustomEvent('sessionTimeout');
    window.dispatchEvent(event);
  }

  // Get current state
  getState(): SessionExpiryHandler {
    return {
      isOperationInProgress: this.isOperationInProgress,
      pendingOperations: new Set(this.pendingOperations),
      sessionExpired: this.sessionExpired
    };
  }
}

export const sessionExpiryManager = SessionExpiryManager.getInstance();
