/**
 * MaterialVisualizer - Base class for 3D model visualization
 * Uses Three.js to render STL models with material properties
 */
class MaterialVisualizer {
  constructor(container, modelUrl = null) {
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    // Default configuration
    this.config = {
      autoRotate: true,
      rotationSpeed: 0.01,
      backgroundColor: 0x12121c,
      materialType: 'standard', // standard, plastic, metal
      materialColor: 0x00ff8c,
      ambientLightColor: 0xffffff,
      ambientLightIntensity: 0.4,
      directionalLightColor: 0xffffff,
      directionalLightIntensity: 0.8
    };
    
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.modelMesh = null;
    this.animationId = null;
    
    // Material presets
    this.materialPresets = {
      plastic: {
        color: 0x00ff8c,
        roughness: 0.3,
        metalness: 0.0,
        clearcoat: 0.3
      },
      metal: {
        color: 0xccccff,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 0.8
      },
      ceramic: {
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.0,
        clearcoat: 0.2
      },
      rubber: {
        color: 0x333333,
        roughness: 1.0,
        metalness: 0.0,
        clearcoat: 0.0
      }
    };
    
    // Initialize if container exists
    if (this.container) {
      this.init();
      
      // Load model if URL provided
      if (modelUrl) {
        this.loadModel(modelUrl);
      }
    }
  }
  
  /**
   * Initialize Three.js scene and components
   */
  init() {
    if (!window.THREE) {
      console.error('Three.js is not loaded. Please include the library.');
      return;
    }
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
    
    // Setup camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 50);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(
      this.config.ambientLightColor, 
      this.config.ambientLightIntensity
    );
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(
      this.config.directionalLightColor, 
      this.config.directionalLightIntensity
    );
    directionalLight.position.set(0, 10, 10);
    this.scene.add(directionalLight);
    
    // Add orbit controls if available
    if (window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
    }
    
