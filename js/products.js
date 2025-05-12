document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const productGrid = document.querySelector('.product-grid');
    const productCards = document.querySelectorAll('.product-card');
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    const materialCheckboxes = document.querySelectorAll('.material-filter');
    const ratingCheckboxes = document.querySelectorAll('.rating-filter');
    const priceRange = document.getElementById('price-range');
    const priceDisplay = document.getElementById('price-display');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const sortSelect = document.getElementById('sort-by');
    const productCountElem = document.getElementById('product-count');
    const noResultsElem = document.getElementById('no-results');
    const viewButtons = document.querySelectorAll('.view-button');
    const quickViewTriggers = document.querySelectorAll('.quick-view-trigger');
    const quickViewModal = document.getElementById('quick-view-modal');
    const orderModal = document.getElementById('order-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Quick View Elements
    const quickViewMainImage = document.getElementById('quick-view-main-image');
    const quickViewTitle = document.getElementById('quick-view-title');
    const quickViewDesc = document.querySelector('.quick-view-description');
    const quickViewDetails = document.querySelector('.quick-view-details-list');
    const quickViewPrice = document.querySelector('.quick-view-price .price-amount');
    const quickViewId = document.querySelector('.quick-view-id span');
    const quickViewCategory = document.querySelector('.quick-view-category span');
    
    // Initialize price slider
    if (priceRange && priceDisplay) {
        priceRange.addEventListener('input', function() {
            const value = this.value;
            priceDisplay.textContent = `Up to $${value}`;
        });
    }

    // Event listeners for filters
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Event listener for sort
    if (sortSelect) {
        sortSelect.addEventListener('change', sortProducts);
    }
    
    // Event listeners for view toggle
    if (viewButtons) {
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                viewButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                if (this.classList.contains('grid-view')) {
                    productGrid.classList.remove('list-view-mode');
                } else {
                    productGrid.classList.add('list-view-mode');
                }
            });
        });
    }
    
    // Quick View functionality
    if (quickViewTriggers) {
        quickViewTriggers.forEach(trigger => {
            trigger.addEventListener('click', function() {
                const card = this.closest('.product-card');
                openQuickView(card);
            });
        });
    }
    
    // Thumbnail image functionality
    const thumbnails = document.querySelectorAll('.thumbnail');
    if (thumbnails) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const imgSrc = this.querySelector('img').src;
                if (quickViewMainImage) {
                    quickViewMainImage.src = imgSrc;
                }
            });
        });
    }
    
    // Quantity selector in quick view
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    if (quantityBtns) {
        quantityBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                let value = parseInt(input.value);
                
                if (this.classList.contains('decrease')) {
                    value = Math.max(1, value - 1);
                } else {
                    value = value + 1;
                }
                
                input.value = value;
            });
        });
    }
    
    // Close modal functionality
    if (closeModalButtons) {
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                }
            });
        });
    }
    
    // Close modal when clicking outside modal content
    if (quickViewModal) {
        quickViewModal.addEventListener('click', function(e) {
            if (e.target === quickViewModal) {
                quickViewModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (orderModal) {
        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                orderModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Order Modal functionality
    const orderButtons = document.querySelectorAll('.order-button');
    if (orderButtons) {
        orderButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (!e.target.classList.contains('add-to-cart')) {
                    e.preventDefault();
                    
                    const card = this.closest('.product-card');
                    const productName = card.querySelector('h3').textContent;
                    const orderProductInput = document.getElementById('order-product');
                    
                    if (orderProductInput) {
                        orderProductInput.value = productName;
                    }
                    
                    if (orderModal) {
                        orderModal.classList.remove('hidden');
                        document.body.style.overflow = 'hidden'; // Prevent scrolling
                    }
                }
            });
        });
    }
    
    // Wishlist functionality
    const wishlistButtons = document.querySelectorAll('.wishlist-button');
    if (wishlistButtons) {
        wishlistButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Toggle filled/unfilled heart
                const path = this.querySelector('path');
                if (path) {
                    if (this.classList.contains('wishlist-active')) {
                        this.classList.remove('wishlist-active');
                        this.style.color = '';
                    } else {
                        this.classList.add('wishlist-active');
                        this.style.color = '#ff6b6b';
                    }
                }
                
                // Show notification
                showNotification('Item added to wishlist!');
            });
        });
    }
    
    // Filter products based on selected criteria
    function applyFilters() {
        const selectedCategory = getSelectedCategory();
        const selectedMaterials = getSelectedMaterials();
        const selectedRatings = getSelectedRatings();
        const maxPrice = priceRange ? parseInt(priceRange.value) : 1000;
        
        let visibleCount = 0;
        
        productCards.forEach(card => {
            const category = card.dataset.category;
            const material = card.dataset.material;
            const price = parseInt(card.dataset.price || '0');
            const rating = parseFloat(card.dataset.rating || '0');
            
            const categoryMatch = selectedCategory === 'all' || category === selectedCategory;
            const materialMatch = selectedMaterials.length === 0 || 
                                selectedMaterials.includes(material) || 
                                (material === 'all' && selectedMaterials.length > 0);
            const priceMatch = price <= maxPrice;
            const ratingMatch = selectedRatings.length === 0 || 
                              selectedRatings.some(minRating => rating >= parseInt(minRating));
            
            if (categoryMatch && materialMatch && priceMatch && ratingMatch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        updateProductCount(visibleCount);
        checkNoResults(visibleCount);
    }
    
    // Get selected category
    function getSelectedCategory() {
        const selectedRadio = document.querySelector('input[name="category"]:checked');
        return selectedRadio ? selectedRadio.value : 'all';
    }
    
    // Get selected materials
    function getSelectedMaterials() {
        const materials = [];
        materialCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                materials.push(checkbox.value);
            }
        });
        return materials;
    }
    
    // Get selected minimum ratings
    function getSelectedRatings() {
        const ratings = [];
        ratingCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                ratings.push(checkbox.value);
            }
        });
        return ratings;
    }
    
    // Clear all filters
    function clearFilters() {
        // Reset category
        const allCategoryRadio = document.getElementById('cat-all');
        if (allCategoryRadio) {
            allCategoryRadio.checked = true;
        }
        
        // Reset materials
        materialCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset ratings
        ratingCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset price
        if (priceRange) {
            priceRange.value = priceRange.max;
            if (priceDisplay) {
                priceDisplay.textContent = `Up to $${priceRange.max}`;
            }
        }
        
        // Reset sort
        if (sortSelect) {
            sortSelect.value = 'featured';
        }
        
        // Show all products
        productCards.forEach(card => {
            card.style.display = 'flex';
        });
        
        updateProductCount(productCards.length);
        
        // Hide no results message
        if (noResultsElem) {
            noResultsElem.classList.add('hidden');
        }
    }
    
    // Sort products
    function sortProducts() {
        const sortBy = sortSelect ? sortSelect.value : 'featured';
        const cardsArray = Array.from(productCards);
        
        cardsArray.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseInt(a.dataset.price || '0') - parseInt(b.dataset.price || '0');
                case 'price-high':
                    return parseInt(b.dataset.price || '0') - parseInt(a.dataset.price || '0');
                case 'rating':
                    return parseFloat(b.dataset.rating || '0') - parseFloat(a.dataset.rating || '0');
                case 'newest':
                    return (b.dataset.date || '') - (a.dataset.date || '');
                default: // featured
                    return 0;
            }
        });
        
        // Reorder elements
        cardsArray.forEach(card => {
            productGrid.appendChild(card);
        });
    }
    
    // Update the product count display
    function updateProductCount(count) {
        if (productCountElem) {
            productCountElem.textContent = count;
        }
    }
    
    // Check if there are no visible products and show message
    function checkNoResults(visibleCount) {
        if (noResultsElem) {
            if (visibleCount === 0) {
                noResultsElem.classList.remove('hidden');
            } else {
                noResultsElem.classList.add('hidden');
            }
        }
    }
    
    // Open quick view modal
    function openQuickView(productCard) {
        if (!quickViewModal) return;
        
        // Get product details
        const title = productCard.querySelector('h3').textContent;
        const description = productCard.querySelector('.product-description').textContent;
        const price = productCard.querySelector('.price-amount').textContent;
        const imageSrc = productCard.querySelector('.product-image img').src;
        const id = productCard.dataset.id;
        const category = getCategoryName(productCard.dataset.category);
        
        // Get product details list
        const detailItems = productCard.querySelectorAll('.detail-item');
        let detailsHtml = '';
        
        detailItems.forEach(item => {
            detailsHtml += `<span class="detail-item">${item.textContent}</span>`;
        });
        
        // Update quick view modal with product details
        if (quickViewTitle) quickViewTitle.textContent = title;
        if (quickViewDesc) quickViewDesc.textContent = description;
        if (quickViewDetails) quickViewDetails.innerHTML = detailsHtml;
        if (quickViewPrice) quickViewPrice.textContent = '$' + price;
        if (quickViewMainImage) quickViewMainImage.src = imageSrc;
        if (quickViewId) quickViewId.textContent = id;
        if (quickViewCategory) quickViewCategory.textContent = category;
        
        // Set thumbnails with the same image for demo
        const thumbs = document.querySelectorAll('.thumbnail img');
        if (thumbs) {
            thumbs.forEach(thumb => {
                thumb.src = imageSrc;
            });
            
            // Set first thumbnail as active
            const firstThumb = document.querySelector('.thumbnail');
            if (firstThumb) {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                firstThumb.classList.add('active');
            }
        }
        
        // Show modal
        quickViewModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Get category name from code
    function getCategoryName(categoryCode) {
        const categories = {
            'printing': '3D Printing',
            'modeling': '3D Modeling',
            'finishing': 'Finishing Services',
            'materials': 'Materials',
            'all': 'All Categories'
        };
        
        return categories[categoryCode] || categoryCode;
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `<span>✓</span> ${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2500);
        }, 10);
    }
    
    // Order form submission handling
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitButton = orderForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;
            
            // Simulate order processing
            setTimeout(() => {
                // Success!
                orderForm.innerHTML = `
                    <div class="order-success">
                        <div class="success-icon">✓</div>
                        <h3>Order Successfully Placed!</h3>
                        <p>Your order number is <strong>PC-${Math.floor(Math.random() * 10000)}</strong></p>
                        <p>We'll contact you shortly with a confirmation and estimated time of completion.</p>
                        <button class="cyber-button" onclick="document.getElementById('order-modal').classList.add('hidden'); document.body.style.overflow = 'auto';">Close</button>
                    </div>
                `;
                
                // Add success styles
                const style = document.createElement('style');
                style.textContent = `
                    .order-success {
                        text-align: center;
                        padding: 2rem;
                    }
                    .success-icon {
                        width: 60px;
                        height: 60px;
                        background-color: rgba(0, 255, 140, 0.1);
                        border: 2px solid #00ff8c;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 1.5rem;
                        font-size: 2rem;
                        color: #00ff8c;
                    }
                `;
                document.head.appendChild(style);
                
            }, 2000);
        });
    }
    
    // Fix for the Add to Cart buttons
    document.querySelectorAll('.order-button').forEach(button => {
        if (button.textContent.trim() === 'Add to Cart') {
            button.classList.add('add-to-cart');
        }
    });
    
    // Quick Quote buttons functionality
    const quoteButtons = document.querySelectorAll('.quote-button');
    if (quoteButtons) {
        quoteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const card = this.closest('.product-card');
                const productName = card.querySelector('h3').textContent;
                
                showNotification(`Quote requested for ${productName}`);
            });
        });
    }
    
    // Initialize pagination (for demo only)
    const pageButtons = document.querySelectorAll('.page-button:not(.disabled)');
    if (pageButtons) {
        pageButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Only for demo - we're not actually paginating
                pageButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Scroll to top of products
                const productsMain = document.querySelector('.products-main');
                if (productsMain) {
                    productsMain.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}); 