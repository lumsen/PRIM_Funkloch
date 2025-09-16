/**
 * Performance Optimization Utilities
 * Provides debouncing, memoization, and lazy evaluation for better performance
 */

class PerformanceOptimizer {
  constructor() {
    this.debounceMap = new Map();
    this.memoizedFunctions = new Map();
  }

  /**
   * Debounce function calls to avoid excessive triggering
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {string} key - Unique identifier for the debounced function
   */
  debounce(func, wait, key) {
    const existingTimeout = this.debounceMap.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const newTimeout = setTimeout(() => {
      func.apply(this, arguments);
      this.debounceMap.delete(key);
    }, wait);

    this.debounceMap.set(key, newTimeout);
  }

  /**
   * Clear all debounced functions
   */
  clearAllDebounce() {
    for (const timeout of this.debounceMap.values()) {
      clearTimeout(timeout);
    }
    this.debounceMap.clear();
  }

  /**
   * Memoize expensive function calls with automatic cache management
   * @param {Function} fn - Function to memoize
   * @param {Function} keyGenerator - Function to generate cache key
   * @param {number} maxAgeMs - Maximum age of cache entries in milliseconds
   */
  memoize(fn, keyGenerator, maxAgeMs = 60 * 60 * 1000) { // Default 1 hour
    const cacheKey = fn.toString();

    if (!this.memoizedFunctions.has(cacheKey)) {
      this.memoizedFunctions.set(cacheKey, {
        cache: new Map(),
        originalFn: fn,
        maxAgeMs,
        keyGenerator
      });
    }

    return (...args) => {
      const memoData = this.memoizedFunctions.get(cacheKey);
      const key = memoData.keyGenerator(...args);

      // Check if result is in cache and not expired
      if (memoData.cache.has(key)) {
        const cached = memoData.cache.get(key);
        if (Date.now() - cached.timestamp < maxAgeMs) {
          return cached.value;
        }
        // Remove expired entry
        memoData.cache.delete(key);
      }

      // Execute function and cache result
      const result = memoData.originalFn.apply(this, args);
      memoData.cache.set(key, {
        value: result,
        timestamp: Date.now()
      });

      return result;
    };
  }

  /**
   * Clear expired cache entries to prevent memory leaks
   */
  cleanExpiredCache() {
    const now = Date.now();

    for (const [key, memoData] of this.memoizedFunctions.entries()) {
      const entriesToDelete = [];

      for (const [cacheKey, cached] of memoData.cache.entries()) {
        if (now - cached.timestamp > memoData.maxAgeMs) {
          entriesToDelete.push(cacheKey);
        }
      }

      entriesToDelete.forEach(entryKey => memoData.cache.delete(entryKey));
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    const stats = {};

    for (const [key, memoData] of this.memoizedFunctions.entries()) {
      stats[key] = {
        functionName: key.substring(0, 50) + '...',
        cacheSize: memoData.cache.size,
        maxSize: 'unlimited'
      };
    }

    return stats;
  }

  /**
   * Clear all memo cache
   */
  clearAllCache() {
    for (const memoData of this.memoizedFunctions.values()) {
      memoData.cache.clear();
    }
  }
}

// Lazy Loading Helper
class LazyLoader {
  constructor() {
    this.loadedModules = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Lazy load a module
   * @param {string} moduleId - Identifier for the module
   * @param {Function} loader - Function that returns a Promise for the module
   */
  async load(moduleId, loader) {
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId);
    }

    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId);
    }

    const loadingPromise = loader().then(module => {
      this.loadedModules.set(moduleId, module);
      this.loadingPromises.delete(moduleId);
      return module;
    });

    this.loadingPromises.set(moduleId, loadingPromise);
    return loadingPromise;
  }

  /**
   * Check if module is loaded
   */
  isLoaded(moduleId) {
    return this.loadedModules.has(moduleId);
  }

  /**
   * Get loaded module
   */
  get(moduleId) {
    return this.loadedModules.get(moduleId);
  }

  /**
   * Clear loaded modules (useful for testing)
   */
  clear() {
    this.loadedModules.clear();
    this.loadingPromises.clear();
  }
}

// Create global instances
const performanceOptimizer = new PerformanceOptimizer();
const lazyLoader = new LazyLoader();

// Auto-clean expired cache every 5 minutes
setInterval(() => {
  performanceOptimizer.cleanExpiredCache();
}, 5 * 60 * 1000);

export { performanceOptimizer, lazyLoader };

// Utility functions for common use cases

/**
 * Simple memoization key generator for objects
 * @param {Object} obj - Source object
 */
export function objectKeyGenerator(obj) {
  // Create a stable string key from object properties
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return obj.toString();

  if (obj && typeof obj === 'object') {
    // For objects, create a key from relevant properties
    const relevantKeys = Object.keys(obj).sort();
    return relevantKeys.map(key =>
      `${key}:${JSON.stringify(obj[key])}`
    ).join('|');
  }

  return JSON.stringify(obj);
}

/**
 * Memoize Path Finding (expensive operation)
 * @param {Function} findPathFunction - The path finding function
 * Key format: startNode-endNode
 */
export function memoizePathFinding(findPathFunction) {
  const keyGenerator = (startNode, endNode) => `${startNode}-${endNode}`;

  return performanceOptimizer.memoize(
    findPathFunction,
    keyGenerator,
    30 * 60 * 1000 // Cache for 30 minutes
  );
}

/**
 * Debounced Table Rendering
 * @param {Function} renderFunction - Function to render table
 * @param {number} delay - Delay in ms (default 150ms)
 */
export function debouncedTableRender(renderFunction, delay = 150) {
  const key = `table-render-${Math.random()}`;
  return (...args) => {
    performanceOptimizer.debounce(() => {
      renderFunction.apply(null, args);
    }, delay, key);
  };
}

/**
 * Debounced Graph Updates
 * @param {Function} updateFunction - Function to update graph
 * @param {number} delay - Delay in ms (default 100ms)
 */
export function debouncedGraphUpdate(updateFunction, delay = 100) {
  const key = `graph-update-${Math.random()}`;
  return (...args) => {
    performanceOptimizer.debounce(() => {
      updateFunction.apply(null, args);
    }, delay, key);
  };
}
