/**
 * PrintStateManager - State machine for managing 3D printing workflow
 * Handles transitions between states and UI updates
 */
class PrintStateManager {
  constructor() {
    // Define application states
    this.states = {
      IDLE: 'IDLE',
      ANALYZING: 'ANALYZING',
      PRINTING: 'PRINTING',
      PAUSED: 'PAUSED',
      COMPLETE: 'COMPLETE',
      ERROR: 'ERROR'
    };
    
    // Current state
    this.currentState = this.states.IDLE;
    
    // History of state transitions for debugging
    this.stateHistory = [
      {
        state: this.states.IDLE,
        timestamp: new Date().toISOString()
      }
    ];
    
    // Event handlers
    this.eventHandlers = {
      onStateChange: [],
      onError: []
    };
    
    // Performance metrics
    this.metrics = {
      startTime: null,
      endTime: null,
      processingTime: null,
      lastUpdate: null
    };
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize state manager
   */
  init() {
    // Add custom event listener to update UI on state change
    this.addEventListener('stateChange', this.updateUI.bind(this));
    
    // Initialize UI based on current state
    this.updateUI({ state: this.currentState });
  }
  
  /**
   * Transition to a new state
   * @param {string} state - New state to transition to
   * @param {Object} data - Optional data associated with the state
   * @returns {boolean} - Whether transition was successful
   */
  transition(state, data = {}) {
    // Validate state
    if (!Object.values(this.states).includes(state)) {
      console.error(`Invalid state: ${state}`);
      this.triggerEvent('error', { 
        message: `Invalid state: ${state}`,
        currentState: this.currentState
      });
      return false;
    }
    
    // Check if state transition is allowed
    if (!this.isValidTransition(this.currentState, state)) {
      console.error(`Invalid state transition: ${this.currentState} -> ${state}`);
      this.triggerEvent('error', { 
        message: `Invalid state transition: ${this.currentState} -> ${state}`,
        currentState: this.currentState,
        targetState: state
      });
      return false;
    }
    
    // Record previous state
    const previousState = this.currentState;
    
    // Update state
    this.currentState = state;
    
    // Add to history
    this.stateHistory.push({
      state,
      timestamp: new Date().toISOString(),
      data
    });
    
    // Limit history length
    if (this.stateHistory.length > 20) {
      this.stateHistory.shift();
    }
    
    // Handle state-specific actions
    this.handleStateEnter(state, previousState, data);
    
    // Trigger state change event
    this.triggerEvent('stateChange', { 
      state,
      previousState,
      data
    });
    
    return true;
  }
  
  /**
   * Check if state transition is valid
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @returns {boolean} - Whether transition is valid
   */
  isValidTransition(fromState, toState) {
    // Define valid transitions
    const validTransitions = {
      [this.states.IDLE]: [this.states.ANALYZING, this.states.ERROR],
      [this.states.ANALYZING]: [this.states.PRINTING, this.states.IDLE, this.states.ERROR],
      [this.states.PRINTING]: [this.states.PAUSED, this.states.COMPLETE, this.states.ERROR],
      [this.states.PAUSED]: [this.states.PRINTING, this.states.IDLE, this.states.ERROR],
      [this.states.COMPLETE]: [this.states.IDLE, this.states.ERROR],
      [this.states.ERROR]: [this.states.IDLE]
    };
    
    // Check if transition is valid
    return validTransitions[fromState] && validTransitions[fromState].includes(toState);
  }
  
  /**
   * Handle actions when entering a state
   * @param {string} state - New state
   * @param {string} previousState - Previous state
   * @param {Object} data - Optional data associated with the state
   */
  handleStateEnter(state, previousState, data) {
    // Start performance monitoring for certain states
    if (state === this.states.ANALYZING || state === this.states.PRINTING) {
      this.startPerformanceMonitoring();
    }
    
    // End performance monitoring for completion states
    if (state === this.states.COMPLETE || state === this.states.ERROR) {
      this.endPerformanceMonitoring();
    }
    
    // State-specific handlers
    switch (state) {
      case this.states.ANALYZING:
        this.lockUI(true);
        break;
        
      case this.states.PRINTING:
        this.lockUI(true);
        this.showProgress();
        break;
        
      case this.states.PAUSED:
        this.lockUI(false);
        break;
        
      case this.states.COMPLETE:
        this.lockUI(false);
        this.showSummary(data);
        break;
        
      case this.states.ERROR:
        this.lockUI(false);
        this.showError(data.message || 'An error occurred');
        break;
        
      case this.states.IDLE:
        this.lockUI(false);
        this.resetUI();
        break;
    }
  }
  
  /**
   * Lock/unlock UI elements
   * @param {boolean} locked - Whether UI should be locked
   */
  lockUI(locked) {
    document.querySelectorAll('.control-button, .print-control, input[type="file"]').forEach(el => {
      el.disabled = locked;
    });
    
    // Show/hide loading indicator
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = locked ? 'block' : 'none';
    }
  }
  
