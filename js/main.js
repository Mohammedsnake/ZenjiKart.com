// =============================================
// INITIALIZATION AND CORE FUNCTIONALITY
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('ZenjiKart initialized');
    
    // Initialize localStorage if empty
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // =============================================
    // MOBILE MENU FUNCTIONALITY
    // =============================================
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            mobileMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = mobileMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });

        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });

        // Close when clicking links
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    // =============================================
    // CART FUNCTIONALITY
    // =============================================
    
    updateCartCount();

    // =============================================
    // HERO SLIDER FUNCTIONALITY
    // =============================================
    
    const heroSlider = document.querySelector('.hero-slider');
    const slides = document.querySelectorAll('.slide');
    const prevSlideBtn = document.querySelector('.prev-slide');
    const nextSlideBtn = document.querySelector('.next-slide');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        const totalSlides = slides.length;

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        }

        // Auto slide change
        let slideInterval = setInterval(nextSlide, 5000);

        // Pause on hover
        heroSlider?.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        heroSlider?.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });

        // Manual controls
        nextSlideBtn?.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });

        prevSlideBtn?.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
    }

    // =============================================
    // DEAL TIMER FUNCTIONALITY
    // =============================================
    
    function updateDealTimer() {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const diff = endOfDay - now;
        
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const hoursEl = document.getElementById('deal-hours');
        const minsEl = document.getElementById('deal-minutes');
        const secsEl = document.getElementById('deal-seconds');
        
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minsEl) minsEl.textContent = minutes.toString().padStart(2, '0');
        if (secsEl) secsEl.textContent = seconds.toString().padStart(2, '0');
    }

    // Only run timer if elements exist
    if (document.getElementById('deal-hours')) {
        setInterval(updateDealTimer, 1000);
        updateDealTimer();
    }

    // =============================================
    // PRODUCT LOADING FUNCTIONALITY
    // =============================================
    
    let products = [];
    
    const featuredProductsGrid = document.getElementById('featured-products');
    const dealProductsGrid = document.getElementById('deal-products');
    const allProductsGrid = document.getElementById('all-products');
    const productDetailsContainer = document.querySelector('.product-details-container');
    const relatedProductsGrid = document.getElementById('related-products');
    
    // Show loading state
    if (featuredProductsGrid) featuredProductsGrid.innerHTML = '<div class="loading">Loading products...</div>';
    if (dealProductsGrid) dealProductsGrid.innerHTML = '<div class="loading">Loading deals...</div>';
    if (allProductsGrid) allProductsGrid.innerHTML = '<div class="loading">Loading products...</div>';
    
    fetch('data/products.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            products = data;
            
            if (featuredProductsGrid) displayFeaturedProducts();
            if (dealProductsGrid) displayDealProducts();
            
            // If on products page
            if (allProductsGrid) {
                displayAllProducts(products);
                setupProductFilters();
            }
            
            // If on product details page
            if (productDetailsContainer) {
                const productId = parseInt(new URLSearchParams(window.location.search).get('id'));
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    displayProductDetails(product);
                    if (relatedProductsGrid) displayRelatedProducts(product);
                } else {
                    productDetailsContainer.innerHTML = '<p class="error">Product not found</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
            const errorEl = document.createElement('div');
            errorEl.className = 'error';
            errorEl.textContent = 'Failed to load products. Please try again later.';
            
            if (featuredProductsGrid) featuredProductsGrid.innerHTML = '';
            if (dealProductsGrid) dealProductsGrid.innerHTML = '';
            if (allProductsGrid) allProductsGrid.innerHTML = '';
            
            [featuredProductsGrid, dealProductsGrid, allProductsGrid].forEach(el => {
                if (el) el.appendChild(errorEl.cloneNode(true));
            });
        });

    // =============================================
    // SEARCH FUNCTIONALITY
    // =============================================
    
    const searchBox = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    
    if (searchBtn && searchBox) {
        searchBtn.addEventListener('click', () => performSearch(searchBox.value));
        searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch(searchBox.value);
        });
    }
});

// =============================================
// PRODUCT DISPLAY FUNCTIONS
// =============================================

