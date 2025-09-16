/**
 * Error Handler Utility
 * Provides consistent error handling and user feedback
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxErrors = 50;
  }

  /**
     * Log and handle application errors
     * @param {Error|string} error - The error to handle
     * @param {string} context - Where the error occurred
     * @param {Object} additionalData - Additional context data
     */
  handleError(error, context = '', additionalData = {}) {
    const errorObj = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : '',
      context,
      timestamp: new Date().toISOString(),
      data: additionalData
    };

    // Keep log size manageable
    this.errorLog.push(errorObj);
    if (this.errorLog.length > this.maxErrors) {
      this.errorLog.shift();
    }

    console.error(`[${context}]`, errorObj.message, errorObj);

    // Show user-friendly message for critical errors
    if (this.isCriticalError(error)) {
      this.showUserError(errorObj.message);
    }
  }

  /**
     * Determine if error is critical (requires user notification)
     */
  isCriticalError(error) {
    const criticalPatterns = [
      'localStorage',
      'clipboard',
      'Failed to parse',
      'Invalid date'
    ];

    const errorMessage = error instanceof Error ? error.message : error;
    return criticalPatterns.some(pattern =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
     * Show user-friendly error message
     */
  showUserError(message) {
    // Create or update error notification
    let errorDiv = document.getElementById('error-notification');

    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'error-notification';
      errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                border-radius: 4px;
                padding: 12px 16px;
                max-width: 300px;
                z-index: 1000;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                font-family: 'Roboto', sans-serif;
                animation: slideIn 0.3s ease-out;
            `;
      document.body.appendChild(errorDiv);
    }

    errorDiv.innerHTML = `
            <strong>Fehler:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="
                float: right;
                border: none;
                background: transparent;
                color: #721c24;
                font-weight: bold;
                cursor: pointer;
                margin-left: 10px;
            ">×</button>
        `;

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 5000);
  }

  /**
     * Get all logged errors
     */
  getErrorLog() {
    return this.errorLog;
  }

  /**
     * Clear error log
     */
  clearLog() {
    this.errorLog = [];
  }

  /**
     * Try wrapper with fallback
     */
  tryWithFallback(func, fallback = null, errorMessage = 'Operation failed') {
    try {
      return func();
    } catch (e) {
      this.handleError(e, errorMessage);
      return fallback;
    }
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export for use in other modules
export { errorHandler as default };

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

export { errorHandler };
