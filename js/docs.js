/**
 * PrintVerseDocs - Documentation system with keyboard shortcuts and cheatsheet
 * Provides interactive documentation for the application
 */
class PrintVerseDocs {
  constructor() {
    // Documentation panel element
    this.docsPanel = document.getElementById('cyber-docs');
    this.docsContent = document.getElementById('docs-content');
    
    // Configure keyboard shortcuts
    this.keyboardShortcuts = {
      'Ctrl+/': 'Toggle documentation',
      'Ctrl+Alt+M': 'Toggle material view',
      'Ctrl+P': 'Start/pause print',
      'Esc': 'Close current dialog',
      'Ctrl+Z': 'Reset view',
      'Shift+Scroll': 'Zoom model in/out',
      'Right click + drag': 'Orbit camera around model',
      'Middle click + drag': 'Pan camera'
    };
    
    // Feature explanations
    this.featureExplanations = {
      'Complexity Analysis': 'Analyzes your model to determine the optimal print settings based on polygon count and geometry.',
      'Material Simulation': 'Visualize how your model will look with different materials applied.',
      'Performance Prediction': 'Estimates print time and material consumption based on model complexity.',
      'Level of Detail': 'Automatically adjusts model complexity based on viewport size and system performance.',
      'Adaptive Quality': 'Dynamically adjusts rendering quality to maintain smooth performance.'
    };
    
    // Initialize the documentation system
    this.init();
  }
  
  /**
   * Initialize the documentation system
   */
  init() {
    // Initialize keyboard shortcuts
    this.initKeyboardShortcuts();
    
    // Add event listeners for doc panel controls
    this.initDocPanelControls();
    
    // Add contextual help for UI elements
    this.initContextualHelp();
    
    // Create sections
    this.buildDocSections();
  }
  
  /**
   * Initialize keyboard shortcuts
   */
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Toggle docs (Ctrl+/)
      if (e.ctrlKey && e.key === '/') {
        this.toggleDocs();
        e.preventDefault();
      }
      
      // Toggle material view (Ctrl+Alt+M)
      if (e.ctrlKey && e.altKey && e.key === 'm') {
        this.triggerAction('toggleMaterialView');
        e.preventDefault();
      }
      
      // Start/pause print (Ctrl+P)
      if (e.ctrlKey && e.key === 'p') {
        this.triggerAction('togglePrint');
        e.preventDefault();
      }
      
