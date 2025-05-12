/**
 * Cart functionality for Phantom Creators
 * Handles adding, removing items, and calculating totals
 */

class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.cartIcon = document.getElementById('cart-icon');
        this.cartItemCount = document.getElementById('cart-count');
        this.cartDropdown = document.getElementById('cart-dropdown');
        this.cartItemsList = document.getElementById('cart-items');
        this.cartTotal = document.getElementById('cart-total');
        this.cartEmptyMessage = document.getElementById('cart-empty');
        this.checkoutButton = document.getElementById('checkout-button');
        
        this.bindEvents();
        this.updateCartDisplay();
    }
    
    loadCart() {
        const savedCart = localStorage.getItem('phantomCreatorsCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }
    
    saveCart() {
        localStorage.setItem('phantomCreatorsCart', JSON.stringify(this.items));
    }
    
    bindEvents() {
        // Bind add to cart buttons
        document.querySelectorAll('.order-button').forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart')) {
                    e.preventDefault();
                    const card = e.target.closest('.product-card');
                    if (card) {
                        this.addToCart({
                            id: card.dataset.id,
                            name: card.querySelector('h3').textContent,
                            price: parseFloat(card.dataset.price || '0'),
                            category: card.dataset.category,
                            image: card.querySelector('.product-image img')?.src || '',
                            quantity: 1
                        });
                    }
                }
            });
        });
        
        // Show/hide cart dropdown
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCartDropdown();
            });
            
            // Close cart when clicking outside
            document.addEventListener('click', (e) => {
                if (this.cartDropdown && 
                    !this.cartDropdown.contains(e.target) && 
                    e.target !== this.cartIcon) {
                    this.cartDropdown.classList.add('hidden');
                }
            });
        }
        
        // Checkout button
        if (this.checkoutButton) {
            this.checkoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.proceedToCheckout();
            });
        }
    }
    
    toggleCartDropdown() {
        if (this.cartDropdown) {
            this.cartDropdown.classList.toggle('hidden');
        }
    }
    
    addToCart(product) {
        const existingItemIndex = this.items.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
            // Item already exists, increase quantity
            this.items[existingItemIndex].quantity += 1;
        } else {
            // New item
            this.items.push(product);
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showAddedToCartNotification(product.name);
    }
    
    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }
    
    updateItemQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartDisplay();
        }
    }
    
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }
    
    getCartTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    
    updateCartDisplay() {
        // Update cart count
        if (this.cartItemCount) {
            const count = this.getItemCount();
            this.cartItemCount.textContent = count;
            this.cartItemCount.style.display = count > 0 ? 'flex' : 'none';
        }
        
        // Update cart items list
        if (this.cartItemsList) {
            // Clear list
            this.cartItemsList.innerHTML = '';
            
            // Add items
            this.items.forEach(item => {
                const itemElement = document.createElement('li');
                itemElement.className = 'cart-item';
                
                itemElement.innerHTML = `
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <div class="item-price">$${item.price.toFixed(2)}</div>
                        <div class="item-quantity">
                            <button class="quantity-btn decrease">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase">+</button>
                        </div>
                    </div>
                    <button class="remove-item" aria-label="Remove ${item.name} from cart">×</button>
                `;
                
                // Add event listeners for quantity buttons
                itemElement.querySelector('.decrease').addEventListener('click', () => {
                    this.updateItemQuantity(item.id, item.quantity - 1);
                });
                
                itemElement.querySelector('.increase').addEventListener('click', () => {
                    this.updateItemQuantity(item.id, item.quantity + 1);
                });
                
                // Add event listener for remove button
                itemElement.querySelector('.remove-item').addEventListener('click', () => {
                    this.removeFromCart(item.id);
                });
                
                this.cartItemsList.appendChild(itemElement);
            });
        }
        
        // Update cart total
        if (this.cartTotal) {
            this.cartTotal.textContent = `$${this.getCartTotal().toFixed(2)}`;
        }
        
        // Show/hide empty message
        if (this.cartEmptyMessage) {
            this.cartEmptyMessage.style.display = this.items.length === 0 ? 'block' : 'none';
        }
        
        // Enable/disable checkout button
        if (this.checkoutButton) {
            this.checkoutButton.disabled = this.items.length === 0;
        }
    }
    
    showAddedToCartNotification(productName) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `<span>✓</span> Added ${productName} to cart`;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
            
            // Remove after animation
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2500);
        }, 10);
    }
    
    proceedToCheckout() {
        // In a real application, this would redirect to a checkout page
        // For demo purposes, we'll just show a notification
        alert(`Ready to checkout with ${this.getItemCount()} items totaling $${this.getCartTotal().toFixed(2)}`);
        
        // Redirect to a checkout page
        // window.location.href = '/checkout.html';
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add cart icon to header if it doesn't exist
    const header = document.querySelector('.cyber-header');
    if (header && !document.getElementById('cart-icon')) {
        const nav = header.querySelector('nav ul');
        if (nav) {
            const cartLi = document.createElement('li');
            cartLi.className = 'cart-container';
            cartLi.innerHTML = `
                <a href="#" id="cart-icon" class="glow-button cart-button" aria-label="Shopping Cart">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span id="cart-count" class="cart-count">0</span>
                </a>
                
                <div id="cart-dropdown" class="cart-dropdown hidden">
                    <h3>Your Cart</h3>
                    <ul id="cart-items" class="cart-items"></ul>
                    <p id="cart-empty" class="cart-empty">Your cart is empty</p>
                    <div class="cart-footer">
                        <div class="cart-total-container">
                            <span>Total:</span>
                            <span id="cart-total" class="cart-total">$0.00</span>
                        </div>
                        <button id="checkout-button" class="cyber-button checkout-button" disabled>Checkout</button>
                    </div>
                </div>
            `;
            
            // Insert before the user-actions if it exists, otherwise append
            const userActions = nav.querySelector('.user-actions');
            if (userActions) {
                nav.insertBefore(cartLi, userActions);
            } else {
                nav.appendChild(cartLi);
            }
        }
    }
    
    // Add cart styles if they don't exist
    if (!document.getElementById('cart-styles')) {
        const cartStyles = document.createElement('style');
        cartStyles.id = 'cart-styles';
        cartStyles.textContent = `
            /* Cart Icon Styles */
            .cart-container {
                position: relative;
            }
            
            .cart-button {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            .cart-count {
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #00ff8c;
                color: #000;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: bold;
            }
            
            /* Cart Dropdown */
            .cart-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                width: 320px;
                background-color: #12121c;
                border: 1px solid #00ff8c;
                border-radius: 5px;
                padding: 1rem;
                z-index: 1000;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
            }
            
            .cart-dropdown h3 {
                margin-top: 0;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(0, 255, 140, 0.3);
            }
            
            .cart-items {
                list-style: none;
                padding: 0;
                margin: 0;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .cart-item {
                display: flex;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .item-image {
                width: 50px;
                height: 50px;
                overflow: hidden;
                border-radius: 4px;
                margin-right: 1rem;
            }
            
            .item-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .item-details {
                flex: 1;
            }
            
            .item-details h4 {
                margin: 0 0 0.25rem;
                font-size: 0.9rem;
            }
            
            .item-price {
                color: #00ff8c;
                font-weight: bold;
                margin-bottom: 0.25rem;
            }
            
            .item-quantity {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .quantity-btn {
                background-color: rgba(0, 255, 140, 0.2);
                border: 1px solid rgba(0, 255, 140, 0.3);
                color: #fff;
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                border-radius: 3px;
                cursor: pointer;
            }
            
            .remove-item {
                background: none;
                border: none;
                color: #ff6b6b;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.25rem;
                margin-left: 0.5rem;
            }
            
            .cart-empty {
                text-align: center;
                padding: 1.5rem 0;
                color: #7a7a8c;
            }
            
            .cart-footer {
                margin-top: 1rem;
                padding-top: 0.5rem;
                border-top: 1px solid rgba(0, 255, 140, 0.3);
            }
            
            .cart-total-container {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1rem;
                font-weight: bold;
            }
            
            .cart-total {
                color: #00ff8c;
            }
            
            .checkout-button {
                width: 100%;
            }
            
            .checkout-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* Notification */
            .cart-notification {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background-color: rgba(0, 255, 140, 0.9);
                color: #000;
                padding: 0.75rem 1.25rem;
                border-radius: 5px;
                font-weight: bold;
                transform: translateY(100%);
                opacity: 0;
                transition: transform 0.3s, opacity 0.3s;
                z-index: 9999;
            }
            
            .cart-notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .cart-notification span {
                margin-right: 0.5rem;
            }
            
            /* Hide dropdown by default */
            .hidden {
                display: none;
            }
            
            /* Mobile Styles */
            @media (max-width: 768px) {
                .cart-dropdown {
                    width: 280px;
                    right: -10px;
                }
            }
        `;
        document.head.appendChild(cartStyles);
    }
    
    // Initialize the cart
    window.shoppingCart = new ShoppingCart();
    
    // Update add to cart buttons on products page
    document.querySelectorAll('.order-button').forEach(button => {
        button.classList.add('add-to-cart');
        
        // Change text if it's just "Order"
        if (button.textContent.trim() === 'Order') {
            button.textContent = 'Add to Cart';
        }
    });
}); 