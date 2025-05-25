/**
 * ModelSlicer - Handles 3D model slicing functionality
 * Provides a simulated slicing experience with layer preview
 */
class ModelSlicer {
  constructor(container, visualizer) {
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    this.visualizer = visualizer;
    
    // Slicer settings
    this.settings = {
      layerHeight: 0.2,
      infillDensity: 20,
      infillPattern: 'grid',
      printSpeed: 50,
      supportType: 'none',
      raft: false,
      brim: false
    };
    
    // Slicing results
    this.slicedModel = {
      layers: [],
      totalLayers: 0,
      estimatedTime: 0,
      materialUsed: 0
    };
    
    // UI elements
    this.ui = {
      slicerControls: document.getElementById('slicer-controls'),
      slicePreview: document.getElementById('slice-preview'),
      layerPreview: document.getElementById('layer-preview'),
      layerCounter: document.getElementById('layer-counter'),
      prevLayerBtn: document.getElementById('prev-layer-btn'),
      nextLayerBtn: document.getElementById('next-layer-btn'),
      estimatedTime: document.getElementById('estimated-time'),
      materialUsed: document.getElementById('material-used'),
      layerCount: document.getElementById('layer-count'),
      sliceBtn: document.getElementById('slice-btn'),
      previewSliceBtn: document.getElementById('preview-slice-btn'),
      generateGcodeBtn: document.getElementById('generate-gcode-btn'),
      closeSlicerBtn: document.getElementById('close-slicer-btn')
    };
    
    // Current layer being viewed
    this.currentLayerIndex = 0;
    
    // Initialize if container exists
    if (this.container) {
      this.init();
    }
  }
  
