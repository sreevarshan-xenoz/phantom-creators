/**
 * ComplexityAnalyzer - Base class for analyzing 3D model complexity
 */
class ComplexityAnalyzer {
  constructor(terminalElement) {
    this.terminalElement = typeof terminalElement === 'string' 
      ? document.getElementById(terminalElement) 
      : terminalElement;
    
    // Analysis parameters
    this.polygonThresholds = {
      simple: 10000,
      medium: 50000,
      complex: 150000,
      veryComplex: 500000
    };
    
    // Results storage
    this.results = {
      polygonCount: 0,
      estimatedPrintTime: 0,
      complexity: 'unknown',
      materialVolume: 0
    };
  }
  
  /**
   * Write message to terminal element
   * @param {string} message - Message to display
   * @param {string} type - Message type (info, warning, error, success)
   */
  writeToTerminal(message, type = 'info') {
    if (!this.terminalElement) return;
    
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    
    // Add timestamp
    const timestamp = new Date().toLocaleTimeString();
    line.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
    
    this.terminalElement.appendChild(line);
    
    // Auto-scroll to bottom
    this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
  }
  
  /**
   * Clear terminal
   */
  clearTerminal() {
    if (!this.terminalElement) return;
    this.terminalElement.innerHTML = '';
  }
  
