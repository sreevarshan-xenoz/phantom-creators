/**
 * Phantom Creators - Main Application
 * This file initializes and connects all components
 */

// Global application state
const PhantomCreators = {
  // Configuration
  config: {
    debug: false,
    autoStartAnimation: true,
    defaultMaterial: 'plastic',
    enableAnalytics: false
  },
  
  // Component references
  components: {
    filamentStream: null,
    materialVisualizer: null,
    complexityAnalyzer: null,
    stateManager: null,
    docs: null
  },
  
  // Initialization
  init() {
    console.log('Initializing Phantom Creators application...');
    
    // Check dependencies
    this.checkDependencies();
    
    // Apply performance optimizations
    this.applyPerformanceOptimizations();
    
    // Initialize UI enhancements
    this.initUI();
    
    // Set up event listeners
    this.initEventListeners();
    
    // Initialize analytics if enabled
    if (this.config.enableAnalytics) {
      this.initAnalytics();
    }
    
    // Log initialization complete
    console.log('Application initialized successfully');
  },
  
  /**
   * Check if required dependencies are loaded
   */
  checkDependencies() {
    // Check for Three.js
    if (!window.THREE) {
      console.warn('Three.js not found. 3D visualization will not work.');
    }
    
    // Check for required DOM elements
    const requiredElements = [
      { id: 'filament-stream', name: 'Filament Stream Container' },
      { id: '3d-visualizer', name: '3D Visualizer Container' },
      { id: 'terminal-output', name: 'Terminal Output' }
    ];
    
    let missingElements = false;
    
    requiredElements.forEach(element => {
      if (!document.getElementById(element.id)) {
        console.warn(`Required element not found: ${element.name} (id: ${element.id})`);
        missingElements = true;
      }
    });
    
    if (missingElements) {
      console.warn('Some required elements are missing. Application may not function correctly.');
    }
  },
  
  /**
   * Apply performance optimizations
   */
  applyPerformanceOptimizations() {
    // Implement loading priority system
    const loadPriority = [
      { id: 'main-content', priority: 1 },
      { id: 'filament-stream', priority: 3 },
      { id: '3d-visualizer', priority: 2 }
    ];
    
    // Sort elements by priority
    loadPriority.sort((a, b) => a.priority - b.priority);
    
    // Load elements in priority order
    loadPriority.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        // If element's priority is > 1, add progressive loading
        if (item.priority > 1) {
          element.classList.add('lazy-load');
          
          // Load high priority items immediately
          setTimeout(() => {
            element.classList.remove('lazy-load');
            element.classList.add('loaded');
          }, item.priority * 100);
        }
      }
    });
    
    // Optimize event handlers by using delegation
    this.setupEventDelegation();
    
    // Optimize animations with requestAnimationFrame
    this.optimizeAnimations();
  },
  
  /**
   * Setup event delegation for better performance
   */
  setupEventDelegation() {
    // Use event delegation for all button clicks
    document.addEventListener('click', (e) => {
      // Control buttons
      if (e.target.matches('[data-state-action]')) {
        const action = e.target.getAttribute('data-state-action');
        // Let the state manager handle this
      }
      
      // Material selection buttons
      if (e.target.matches('[data-material]')) {
        const material = e.target.getAttribute('data-material');
        if (window.materialVisualizer) {
          window.materialVisualizer.setMaterial(material);
        }
      }
    });
  },
  
  /**
   * Optimize animations
   */
  optimizeAnimations() {
    // Use IntersectionObserver to pause animations when not visible
    if ('IntersectionObserver' in window) {
      const animatedElements = document.querySelectorAll('.animated-element, canvas');
      
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          // Get element ID
          const id = entry.target.id;
          
          if (entry.isIntersecting) {
            // Resume animation
            if (id === 'filament-stream' && window.filamentStream) {
              window.filamentStream.start();
            }
          } else {
            // Pause animation
            if (id === 'filament-stream' && window.filamentStream) {
              window.filamentStream.stop();
            }
          }
        });
      }, {
        threshold: 0.1 // React when at least 10% of the element is visible
      });
      
      // Observe all animated elements
      animatedElements.forEach(element => {
        observer.observe(element);
      });
    }
  },
  
  /**
   * Initialize UI enhancements
   */
  initUI() {
    // Add CSS variable support detection
    if (!window.CSS || !window.CSS.supports || !window.CSS.supports('--a', '0')) {
      document.body.classList.add('no-css-variables');
    }
    
    // Add reduced motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }
    
    // Add theme support
    this.initThemeSupport();
    
    // Add keyboard navigation enhancements
    this.enhanceKeyboardNavigation();
  },
  
  /**
   * Initialize theme support
   */
  initThemeSupport() {
    // Check for preferred color scheme
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-theme', prefersDarkMode);
    document.body.classList.toggle('light-theme', !prefersDarkMode);
    
    // Listen for changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      document.body.classList.toggle('dark-theme', e.matches);
      document.body.classList.toggle('light-theme', !e.matches);
    });
    
    // Add theme toggle button
    this.addThemeToggle();
  },
  
  /**
   * Add theme toggle button
   */
  addThemeToggle() {
    // Check if theme toggle already exists
    if (document.querySelector('.theme-toggle')) return;
    
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle dark/light theme');
    themeToggle.innerHTML = '🌓';
    
    // Add event listener
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      document.body.classList.toggle('light-theme');
      
      // Store preference
      const isDarkTheme = document.body.classList.contains('dark-theme');
      localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    });
    
    // Append to body
    document.body.appendChild(themeToggle);
    
    // Add styles
    const styleEl = document.getElementById('main-styles') || document.createElement('style');
    if (!document.getElementById('main-styles')) {
      styleEl.id = 'main-styles';
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent += `
      .theme-toggle {
        position: fixed;
        top: 1rem;
        right: 1rem;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.2);
        color: #fff;
        font-size: 1.2rem;
        border: none;
        cursor: pointer;
        z-index: 98;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .light-theme .theme-toggle {
        background-color: rgba(255, 255, 255, 0.4);
        color: #333;
      }
      
      .theme-toggle:hover {
        transform: scale(1.1);
      }
    `;
    
    // Check for stored preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      document.body.classList.remove('dark-theme', 'light-theme');
      document.body.classList.add(`${storedTheme}-theme`);
    }
  },
  
  /**
   * Enhance keyboard navigation
   */
  enhanceKeyboardNavigation() {
    // Add focus styles
    const styleEl = document.getElementById('main-styles') || document.createElement('style');
    if (!document.getElementById('main-styles')) {
      styleEl.id = 'main-styles';
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent += `
      :focus {
        outline: 2px solid var(--neon-cyan, #00c8ff);
        outline-offset: 2px;
      }
      
      .focus-visible-only :focus:not(:focus-visible) {
        outline: none;
      }
      
      .focus-visible-only :focus-visible {
        outline: 2px solid var(--neon-cyan, #00c8ff);
        outline-offset: 2px;
      }
    `;
    
    // Add class for :focus-visible support detection
    if ('FocusOptions' in window) {
      document.documentElement.classList.add('focus-visible-only');
    }
  },
  
  /**
   * Set up event listeners
   */
  initEventListeners() {
    // Listen for file uploads
    const fileInput = document.getElementById('model-upload');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          this.handleFileUpload(file);
        }
      });
    }
    
    // Add drag and drop support
    this.initDragAndDrop();
    
    // Add resize handling
    window.addEventListener('resize', this.handleResize.bind(this));
  },
  
  /**
   * Initialize drag and drop
   */
  initDragAndDrop() {
    const dropZone = document.getElementById('3d-visualizer');
    if (!dropZone) return;
    
    // Prevent default to allow drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      dropZone.classList.add('drag-highlight');
    }
    
    function unhighlight() {
      dropZone.classList.remove('drag-highlight');
    }
    
    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });
    
    // Add drag-drop styles
    const styleEl = document.getElementById('main-styles');
    if (styleEl) {
      styleEl.textContent += `
        .drag-highlight {
          border: 2px dashed var(--neon-cyan, #00c8ff) !important;
          background-color: rgba(0, 200, 255, 0.1) !important;
        }
      `;
    }
  },
  
  /**
   * Handle file upload
   * @param {File} file - The uploaded file
   */
  handleFileUpload(file) {
    console.log('File uploaded:', file.name);
    
    // Check if it's an STL file
    if (!file.name.toLowerCase().endsWith('.stl')) {
      alert('Please upload an STL file.');
      return;
    }
    
    // Load into visualizer if available
    if (window.materialVisualizer) {
      window.materialVisualizer.loadModelFromFile(file);
    }
    
    // Analyze with complexity analyzer if available
    if (window.complexityAnalyzer) {
      window.complexityAnalyzer.analyzeModel(file)
        .then(results => {
          console.log('Analysis results:', results);
        })
        .catch(error => {
          console.error('Analysis error:', error);
        });
    }
  },
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Update responsive UI elements
    this.updateResponsiveElements();
  },
  
  /**
   * Update responsive UI elements
   */
  updateResponsiveElements() {
    // Adjust for mobile layout
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile-layout', isMobile);
    
    // Update any components that need to respond to resize
    // (They should handle this internally, this is just a fallback)
  },
  
  /**
   * Initialize analytics if enabled
   */
  initAnalytics() {
    // Create analytics tracking class
    window.PrintVerseAnalytics = {
      trackEvent(category, action, label) {
        if (typeof gtag === 'function') {
          gtag('event', action, {
            event_category: category,
            event_label: label
          });
        } else {
          console.log('Analytics event:', category, action, label);
        }
      },
      
      trackInteraction(event) {
        this.trackEvent(event.category, 'interaction', event.label);
      },
      
      trackError(error) {
        this.trackEvent('error', error.name, error.message);
      }
    };
    
    // Track page view
    window.PrintVerseAnalytics.trackEvent('navigation', 'page_view', window.location.pathname);
  }
};

