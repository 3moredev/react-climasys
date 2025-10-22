import { sessionService } from '../services/sessionService';

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
    console.log(`🔄 Started operation: ${operationId}`);
  }

  // Complete operation tracking
  completeOperation(operationId: string): void {
    this.pendingOperations.delete(operationId);
    this.retryAttempts.delete(operationId);
    
    if (this.pendingOperations.size === 0) {
      this.isOperationInProgress = false;
    }
    console.log(`✅ Completed operation: ${operationId}`);
  }

  // Handle session expiry during operations
  async handleSessionExpiry(): Promise<boolean> {
    if (!this.isOperationInProgress) {
      return false;
    }

    console.log('⚠️ Session expired during operation, attempting recovery...');
    
    try {
      // Try to validate session
      const validation = await sessionService.validateSession();
      
      if (validation.valid) {
        console.log('✅ Session recovered successfully');
        this.sessionExpired = false;
        return true;
      } else {
        console.log('❌ Session recovery failed');
        this.sessionExpired = true;
        this.showSessionExpiredModal();
        return false;
      }
    } catch (error) {
      console.error('❌ Session validation error:', error);
      this.sessionExpired = true;
      this.showSessionExpiredModal();
      return false;
    }
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
          console.log(`🔄 Retrying operation ${operationId} (attempt ${attempts + 1})`);
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
    // Enhanced session expired modal with operation context
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: 'Roboto', sans-serif;
    `;
    
    const pendingOps = Array.from(this.pendingOperations).join(', ');
    
    modal.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      ">
        <h3 style="color: #d32f2f; margin-bottom: 15px;">Session Expired</h3>
        <p style="margin-bottom: 15px; color: #666;">
          Your session has expired while performing operations.
        </p>
        ${pendingOps ? `
          <p style="margin-bottom: 20px; color: #ff9800; font-size: 14px;">
            <strong>Pending operations:</strong> ${pendingOps}
          </p>
        ` : ''}
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button onclick="this.closest('div').parentElement.remove(); window.location.href='/login'" style="
            background: #1976d2;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">Go to Login</button>
          <button onclick="this.closest('div').parentElement.remove(); window.location.reload()" style="
            background: #4caf50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">Retry</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
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
