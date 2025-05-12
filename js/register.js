/**
 * Registration Handler for Phantom Creators
 * Handles new customer account registration
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('register-error');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        
        // Add password matching validation
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');
        
        if (password && confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                if (password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Passwords do not match');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
            
            password.addEventListener('input', () => {
                if (confirmPassword.value && password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Passwords do not match');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
        }
    }
    
    /**
     * Handle registration form submission
     * @param {Event} event - Form submission event
     */
    function handleRegistration(event) {
        event.preventDefault();
        
        // Get form values
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const termsAccepted = document.getElementById('terms').checked;
        const newsletterOptIn = document.getElementById('newsletter').checked;
        
        // Basic validation
        if (!firstName || !lastName) {
            showError('Please enter your full name.');
            return;
        }
        
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }
        
        if (phone && !isValidPhone(phone)) {
            showError('Please enter a valid phone number or leave it blank.');
            return;
        }
        
        if (!isStrongPassword(password)) {
            showError('Password must be at least 8 characters and include letters and numbers.');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match.');
            return;
        }
        
        if (!termsAccepted) {
            showError('You must accept the Terms of Service and Privacy Policy.');
            return;
        }
        
        // In a real application, you would send this data to a server
        // For this demo, we'll simulate a successful registration
        
        // Show loading state
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;
        
        // Simulate server request
        setTimeout(() => {
            // Check if email is already registered
            // For demo purposes, we'll consider 'registered@example.com' as already taken
            if (email === 'registered@example.com') {
                showError('This email address is already registered. Please login or use a different email.');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                return;
            }
            
            // Successful registration
            registerSuccess({
                firstName,
                lastName,
                email,
                phone,
                newsletterOptIn
            });
        }, 2000);
    }
    
    /**
     * Handle successful registration
     * @param {Object} userData - User data for confirmation
     */
    function registerSuccess(userData) {
        // Get form container and replace with success message
        const registerCard = document.querySelector('.register-card');
        
        if (registerCard) {
            // Create success message
            const successMessage = document.createElement('div');
            successMessage.className = 'register-success';
            successMessage.innerHTML = `
                <div class="success-icon">✓</div>
                <h2>Account <span class="highlight">Created</span></h2>
                <p class="success-message">Welcome to Phantom Creators, ${userData.firstName}!</p>
                <p>We've sent a confirmation email to <strong>${userData.email}</strong>.</p>
                <p>Please verify your email address to complete your registration.</p>
                <div class="success-actions">
                    <a href="login.html" class="cyber-button primary-button">Proceed to Login</a>
                </div>
            `;
            
            // Replace form with success message
            registerCard.innerHTML = '';
            registerCard.appendChild(successMessage);
            
            // Scroll to top of success message
            registerCard.scrollIntoView({ behavior: 'smooth' });
        }
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
        
        // Scroll to error message
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    
    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Is valid phone format
     */
    function isValidPhone(phone) {
        // Allow various formats with optional country code
        const phoneRegex = /^(\+\d{1,3})?([\s.-]?\d{3}){1,2}([\s.-]?\d{4})$/;
        return phoneRegex.test(phone);
    }
    
    /**
     * Check password strength
     * @param {string} password - Password to validate
     * @returns {boolean} Is strong password
     */
    function isStrongPassword(password) {
        // At least 8 characters, contains both letters and numbers
        return password.length >= 8 && 
               /[A-Za-z]/.test(password) && 
               /\d/.test(password);
    }
});

// Add styling for success message
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .register-success {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            padding: 1rem;
        }
        
        .success-icon {
            font-size: 3rem;
            color: #00ff8c;
            background: rgba(0, 255, 140, 0.15);
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            border: 2px solid #00ff8c;
        }
        
        .success-message {
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }
        
        .success-actions {
            margin-top: 1.5rem;
        }
        
        @keyframes error-flash {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}); 