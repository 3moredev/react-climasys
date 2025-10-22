/**
 * Concurrency management utilities to prevent race conditions and handle concurrent operations
 */

export interface OperationLock {
  id: string;
  operation: string;
  timestamp: number;
  userId?: string;
  data?: any;
}

export interface ConcurrencyConfig {
  maxConcurrentOperations: number;
  operationTimeout: number;
  retryDelay: number;
  maxRetries: number;
}

export class ConcurrencyManager {
  private static readonly DEFAULT_CONFIG: ConcurrencyConfig = {
    maxConcurrentOperations: 5,
    operationTimeout: 30000, // 30 seconds
    retryDelay: 1000,
    maxRetries: 3
  };

  private static config = this.DEFAULT_CONFIG;
  private static activeOperations = new Map<string, OperationLock>();
  private static operationQueue: Array<{
    id: string;
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
  }> = [];

  /**
   * Configure concurrency settings
   */
  static configure(config: Partial<ConcurrencyConfig>): void {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute operation with concurrency control
   */
  static async executeWithLock<T>(
    operationId: string,
    operation: string,
    operationFn: () => Promise<T>,
    options: {
      userId?: string;
      data?: any;
      allowRetry?: boolean;
    } = {}
  ): Promise<T> {
    const { userId, data, allowRetry = true } = options;

    // Check if operation is already in progress
    if (this.activeOperations.has(operationId)) {
      const existingLock = this.activeOperations.get(operationId)!;
      const timeSinceStart = Date.now() - existingLock.timestamp;
      
      if (timeSinceStart < this.config.operationTimeout) {
        throw new Error(`Operation '${operation}' is already in progress`);
      } else {
        // Clean up stale lock
        this.activeOperations.delete(operationId);
        console.warn(`🧹 Cleaned up stale lock for operation: ${operationId}`);
      }
    }

    // Check concurrent operation limit
    if (this.activeOperations.size >= this.config.maxConcurrentOperations) {
      throw new Error(`Maximum concurrent operations (${this.config.maxConcurrentOperations}) exceeded`);
    }

    // Create operation lock
    const lock: OperationLock = {
      id: operationId,
      operation,
      timestamp: Date.now(),
      userId,
      data
    };

    this.activeOperations.set(operationId, lock);
    console.log(`🔒 Locked operation: ${operation} (${operationId})`);

    try {
      const result = await operationFn();
      console.log(`✅ Completed operation: ${operation} (${operationId})`);
      return result;
    } catch (error) {
      console.error(`❌ Failed operation: ${operation} (${operationId})`, error);
      
      // Retry logic for certain errors
      if (allowRetry && this.shouldRetry(error)) {
        console.log(`🔄 Retrying operation: ${operation} (${operationId})`);
        await this.delay(this.config.retryDelay);
        return this.executeWithLock(operationId, operation, operationFn, {
          ...options,
          allowRetry: false // Prevent infinite retry loops
        });
      }
      
      throw error;
    } finally {
      // Always release the lock
      this.activeOperations.delete(operationId);
      console.log(`🔓 Released lock: ${operation} (${operationId})`);
      
      // Process queued operations
      this.processQueue();
    }
  }

  /**
   * Queue operation for later execution
   */
  static async queueOperation<T>(
    operationId: string,
    operation: string,
    operationFn: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.operationQueue.push({
        id: operationId,
        operation: operationFn,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      console.log(`📋 Queued operation: ${operation} (${operationId})`);
      this.processQueue();
    });
  }

  /**
   * Process queued operations
   */
  private static processQueue(): void {
    if (this.operationQueue.length === 0) return;
    if (this.activeOperations.size >= this.config.maxConcurrentOperations) return;

    const queuedOp = this.operationQueue.shift();
    if (!queuedOp) return;

    // Check if operation is too old
    const age = Date.now() - queuedOp.timestamp;
    if (age > this.config.operationTimeout) {
      queuedOp.reject(new Error('Operation timed out in queue'));
      this.processQueue();
      return;
    }

    // Execute the operation
    this.executeWithLock(queuedOp.id, `queued-${queuedOp.id}`, queuedOp.operation)
      .then(queuedOp.resolve)
      .catch(queuedOp.reject);
  }

  /**
   * Check if error should trigger a retry
   */
  private static shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and certain server errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return true;
    }
    