      // Reset view (Ctrl+Z)
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        this.triggerAction('resetView');
        e.preventDefault();
      }
      
      // Close dialog (Esc)
      if (e.key === 'Escape') {
        this.triggerAction('closeDialog');
        e.preventDefault();
      }
    });
  }
  
  /**
   * Initialize doc panel controls
   */
  initDocPanelControls() {
    if (!this.docsPanel) return;
    
    // Get close button
    const closeButton = this.docsPanel.querySelector('.close-docs');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.toggleDocs(false); // Hide docs
      });
    }
    
    // Add help button to the main UI if it doesn't exist
    this.addHelpButton();
  }
  
  /**
   * Add help button to the UI
   */
  addHelpButton() {
    // Check if help button already exists
    if (document.querySelector('.help-button')) return;
    
    // Create help button
    const helpButton = document.createElement('button');
    helpButton.className = 'help-button';
    helpButton.innerHTML = '?';
    helpButton.setAttribute('aria-label', 'Show documentation');
    helpButton.title = 'Show Documentation (Ctrl+/)';
    
    // Add event listener
    helpButton.addEventListener('click', () => {
      this.toggleDocs(true); // Show docs
    });
    
    // Append to the UI
    document.body.appendChild(helpButton);
    
    // Add styles if not already defined
    this.addHelpButtonStyles();
  }
  
  /**
   * Add styles for the help button
   */
  addHelpButtonStyles() {
    // Check if styles already exist
    if (document.getElementById('docs-styles')) return;
    
    // Create style element
    const styleEl = document.createElement('style');
    styleEl.id = 'docs-styles';
    
    // Add styles
    styleEl.textContent = `
      .help-button {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background-color: var(--neon-cyan, #00c8ff);
        color: #000;
        font-weight: bold;
        font-size: 1.2rem;
        border: none;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
        z-index: 99;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .help-button:hover {
        transform: scale(1.1);
        box-shadow: 0 0 15px rgba(0, 200, 255, 0.8);
      }
      
      .help-tooltip {
        position: absolute;
        background-color: rgba(18, 18, 28, 0.9);
        border: 1px solid var(--neon-cyan, #00c8ff);
        color: #fff;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 100;
        max-width: 250px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        box-shadow: 0 0 10px rgba(0, 200, 255, 0.3);
      }
      
      .help-tooltip.visible {
        opacity: 1;
      }
      
      /* Added tab styles to the docs panel */
      .docs-tabs {
        display: flex;
        border-bottom: 1px solid rgba(0, 200, 255, 0.3);
        margin-bottom: 1rem;
      }
      
      .docs-tab {
        padding: 0.5rem 1rem;
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.3s;
      }
      
      .docs-tab.active {
        opacity: 1;
        border-bottom: 2px solid var(--neon-cyan, #00c8ff);
      }
      
      .docs-section {
        display: none;
      }
      
      .docs-section.active {
        display: block;
      }
    `;
    
    // Append to head
    document.head.appendChild(styleEl);
  }
  
  /**
   * Initialize contextual help for UI elements
   */
  initContextualHelp() {
    // Help tooltips for various UI elements
    const helpTargets = [
      { selector: '#model-upload', text: 'Upload an STL file to analyze and visualize.' },
      { selector: '[data-state-action="start"]', text: 'Start the 3D printing simulation process.' },
      { selector: '[data-state-action="pause"]', text: 'Pause the current printing process.' },
      { selector: '.model-container', text: 'Right-click and drag to orbit. Scroll to zoom. Middle-click to pan.' }
    ];
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'help-tooltip';
    document.body.appendChild(tooltip);
    
    // Add event listeners to targets
    helpTargets.forEach(target => {
      const elements = document.querySelectorAll(target.selector);
      elements.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
          // Position tooltip
          const rect = el.getBoundingClientRect();
          tooltip.style.left = `${rect.left + rect.width / 2 - 125}px`;
          tooltip.style.top = `${rect.top - 40}px`;
          
          // Set text
          tooltip.textContent = target.text;
          
          // Show tooltip
          tooltip.classList.add('visible');
        });
        
        el.addEventListener('mouseleave', () => {
          // Hide tooltip
          tooltip.classList.remove('visible');
        });
      });
    });
  }
  
  /**
   * Build documentation sections with tabs
   */
  buildDocSections() {
    if (!this.docsContent) return;
    
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'docs-tabs';
    
    // Create content sections
    const sectionsHtml = `
      <div class="docs-section active" id="docs-shortcuts">
        <h3>Keyboard Shortcuts</h3>
        ${this.renderShortcuts()}
      </div>
      
      <div class="docs-section" id="docs-features">
        <h3>Features</h3>
        ${this.renderFeatures()}
      </div>
      
      <div class="docs-section" id="docs-tips">
        <h3>Tips & Tricks</h3>
        <ul class="docs-tips-list">
          <li>For best performance, use models with less than 500,000 polygons.</li>
          <li>Hollowing your model can reduce material usage by up to 40%.</li>
          <li>Rotate thin parts to be perpendicular to the print bed for better strength.</li>
          <li>The visualizer automatically adjusts quality based on your system performance.</li>
          <li>Use the complexity analysis to identify potential print issues before printing.</li>
        </ul>
      </div>
    `;
    
    // Create tabs
    const tabs = [
      { id: 'docs-shortcuts', label: 'Shortcuts' },
      { id: 'docs-features', label: 'Features' },
      { id: 'docs-tips', label: 'Tips & Tricks' }
    ];
    
    // Add tabs to container
    tabs.forEach((tab, index) => {
      const tabButton = document.createElement('button');
      tabButton.className = `docs-tab ${index === 0 ? 'active' : ''}`;
      tabButton.setAttribute('data-tab', tab.id);
      tabButton.textContent = tab.label;
      
      tabButton.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.docs-tab').forEach(t => t.classList.remove('active'));
        tabButton.classList.add('active');
        
        // Update active section
        document.querySelectorAll('.docs-section').forEach(s => s.classList.remove('active'));
        document.getElementById(tab.id).classList.add('active');
      });
      
      tabsContainer.appendChild(tabButton);
    });
    
    // Set content
    this.docsContent.innerHTML = '';
    this.docsContent.appendChild(tabsContainer);
    this.docsContent.insertAdjacentHTML('beforeend', sectionsHtml);
  }
  
  /**
   * Render keyboard shortcuts
   * @returns {string} - HTML for shortcuts
   */
  renderShortcuts() {
    return Object.entries(this.keyboardShortcuts)
      .map(([key, desc]) => 
        `<div class="doc-item">
          <kbd>${key}</kbd>
          <span>${desc}</span>
        </div>`
      ).join('');
  }
  
  /**
   * Render feature explanations
   * @returns {string} - HTML for features
   */
  renderFeatures() {
    return Object.entries(this.featureExplanations)
      .map(([feature, desc]) => 
        `<div class="doc-item">
          <strong>${feature}</strong>
          <p>${desc}</p>
        </div>`
      ).join('');
  }
  
  /**
   * Toggle documentation panel visibility
   * @param {boolean} [show] - Force show/hide state
   */
  toggleDocs(show) {
    if (!this.docsPanel) return;
    
    const isHidden = this.docsPanel.classList.contains('hidden');
    const newState = show !== undefined ? show : isHidden;
    
    if (newState) {
      // Show docs
      this.docsPanel.classList.remove('hidden');
      this.buildDocSections(); // Refresh content
    } else {
      // Hide docs
      this.docsPanel.classList.add('hidden');
    }
  }
  
  /**
   * Trigger an action based on keyboard shortcut
   * @param {string} action - Action to trigger
   */
  triggerAction(action) {
    switch (action) {
      case 'toggleMaterialView':
        // Toggle material type if the visualizer is available
        if (window.materialVisualizer) {
          const materialTypes = ['plastic', 'metal', 'ceramic', 'rubber'];
          const currentMaterial = materialTypes.indexOf(window.materialVisualizer.config.materialType);
          const nextMaterial = materialTypes[(currentMaterial + 1) % materialTypes.length];
          window.materialVisualizer.setMaterial(nextMaterial);
          
          // Show temporary notification
          this.showNotification(`Material changed to: ${nextMaterial}`);
        }
        break;
        
      case 'togglePrint':
        // Toggle print state if state manager is available
        if (window.printStateManager) {
          const stateManager = window.printStateManager;
          const currentState = stateManager.getState();
          
          if (currentState === stateManager.states.IDLE) {
            stateManager.transition(stateManager.states.ANALYZING);
            // Simulate analysis completion after 2 seconds
            setTimeout(() => {
              stateManager.transition(stateManager.states.PRINTING);
            }, 2000);
          } else if (currentState === stateManager.states.PRINTING) {
            stateManager.transition(stateManager.states.PAUSED);
          } else if (currentState === stateManager.states.PAUSED) {
            stateManager.transition(stateManager.states.PRINTING);
          }
        }
        break;
        
      case 'resetView':
        // Reset camera view if the visualizer is available
        if (window.materialVisualizer && window.materialVisualizer.controls) {
          window.materialVisualizer.controls.reset();
          this.showNotification('View reset');
        }
        break;
        
      case 'closeDialog':
        // Close any visible dialogs or panels
        this.toggleDocs(false);
        
        // Close any modals or dialogs
        document.querySelectorAll('.modal, .dialog').forEach(el => {
          el.style.display = 'none';
        });
        break;
    }
  }
  
  /**
   * Show a temporary notification
   * @param {string} message - Notification message
   * @param {number} [duration=2000] - Duration in milliseconds
   */
  showNotification(message, duration = 2000) {
    // Get existing notification container or create new one
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
      
      // Add styles
      const styleEl = document.getElementById('docs-styles');
      if (styleEl) {
        styleEl.textContent += `
          .notification-container {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 1000;
          }
          
          .notification {
            background-color: rgba(12, 12, 18, 0.9);
            border-left: 3px solid var(--neon-cyan, #00c8ff);
            color: #fff;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            border-radius: 4px;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
          }
          
          .notification.visible {
            transform: translateX(0);
            opacity: 1;
          }
        `;
      }
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
      notification.classList.add('visible');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      notification.classList.remove('visible');
      
      // Remove from DOM after animation
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }
}

// Initialize documentation system on document load
document.addEventListener('DOMContentLoaded', () => {
  const docs = new PrintVerseDocs();
  
  // Add global reference for other components
  window.printVerseDocs = docs;
}); 