// Initialize app after loading all dependencies
document.addEventListener('DOMContentLoaded', () => {
  // Check if Three.js is loaded properly
  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded correctly. Loading fallback version.');
    
    // Load Three.js dynamically as fallback
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js';
    document.head.appendChild(threeScript);
    
    // Load STLLoader after Three.js
    threeScript.onload = () => {
      const stlLoaderScript = document.createElement('script');
      stlLoaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/STLLoader.js';
      document.head.appendChild(stlLoaderScript);
      
      // Initialize after loading dependencies
      stlLoaderScript.onload = () => {
        PhantomCreators.init();
      };
    };
  } else {
    // Initialize if Three.js is already loaded
    PhantomCreators.init();
  }
  
  // Add timeout to hide loading indicators that might be stuck
  setTimeout(() => {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer && !loadingContainer.classList.contains('hidden')) {
      console.log('Hiding stuck loading indicator');
      loadingContainer.classList.add('hidden');
    }
  }, 3000);
});

// 3D Printing Status Simulation
function initPrintingStatusSimulation() {
    // Check if the printing status elements exist
    const statusCards = document.querySelectorAll('.status-card.active');
    if (!statusCards.length) return;

    // Update progress bars and times every 30 seconds
    function updatePrintingStatus() {
        statusCards.forEach(card => {
            const progressBar = card.querySelector('.progress');
            const statusMeta = card.querySelector('.status-meta');
            
            if (progressBar && statusMeta) {
                // Get current progress
                let currentWidth = parseInt(progressBar.style.width);
                if (isNaN(currentWidth)) currentWidth = 0;
                
                // Increment progress by a small random amount (0.5% to 1.5%)
                const increment = Math.random() * 1 + 0.5;
                let newWidth = Math.min(currentWidth + increment, 100);
                
                // Update progress bar
                progressBar.style.width = newWidth + '%';
                
                // Parse current status to extract completion percentage and time
                const statusText = statusMeta.textContent;
                const percentMatch = statusText.match(/(\d+)%/);
                const timeMatch = statusText.match(/(\d+)h\s+(\d+)m/);
                
                if (percentMatch && timeMatch) {
                    const currentPercent = parseInt(percentMatch[1]);
                    const hours = parseInt(timeMatch[1]);
                    const minutes = parseInt(timeMatch[2]);
                    
                    // Calculate new percentage based on progress bar
                    const newPercent = Math.round(newWidth);
                    
                    // Calculate new time remaining (reduce proportionally)
                    let totalMinutes = hours * 60 + minutes;
                    const percentComplete = newPercent / 100;
                    const percentRemaining = 1 - percentComplete;
                    
                    // Adjust remaining time based on original estimate and completion percentage
                    const originalTotalMinutes = totalMinutes / (1 - (currentPercent / 100));
                    const newTotalMinutes = Math.max(0, Math.round(originalTotalMinutes * percentRemaining));
                    
                    const newHours = Math.floor(newTotalMinutes / 60);
                    const newMinutes = newTotalMinutes % 60;
                    
                    // Update status text
                    statusMeta.textContent = `${newPercent}% complete • ${newHours}h ${newMinutes}m remaining`;
                    
                    // If print is complete, update status
                    if (newPercent >= 100) {
                        const statusIndicator = card.querySelector('.status-indicator');
                        const statusDetails = card.querySelector('.status-details p');
                        
                        if (statusIndicator) {
                            statusIndicator.classList.add('idle');
                        }
                        
                        if (statusDetails) {
                            statusDetails.textContent = 'Status: Completed';
                        }
                        
                        statusMeta.textContent = 'Ready for pickup';
                        
                        // Remove from active cards
                        card.classList.remove('active');
                    }
                }
            }
        });
    }
    
    // Initial update
    updatePrintingStatus();
    
    // Set interval for updates (every 30 seconds)
    const updateInterval = setInterval(updatePrintingStatus, 30000);
    
    // Add a listener to stop updates if the page is hidden
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            clearInterval(updateInterval);
        } else {
            // Restart interval when tab becomes visible again
            clearInterval(updateInterval);
            updatePrintingStatus();
            setInterval(updatePrintingStatus, 30000);
        }
    });
}