    if (error.response?.status >= 500) {
      return true;
    }
    
    if (error.response?.status === 429) { // Too Many Requests
      return true;
    }
    
    return false;
  }

  /**
   * Delay execution
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current operation status
   */
  static getOperationStatus(): {
    activeOperations: OperationLock[];
    queuedOperations: number;
    canAcceptNewOperations: boolean;
  } {
    return {
      activeOperations: Array.from(this.activeOperations.values()),
      queuedOperations: this.operationQueue.length,
      canAcceptNewOperations: this.activeOperations.size < this.config.maxConcurrentOperations
    };
  }

  /**
   * Cancel operation by ID
   */
  static cancelOperation(operationId: string): boolean {
    if (this.activeOperations.has(operationId)) {
      this.activeOperations.delete(operationId);
      console.log(`🚫 Cancelled operation: ${operationId}`);
      this.processQueue();
      return true;
    }
    return false;
  }

  /**
   * Cancel all operations for a user
   */
  static cancelUserOperations(userId: string): number {
    let cancelledCount = 0;
    
    for (const [id, lock] of this.activeOperations.entries()) {
      if (lock.userId === userId) {
        this.activeOperations.delete(id);
        cancelledCount++;
      }
    }
    
    console.log(`🚫 Cancelled ${cancelledCount} operations for user: ${userId}`);
    this.processQueue();
    return cancelledCount;
  }

  /**
   * Clean up stale operations
   */
  static cleanupStaleOperations(): number {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [id, lock] of this.activeOperations.entries()) {
      if (now - lock.timestamp > this.config.operationTimeout) {
        this.activeOperations.delete(id);
        cleanedCount++;
        console.warn(`🧹 Cleaned up stale operation: ${id}`);
      }
    }
    
    return cleanedCount;
  }

  /**
   * Prevent duplicate operations
   */
  static preventDuplicate<T>(
    operationId: string,
    operation: string,
    operationFn: () => Promise<T>
  ): Promise<T> {
    // Check if same operation is already running
    for (const lock of this.activeOperations.values()) {
      if (lock.operation === operation && 
          lock.timestamp > Date.now() - 5000) { // Within last 5 seconds
        throw new Error(`Duplicate operation '${operation}' detected`);
      }
    }
    
    return this.executeWithLock(operationId, operation, operationFn);
  }

  /**
   * Batch operations to reduce concurrency
   */
  static async batchOperations<T>(
    operations: Array<{
      id: string;
      operation: string;
      fn: () => Promise<T>;
    }>,
    batchSize: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      
      const batchPromises = batch.map(op => 
        this.executeWithLock(op.id, op.operation, op.fn)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Get operation statistics
   */
  static getStatistics(): {
    totalActive: number;
    totalQueued: number;
    averageOperationTime: number;
    oldestOperation: number;
  } {
    const now = Date.now();
    const activeOps = Array.from(this.activeOperations.values());
    
    const totalActive = activeOps.length;
    const totalQueued = this.operationQueue.length;
    
    const operationTimes = activeOps.map(op => now - op.timestamp);
    const averageOperationTime = operationTimes.length > 0 
      ? operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length 
      : 0;
    
    const oldestOperation = operationTimes.length > 0 
      ? Math.max(...operationTimes) 
      : 0;
    
    return {
      totalActive,
      totalQueued,
      averageOperationTime,
      oldestOperation
    };
  }
}

// Export convenience functions
export const executeWithLock = ConcurrencyManager.executeWithLock;
export const queueOperation = ConcurrencyManager.queueOperation;
export const preventDuplicate = ConcurrencyManager.preventDuplicate;
export const batchOperations = ConcurrencyManager.batchOperations;
export const getOperationStatus = ConcurrencyManager.getOperationStatus;
