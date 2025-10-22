/**
 * Performance optimization utilities for handling large datasets
 */

export interface PerformanceConfig {
  maxAppointments: number;
  virtualScrollThreshold: number;
  debounceDelay: number;
  batchSize: number;
}

export interface VirtualScrollItem {
  index: number;
  data: any;
  height: number;
}

export class PerformanceOptimizer {
  private static readonly DEFAULT_CONFIG: PerformanceConfig = {
    maxAppointments: 500,
    virtualScrollThreshold: 100,
    debounceDelay: 300,
    batchSize: 50
  };

  private static config = this.DEFAULT_CONFIG;
  private static debounceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Configure performance settings
   */
  static configure(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  /**
   * Debounce function calls to prevent excessive API calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    key: string,
    delay: number = this.config.debounceDelay
  ): T {
    return ((...args: Parameters<T>) => {
      // Clear existing timer
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        func(...args);
        this.debounceTimers.delete(key);
      }, delay);

      this.debounceTimers.set(key, timer);
    }) as T;
  }

  /**
   * Throttle function calls to limit execution frequency
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }

  /**
   * Implement virtual scrolling for large lists
   */
  static createVirtualScroll(
    items: any[],
    containerHeight: number,
    itemHeight: number = 50,
    overscan: number = 5
  ) {
    const totalHeight = items.length * itemHeight;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleEnd = Math.min(items.length, visibleStart + visibleCount + overscan * 2);

    return {
      totalHeight,
      visibleItems: items.slice(visibleStart, visibleEnd),
      visibleStart,
      visibleEnd,
      offsetY: visibleStart * itemHeight
    };
  }

  /**
   * Batch process large datasets
   */
  static async processBatch<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = this.config.batchSize
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      // Allow UI to update between batches
      await this.yieldToUI();
    }
    
    return results;
  }

  /**
   * Yield control to UI thread
   */
  private static yieldToUI(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Optimize search with indexing
   */
  static createSearchIndex<T>(
    items: T[],
    searchFields: (keyof T)[]
  ): Map<string, T[]> {
    const index = new Map<string, T[]>();
    
    items.forEach(item => {
      searchFields.forEach(field => {
        const value = item[field];
        if (typeof value === 'string') {
          const normalized = value.toLowerCase().trim();
          const words = normalized.split(/\s+/);
          
          words.forEach(word => {
            if (word.length > 0) {
              if (!index.has(word)) {
                index.set(word, []);
              }
              index.get(word)!.push(item);
            }
          });
        }
      });
    });
    
    return index;
  }

  /**
   * Fast search using index
   */
  static searchWithIndex<T>(
    query: string,
    index: Map<string, T[]>,
    maxResults: number = 100
  ): T[] {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);
    const resultSets: T[][] = [];
    
    words.forEach(word => {
      if (word.length > 0) {
        const results = index.get(word) || [];
        resultSets.push(results);
      }
    });
    
    if (resultSets.length === 0) return [];
    
    // Find intersection of all result sets
    let intersection = resultSets[0];
    for (let i = 1; i < resultSets.length; i++) {
      intersection = intersection.filter(item => 
        resultSets[i].includes(item)
      );
    }
    
    return intersection.slice(0, maxResults);
  }

  /**
   * Memory usage monitoring
   */
  static getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    return null;
  }

  /**
   * Performance monitoring
   */
  static measurePerformance<T>(
    name: string,
    fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  }

  /**
   * Cleanup resources
   */
  static cleanup(): void {
    // Clear all debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  /**
   * Check if dataset is too large for optimal performance
   */
  static isDatasetTooLarge(itemCount: number): boolean {
    return itemCount > this.config.maxAppointments;
  }

  /**
   * Get performance recommendations
   */
  static getPerformanceRecommendations(itemCount: number): string[] {
    const recommendations: string[] = [];
    
    if (itemCount > this.config.maxAppointments) {
      recommendations.push('Consider implementing pagination');
      recommendations.push('Use virtual scrolling for large lists');
      recommendations.push('Implement server-side filtering');
    }
    
    if (itemCount > this.config.virtualScrollThreshold) {
      recommendations.push('Enable virtual scrolling');
    }
    
    const memory = this.getMemoryUsage();
    if (memory && memory.percentage > 80) {
      recommendations.push('High memory usage detected - consider data cleanup');
    }
    
    return recommendations;
  }
}

// Export convenience functions
export const debounce = PerformanceOptimizer.debounce;
export const throttle = PerformanceOptimizer.throttle;
export const createVirtualScroll = PerformanceOptimizer.createVirtualScroll;
export const processBatch = PerformanceOptimizer.processBatch;
export const createSearchIndex = PerformanceOptimizer.createSearchIndex;
export const searchWithIndex = PerformanceOptimizer.searchWithIndex;