  /**
   * Show progress indicator
   */
  showProgress() {
    const progressContainer = document.querySelector('.progress-container');
    if (!progressContainer) return;
    
    progressContainer.style.display = 'block';
    
    // Set up progress updates
    this.progressInterval = setInterval(() => {
      if (this.currentState !== this.states.PRINTING) {
        clearInterval(this.progressInterval);
        return;
      }
      
      // Simulate progress updates
      const progressBar = document.querySelector('.progress-bar');
      const progressText = document.querySelector('.progress-text');
      
      if (progressBar && progressText) {
        const currentProgress = parseInt(progressBar.style.width || '0', 10);
        const newProgress = Math.min(100, currentProgress + Math.random() * 5);
        
        progressBar.style.width = `${newProgress}%`;
        progressText.textContent = `${Math.floor(newProgress)}%`;
        
        // Update metrics
        this.metrics.lastUpdate = new Date();
        
        // Auto-complete when reaching 100%
        if (newProgress >= 100) {
          clearInterval(this.progressInterval);
          this.transition(this.states.COMPLETE, { success: true });
        }
      }
    }, 1000);
  }
  
  /**
   * Show summary after completion
   * @param {Object} data - State data
   */
  showSummary(data) {
    const summaryContainer = document.querySelector('.summary-container');
    if (!summaryContainer) return;
    
    summaryContainer.style.display = 'block';
    summaryContainer.innerHTML = `
      <h3>Print Complete</h3>
      <p>Total time: ${this.formatDuration(this.metrics.processingTime)}</p>
      <p>Result: ${data.success ? 'Success' : 'Failed'}</p>
      <button class="glow-button reset-button">New Print</button>
    `;
    
    // Add reset button handler
    const resetButton = summaryContainer.querySelector('.reset-button');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.transition(this.states.IDLE);
      });
    }
  }
  
  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorContainer = document.querySelector('.error-container');
    if (!errorContainer) return;
    
    errorContainer.style.display = 'block';
    errorContainer.innerHTML = `
      <h3>Error</h3>
      <p>${message}</p>
      <button class="glow-button reset-button">Reset</button>
    `;
    
    // Add reset button handler
    const resetButton = errorContainer.querySelector('.reset-button');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.transition(this.states.IDLE);
      });
    }
    
    // Log error
    console.error(`Print error: ${message}`);
  }
  
  /**
   * Reset UI elements
   */
  resetUI() {
    // Hide all state-specific containers
    document.querySelectorAll('.progress-container, .summary-container, .error-container').forEach(el => {
      el.style.display = 'none';
    });
    
    // Reset any progress bars
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    
    // Clear any intervals
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }
  
  /**
   * Update UI based on state change
   * @param {Object} event - State change event
   */
  updateUI(event) {
    const { state, previousState } = event;
    
    // Update status text
    const statusElement = document.querySelector('.status-text');
    if (statusElement) {
      statusElement.textContent = this.getStatusText(state);
    }
    
    // Update button states
    document.querySelectorAll('[data-state-action]').forEach(button => {
      const action = button.getAttribute('data-state-action');
      
      // Enable/disable buttons based on current state
      switch (action) {
        case 'start':
          button.disabled = state !== this.states.IDLE;
          break;
        case 'pause':
          button.disabled = state !== this.states.PRINTING;
          break;
        case 'resume':
          button.disabled = state !== this.states.PAUSED;
          break;
        case 'cancel':
          button.disabled = state === this.states.IDLE || state === this.states.COMPLETE;
          break;
      }
    });
    
    // Add state classes to body
    document.body.classList.remove(...Object.values(this.states).map(s => `state-${s.toLowerCase()}`));
    document.body.classList.add(`state-${state.toLowerCase()}`);
  }
  
  /**
   * Get human-readable status text for state
   * @param {string} state - Current state
   * @returns {string} - Status text
   */
  getStatusText(state) {
    switch (state) {
      case this.states.IDLE:
        return 'Ready';
      case this.states.ANALYZING:
        return 'Analyzing Model...';
      case this.states.PRINTING:
        return 'Printing in Progress';
      case this.states.PAUSED:
        return 'Print Paused';
      case this.states.COMPLETE:
        return 'Print Complete';
      case this.states.ERROR:
        return 'Error';
      default:
        return 'Unknown State';
    }
  }
  
  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    this.metrics.startTime = new Date();
    this.metrics.lastUpdate = new Date();
    
    // Monitor memory usage if available
    if (window.performance && window.performance.memory) {
      this.memoryMonitorInterval = setInterval(() => {
        const memory = window.performance.memory;
        console.log(`Memory Usage: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB / ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
      }, 5000);
    }
  }
  
  /**
   * End performance monitoring
   */
  endPerformanceMonitoring() {
    this.metrics.endTime = new Date();
    this.metrics.processingTime = this.metrics.endTime - this.metrics.startTime;
    
    // Log performance metrics
    console.log(`Total processing time: ${this.formatDuration(this.metrics.processingTime)}`);
    
    // Clear memory monitoring
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
    }
  }
  
  /**
   * Format duration in milliseconds to human-readable string
   * @param {number} ms - Duration in milliseconds
   * @returns {string} - Formatted duration
   */
  formatDuration(ms) {
    if (!ms) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  addEventListener(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].push(handler);
    }
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  removeEventListener(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    }
  }
  
  /**
   * Trigger event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  triggerEvent(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Get current state
   * @returns {string} - Current state
   */
  getState() {
    return this.currentState;
  }
  
  /**
   * Get state history
   * @returns {Array} - State transition history
   */
  getStateHistory() {
    return [...this.stateHistory];
  }
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  // Create singleton instance
  const stateManager = new PrintStateManager();
  
  // Add button event listeners
  document.querySelectorAll('[data-state-action]').forEach(button => {
    button.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-state-action');
      
      switch (action) {
        case 'start':
          stateManager.transition(stateManager.states.ANALYZING);
          // Simulate analysis completion after 3 seconds
          setTimeout(() => {
            stateManager.transition(stateManager.states.PRINTING);
          }, 3000);
          break;
          
        case 'pause':
          stateManager.transition(stateManager.states.PAUSED);
          break;
          
        case 'resume':
          stateManager.transition(stateManager.states.PRINTING);
          break;
          
        case 'cancel':
          stateManager.transition(stateManager.states.IDLE);
          break;
      }
    });
  });
  
  // Create placeholder UI elements if they don't exist
  createPlaceholderUI();
  
  // Add file change handler
  const fileInput = document.getElementById('model-upload');
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        // Start analysis
        stateManager.transition(stateManager.states.ANALYZING);
        
        // Simulate analysis completion after 3 seconds
        setTimeout(() => {
          stateManager.transition(stateManager.states.PRINTING);
        }, 3000);
      }
    });
  }
  
  // Add global reference for debugging
  window.printStateManager = stateManager;
});

/**
 * Create placeholder UI elements if they don't exist
 * This is just for demonstration purposes
 */
function createPlaceholderUI() {
  const visualizerSection = document.getElementById('visualizer');
  if (!visualizerSection) return;
  
  // Check if controls container exists
  let controlsContainer = visualizerSection.querySelector('.controls-container');
  if (!controlsContainer) {
    // Create controls container
    controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    visualizerSection.appendChild(controlsContainer);
    
    // Add control buttons
    controlsContainer.innerHTML = `
      <div class="status-container">
        <span class="status-label">Status:</span>
        <span class="status-text">Ready</span>
      </div>
      <div class="button-group">
        <button class="glow-button control-button" data-state-action="start">Start Print</button>
        <button class="glow-button control-button" data-state-action="pause">Pause</button>
        <button class="glow-button control-button" data-state-action="resume">Resume</button>
        <button class="glow-button control-button" data-state-action="cancel">Cancel</button>
      </div>
    `;
  }
  
  // Check if progress container exists
  let progressContainer = visualizerSection.querySelector('.progress-container');
  if (!progressContainer) {
    // Create progress container
    progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.style.display = 'none';
    visualizerSection.appendChild(progressContainer);
    
    // Add progress bar
    progressContainer.innerHTML = `
      <div class="progress-label">Print Progress:</div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%"></div>
      </div>
      <div class="progress-text">0%</div>
    `;
  }
  
  // Check if summary container exists
  let summaryContainer = visualizerSection.querySelector('.summary-container');
  if (!summaryContainer) {
    // Create summary container
    summaryContainer = document.createElement('div');
    summaryContainer.className = 'summary-container';
    summaryContainer.style.display = 'none';
    visualizerSection.appendChild(summaryContainer);
  }
  
  // Check if error container exists
  let errorContainer = visualizerSection.querySelector('.error-container');
  if (!errorContainer) {
    // Create error container
    errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.style.display = 'none';
    visualizerSection.appendChild(errorContainer);
  }
  
  // Add loading indicator
  let loadingIndicator = visualizerSection.querySelector('.loading-indicator');
  if (!loadingIndicator) {
    loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.display = 'none';
    loadingIndicator.innerHTML = `
      <div class="spinner"></div>
      <div class="loading-text">Processing...</div>
    `;
    visualizerSection.appendChild(loadingIndicator);
  }
} 