  /**
   * Initialize the slicer
   */
  init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize layer preview canvas
    this.initLayerPreview();
  }
  
  /**
   * Set up event listeners for UI elements
   */
  setupEventListeners() {
    // Slice button click
    if (this.ui.sliceBtn) {
      this.ui.sliceBtn.addEventListener('click', () => {
        this.toggleSlicerControls(true);
      });
    }
    
    // Close slicer button click
    if (this.ui.closeSlicerBtn) {
      this.ui.closeSlicerBtn.addEventListener('click', () => {
        this.toggleSlicerControls(false);
      });
    }
    
    // Preview slice button click
    if (this.ui.previewSliceBtn) {
      this.ui.previewSliceBtn.addEventListener('click', () => {
        this.previewSlice();
      });
    }
    
    // Generate G-code button click
    if (this.ui.generateGcodeBtn) {
      this.ui.generateGcodeBtn.addEventListener('click', () => {
        this.generateGcode();
      });
    }
    
    // Previous layer button click
    if (this.ui.prevLayerBtn) {
      this.ui.prevLayerBtn.addEventListener('click', () => {
        this.showPreviousLayer();
      });
    }
    
    // Next layer button click
    if (this.ui.nextLayerBtn) {
      this.ui.nextLayerBtn.addEventListener('click', () => {
        this.showNextLayer();
      });
    }
    
    // Settings change events
    const settingsInputs = [
      'layer-height', 'infill-density', 'infill-pattern', 
      'print-speed', 'support-type', 'raft', 'brim'
    ];
    
    settingsInputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        if (element.type === 'checkbox') {
          element.addEventListener('change', () => {
            this.settings[id] = element.checked;
          });
        } else {
          element.addEventListener('change', () => {
            this.settings[id] = element.value;
          });
        }
      }
    });
  }
  
  /**
   * Initialize layer preview canvas
   */
  initLayerPreview() {
    if (!this.ui.layerPreview) return;
    
    // Create canvas for layer preview
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.ui.layerPreview.clientWidth;
    this.canvas.height = this.ui.layerPreview.clientHeight;
    this.ui.layerPreview.appendChild(this.canvas);
    
    // Get 2D context
    this.ctx = this.canvas.getContext('2d');
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.canvas.width = this.ui.layerPreview.clientWidth;
      this.canvas.height = this.ui.layerPreview.clientHeight;
      this.renderCurrentLayer();
    });
  }
  
  /**
   * Toggle slicer controls visibility
   * @param {boolean} show - Whether to show or hide the controls
   */
  toggleSlicerControls(show) {
    if (show) {
      this.ui.slicerControls.classList.remove('hidden');
      this.ui.slicePreview.classList.add('hidden');
    } else {
      this.ui.slicerControls.classList.add('hidden');
      this.ui.slicePreview.classList.add('hidden');
    }
  }
  
  /**
   * Preview the sliced model
   */
  previewSlice() {
    // Check if model is loaded
    if (!this.visualizer || !this.visualizer.modelMesh) {
      this.showNotification('Please load a model first', 'error');
      return;
    }
    
    // Show loading state
    this.showNotification('Slicing model...', 'info');
    
    // Simulate slicing process
    setTimeout(() => {
      this.simulateSlicing();
      
      // Show preview
      this.toggleSlicerControls(false);
      this.ui.slicePreview.classList.remove('hidden');
      
      // Show first layer
      this.currentLayerIndex = 0;
      this.renderCurrentLayer();
      
      // Update UI
      this.updateLayerControls();
      this.updateSliceStats();
      
      this.showNotification('Slicing complete', 'success');
    }, 1500);
  }
  
  /**
   * Simulate slicing process
   */
  simulateSlicing() {
    // Get model dimensions from visualizer
    const model = this.visualizer.modelMesh;
    const geometry = model.geometry;
    
    // Calculate model height
    geometry.computeBoundingBox();
    const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    
    // Calculate number of layers based on layer height
    const layerHeight = parseFloat(this.settings.layerHeight);
    const totalLayers = Math.ceil(height / layerHeight);
    
    // Generate simulated layers
    const layers = [];
    for (let i = 0; i < totalLayers; i++) {
      // Create a simulated layer with random paths
      const layer = this.generateSimulatedLayer(i, totalLayers);
      layers.push(layer);
    }
    
    // Calculate estimated print time
    const printSpeed = parseFloat(this.settings.printSpeed);
    const infillDensity = parseFloat(this.settings.infillDensity) / 100;
    
    // Base time calculation (simplified)
    const baseTimePerLayer = 60; // seconds
    const estimatedTime = (baseTimePerLayer * totalLayers * infillDensity) / (printSpeed / 50);
    
    // Calculate material used (simplified)
    const modelVolume = this.calculateModelVolume(geometry);
    const materialUsed = modelVolume * 1.25; // Add 25% for infill and support
    
    // Store results
    this.slicedModel = {
      layers,
      totalLayers,
      estimatedTime,
      materialUsed
    };
  }
  
  /**
   * Generate a simulated layer
   * @param {number} layerIndex - Current layer index
   * @param {number} totalLayers - Total number of layers
   * @returns {Object} - Layer data
   */
  generateSimulatedLayer(layerIndex, totalLayers) {
    // Create a simulated layer with random paths
    const paths = [];
    
    // Number of paths in this layer (varies by layer)
    const pathCount = Math.floor(10 + Math.random() * 20);
    
    // Layer height position
    const z = layerIndex * parseFloat(this.settings.layerHeight);
    
    // Generate paths
    for (let i = 0; i < pathCount; i++) {
      const path = [];
      
      // Number of points in this path
      const pointCount = Math.floor(5 + Math.random() * 15);
      
      // Generate points
      for (let j = 0; j < pointCount; j++) {
        // Create a point with x, y, z coordinates
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        
        path.push({ x, y, z });
      }
      
      paths.push(path);
    }
    
    // Add infill pattern based on settings
    const infillPaths = this.generateInfillPattern(layerIndex, totalLayers);
    paths.push(...infillPaths);
    
    return {
      z,
      paths,
      isSupport: layerIndex < totalLayers * 0.1 && this.settings.supportType !== 'none'
    };
  }
  
  /**
   * Generate infill pattern for a layer
   * @param {number} layerIndex - Current layer index
   * @param {number} totalLayers - Total number of layers
   * @returns {Array} - Array of infill paths
   */
  generateInfillPattern(layerIndex, totalLayers) {
    const infillPaths = [];
    const infillDensity = parseFloat(this.settings.infillDensity) / 100;
    
    // Skip infill for some layers based on density
    if (Math.random() > infillDensity) {
      return infillPaths;
    }
    
    // Layer height position
    const z = layerIndex * parseFloat(this.settings.layerHeight);
    
    // Generate different patterns based on setting
    switch (this.settings.infillPattern) {
      case 'grid':
        this.generateGridInfill(infillPaths, z);
        break;
      case 'triangles':
        this.generateTriangleInfill(infillPaths, z);
        break;
      case 'zigzag':
        this.generateZigzagInfill(infillPaths, z);
        break;
      case 'concentric':
        this.generateConcentricInfill(infillPaths, z);
        break;
      case 'gyroid':
        this.generateGyroidInfill(infillPaths, z);
        break;
      default:
        this.generateGridInfill(infillPaths, z);
    }
    
    return infillPaths;
  }
  
  /**
   * Generate grid infill pattern
   * @param {Array} paths - Array to add paths to
   * @param {number} z - Z coordinate
   */
  generateGridInfill(paths, z) {
    // Create a grid pattern
    const gridSize = 10;
    const gridCount = 5;
    
    // Horizontal lines
    for (let i = -gridCount; i <= gridCount; i++) {
      const y = i * gridSize;
      const path = [
        { x: -gridCount * gridSize, y, z },
        { x: gridCount * gridSize, y, z }
      ];
      paths.push(path);
    }
    
    // Vertical lines
    for (let i = -gridCount; i <= gridCount; i++) {
      const x = i * gridSize;
      const path = [
        { x, y: -gridCount * gridSize, z },
        { x, y: gridCount * gridSize, z }
      ];
      paths.push(path);
    }
  }
  
  /**
   * Generate triangle infill pattern
   * @param {Array} paths - Array to add paths to
   * @param {number} z - Z coordinate
   */
  generateTriangleInfill(paths, z) {
    // Create a triangle pattern
    const size = 20;
    const count = 3;
    
    for (let i = -count; i <= count; i++) {
      for (let j = -count; j <= count; j++) {
        // Create triangles
        const x1 = i * size;
        const y1 = j * size;
        const x2 = x1 + size;
        const y2 = y1;
        const x3 = x1 + size / 2;
        const y3 = y1 + size;
        
        // Add three sides of triangle
        paths.push([
          { x: x1, y: y1, z },
          { x: x2, y: y2, z }
        ]);
        
        paths.push([
          { x: x2, y: y2, z },
          { x: x3, y: y3, z }
        ]);
        
        paths.push([
          { x: x3, y: y3, z },
          { x: x1, y: y1, z }
        ]);
      }
    }
  }
  
  /**
   * Generate zigzag infill pattern
   * @param {Array} paths - Array to add paths to
   * @param {number} z - Z coordinate
   */
  generateZigzagInfill(paths, z) {
    // Create a zigzag pattern
    const size = 10;
    const count = 5;
    
    for (let i = -count; i <= count; i++) {
      const y = i * size;
      const path = [];
      
      // Create zigzag
      for (let j = -count; j <= count; j++) {
        const x = j * size;
        const yOffset = (j % 2 === 0) ? 0 : size / 2;
        path.push({ x, y: y + yOffset, z });
      }
      
      paths.push(path);
    }
  }
  
  /**
   * Generate concentric infill pattern
   * @param {Array} paths - Array to add paths to
   * @param {number} z - Z coordinate
   */
  generateConcentricInfill(paths, z) {
    // Create concentric circles
    const maxRadius = 50;
    const step = 5;
    
    for (let radius = step; radius <= maxRadius; radius += step) {
      const path = [];
      const segments = 32;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        path.push({ x, y, z });
      }
      
      paths.push(path);
    }
  }
  
  /**
   * Generate gyroid infill pattern
   * @param {Array} paths - Array to add paths to
   * @param {number} z - Z coordinate
   */
  generateGyroidInfill(paths, z) {
    // Create a simplified gyroid pattern
    const size = 50;
    const resolution = 20;
    const step = size / resolution;
    
    // Generate points for a simplified gyroid
    for (let i = 0; i < resolution; i++) {
      const path = [];
      const x = -size / 2 + i * step;
      
      for (let j = 0; j < resolution; j++) {
        const y = -size / 2 + j * step;
        // Simplified gyroid formula
        const gyroid = Math.sin(x / 5) * Math.cos(y / 5) + Math.sin(y / 5) * Math.cos(z / 5) + Math.sin(z / 5) * Math.cos(x / 5);
        
        if (Math.abs(gyroid) < 0.2) {
          path.push({ x, y, z });
        }
      }
      
      if (path.length > 1) {
        paths.push(path);
      }
    }
  }
  
  /**
   * Calculate model volume (simplified)
   * @param {THREE.BufferGeometry} geometry - Model geometry
   * @returns {number} - Estimated volume in cm³
   */
  calculateModelVolume(geometry) {
    // This is a simplified volume calculation
    // In a real implementation, you would use a more accurate method
    
    // Get bounding box
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    
    // Get dimensions
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Calculate volume (simplified)
    const volume = size.x * size.y * size.z;
    
    // Convert to cm³ (assuming units are in mm)
    return volume / 1000;
  }
  
  /**
   * Render the current layer
   */
  renderCurrentLayer() {
    if (!this.ctx || !this.slicedModel.layers.length) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get current layer
    const layer = this.slicedModel.layers[this.currentLayerIndex];
    
    // Set up canvas
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const scale = Math.min(this.canvas.width, this.canvas.height) / 120;
    
    // Draw paths
    this.ctx.strokeStyle = '#00ff8c';
    this.ctx.lineWidth = 2;
    
    layer.paths.forEach(path => {
      if (path.length < 2) return;
      
      this.ctx.beginPath();
      this.ctx.moveTo(centerX + path[0].x * scale, centerY + path[0].y * scale);
      
      for (let i = 1; i < path.length; i++) {
        this.ctx.lineTo(centerX + path[i].x * scale, centerY + path[i].y * scale);
      }
      
      this.ctx.stroke();
    });
    
    // Draw support if this is a support layer
    if (layer.isSupport) {
      this.ctx.strokeStyle = '#ff6b6b';
      this.ctx.lineWidth = 1;
      
      // Draw support pattern
      for (let i = 0; i < 10; i++) {
        const x = -50 + i * 10;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + x * scale, centerY - 50 * scale);
        this.ctx.lineTo(centerX + x * scale, centerY + 50 * scale);
        this.ctx.stroke();
      }
    }
    
    // Draw layer info
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 200, 30);
    this.ctx.fillStyle = '#00ff8c';
    this.ctx.font = '14px "Courier New", monospace';
    this.ctx.fillText(`Layer ${this.currentLayerIndex + 1} of ${this.slicedModel.totalLayers}`, 20, 30);
    this.ctx.fillText(`Z: ${layer.z.toFixed(2)}mm`, 20, 50);
  }
  
  /**
   * Show previous layer
   */
  showPreviousLayer() {
    if (this.currentLayerIndex > 0) {
      this.currentLayerIndex--;
      this.renderCurrentLayer();
      this.updateLayerControls();
    }
  }
  
  /**
   * Show next layer
   */
  showNextLayer() {
    if (this.currentLayerIndex < this.slicedModel.totalLayers - 1) {
      this.currentLayerIndex++;
      this.renderCurrentLayer();
      this.updateLayerControls();
    }
  }
  
  /**
   * Update layer navigation controls
   */
  updateLayerControls() {
    if (!this.ui.prevLayerBtn || !this.ui.nextLayerBtn || !this.ui.layerCounter) return;
    
    // Update layer counter
    this.ui.layerCounter.textContent = `Layer: ${this.currentLayerIndex + 1} / ${this.slicedModel.totalLayers}`;
    
    // Update button states
    this.ui.prevLayerBtn.disabled = this.currentLayerIndex === 0;
    this.ui.nextLayerBtn.disabled = this.currentLayerIndex === this.slicedModel.totalLayers - 1;
  }
  
  /**
   * Update slice statistics
   */
  updateSliceStats() {
    if (!this.ui.estimatedTime || !this.ui.materialUsed || !this.ui.layerCount) return;
    
    // Format time
    const hours = Math.floor(this.slicedModel.estimatedTime / 3600);
    const minutes = Math.floor((this.slicedModel.estimatedTime % 3600) / 60);
    const timeString = hours > 0 
      ? `${hours}h ${minutes}m` 
      : `${minutes}m`;
    
    // Update UI
    this.ui.estimatedTime.textContent = timeString;
    this.ui.materialUsed.textContent = `${this.slicedModel.materialUsed.toFixed(1)} g`;
    this.ui.layerCount.textContent = this.slicedModel.totalLayers;
  }
  
  /**
   * Generate G-code from sliced model
   */
  generateGcode() {
    if (!this.slicedModel.layers.length) {
      this.showNotification('Please slice the model first', 'error');
      return;
    }
    
    // Show loading state
    this.showNotification('Generating G-code...', 'info');
    
    // Simulate G-code generation
    setTimeout(() => {
      // Create G-code content
      const gcode = this.createSimulatedGcode();
      
      // Create download link
      const blob = new Blob([gcode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'model.gcode';
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      this.showNotification('G-code generated and downloaded', 'success');
    }, 1500);
  }
  
  /**
   * Create simulated G-code
   * @returns {string} - G-code content
   */
  createSimulatedGcode() {
    // Create a simulated G-code file
    let gcode = '; Generated by Phantom Creators Slicer\n';
    gcode += '; Model: ' + (this.visualizer.modelMesh ? this.visualizer.modelMesh.name || 'Unknown' : 'Unknown') + '\n';
    gcode += '; Layer Height: ' + this.settings.layerHeight + 'mm\n';
    gcode += '; Infill Density: ' + this.settings.infillDensity + '%\n';
    gcode += '; Infill Pattern: ' + this.settings.infillPattern + '\n';
    gcode += '; Print Speed: ' + this.settings.printSpeed + 'mm/s\n';
    gcode += '; Estimated Time: ' + Math.floor(this.slicedModel.estimatedTime / 60) + 'h ' + Math.floor(this.slicedModel.estimatedTime % 60) + 'm\n';
    gcode += '; Material Used: ' + this.slicedModel.materialUsed.toFixed(1) + 'g\n\n';
    
    // Add G-code header
    gcode += 'G21 ; Set units to millimeters\n';
    gcode += 'G90 ; Use absolute coordinates\n';
    gcode += 'M82 ; Use absolute distances for extrusion\n';
    gcode += 'M104 S200 ; Set extruder temperature\n';
    gcode += 'M140 S60 ; Set bed temperature\n';
    gcode += 'M190 S60 ; Wait for bed temperature\n';
    gcode += 'M109 S200 ; Wait for extruder temperature\n';
    gcode += 'G28 ; Home all axes\n';
    gcode += 'G1 Z5 F5000 ; Lift nozzle\n\n';
    
    // Add layers
    this.slicedModel.layers.forEach((layer, index) => {
      gcode += '; Layer ' + (index + 1) + ' of ' + this.slicedModel.totalLayers + '\n';
      gcode += 'G1 Z' + layer.z.toFixed(3) + ' F1000 ; Move to layer height\n\n';
      
      // Add paths
      layer.paths.forEach((path, pathIndex) => {
        if (path.length < 2) return;
        
        // Move to start of path
        gcode += 'G1 X' + path[0].x.toFixed(3) + ' Y' + path[0].y.toFixed(3) + ' F' + this.settings.printSpeed + '\n';
        
        // Extrude along path
        for (let i = 1; i < path.length; i++) {
          gcode += 'G1 X' + path[i].x.toFixed(3) + ' Y' + path[i].y.toFixed(3) + ' E' + (i * 0.01).toFixed(5) + '\n';
        }
        
        gcode += '\n';
      });
    });
    
    // Add footer
    gcode += '; End of G-code\n';
    gcode += 'G1 Z10 F5000 ; Lift nozzle\n';
    gcode += 'G28 X0 Y0 ; Home X and Y axes\n';
    gcode += 'M104 S0 ; Turn off extruder\n';
    gcode += 'M140 S0 ; Turn off bed\n';
    gcode += 'M84 ; Disable motors\n';
    
    return gcode;
  }
  
  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, error)
   */
  showNotification(message, type = 'info') {
    // Check if terminal output exists
    const terminal = document.getElementById('terminal-output');
    if (!terminal) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'terminal-line ' + type;
    notification.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
    
    // Add to terminal
    terminal.appendChild(notification);
    
    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
  }
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  // Wait for visualizer to be initialized
  setTimeout(() => {
    const modelContainer = document.getElementById('3d-visualizer');
    const visualizer = window.materialVisualizer;
    
    if (modelContainer && visualizer) {
      // Create slicer
      const slicer = new ModelSlicer(modelContainer, visualizer);
      
      // Add global reference for debugging
      window.modelSlicer = slicer;
    }
  }, 1000);
}); 