function displayFeaturedProducts() {
    const featuredProductsGrid = document.getElementById('featured-products');
    if (!featuredProductsGrid) return;
    
    const featuredProducts = products.filter(product => product.isFeatured);
    featuredProductsGrid.innerHTML = '';
    
    if (featuredProducts.length === 0) {
        featuredProductsGrid.innerHTML = '<p class="no-products">No featured products found</p>';
        return;
    }
    
    featuredProducts.slice(0, 4).forEach(product => {
        featuredProductsGrid.appendChild(createProductCard(product));
    });
}

function displayDealProducts() {
    const dealProductsGrid = document.getElementById('deal-products');
    if (!dealProductsGrid) return;
    
    const dealProducts = products.filter(product => product.isDeal);
    dealProductsGrid.innerHTML = '';
    
    if (dealProducts.length === 0) {
        dealProductsGrid.innerHTML = '<p class="no-products">No deals available</p>';
        return;
    }
    
    dealProducts.slice(0, 4).forEach(product => {
        dealProductsGrid.appendChild(createProductCard(product));
    });
}

function displayAllProducts(productsToDisplay) {
    const allProductsGrid = document.getElementById('all-products');
    if (!allProductsGrid) return;
    
    allProductsGrid.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        allProductsGrid.innerHTML = '<p class="no-products">No products match your criteria</p>';
        return;
    }
    
    productsToDisplay.forEach(product => {
        allProductsGrid.appendChild(createProductCard(product));
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        ${product.discount > 0 ? `<div class="product-badge">${product.discount}% OFF</div>` : ''}
        <div class="product-image">
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
                <div class="stars">
                    ${getStarRating(product.rating)}
                </div>
                <span class="rating-count">(${product.reviews.length})</span>
            </div>
            <div class="product-price">
                <span class="current-price">TZS ${product.price.toLocaleString()}</span>
                ${product.originalPrice > product.price ? 
                    `<span class="original-price">TZS ${product.originalPrice.toLocaleString()}</span>
                     <span class="discount-percent">${product.discount}% off</span>` : ''}
            </div>
            <div class="product-actions">
                <button class="btn add-to-cart" data-id="${product.id}">ADD TO CART</button>
                <button class="wishlist-btn"><i class="far fa-heart"></i></button>
            </div>
        </div>
    `;
    
    // Product click handler
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.add-to-cart') && !e.target.closest('.wishlist-btn')) {
            window.location.href = `product-details.html?id=${product.id}`;
        }
    });
    
    // Add to cart button
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product.id);
    });
    
    // Wishlist button
    const wishlistBtn = card.querySelector('.wishlist-btn');
    wishlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        wishlistBtn.classList.toggle('active');
        wishlistBtn.innerHTML = wishlistBtn.classList.contains('active') ? 
            '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    });
    
    return card;
}

// =============================================
// PRODUCT DETAILS PAGE FUNCTIONS
// =============================================

function displayProductDetails(product) {
    document.title = `${product.name} - ZenjiKart`;
    
    // Update breadcrumb
    const categoryBreadcrumb = document.getElementById('product-category-breadcrumb');
    const nameBreadcrumb = document.getElementById('product-name-breadcrumb');
    if (categoryBreadcrumb) categoryBreadcrumb.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    if (nameBreadcrumb) nameBreadcrumb.textContent = product.name;
    
    // Main image
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = product.images[0];
        mainImage.alt = product.name;
    }
    
    // Thumbnails
    const thumbnailsContainer = document.getElementById('thumbnail-images');
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
        
        product.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.alt = `${product.name} ${index + 1}`;
            thumbnail.addEventListener('click', () => {
                if (mainImage) mainImage.src = image;
                document.querySelectorAll('.thumbnail-images img').forEach(img => img.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            
            if (index === 0) thumbnail.classList.add('active');
            thumbnailsContainer.appendChild(thumbnail);
        });
    }
    
    // Product info
    const productTitle = document.getElementById('product-title');
    if (productTitle) productTitle.textContent = product.name;
    
    const ratingContainer = document.querySelector('.product-rating .stars');
    if (ratingContainer) {
        ratingContainer.innerHTML = getStarRating(product.rating);
        const ratingCount = document.querySelector('.rating-count');
        if (ratingCount) ratingCount.textContent = `(${product.reviews.length} reviews)`;
    }
    
    const priceEl = document.getElementById('product-price');
    const originalPriceEl = document.getElementById('original-price');
    const discountEl = document.getElementById('discount-percent');
    
    if (priceEl) priceEl.textContent = `TZS ${product.price.toLocaleString()}`;
    if (originalPriceEl) originalPriceEl.textContent = `TZS ${product.originalPrice.toLocaleString()}`;
    if (discountEl) discountEl.textContent = `${product.discount}% off`;
    
    // Color options
    const colorOptions = document.getElementById('color-options');
    if (colorOptions) {
        colorOptions.innerHTML = '';
        
        product.colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = getColorCode(color);
            colorOption.title = color;
            colorOption.dataset.color = color;
            
            colorOption.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                colorOption.classList.add('active');
            });
            
            if (color.toLowerCase().includes('black')) {
                colorOption.classList.add('active');
            }
            
            colorOptions.appendChild(colorOption);
        });
    }
    
    // Size options
    const sizeOptions = document.getElementById('size-options');
    if (sizeOptions) {
        sizeOptions.innerHTML = '';
        
        product.sizes.forEach(size => {
            const sizeOption = document.createElement('div');
            sizeOption.className = 'size-option';
            sizeOption.textContent = size;
            sizeOption.dataset.size = size;
            
            sizeOption.addEventListener('click', () => {
                document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('active'));
                sizeOption.classList.add('active');
            });
            
            if (size === product.sizes[0]) {
                sizeOption.classList.add('active');
            }
            
            sizeOptions.appendChild(sizeOption);
        });
    }
    
    // Quantity selector
    const quantityInput = document.getElementById('product-quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    
    if (quantityInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', () => {
            if (parseInt(quantityInput.value) > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });
        
        plusBtn.addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
    }
    
    // Add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const selectedColor = document.querySelector('.color-option.active')?.dataset.color || null;
            const selectedSize = document.querySelector('.size-option.active')?.dataset.size || null;
            const quantity = parseInt(quantityInput?.value || 1);
            
            addToCart(product.id, selectedColor, selectedSize, quantity);
        });
    }
    
    // Buy now button
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            const selectedColor = document.querySelector('.color-option.active')?.dataset.color || null;
            const selectedSize = document.querySelector('.size-option.active')?.dataset.size || null;
            const quantity = parseInt(quantityInput?.value || 1);
            
            addToCart(product.id, selectedColor, selectedSize, quantity, true);
        });
    }
    
    // Wishlist button
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            wishlistBtn.classList.toggle('active');
            wishlistBtn.innerHTML = wishlistBtn.classList.contains('active') ? 
                '<i class="fas fa-heart"></i> WISHLIST' : '<i class="far fa-heart"></i> WISHLIST';
        });
    }
    
    // Product description
    const descriptionEl = document.getElementById('product-description');
    if (descriptionEl) descriptionEl.textContent = product.description;
    
    // Product specifications
    const specsTable = document.getElementById('product-specifications');
    if (specsTable) {
        specsTable.innerHTML = '';
        
        for (const [key, value] of Object.entries(product.specifications)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${key}</td>
                <td>${value}</td>
            `;
            specsTable.appendChild(row);
        }
    }
    
    // Product reviews
    const reviewsContainer = document.getElementById('product-reviews');
    if (reviewsContainer) {
        reviewsContainer.innerHTML = '';
        
        product.reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            reviewCard.innerHTML = `
                <div class="review-header">
                    <span class="review-user">${review.user}</span>
                    <div class="review-rating">
                        ${getStarRating(review.rating)}
                    </div>
                </div>
                <h4 class="review-title">${review.title}</h4>
                <p class="review-comment">${review.comment}</p>
            `;
            reviewsContainer.appendChild(reviewCard);
        });
    }
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabName)?.classList.add('active');
        });
    });
}