    // Add window resize listener
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Start animation loop
    this.animate();
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * Animation loop
   */
  animate() {
    if (!this.scene || !this.camera || !this.renderer) return;
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Auto-rotate model if enabled
    if (this.config.autoRotate && this.modelMesh) {
      this.modelMesh.rotation.y += this.config.rotationSpeed;
    }
    
    // Update controls if available
    if (this.controls) {
      this.controls.update();
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Load STL model from URL
   * @param {string} url - URL to STL file
   */
  loadModel(url) {
    if (!window.THREE || !window.THREE.STLLoader) {
      console.error('Three.js STLLoader is not available');
      return;
    }
    
    // Clear existing model
    if (this.modelMesh) {
      this.scene.remove(this.modelMesh);
      this.modelMesh = null;
    }
    
    const loader = new THREE.STLLoader();
    
    loader.load(
      url,
      (geometry) => {
        // Center geometry
        geometry.center();
        
        // Create material
        const material = this.createMaterial();
        
        // Create mesh
        this.modelMesh = new THREE.Mesh(geometry, material);
        
        // Scale model to fit view
        this.fitModelToView(geometry);
        
        // Add to scene
        this.scene.add(this.modelMesh);
        
        // Enable slice button
        this.enableSliceButton();
      },
      (xhr) => {
        // Loading progress
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        console.log(`Model loading: ${Math.round(percentComplete)}% complete`);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }
  
  /**
   * Load STL model from File object
   * @param {File} file - STL file object
   */
  loadModelFromFile(file) {
    if (!window.THREE || !window.THREE.STLLoader) {
      console.error('Three.js STLLoader is not available');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const buffer = event.target.result;
      
      const loader = new THREE.STLLoader();
      const geometry = loader.parse(buffer);
      
      // Clear existing model
      if (this.modelMesh) {
        this.scene.remove(this.modelMesh);
        this.modelMesh = null;
      }
      
      // Center geometry
      geometry.center();
      
      // Create material
      const material = this.createMaterial();
      
      // Create mesh
      this.modelMesh = new THREE.Mesh(geometry, material);
      
      // Scale model to fit view
      this.fitModelToView(geometry);
      
      // Add to scene
      this.scene.add(this.modelMesh);
      
      // Enable slice button
      this.enableSliceButton();
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    
    reader.readAsArrayBuffer(file);
  }
  
  /**
   * Enable the slice button when a model is loaded
   */
  enableSliceButton() {
    const sliceBtn = document.getElementById('slice-btn');
    if (sliceBtn) {
      sliceBtn.disabled = false;
      sliceBtn.classList.remove('disabled');
    }
  }
  
  /**
   * Create material based on current config
   * @returns {THREE.Material} - Three.js material
   */
  createMaterial() {
    const preset = this.materialPresets[this.config.materialType] || this.materialPresets.plastic;
    
    // Use MeshStandardMaterial for realistic rendering
    const material = new THREE.MeshStandardMaterial({
      color: preset.color,
      roughness: preset.roughness,
      metalness: preset.metalness,
      flatShading: false
    });
    
    return material;
  }
  
  /**
   * Scale and position model to fit in view
   * @param {THREE.BufferGeometry} geometry - Model geometry
   */
  fitModelToView(geometry) {
    if (!this.modelMesh) return;
    
    // Get bounding box
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    
    // Get dimensions
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Get largest dimension
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Scale model to reasonable size
    const scale = 20 / maxDim;
    this.modelMesh.scale.set(scale, scale, scale);
  }
  
  /**
   * Change material type
   * @param {string} materialType - Material type (plastic, metal, etc.)
   */
  setMaterial(materialType) {
    if (!this.materialPresets[materialType]) {
      console.error(`Material type "${materialType}" not found`);
      return;
    }
    
    this.config.materialType = materialType;
    
    if (this.modelMesh) {
      this.modelMesh.material = this.createMaterial();
    }
  }
  
  /**
   * Toggle auto-rotation
   * @param {boolean} enabled - Enable auto-rotation
   */
  setAutoRotate(enabled) {
    this.config.autoRotate = enabled;
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Stop animation loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Dispose geometry and material
    if (this.modelMesh) {
      if (this.modelMesh.geometry) {
        this.modelMesh.geometry.dispose();
      }
      
      if (this.modelMesh.material) {
        this.modelMesh.material.dispose();
      }
    }
    
    // Remove renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
  }
}

/**
 * OptimizedMaterialVisualizer - Enhanced version with performance optimizations
 * Extends the base MaterialVisualizer with LOD and adaptive quality
 */
class OptimizedMaterialVisualizer extends MaterialVisualizer {
  constructor(container, modelUrl = null) {
    super(container, modelUrl);
    
    // Add LOD (Level of Detail) control
    this.lod = new THREE.LOD();
    
    // Only add LOD to scene if scene exists
    if (this.scene) {
      this.scene.add(this.lod);
    } else {
      // If scene doesn't exist yet, we'll add LOD in init or when loading a model
      console.warn('Scene not available in constructor, LOD will be added later');
    }
    
    // Add adaptive quality based on container size
    this.qualityLevels = [
      { threshold: 0, detail: 1, maxPolyCount: 100000 },      // High quality
      { threshold: 500, detail: 0.5, maxPolyCount: 50000 },   // Medium quality
      { threshold: 1000, detail: 0.25, maxPolyCount: 25000 }  // Low quality
    ];
    
    // Current detail level
    this.currentDetailLevel = 1;
    
    // Performance monitoring
    this.fpsCounter = {
      frames: 0,
      lastTime: performance.now(),
      value: 0
    };
    
    // Initialize this.modelMesh if not set
    if (!this.modelMesh) {
      this.modelMesh = null;
    }
    
    // Try to enable environment mapping, but handle any errors
    try {
      this.enableEnvironmentMap();
    } catch (error) {
      console.warn('Failed to initialize environment map:', error);
    }
  }
  
  /**
   * Enable environment mapping for more realistic reflections
   */
  enableEnvironmentMap() {
    if (!this.scene) {
      console.warn('Cannot enable environment map: scene not available');
      return;
    }
    
    // Create a simple environment cubemap with built-in fallbacks
    try {
      // First try loading external textures
      const path = 'https://threejs.org/examples/textures/cube/pisa/';
      const format = '.png';
      const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
      ];
      
      // Create fallback environment map using simplified textures (1x1 pixel textures)
      const fallbackEnvMap = new THREE.CubeTextureLoader().load([
        // Simplified cube map for low resources - 1x1 pixel transparent PNGs
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      ]);
      
      // Set up fallback in case external loading fails
      this.scene.environment = fallbackEnvMap;
      
      // Now try loading the better environment map
      try {
        new THREE.CubeTextureLoader().load(
          urls,
          (envMap) => {
            // Success - apply to scene
            if (this.scene) {
              this.scene.environment = envMap;
            }
          },
          undefined, // Progress callback not needed
          (error) => {
            // Error - we already have fallback set
            console.warn('Could not load environment map:', error);
          }
        );
      } catch (loadError) {
        // Already using fallback, just log the error
        console.warn('Error loading environment textures:', loadError);
      }
    } catch (fallbackError) {
      // If even the fallback fails, just disable environment mapping
      console.warn('Environment mapping completely disabled due to errors:', fallbackError);
      
      // Set a null environment to avoid future errors
      if (this.scene) {
        this.scene.environment = null;
      }
    }
  }
  
  /**
   * Enhanced renderer initialization with adaptive qualities
   */
  init() {
    super.init();
    
    // Enable physically correct lighting
    if (this.renderer) {
      this.renderer.physicallyCorrectLights = true;
      
      // Check if hardware can handle advanced features
      const gl = this.renderer.getContext();
      const isHighEnd = (gl.getParameter(gl.MAX_TEXTURE_SIZE) > 8192);
      
      if (isHighEnd) {
        // High-end device - enable shadows
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Add directional light shadow
        const directionalLight = this.scene.children.find(child => 
          child instanceof THREE.DirectionalLight
        );
        
        if (directionalLight) {
          directionalLight.castShadow = true;
          directionalLight.shadow.mapSize.width = 1024;
          directionalLight.shadow.mapSize.height = 1024;
          directionalLight.shadow.camera.near = 0.1;
          directionalLight.shadow.camera.far = 100;
          directionalLight.shadow.bias = -0.001;
        }
      } else {
        // Low-end device - reduce quality
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      }
    }
  }
  
  /**
   * Enhanced model loading with LOD support
   * @param {string} url - URL to STL file
   */
  loadModel(url) {
    if (!window.THREE || !window.THREE.STLLoader) {
      console.error('Three.js STLLoader is not available');
      return;
    }
    
    // Clear existing model and LOD
    if (this.modelMesh) {
      this.scene.remove(this.modelMesh);
      this.modelMesh = null;
    }
    
    this.lod.clear();
    
    const loader = new THREE.STLLoader();
    
    loader.load(
      url,
      (geometry) => {
        // Center geometry
        geometry.center();
        
        // Create multiple LOD levels
        this.createLODLevels(geometry);
        
        // Set main model reference to highest LOD for compatibility
        this.modelMesh = this.lod.getObjectByName('lod-high');
        
        // Scale model to fit view
        this.fitModelToView(geometry);
        
        // Add LOD to scene
        this.scene.add(this.lod);
        
        // Enable slice button
        this.enableSliceButton();
      },
      (xhr) => {
        // Loading progress
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        console.log(`Model loading: ${Math.round(percentComplete)}% complete`);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }
  
  /**
   * Create LOD levels from geometry
   * @param {THREE.BufferGeometry} geometry - Original geometry
   */
  createLODLevels(geometry) {
    if (!geometry || !geometry.attributes || !geometry.attributes.position) {
      console.error('Invalid geometry provided to createLODLevels');
      throw new Error('Invalid geometry');
    }
    
    // Get original vertex count
    const originalCount = geometry.attributes.position.count;
    
    // Create materials
    const material = this.createMaterial();
    
    // Add highest quality level (original geometry)
    try {
      const highMesh = new THREE.Mesh(geometry, material.clone());
      highMesh.name = 'lod-high';
      highMesh.castShadow = true;
      highMesh.receiveShadow = true;
      
      // Make sure the lod object exists
      if (!this.lod) {
        this.lod = new THREE.LOD();
      }
      
      this.lod.addLevel(highMesh, 0); // Visible when camera is closest
    } catch (e) {
      console.error('Failed to create high LOD level:', e);
      throw e; // Re-throw to trigger fallback
    }
    
    // Create medium quality version (simplified)
    try {
      const medGeometry = this.simplifyGeometry(geometry, 0.5);
      const medMesh = new THREE.Mesh(medGeometry, material.clone());
      medMesh.name = 'lod-med';
      medMesh.castShadow = true;
      medMesh.receiveShadow = true;
      this.lod.addLevel(medMesh, 25); // Visible at medium distance
    } catch (e) {
      console.warn('Could not create medium LOD level:', e);
      // Continue without medium LOD
    }
    
    // Create low quality version (highly simplified)
    try {
      const lowGeometry = this.simplifyGeometry(geometry, 0.2);
      const lowMesh = new THREE.Mesh(lowGeometry, material.clone());
      lowMesh.name = 'lod-low';
      lowMesh.castShadow = false;
      lowMesh.receiveShadow = true;
      this.lod.addLevel(lowMesh, 50); // Visible at far distance
    } catch (e) {
      console.warn('Could not create low LOD level:', e);
      // Continue without low LOD
    }
  }
  
  /**
   * Simplify geometry (mock implementation - would use actual simplification library in production)
   * @param {THREE.BufferGeometry} geometry - Original geometry
   * @param {number} ratio - Simplification ratio (0.0-1.0)
   * @returns {THREE.BufferGeometry} - Simplified geometry
   */
  simplifyGeometry(geometry, ratio) {
    // Add error handling and validation
    if (!geometry || !geometry.attributes || !geometry.attributes.position) {
      console.error('Invalid geometry provided to simplifyGeometry');
      return new THREE.BufferGeometry(); // Return empty geometry as fallback
    }
    
    // Validate ratio
    if (ratio <= 0 || ratio > 1) {
      console.warn('Invalid simplification ratio, using 0.5');
      ratio = 0.5;
    }
    
    try {
      // This is a mock implementation - in a real app you would use:
      // - THREE.SimplifyModifier
      // - meshopt.js
      // - simplify-3d-mesh
      
      // For demonstration, we'll create a simplified version by skipping vertices
      const positions = geometry.attributes.position.array;
      const normals = geometry.attributes.normal ? geometry.attributes.normal.array : null;
      
      // Ensure we have positions
      if (!positions || positions.length === 0) {
        console.error('Geometry has no position data');
        return geometry.clone(); // Return original as fallback
      }
      
      const stride = Math.max(1, Math.floor(1 / ratio));
      const newPositions = [];
      const newNormals = normals ? [] : null;
      
      // Protect against out-of-bounds access
      const maxIndex = positions.length - 9;
      
      for (let i = 0; i < positions.length; i += 9 * stride) {
        // Keep every Nth triangle and ensure we don't exceed array bounds
        if (i <= maxIndex) {
          // Add positions
          for (let j = 0; j < 9; j++) {
            newPositions.push(positions[i + j]);
          }
          
          // Add normals if available
          if (newNormals && normals && i + 8 < normals.length) {
            for (let j = 0; j < 9; j++) {
              newNormals.push(normals[i + j]);
            }
          }
        }
      }
      
      // Ensure we have at least some vertices
      if (newPositions.length < 9) {
        console.warn('Too few vertices after simplification, returning original');
        return geometry.clone();
      }
      
      // Create new geometry
      const newGeometry = new THREE.BufferGeometry();
      
      // Add attributes
      newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
      
      if (newNormals && newNormals.length > 0) {
        newGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
      } else {
        newGeometry.computeVertexNormals();
      }
      
      return newGeometry;
    } catch (error) {
      console.error('Error during geometry simplification:', error);
      // In case of any error, return original geometry
      return geometry.clone();
    }
  }
  
  /**
   * Enhanced animation loop with FPS monitoring and adaptive quality
   */
  animate(timestamp) {
    if (!this.scene || !this.camera || !this.renderer) return;
    
    // Make sure fpsCounter exists before using it
    if (!this.fpsCounter) {
      this.fpsCounter = {
        frames: 0,
        lastTime: performance.now(),
        value: 0
      };
    }
    
    // Calculate FPS
    this.fpsCounter.frames++;
    
    if (timestamp - this.fpsCounter.lastTime >= 1000) {
      this.fpsCounter.value = Math.round((this.fpsCounter.frames * 1000) / (timestamp - this.fpsCounter.lastTime));
      this.fpsCounter.frames = 0;
      this.fpsCounter.lastTime = timestamp;
      
      // Adjust quality based on FPS
      this.adaptQualityToPerformance();
    }
    
    // Adaptive quality based on viewport size
    const width = this.container.clientWidth;
    
    // Check if qualityLevels exists before using it
    if (!this.qualityLevels) {
      this.qualityLevels = [
        { threshold: 0, detail: 1, maxPolyCount: 100000 },
        { threshold: 500, detail: 0.5, maxPolyCount: 50000 },
        { threshold: 1000, detail: 0.25, maxPolyCount: 25000 }
      ];
    }
    
    // Safe access to qualityLevels
    const detailLevel = this.qualityLevels.find(level => width > level.threshold)?.detail || 1;
    
    // Set currentDetailLevel if not defined
    if (this.currentDetailLevel === undefined) {
      this.currentDetailLevel = detailLevel;
    }
    
    // Check if lod exists before using it
    if (!this.lod) {
      this.lod = new THREE.LOD();
      this.scene.add(this.lod);
    }
    
    // Update materials with detail level
    if (this.modelMesh && Math.abs(this.currentDetailLevel - detailLevel) > 0.05) {
      this.currentDetailLevel = detailLevel;
      
      // Update material properties for all LOD levels if lod exists
      if (this.lod) {
        this.lod.traverse(child => {
          if (child.isMesh && child.material) {
            // Adjust material quality
            child.material.roughness = Math.max(0.1, Math.min(1, 1 - detailLevel * 0.7));
            
            // Adjust displacement scale if using displacement mapping
            if (child.material.displacementScale !== undefined) {
              child.material.displacementScale = detailLevel;
            }
            
            // Toggle expensive material features
            if (detailLevel < 0.5) {
              child.material.envMapIntensity = 0.2;
              child.receiveShadow = false;
              child.castShadow = false;
            } else {
              child.material.envMapIntensity = 1.0;
              child.receiveShadow = true;
              child.castShadow = detailLevel > 0.8;
            }
          }
        });
      }
    }
    
    // Auto-rotate model
    if (this.config.autoRotate) {
      if (this.lod) {
        this.lod.rotation.y += this.config.rotationSpeed;
      } else if (this.modelMesh) {
        this.modelMesh.rotation.y += this.config.rotationSpeed;
      }
    }
    
    // Update controls if available
    if (this.controls) {
      this.controls.update();
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
  
  /**
   * Adjust rendering quality based on FPS performance
   */
  adaptQualityToPerformance() {
    if (!this.renderer) return;
    
    // Make sure fpsCounter exists
    if (!this.fpsCounter) return;
    
    if (this.fpsCounter.value < 30) {
      // Low FPS - reduce quality
      this.renderer.setPixelRatio(Math.max(1, window.devicePixelRatio - 0.5));
      
      // Use simpler materials if lod exists
      if (this.lod) {
        this.lod.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.flatShading = true;
          }
        });
      } else if (this.modelMesh && this.modelMesh.material) {
        this.modelMesh.material.flatShading = true;
      }
    } else if (this.fpsCounter.value > 55) {
      // High FPS - can increase quality
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Use better materials if lod exists
      if (this.lod) {
        this.lod.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.flatShading = false;
          }
        });
      } else if (this.modelMesh && this.modelMesh.material) {
        this.modelMesh.material.flatShading = false;
      }
    }
  }
  
  /**
   * Enhanced material creation
   * @returns {THREE.Material} - Three.js material
   */
  createMaterial() {
    const preset = this.materialPresets[this.config.materialType] || this.materialPresets.plastic;
    
    // Use MeshPhysicalMaterial for more realistic rendering
    const material = new THREE.MeshPhysicalMaterial({
      color: preset.color,
      roughness: preset.roughness,
      metalness: preset.metalness,
      clearcoat: preset.clearcoat || 0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.5,
      envMapIntensity: 1,
      flatShading: false
    });
    
    return material;
  }
  
  /**
   * Enhanced cleanup
   */
  dispose() {
    // Clear LOD
    if (this.lod) {
      this.lod.traverse(child => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        }
      });
      
      this.lod.clear();
    }
    
    // Run base disposal
    super.dispose();
  }
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  const modelContainer = document.getElementById('3d-visualizer');
  const fileInput = document.getElementById('model-upload');
  
  if (!modelContainer) return;
  
  // Create visualizer
  const visualizer = new OptimizedMaterialVisualizer(modelContainer);
  
  // Load demo model if available
  const demoModelUrl = 'https://threejs.org/examples/models/stl/ascii/slotted_disk.stl';
  visualizer.loadModel(demoModelUrl);
  
  // Add file input event listener
  if (fileInput) {
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        visualizer.loadModelFromFile(file);
      }
    });
  }
  
  // Add global reference for debugging
  window.materialVisualizer = visualizer;
}); 