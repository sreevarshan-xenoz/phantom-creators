/**
 * Admin Login Handler for Phantom Creators
 * Handles administrator login with 2FA
 */

document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('admin-login-form');
    const errorMessage = document.getElementById('login-error');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    /**
     * Handle admin login form submission
     * @param {Event} event - Form submission event
     */
    function handleAdminLogin(event) {
        event.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const authCode = document.getElementById('auth-code').value.trim();
        
        // Basic validation
        if (!username || !password) {
            showError('Please enter both username and password.');
            return;
        }
        
        if (!authCode) {
            showError('Authentication code is required for admin access.');
            return;
        }
        
        // Validate auth code format (should be 6 digits)
        if (!/^\d{6}$/.test(authCode)) {
            showError('Authentication code must be 6 digits.');
            return;
        }
        
        // In a real application, you would send this data to a server
        // For this demo, we'll simulate a login verification process
        
        // Show loading state
        const submitButton = adminLoginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Verifying...';
        submitButton.disabled = true;
        
        // Log the attempt for security monitoring
        logAttempt(username);
        
        // Simulate server request with multi-step verification
        setTimeout(() => {
            // First step: Verify credentials
            verifyCredentials(username, password)
                .then(result => {
                    if (!result.success) {
                        showError(result.message);
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        return Promise.reject();
                    }
                    
                    // Update status
                    submitButton.textContent = 'Validating 2FA...';
                    
                    // Second step: Verify 2FA
                    return verify2FA(username, authCode);
                })
                .then(result => {
                    if (!result.success) {
                        showError(result.message);
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        return;
                    }
                    
                    // Success - both credential and 2FA check passed
                    loginSuccess();
                })
                .catch(err => {
                    // General error handling
                    if (err) {
                        console.error('Login error:', err);
                    }
                });
        }, 1000);
    }
    
    /**
     * Simulate credential verification
     * @param {string} username - Admin username
     * @param {string} password - Admin password
     * @returns {Promise<Object>} - Result of verification
     */
    function verifyCredentials(username, password) {
        return new Promise(resolve => {
            setTimeout(() => {
                // For demo purposes, we'll accept a specific test account
                if (username === 'admin' && password === 'admin123') {
                    resolve({
                        success: true,
                        message: 'Credentials verified'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Invalid username or password'
                    });
                }
            }, 800);
        });
    }
    
    /**
     * Simulate 2FA verification
     * @param {string} username - Admin username
     * @param {string} authCode - 2FA code
     * @returns {Promise<Object>} - Result of verification
     */
    function verify2FA(username, authCode) {
        return new Promise(resolve => {
            setTimeout(() => {
                // For demo purposes, we'll accept code '123456'
                if (authCode === '123456') {
                    resolve({
                        success: true,
                        message: '2FA verified'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Invalid authentication code. Please try again.'
                    });
                }
            }, 800);
        });
    }
    
    /**
     * Log login attempt for security monitoring
     * @param {string} username - Admin username
     */
    function logAttempt(username) {
        const timestamp = new Date().toISOString();
        const userAgent = navigator.userAgent;
        const ipAddress = '192.168.1.1'; // In a real app, this would be the actual IP
        
        console.log(`[ADMIN LOGIN ATTEMPT] ${timestamp} | User: ${username} | IP: ${ipAddress} | UA: ${userAgent}`);
        
        // In a real application, this would be sent to a secure logging service
    }
    
    /**
     * Handle successful login
     */
    function loginSuccess() {
        // Show success message
        errorMessage.textContent = 'Authentication successful! Redirecting to admin dashboard...';
        errorMessage.classList.remove('error-message');
        errorMessage.classList.add('success-message', 'visible');
        
        // Redirect to admin dashboard page
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
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