function displayRelatedProducts(currentProduct) {
    const relatedProductsGrid = document.getElementById('related-products');
    if (!relatedProductsGrid) return;
    
    const relatedProducts = products.filter(
        product => product.category === currentProduct.category && product.id !== currentProduct.id
    ).slice(0, 4);
    
    relatedProductsGrid.innerHTML = '';
    
    if (relatedProducts.length === 0) {
        relatedProductsGrid.innerHTML = '<p>No related products found</p>';
        return;
    }
    
    relatedProducts.forEach(product => {
        relatedProductsGrid.appendChild(createProductCard(product));
    });
}

// =============================================
// PRODUCT FILTERING AND SORTING
// =============================================

function setupProductFilters() {
    const sortBySelect = document.getElementById('sort-by');
    const priceSlider = document.getElementById('price-slider');
    const maxPriceDisplay = document.getElementById('max-price');
    const categoryLinks = document.querySelectorAll('[data-category]');
    const brandLinks = document.querySelectorAll('[data-brand]');
    
    if (sortBySelect) {
        sortBySelect.addEventListener('change', filterProducts);
    }
    
    if (priceSlider && maxPriceDisplay) {
        priceSlider.addEventListener('input', () => {
            maxPriceDisplay.textContent = parseInt(priceSlider.value).toLocaleString();
            filterProducts();
        });
    }
    
    if (categoryLinks.length > 0) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                categoryLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                filterProducts();
            });
        });
    }
    
    if (brandLinks.length > 0) {
        brandLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                brandLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                filterProducts();
            });
        });
    }
}