  /**
   * Analyze model from file
   * @param {File} file - STL file to analyze
   * @returns {Promise} - Analysis results
   */
  async analyzeModel(file) {
    this.clearTerminal();
    this.writeToTerminal('Starting model analysis...', 'info');
    
    try {
      this.writeToTerminal(`Model name: ${file.name}`, 'info');
      this.writeToTerminal(`File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 'info');
      
      // Simulate reading file
      await this.delay(1000);
      this.writeToTerminal('Reading STL data...', 'info');
      
      // Simulate analysis
      await this.delay(1500);
      
      // Generate random polygon count for demo
      const polygonCount = Math.floor(Math.random() * 1000000);
      this.results.polygonCount = polygonCount;
      
      // Determine complexity based on polygon count
      this.determineComplexity(polygonCount);
      
      // Calculate estimated print time and material volume
      this.calculatePrintEstimates();
      
      // Return results
      return this.results;
    } catch (error) {
      this.writeToTerminal(`Analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Determine complexity based on polygon count
   * @param {number} polygonCount - Number of polygons in model
   */
  determineComplexity(polygonCount) {
    let complexity;
    
    if (polygonCount < this.polygonThresholds.simple) {
      complexity = 'Simple';
    } else if (polygonCount < this.polygonThresholds.medium) {
      complexity = 'Medium';
    } else if (polygonCount < this.polygonThresholds.complex) {
      complexity = 'Complex';
    } else if (polygonCount < this.polygonThresholds.veryComplex) {
      complexity = 'Very Complex';
    } else {
      complexity = 'Extremely Complex';
    }
    
    this.results.complexity = complexity;
    this.writeToTerminal(`Model complexity: ${complexity} (${polygonCount.toLocaleString()} polygons)`, 'info');
  }
  
  /**
   * Calculate print estimates (time and material)
   */
  calculatePrintEstimates() {
    // Simulate print time calculation based on complexity
    const baseTime = 30; // minutes
    let multiplier;
    
    switch (this.results.complexity) {
      case 'Simple':
        multiplier = 1;
        break;
      case 'Medium':
        multiplier = 3;
        break;
      case 'Complex':
        multiplier = 8;
        break;
      case 'Very Complex':
        multiplier = 20;
        break;
      case 'Extremely Complex':
        multiplier = 48;
        break;
      default:
        multiplier = 5;
    }
    
    // Calculate print time in minutes
    const printTimeMinutes = baseTime * multiplier + Math.random() * 60;
    this.results.estimatedPrintTime = printTimeMinutes;
    
    // Format as hours and minutes
    const hours = Math.floor(printTimeMinutes / 60);
    const minutes = Math.floor(printTimeMinutes % 60);
    const printTime = hours > 0
      ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`
      : `${minutes} minute${minutes > 1 ? 's' : ''}`;
    
    // Calculate material volume (cm³)
    const materialVolume = (this.results.polygonCount / 50000) * (5 + Math.random() * 5);
    this.results.materialVolume = materialVolume;
    
    this.writeToTerminal(`Estimated print time: ${printTime}`, 'success');
    this.writeToTerminal(`Estimated material volume: ${materialVolume.toFixed(2)} cm³`, 'success');
  }
  
  /**
   * Helper method to create delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * RobustComplexityAnalyzer - Enhanced version with better error handling and validation
 */
class RobustComplexityAnalyzer extends ComplexityAnalyzer {
  constructor(terminalElement) {
    super(terminalElement);
    
    // Add analytics tracking flag
    this.enableAnalytics = typeof window.ga === 'function';
    
    // Error logging configuration
    this.errorLog = [];
    this.maxErrorLogSize = 50;
  }
  
  /**
   * Enhanced analyzeModel with validation and error handling
   * @param {File} file - STL file to analyze
   * @returns {Promise} - Analysis results
   */
  async analyzeModel(file) {
    this.clearTerminal();
    this.writeToTerminal('Starting model analysis...', 'info');
    
    try {
      // Add file validation
      if (!this.validateFile(file)) {
        throw new Error('Invalid file format. Please upload an STL file.');
      }
      
      // Add file size check (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size exceeds 50MB limit. Please optimize your model.');
      }
      
      this.writeToTerminal(`Model name: ${file.name}`, 'info');
      this.writeToTerminal(`File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`, 'info');
      
      // Validate file headers (first few bytes)
      try {
        await this.validateFileHeader(file);
      } catch (headerError) {
        throw new Error(`Invalid STL file: ${headerError.message}`);
      }
      
      // Simulate reading file with progress updates
      this.writeToTerminal('Reading STL data...', 'info');
      await this.simulateFileReadingProgress(file.size);
      
      // Simulate analysis with timeout protection
      this.writeToTerminal('Analyzing model complexity...', 'info');
      
      // Set a timeout limit for analysis (30 seconds)
      const analysisPromise = this.performComplexAnalysis(file);
      const timeoutPromise = this.delay(30000).then(() => {
        throw new Error('Analysis timed out. Your model may be too complex.');
      });
      
      // Race between normal analysis and timeout
      await Promise.race([analysisPromise, timeoutPromise]);
      
      // Return results
      return this.results;
    } catch (error) {
      this.logError(error);
      this.showError(error.message);
      throw error; // Propagate for global error handling
    }
  }
  
  /**
   * Validate file extension and MIME type
   * @param {File} file - File to validate
   * @returns {boolean} - Is file valid
   */
  validateFile(file) {
    // Check file extension
    const validExtensions = ['.stl', '.STL'];
    const hasValidExtension = validExtensions.some(ext => file.name.endsWith(ext));
    
    // Check MIME type if available
    const validTypes = ['model/stl', 'application/octet-stream', 'application/vnd.ms-pki.stl'];
    const hasValidType = file.type ? validTypes.includes(file.type) : true;
    
    return hasValidExtension && hasValidType;
  }
  
  /**
   * Validate STL file header
   * @param {File} file - STL file
   * @returns {Promise} - Resolves if valid, rejects if invalid
   */
  validateFileHeader(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const buffer = e.target.result;
          
          // Check if ASCII STL (starts with "solid")
          if (buffer.byteLength >= 5) {
            const header = new Uint8Array(buffer, 0, 5);
            const headerString = String.fromCharCode.apply(null, header);
            
            if (headerString.toLowerCase() === 'solid') {
              // ASCII STL file
              resolve();
              return;
            }
          }
          
          // Check if binary STL (80-byte header followed by 4-byte unsigned integer)
          if (buffer.byteLength >= 84) {
            // Skip header and read face count
            const faceCountView = new DataView(buffer, 80, 4);
            const faceCount = faceCountView.getUint32(0, true);
            
            // Check if file size matches expected size for binary STL
            const expectedSize = 84 + (faceCount * 50);
            if (Math.abs(buffer.byteLength - expectedSize) < 100) {
              // Binary STL file with reasonable size
              resolve();
              return;
            }
          }
          
          reject(new Error('Unrecognized STL format'));
        } catch (error) {
          reject(new Error('Failed to parse file header'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read the first 84 bytes (enough for an STL header)
      reader.readAsArrayBuffer(file.slice(0, 84));
    });
  }
  
  /**
   * Simulate file reading progress
   * @param {number} fileSize - Size of file in bytes
   * @returns {Promise} - Resolves when complete
   */
  async simulateFileReadingProgress(fileSize) {
    const steps = 5;
    const stepSize = 100 / steps;
    
    for (let i = 1; i <= steps; i++) {
      await this.delay(300);
      const progress = i * stepSize;
      this.writeToTerminal(`Reading data: ${progress.toFixed(0)}% complete...`, 'info');
    }
    
    return Promise.resolve();
  }
  
  /**
   * Perform complex analysis simulation
   * @param {File} file - File to analyze
   * @returns {Promise} - Analysis results
   */
  async performComplexAnalysis(file) {
    // Simulate processing with multiple steps
    await this.delay(1000);
    this.writeToTerminal('Counting vertices and faces...', 'info');
    
    await this.delay(800);
    
    // Generate random polygon count for demo
    const polygonCount = Math.floor(Math.random() * 1000000);
    this.results.polygonCount = polygonCount;
    
    // Determine complexity based on polygon count
    this.determineComplexity(polygonCount);
    
    await this.delay(500);
    this.writeToTerminal('Estimating material requirements...', 'info');
    
    await this.delay(700);
    
    // Calculate estimated print time and material volume
    this.calculatePrintEstimates();
    
    // Add optimization suggestions based on complexity
    this.suggestOptimizations();
    
    return this.results;
  }
  
  /**
   * Suggest optimizations based on model complexity
   */
  suggestOptimizations() {
    this.writeToTerminal('Analyzing optimization opportunities...', 'info');
    
    switch (this.results.complexity) {
      case 'Very Complex':
      case 'Extremely Complex':
        this.writeToTerminal('Suggestion: Consider decimating your model to reduce polygon count.', 'warning');
        this.writeToTerminal('Suggestion: Hollowing the model could reduce material usage by up to 40%.', 'warning');
        break;
      case 'Complex':
        this.writeToTerminal('Suggestion: Removing internal geometry could improve print time.', 'warning');
        break;
      case 'Medium':
        this.writeToTerminal('Suggestion: Model appears well optimized for 3D printing.', 'success');
        break;
      case 'Simple':
        this.writeToTerminal('Suggestion: Model is very efficient! Perfect for quick printing.', 'success');
        break;
    }
  }
  
  /**
   * Log error for tracking and analytics
   * @param {Error} error - Error to log
   */
  logError(error) {
    // Add to internal log with timestamp
    const timestamp = new Date().toISOString();
    this.errorLog.push({
      timestamp,
      message: error.message,
      stack: error.stack
    });
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxErrorLogSize) {
      this.errorLog.shift();
    }
    
    // Log to console
    console.error('Analysis error:', error);
    
    // Send to analytics if available
    if (this.enableAnalytics && typeof window.ga === 'function') {
      ga('send', 'exception', {
        exDescription: error.message,
        exFatal: false
      });
    }
  }
  
  /**
   * Show user-friendly error in terminal
   * @param {string} message - Error message
   */
  showError(message) {
    this.writeToTerminal(`Error: ${message}`, 'error');
    this.writeToTerminal('Please try again with a different model or contact support.', 'error');
  }
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  const terminalOutput = document.getElementById('terminal-output');
  const fileInput = document.getElementById('model-upload');
  
  if (!terminalOutput || !fileInput) return;
  
  // Create analyzer
  const analyzer = new RobustComplexityAnalyzer(terminalOutput);
  
  // Add file input event listener
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const results = await analyzer.analyzeModel(file);
      console.log('Analysis complete:', results);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  });
  
  // Add global reference for debugging
  window.complexityAnalyzer = analyzer;
}); 