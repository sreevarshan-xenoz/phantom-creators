/**
 * Demo functionality for Phantom Creators
 * Provides sample models and auto-loading features for demonstration purposes
 */

class PhantomCreatorsDemo {
  constructor() {
    this.demoModels = {
      cube: {
        name: 'Cube',
        complexity: 'Low',
        estimatedTime: '45 minutes',
        description: 'Simple cube with beveled edges. Perfect for beginners.'
      },
      sphere: {
        name: 'Sphere',
        complexity: 'Medium',
        estimatedTime: '1.5 hours',
        description: 'Hollow sphere with patterned surface texture.'
      },
      gyroid: {
        name: 'Gyroid',
        complexity: 'High', 
        estimatedTime: '4.5 hours',
        description: 'Complex gyroid structure with variable thickness.'
      },
      vase: {
        name: 'Twisted Vase',
        complexity: 'Medium',
        estimatedTime: '2.25 hours',
        description: 'Twisted vase with spiral patterns and thin walls.'
      }
    };
    
    this.currentDemo = null;
    this.demoContainer = null;
    this.demoPanel = null;
  }
  
  init() {
    this.createDemoUI();
    this.setupEventListeners();
    
    // Check for demo parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const demoModel = urlParams.get('demo');
    if (demoModel && this.demoModels[demoModel]) {
      this.loadDemo(demoModel);
    }
    
    console.log('Demo mode initialized');
  }
  
  createDemoUI() {
    // Create demo button in header
    const nav = document.querySelector('nav ul');
    if (nav) {
      const demoLi = document.createElement('li');
      const demoButton = document.createElement('a');
      demoButton.href = '#';
      demoButton.className = 'glow-button demo-button';
      demoButton.textContent = 'Demo Models';
      demoButton.setAttribute('id', 'demo-button');
      demoLi.appendChild(demoButton);
      nav.appendChild(demoLi);
    }
    
    // Create demo panel
    this.demoPanel = document.createElement('div');
    this.demoPanel.className = 'demo-panel hidden';
    this.demoPanel.innerHTML = `
      <div class="demo-header">
        <h3>Demo Models</h3>
        <button class="close-demo">×</button>
      </div>
      <div class="demo-content">
        <p>Select a demo model to visualize:</p>
        <div class="demo-grid"></div>
      </div>
    `;
    document.body.appendChild(this.demoPanel);
    
    // Create demo grid items
    const demoGrid = this.demoPanel.querySelector('.demo-grid');
    
    for (const [id, model] of Object.entries(this.demoModels)) {
      const demoCard = document.createElement('div');
      demoCard.className = 'demo-card';
      demoCard.dataset.model = id;
      
      demoCard.innerHTML = `
        <h4>${model.name}</h4>
        <div class="demo-thumbnail" data-model="${id}"></div>
        <div class="demo-details">
          <div class="detail-row">
            <span>Complexity:</span>
            <span class="complexity-${model.complexity.toLowerCase()}">${model.complexity}</span>
          </div>
          <div class="detail-row">
            <span>Print time:</span>
            <span>${model.estimatedTime}</span>
          </div>
        </div>
        <p>${model.description}</p>
      `;
      
      demoGrid.appendChild(demoCard);
    }
    
    // Create notice for demo mode
    this.demoNotice = document.createElement('div');
    this.demoNotice.className = 'demo-notice hidden';
    this.demoNotice.innerHTML = `
      <div class="demo-badge">Demo Mode</div>
      <div class="demo-info">
        <span id="demo-model-name"></span>
        <button id="exit-demo">Exit Demo</button>
      </div>
    `;
    
    const visualizerSection = document.getElementById('visualizer');
    if (visualizerSection) {
      visualizerSection.prepend(this.demoNotice);
    }
  }
  