function filterProducts() {
    const sortBySelect = document.getElementById('sort-by');
    const priceSlider = document.getElementById('price-slider');
    const activeCategory = document.querySelector('[data-category].active');
    const activeBrand = document.querySelector('[data-brand].active');
    
    let filteredProducts = [...products];
    
    // Filter by category
    if (activeCategory && activeCategory.dataset.category !== 'all') {
        filteredProducts = filteredProducts.filter(
            product => product.category === activeCategory.dataset.category
        );
    }
    
    // Filter by brand
    if (activeBrand && activeBrand.dataset.brand !== 'all') {
        filteredProducts = filteredProducts.filter(
            product => product.brand === activeBrand.dataset.brand
        );
    }
    
    // Filter by price
    if (priceSlider) {
        const maxPrice = parseInt(priceSlider.value);
        filteredProducts = filteredProducts.filter(
            product => product.price <= maxPrice
        );
    }
    
    // Sort products
    if (sortBySelect) {
        const sortBy = sortBySelect.value;
        switch (sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'popularity':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                filteredProducts.sort((a, b) => b.id - a.id);
                break;
            default:
                // Default sorting (by ID)
                filteredProducts.sort((a, b) => a.id - b.id);
                break;
        }
    }
    
    displayAllProducts(filteredProducts);
}

// =============================================
// CART AND CHECKOUT FUNCTIONS
// =============================================

function addToCart(productId, color = null, size = null, quantity = 1, redirectToCheckout = false) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found');
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(
        item => item.id === productId && item.color === color && item.size === size
    );
    
    if (existingItemIndex >= 0) {
        // Update quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images[0],
            color,
            size,
            quantity,
            stock: product.stock
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    showNotification(`${product.name} added to cart`);
    
    if (redirectToCheckout) {
        window.location.href = 'checkout.html';
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = totalItems;
    });
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function getStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

function getColorCode(colorName) {
    const colors = {
        'black': '#000000',
        'phantom black': '#000000',
        'space black': '#000000',
        'white': '#ffffff',
        'cream': '#f5f5dc',
        'green': '#008000',
        'lavender': '#e6e6fa',
        'blue': '#0000ff',
        'red': '#ff0000',
        'silver': '#c0c0c0',
        'gold': '#ffd700',
        'deep purple': '#663399',
        'empire red': '#cc0000',
        'pistachio': '#93c572'
    };
    
    return colors[colorName.toLowerCase()] || '#cccccc';
}

function performSearch(query) {
    if (!query.trim()) return;
    
    // In a real implementation, you would:
    // 1. Redirect to search results page with query parameter
    // 2. Or filter products on the current page
    console.log('Searching for:', query);
    showNotification(`Search results for: ${query}`);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}