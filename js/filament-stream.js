/**
 * FilamentStream - Creates an animated particle stream visual effect
 * Base class for the optimized version
 */
class FilamentStream {
  constructor(container) {
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    // Set dimensions
    this.resizeCanvas();
    
    // Particles configuration
    this.particles = [];
    this.particleCount = 500;
    this.particleMinSize = 1;
    this.particleMaxSize = 3;
    this.particleColor = '#00ff8c';
    
    // Animation properties
    this.animationId = null;
    this.isAnimating = false;
    this.frameCount = 0;
    
    // Initialize
    this.initialize();
    
    // Event listeners
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }
  
  /**
   * Resize canvas to match container dimensions
   */
  resizeCanvas() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    
    // Reinitialize particles if already created
    if (this.particles.length) {
      this.initialize();
    }
  }
  
  /**
   * Initialize particles
   */
  initialize() {
    this.particles = [];
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: this.particleMinSize + Math.random() * (this.particleMaxSize - this.particleMinSize),
        speedX: Math.random() * 0.5 - 0.25,
        speedY: -0.5 - Math.random() * 1,
        opacity: 0.5 + Math.random() * 0.5
      });
    }
  }
  
  /**
   * Animation frame
   */
  animate() {
    if (!this.isAnimating) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Reset if out of bounds
      if (p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
        p.x = Math.random() * this.canvas.width;
        p.y = this.canvas.height + 10;
        p.size = this.particleMinSize + Math.random() * (this.particleMaxSize - this.particleMinSize);
        p.speedX = Math.random() * 0.5 - 0.25;
        p.speedY = -0.5 - Math.random() * 1;
        p.opacity = 0.5 + Math.random() * 0.5;
      }
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = this.particleColor;
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Request next frame
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
  
  /**
   * Start animation
   */
  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.animate();
  }
  
  /**
   * Stop animation
   */
  stop() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

/**
 * OptimizedFilamentStream - Enhanced version with performance optimizations
 * Extends the base FilamentStream with improved features
 */
class OptimizedFilamentStream extends FilamentStream {
  constructor(container) {
    super(container);
    
    // Add adaptive particle density based on screen width
    this.particleCount = window.innerWidth < 768 ? 100 : 500;
    
    // Implement WebGL fallback with optimized 2D context
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    
    // Performance tracking
    this.frameCount = 0;
    this.lastTimestamp = performance.now();
    this.fps = 0;
    
    // Re-initialize with optimized parameters
    this.initialize();
  }
  
  /**
   * Enhanced initialization with more optimized particle distribution
   */
  initialize() {
    this.particles = [];
    
    // Create initial particles
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: this.particleMinSize + Math.random() * (this.particleMaxSize - this.particleMinSize),
        speedX: Math.random() * 0.5 - 0.25,
        speedY: -0.5 - Math.random() * 1,
        opacity: 0.5 + Math.random() * 0.5,
        // Add color variation for more visual interest
        color: `rgba(0, ${180 + Math.floor(Math.random() * 75)}, ${100 + Math.floor(Math.random() * 155)}, ${0.5 + Math.random() * 0.5})`
      });
    }
  }
  
  /**
   * Optimized animation with frame skipping for mobile
   */
  animate(timestamp) {
    if (!this.isAnimating) return;
    
    // Calculate FPS for performance monitoring
    if (timestamp) {
      this.fps = 1000 / (timestamp - this.lastTimestamp);
      this.lastTimestamp = timestamp;
    }
    
    // Add frame skipping for mobile devices
    this.frameCount++;
    if (window.innerWidth < 768 && this.frameCount % 2 !== 0) {
      this.animationId = requestAnimationFrame(this.animate.bind(this));
      return;
    }
    
    // Clear with optimized method
    this.ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Batch similar operations for better performance
    this.ctx.beginPath();
    
    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Reset if out of bounds
      if (p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
        p.x = Math.random() * this.canvas.width;
        p.y = this.canvas.height + 10;
        p.size = this.particleMinSize + Math.random() * (this.particleMaxSize - this.particleMinSize);
        p.speedX = Math.random() * 0.5 - 0.25;
        p.speedY = -0.5 - Math.random() * 1;
        p.opacity = 0.5 + Math.random() * 0.5;
      }
      
      // Optimized drawing - reuse path for similar particles
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color || this.particleColor;
      this.ctx.moveTo(p.x, p.y);
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    }
    
    this.ctx.fill();
    
    // Request next frame
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
  
  /**
   * Enhanced resize with adaptive quality
   */
  resizeCanvas() {
    super.resizeCanvas();
    
    // Update particle count based on new dimensions
    this.particleCount = window.innerWidth < 768 ? 100 : 500;
    
    // Update LOD based on new dimensions
    this.particleMinSize = window.innerWidth < 768 ? 0.5 : 1;
    this.particleMaxSize = window.innerWidth < 768 ? 1.5 : 3;
    
    this.initialize();
  }
}

// Add IntersectionObserver for animation pausing
document.addEventListener('DOMContentLoaded', () => {
  const filamentContainer = document.getElementById('filament-stream');
  if (!filamentContainer) return;
  
  const filamentStream = new OptimizedFilamentStream(filamentContainer);
  
  // Start animation
  filamentStream.start();
  
  // Setup IntersectionObserver for performance
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        filamentStream.start();
      } else {
        filamentStream.stop();
      }
    });
  }, {
    threshold: 0.1 // React when at least 10% of the element is visible
  });
  
  observer.observe(filamentContainer);
  
  // Add global references for debugging
  window.filamentStream = filamentStream;
}); 