  setupEventListeners() {
    // Demo button click
    const demoButton = document.getElementById('demo-button');
    if (demoButton) {
      demoButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleDemoPanel();
      });
    }
    
    // Try Demo Models button
    const tryDemoBtn = document.getElementById('try-demo-btn');
    if (tryDemoBtn) {
      tryDemoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleDemoPanel();
      });
    }
    
    // Close demo panel
    const closeButton = this.demoPanel.querySelector('.close-demo');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.demoPanel.classList.add('hidden');
      });
    }
    
    // Demo card selection
    const demoCards = this.demoPanel.querySelectorAll('.demo-card');
    demoCards.forEach(card => {
      card.addEventListener('click', () => {
        const modelId = card.dataset.model;
        this.loadDemo(modelId);
        this.demoPanel.classList.add('hidden');
      });
    });
    
    // Exit demo button
    const exitDemoButton = document.getElementById('exit-demo');
    if (exitDemoButton) {
      exitDemoButton.addEventListener('click', () => {
        this.exitDemoMode();
      });
    }
    
    // Keyboard shortcut for demo panel (Ctrl+D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.toggleDemoPanel();
      }
    });
  }
  
  toggleDemoPanel() {
    this.demoPanel.classList.toggle('hidden');
  }
  
  loadDemo(modelId) {
    if (!this.demoModels[modelId]) {
      console.error(`Demo model "${modelId}" not found`);
      return;
    }
    
    this.currentDemo = modelId;
    const model = this.demoModels[modelId];
    
    // Update URL with demo parameter without refreshing
    const url = new URL(window.location);
    url.searchParams.set('demo', modelId);
    window.history.pushState({}, '', url);
    
    // Show demo notice
    this.demoNotice.classList.remove('hidden');
    document.getElementById('demo-model-name').textContent = model.name;
    
    // Create a fake file event to simulate file upload
    this.simulateModelLoad(modelId);
    
    // Update terminal with demo info
    const terminal = document.getElementById('terminal-output');
    if (terminal) {
      terminal.innerHTML = '';
      this.typeInTerminal(terminal, [
        `> Loading demo model: ${model.name}`,
        `> Complexity analysis: ${model.complexity}`,
        `> Estimated print time: ${model.estimatedTime}`,
        `> Layer count: ${this.getRandomLayerCount(model.complexity)}`,
        `> Material usage: ${this.getRandomMaterialUsage(model.complexity)}`,
        '> Demo mode active. All functionality available for testing.'
      ]);
    }
    
    // Trigger complexity analyzer if available
    if (window.PhantomCreators && window.PhantomCreators.complexityAnalyzer) {
      setTimeout(() => {
        // Simulate complexity analysis process
        if (window.PhantomCreators.stateManager) {
          window.PhantomCreators.stateManager.transition('ANALYZING');
          
          setTimeout(() => {
            // After "analysis", transition to IDLE
            window.PhantomCreators.stateManager.reset();
          }, 2500);
        }
      }, 1000);
    }
  }
  
  simulateModelLoad(modelId) {
    // This function simulates loading a 3D model by creating a basic
    // shape in Three.js instead of loading an actual STL file
    
    try {
      // Check if Three.js is loaded
      if (typeof THREE === 'undefined') {
        console.error('Three.js is not available. Cannot display demo model.');
        this.showErrorMessage('Three.js library is not available. Please check your internet connection and try again.');
        return;
      }
      
      // If materialVisualizer is not available, create a simple demo renderer
      const visualizer = (window.PhantomCreators && window.PhantomCreators.materialVisualizer) || 
        this.createSimpleDemoVisualizer();
      
      if (!visualizer) {
        console.error('Could not create visualizer for demo');
        return;
      }
      
      // Clear current model if any
      if (typeof visualizer.clearScene === 'function') {
        visualizer.clearScene();
      }
      
      // Create geometry based on model type
      let geometry;
      switch (modelId) {
        case 'cube':
          geometry = new THREE.BoxGeometry(2, 2, 2);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(1.5, 32, 32);
          break;
        case 'gyroid':
          // For gyroid, create a complex shape using multiple spheres
          this.createGyroidShape(visualizer);
          return; // Return early as we're handling this separately
        case 'vase':
          geometry = new THREE.CylinderGeometry(1, 1.5, 3, 32, 1, true);
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }
      
      // Get material based on current UI selection
      const material = typeof visualizer.getCurrentMaterial === 'function' 
        ? visualizer.getCurrentMaterial() 
        : new THREE.MeshStandardMaterial({ color: 0x00ff8c });
      
      // Create mesh and add to scene
      const mesh = new THREE.Mesh(geometry, material);
      
      if (visualizer.scene) {
        visualizer.scene.add(mesh);
        visualizer.currentModel = mesh;
      
        // Update visualization
        if (typeof visualizer.render === 'function') {
          visualizer.render();
        }
      }
      
      // Show loading indicator briefly to simulate load time
      const loadingContainer = document.getElementById('loading-container');
      if (loadingContainer) {
        loadingContainer.classList.remove('hidden');
        
        // Simulate progress updates
        const loadingBar = document.getElementById('loading-bar');
        const loadingStatus = document.getElementById('loading-status');
        
        if (loadingBar && loadingStatus) {
          const updateProgress = (progress) => {
            loadingBar.style.width = `${progress}%`;
            loadingStatus.textContent = 
              progress < 100 
                ? `Loading ${this.demoModels[modelId].name}... ${progress}%` 
                : 'Processing complete!';
          };
          
          // Simulate progress updates
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress > 100) progress = 100;
            
            updateProgress(progress);
            
            if (progress === 100) {
              clearInterval(interval);
              setTimeout(() => {
                loadingContainer.classList.add('hidden');
              }, 500);
            }
          }, 200);
        }
      }
    } catch (error) {
      console.error('Error loading demo model:', error);
      this.showErrorMessage('Could not load demo model. Please try again later.');
    }
  }
  
  createGyroidShape(visualizer) {
    // Create a more complex shape to represent a gyroid
    // This is a simplified version that creates a pattern of spheres
    
    const group = new THREE.Group();
    const material = visualizer.getCurrentMaterial();
    
    // Create a grid of spheres with varying sizes
    const size = 0.2;
    const count = 5;
    const spacing = 0.5;
    
    for (let x = -count; x <= count; x++) {
      for (let y = -count; y <= count; y++) {
        for (let z = -count; z <= count; z++) {
          // Skip some spheres to create a pattern
          if ((x + y + z) % 2 !== 0) continue;
          
          // Create a small sphere
          const geometry = new THREE.SphereGeometry(size, 8, 8);
          const mesh = new THREE.Mesh(geometry, material);
          
          // Position the sphere
          mesh.position.set(
            x * spacing,
            y * spacing,
            z * spacing
          );
          
          group.add(mesh);
        }
      }
    }
    
    // Add cylinders to connect spheres (to simulate the gyroid structure)
    for (let x = -count; x < count; x++) {
      for (let y = -count; y < count; y++) {
        for (let z = -count; z < count; z++) {
          if ((x + y + z) % 2 !== 0 || (x + 1 + y + z) % 2 !== 0) continue;
          
          // Create cylinder between adjacent spheres
          const cylinderGeom = new THREE.CylinderGeometry(size/2, size/2, spacing, 8);
          const cylinder = new THREE.Mesh(cylinderGeom, material);
          
          // Rotate and position cylinder to connect spheres
          cylinder.position.set(
            (x + 0.5) * spacing,
            y * spacing,
            z * spacing
          );
          cylinder.rotation.z = Math.PI / 2;
          
          group.add(cylinder);
        }
      }
    }
    
    // Add the group to the scene
    visualizer.scene.add(group);
    visualizer.currentModel = group;
    
    // Update visualization
    visualizer.render();
  }
  
  typeInTerminal(terminal, lines, index = 0, charIndex = 0) {
    if (index >= lines.length) return;
    
    if (charIndex === 0) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      terminal.appendChild(line);
    }
    
    const currentLine = terminal.querySelector('.terminal-line:last-child');
    const currentText = lines[index].substring(0, charIndex + 1);
    currentLine.textContent = currentText;
    
    if (charIndex < lines[index].length - 1) {
      // Continue typing current line
      setTimeout(() => {
        this.typeInTerminal(terminal, lines, index, charIndex + 1);
      }, 10);
    } else {
      // Move to next line
      setTimeout(() => {
        this.typeInTerminal(terminal, lines, index + 1, 0);
      }, 100);
    }
    
    // Auto-scroll terminal
    terminal.scrollTop = terminal.scrollHeight;
  }
  
  getRandomLayerCount(complexity) {
    switch (complexity.toLowerCase()) {
      case 'low': return Math.floor(Math.random() * 30) + 20;
      case 'medium': return Math.floor(Math.random() * 50) + 50;
      case 'high': return Math.floor(Math.random() * 100) + 100;
      default: return 50;
    }
  }
  
  getRandomMaterialUsage(complexity) {
    const base = {
      'low': 15,
      'medium': 35,
      'high': 75
    }[complexity.toLowerCase()] || 30;
    
    const exact = base + Math.random() * 10 - 5;
    return `${exact.toFixed(1)}g`;
  }
  
  exitDemoMode() {
    this.currentDemo = null;
    this.demoNotice.classList.add('hidden');
    
    // Remove demo parameter from URL
    const url = new URL(window.location);
    url.searchParams.delete('demo');
    window.history.pushState({}, '', url);
    
    // Clear visualization if available
    if (window.PhantomCreators && window.PhantomCreators.materialVisualizer) {
      window.PhantomCreators.materialVisualizer.clearScene();
    }
    
    // Clear terminal
    const terminal = document.getElementById('terminal-output');
    if (terminal) {
      terminal.innerHTML = '';
      terminal.textContent = '> Ready to analyze new models';
    }
    
    // Reset state manager if available
    if (window.PhantomCreators && window.PhantomCreators.stateManager) {
      window.PhantomCreators.stateManager.reset();
    }
  }
  
  // Create a simple visualizer if the main one isn't available
  createSimpleDemoVisualizer() {
    try {
      // Get the container
      const container = document.getElementById('3d-visualizer');
      if (!container) return null;
      
      // Create basic Three.js components
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x12121c);
      
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
      
      const camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);
      
      const light = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(light);
      
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(0, 1, 1);
      scene.add(dirLight);
      
      // Create simple visualizer object
      const simpleVisualizer = {
        scene,
        camera,
        renderer,
        clearScene: function() {
          while(scene.children.length > 0) { 
            if (scene.children[0].type === 'Mesh') {
              scene.remove(scene.children[0]); 
            } else {
              // Skip lights
              break;
            }
          }
        },
        getCurrentMaterial: function() {
          return new THREE.MeshStandardMaterial({ 
            color: 0x00ff8c,
            roughness: 0.3,
            metalness: 0.2
          });
        },
        render: function() {
          renderer.render(scene, camera);
          
          // Add simple rotation animation
          const animate = () => {
            requestAnimationFrame(animate);
            
            if (this.currentModel) {
              this.currentModel.rotation.y += 0.01;
            }
            
            renderer.render(scene, camera);
          };
          
          animate();
        }
      };
      
      return simpleVisualizer;
    } catch (error) {
      console.error('Could not create simple demo visualizer:', error);
      return null;
    }
  }
  
  // Show error message in the terminal
  showErrorMessage(message) {
    const terminal = document.getElementById('terminal-output');
    if (terminal) {
      terminal.innerHTML = `<div class="terminal-line error">> ERROR: ${message}</div>`;
    }
  }
}

// Initialize demo features on document load
document.addEventListener('DOMContentLoaded', () => {
  window.PhantomCreatorsDemo = new PhantomCreatorsDemo();
  window.PhantomCreatorsDemo.init();
}); 