/**
 * Customer Login Handler for Phantom Creators
 * Handles login form submission and validation
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('login-error');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    /**
     * Handle login form submission
     * @param {Event} event - Form submission event
     */
    function handleLogin(event) {
        event.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate email format
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }
        
        // In a real application, you would send this data to a server
        // For this demo, we'll simulate a successful login
        
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Authenticating...';
        submitButton.disabled = true;
        
        // Simulate server request
        setTimeout(() => {
            // For demo purposes, we'll consider any login with @admin.com to fail
            if (email.endsWith('@admin.com')) {
                showError('Please use the admin login page for administrator accounts.');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                return;
            }
            
            // For demo purposes, we'll consider a specific demo account
            if (email === 'demo@example.com' && password === 'demo123') {
                // Successful login
                loginSuccess();
            } else {
                // Failed login
                showError('Invalid email or password. Please try again.');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }, 1500);
    }
    
    /**
     * Handle successful login
     */
    function loginSuccess() {
        // Show success message
        errorMessage.textContent = 'Login successful! Redirecting to your dashboard...';
        errorMessage.classList.remove('error-message');
        errorMessage.classList.add('success-message', 'visible');
        
        // Redirect to dashboard page
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
    
    /**
     * Display error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('visible');
        
        // Highlight animation
        errorMessage.style.animation = 'none';
        errorMessage.offsetHeight; // Force reflow
        errorMessage.style.animation = 'error-flash 0.5s';
    }
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email format
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});

// Add some CSS for success message and animation
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .success-message {
            background-color: rgba(0, 255, 140, 0.1);
            border-left: 3px solid #00ff8c;
            color: #00ff8c;
            padding: 0.75rem 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            display: none;
        }
        
        .success-message.visible {
            display: block;
        }
        
        @keyframes error-flash {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}); 