// Sample available printer selection functionality
function initAvailablePrinterSelection() {
    const idlePrinter = document.querySelector('.status-card:not(.active)');
    if (!idlePrinter) return;
    
    idlePrinter.addEventListener('click', function() {
        // Show a notification that this printer is available
        const printerName = idlePrinter.querySelector('h4').textContent;
        
        const notification = document.createElement('div');
        notification.className = 'printer-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${printerName} is available!</h4>
                <p>Would you like to start a new print job?</p>
                <div class="notification-actions">
                    <button class="cyber-button primary-button start-print-btn">Start Print</button>
                    <button class="cyber-button dismiss-btn">Dismiss</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add styles for the notification
        const style = document.createElement('style');
        style.textContent = `
            .printer-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: rgba(10, 10, 18, 0.95);
                border: 1px solid #00ff8c;
                border-radius: 8px;
                padding: 1.5rem;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                animation: slide-in 0.3s ease-out;
                max-width: 350px;
            }
            
            .notification-content h4 {
                margin-top: 0;
                margin-bottom: 0.5rem;
                color: #00ff8c;
            }
            
            .notification-content p {
                margin-bottom: 1rem;
                color: #ffffff;
            }
            
            .notification-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            @keyframes slide-in {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Add event listeners to buttons
        const dismissBtn = notification.querySelector('.dismiss-btn');
        const startPrintBtn = notification.querySelector('.start-print-btn');
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', function() {
                document.body.removeChild(notification);
            });
        }
        
        if (startPrintBtn) {
            startPrintBtn.addEventListener('click', function() {
                // Redirect to products page or show model uploader
                window.location.href = 'pages/products.html';
            });
        }
    });
}

// Featured Prints Gallery Functionality
function initFeaturedPrintsGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const pageDots = document.querySelectorAll('.page-dot');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');
    
    if (!galleryItems.length) return;
    
    let currentPage = 0;
    const itemsPerPage = 4;
    let filteredItems = [...galleryItems];
    
    // Filter items by category
    function filterItems(category) {
        if (category === 'all') {
            filteredItems = [...galleryItems];
        } else {
            filteredItems = [...galleryItems].filter(item => 
                item.getAttribute('data-category') === category
            );
        }
        
        // Reset pagination
        currentPage = 0;
        updatePagination();
        showCurrentItems();
    }
    
    // Show items for current page
    function showCurrentItems() {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Hide all items first
        galleryItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // Show only items for current page
        filteredItems.slice(startIndex, endIndex).forEach(item => {
            item.style.display = 'block';
        });
        
        // Update page dots
        updateActiveDot();
    }
    
    // Update pagination dots
    function updatePagination() {
        const pageCount = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
        
        // Hide all dots
        pageDots.forEach((dot, index) => {
            dot.style.display = index < pageCount ? 'block' : 'none';
        });
    }
    
    // Update active dot
    function updateActiveDot() {
        pageDots.forEach((dot, index) => {
            if (index === currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Navigate to next page
    function nextPage() {
        const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
        if (currentPage < pageCount - 1) {
            currentPage++;
            showCurrentItems();
        }
    }
    
    // Navigate to previous page
    function prevPage() {
        if (currentPage > 0) {
            currentPage--;
            showCurrentItems();
        }
    }
    
    // Event listeners for category buttons
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            const category = this.getAttribute('data-category');
            filterItems(category);
        });
    });
    
    // Event listeners for pagination dots
    pageDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentPage = index;
            showCurrentItems();
        });
    });
    
    // Event listeners for navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', prevPage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextPage);
    }
    
    // Add hover effect to gallery items
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const glowEffect = document.createElement('div');
            glowEffect.className = 'gallery-item-glow';
            glowEffect.style.position = 'absolute';
            glowEffect.style.top = '0';
            glowEffect.style.left = '0';
            glowEffect.style.right = '0';
            glowEffect.style.bottom = '0';
            glowEffect.style.boxShadow = 'inset 0 0 30px rgba(0, 255, 140, 0.3)';
            glowEffect.style.pointerEvents = 'none';
            glowEffect.style.opacity = '0';
            glowEffect.style.transition = 'opacity 0.5s';
            
            this.style.position = 'relative';
            this.appendChild(glowEffect);
            
            // Fade in glow effect
            setTimeout(() => {
                glowEffect.style.opacity = '1';
            }, 10);
        });
        
        item.addEventListener('mouseleave', function() {
            const glowEffect = this.querySelector('.gallery-item-glow');
            if (glowEffect) {
                glowEffect.style.opacity = '0';
                setTimeout(() => {
                    if (glowEffect.parentNode === this) {
                        this.removeChild(glowEffect);
                    }
                }, 500);
            }
        });
    });
    
    // Initialize gallery
    updatePagination();
    showCurrentItems();
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the printing status simulation
    initPrintingStatusSimulation();
    
    // Initialize idle printer selection
    initAvailablePrinterSelection();
    
    // Initialize featured prints gallery
    initFeaturedPrintsGallery();
}); 