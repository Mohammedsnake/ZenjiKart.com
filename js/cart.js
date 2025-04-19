// =============================================
// CART AND CHECKOUT FUNCTIONALITY
// =============================================

// DOM Elements
const cartItemsContainer = document.getElementById('cart-items');
const cartSubtotal = document.getElementById('cart-subtotal');
const deliveryCharge = document.getElementById('delivery-charge');
const cartDiscount = document.getElementById('cart-discount');
const cartTotal = document.getElementById('cart-total');
const cartItemCount = document.getElementById('cart-item-count');
const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout');
const checkoutItemsContainer = document.getElementById('checkout-items');
const checkoutSubtotal = document.getElementById('checkout-subtotal');
const checkoutDelivery = document.getElementById('checkout-delivery');
const checkoutDiscount = document.getElementById('checkout-discount');
const checkoutTotal = document.getElementById('checkout-total');
const applyCouponBtn = document.getElementById('apply-coupon');
const couponCodeInput = document.getElementById('coupon-code');
const availableCoupons = document.querySelectorAll('.available-coupons li');

// Global cart variable
let cart = [];

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Initialize UI
    displayCartItems();
    updateCartSummary();
    updateCartCount();
    
    // If on checkout page
    if (checkoutItemsContainer) {
        displayCheckoutItems();
        updateCheckoutSummary();
    }
    
    // Setup coupon functionality
    setupCoupons();
});

// =============================================
// CART DISPLAY FUNCTIONS
// =============================================

function displayCartItems() {
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    cartItemCount.textContent = `${getTotalItems()} items`;
    
    cart.forEach(item => {
        const product = getProductById(item.id);
        if (!product) return;
        
        cartItemsContainer.appendChild(createCartItemElement(item, product));
    });
    
    setupCartItemEventListeners();
}

function displayCheckoutItems() {
    if (!checkoutItemsContainer) return;
    
    checkoutItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    cart.forEach(item => {
        const product = getProductById(item.id);
        if (!product) return;
        
        checkoutItemsContainer.appendChild(createCheckoutItemElement(item, product));
    });
}

// =============================================
// CART ITEM ELEMENT CREATION
// =============================================

function createCartItemElement(item, product) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
        <div class="cart-item-image-container">
            <img src="${item.image || product.images[0]}" alt="${item.name}" class="cart-item-image">
        </div>
        <div class="cart-item-details">
            <h3 class="cart-item-title">${item.name}</h3>
            ${item.color ? `<p class="cart-item-color">Color: ${item.color}</p>` : ''}
            ${item.size ? `<p class="cart-item-size">Size: ${item.size}</p>` : ''}
            <p class="cart-item-price">TZS ${item.price.toLocaleString()}</p>
            <div class="cart-item-actions">
                <span class="remove-item" data-id="${item.id}" data-color="${item.color || ''}" data-size="${item.size || ''}">Remove</span>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}" data-color="${item.color || ''}" data-size="${item.size || ''}">-</button>
                <input type="number" value="${item.quantity}" min="1" max="${item.stock || 10}" class="quantity-input" 
                       data-id="${item.id}" data-color="${item.color || ''}" data-size="${item.size || ''}">
                <button class="quantity-btn plus" data-id="${item.id}" data-color="${item.color || ''}" data-size="${item.size || ''}">+</button>
            </div>
        </div>
        <div class="cart-item-total">
            <p class="cart-item-total-price">TZS ${(item.price * item.quantity).toLocaleString()}</p>
            ${item.originalPrice > item.price ? 
                `<p class="cart-item-save">You save TZS ${((item.originalPrice - item.price) * item.quantity).toLocaleString()}</p>` : ''}
        </div>
    `;
    return cartItem;
}

function createCheckoutItemElement(item, product) {
    const checkoutItem = document.createElement('div');
    checkoutItem.className = 'summary-item';
    checkoutItem.innerHTML = `
        <img src="${item.image || product.images[0]}" alt="${item.name}" class="summary-item-image">
        <div class="summary-item-details">
            <h4 class="summary-item-title">${item.name}</h4>
            <p class="summary-item-price">TZS ${item.price.toLocaleString()}</p>
            ${item.color ? `<p class="summary-item-quantity">Color: ${item.color}</p>` : ''}
            ${item.size ? `<p class="summary-item-quantity">Size: ${item.size}</p>` : ''}
            <p class="summary-item-quantity">Qty: ${item.quantity}</p>
        </div>
    `;
    return checkoutItem;
}

// =============================================
// CART MANAGEMENT FUNCTIONS
// =============================================

function updateCartItemQuantity(id, color, size, change, newQuantity = null) {
    const itemIndex = findCartItemIndex(id, color, size);
    
    if (itemIndex >= 0) {
        if (newQuantity !== null) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            cart[itemIndex].quantity += change;
        }
        
        // Remove if quantity is 0 or less
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
            showNotification('Item removed from cart');
        }
        
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(id, color, size) {
    const itemIndex = findCartItemIndex(id, color, size);
    
    if (itemIndex >= 0) {
        cart.splice(itemIndex, 1);
        saveCart();
        updateCartUI();
        showNotification('Item removed from cart');
    }
}

// =============================================
// CART CALCULATION FUNCTIONS
// =============================================

function updateCartSummary() {
    const subtotal = calculateSubtotal();
    const delivery = calculateDelivery(subtotal);
    const discount = calculateDiscount();
    const total = subtotal + delivery - discount;
    
    if (cartSubtotal) cartSubtotal.textContent = `TZS ${subtotal.toLocaleString()}`;
    if (deliveryCharge) deliveryCharge.textContent = `TZS ${delivery.toLocaleString()}`;
    if (cartDiscount) cartDiscount.textContent = `-TZS ${discount.toLocaleString()}`;
    if (cartTotal) cartTotal.textContent = `TZS ${total.toLocaleString()}`;
}

function updateCheckoutSummary() {
    const subtotal = calculateSubtotal();
    const delivery = calculateDelivery(subtotal);
    const discount = calculateDiscount();
    const total = subtotal + delivery - discount;
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = `TZS ${subtotal.toLocaleString()}`;
    if (checkoutDelivery) checkoutDelivery.textContent = `TZS ${delivery.toLocaleString()}`;
    if (checkoutDiscount) checkoutDiscount.textContent = `-TZS ${discount.toLocaleString()}`;
    if (checkoutTotal) checkoutTotal.textContent = `TZS ${total.toLocaleString()}`;
}

function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateDelivery(subtotal) {
    return subtotal > 100000 ? 0 : 10000;
}

function calculateDiscount() {
    // Check for active coupon in localStorage
    const activeCoupon = localStorage.getItem('activeCoupon');
    if (!activeCoupon) return 0;
    
    const subtotal = calculateSubtotal();
    
    switch (activeCoupon) {
        case 'WELCOME10':
            return subtotal * 0.1;
        case 'FREESHIP':
            return calculateDelivery(subtotal);
        case 'SAVE20':
            return subtotal >= 100000 ? subtotal * 0.2 : 0;
        default:
            return 0;
    }
}

function getTotalItems() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// =============================================
// COUPON FUNCTIONALITY
// =============================================

function setupCoupons() {
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
    
    if (couponCodeInput) {
        couponCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyCoupon();
        });
    }
    
    if (availableCoupons.length > 0) {
        availableCoupons.forEach(coupon => {
            coupon.addEventListener('click', () => {
                couponCodeInput.value = coupon.dataset.code;
                applyCoupon();
            });
        });
    }
}

function applyCoupon() {
    if (!couponCodeInput) return;
    
    const couponCode = couponCodeInput.value.trim().toUpperCase();
    const subtotal = calculateSubtotal();
    let discount = 0;
    let message = '';
    
    switch (couponCode) {
        case 'WELCOME10':
            discount = subtotal * 0.1;
            message = '10% discount applied!';
            localStorage.setItem('activeCoupon', 'WELCOME10');
            break;
        case 'FREESHIP':
            discount = calculateDelivery(subtotal);
            message = 'Free delivery applied!';
            localStorage.setItem('activeCoupon', 'FREESHIP');
            break;
        case 'SAVE20':
            if (subtotal >= 100000) {
                discount = subtotal * 0.2;
                message = '20% discount applied!';
                localStorage.setItem('activeCoupon', 'SAVE20');
            } else {
                message = 'Coupon requires minimum purchase of TZS 100,000';
            }
            break;
        default:
            message = 'Invalid coupon code';
            localStorage.removeItem('activeCoupon');
    }
    
    if (discount > 0) {
        if (cartDiscount) cartDiscount.textContent = `-TZS ${discount.toLocaleString()}`;
        if (checkoutDiscount) checkoutDiscount.textContent = `-TZS ${discount.toLocaleString()}`;
        
        const delivery = calculateDelivery(subtotal);
        const total = subtotal + delivery - discount;
        
        if (cartTotal) cartTotal.textContent = `TZS ${total.toLocaleString()}`;
        if (checkoutTotal) checkoutTotal.textContent = `TZS ${total.toLocaleString()}`;
    }
    
    showNotification(message);
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function showEmptyCart() {
    cartItemsContainer.innerHTML = `
        <div class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <h2>Your cart is empty!</h2>
            <p>You have no items in your shopping cart.</p>
            <a href="products.html" class="btn">Continue Shopping</a>
        </div>
    `;
    cartItemCount.textContent = '0 items';
}

function setupCartItemEventListeners() {
    // Remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const color = btn.dataset.color || null;
            const size = btn.dataset.size || null;
            removeFromCart(id, color, size);
        });
    });
    
    // Quantity minus buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const color = btn.dataset.color || null;
            const size = btn.dataset.size || null;
            updateCartItemQuantity(id, color, size, -1);
        });
    });
    
    // Quantity plus buttons
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const color = btn.dataset.color || null;
            const size = btn.dataset.size || null;
            updateCartItemQuantity(id, color, size, 1);
        });
    });
    
    // Quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = parseInt(input.dataset.id);
            const color = input.dataset.color || null;
            const size = input.dataset.size || null;
            const newQuantity = parseInt(input.value);
            
            if (newQuantity > 0) {
                updateCartItemQuantity(id, color, size, 0, newQuantity);
            } else {
                input.value = 1;
            }
        });
    });
    
    // Proceed to checkout button
    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                showNotification('Your cart is empty!');
            }
        });
    }
}

function findCartItemIndex(id, color, size) {
    return cart.findIndex(
        item => item.id === id && 
               (item.color || null) === (color || null) && 
               (item.size || null) === (size || null)
    );
}

function getProductById(id) {
    // This assumes products are loaded from products.json
    // If you have issues here, make sure products are properly loaded
    return window.products ? window.products.find(p => p.id === id) : null;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = getTotalItems();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

function updateCartUI() {
    displayCartItems();
    updateCartSummary();
    updateCartCount();
    
    if (checkoutItemsContainer) {
        displayCheckoutItems();
        updateCheckoutSummary();
    }
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

// =============================================
// PUBLIC API
// =============================================

// Expose these functions to other scripts if needed
window.cartFunctions = {
    addToCart: function(productId, color = null, size = null, quantity = 1, redirectToCheckout = false) {
        const product = getProductById(productId);
        if (!product) {
            showNotification('Product not found');
            return;
        }
        
        const itemIndex = findCartItemIndex(productId, color, size);
        
        if (itemIndex >= 0) {
            // Update quantity if item exists
            cart[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                image: product.images[0],
                color,
                size,
                quantity,
                stock: product.stock || 10
            });
        }
        
        saveCart();
        updateCartUI();
        showNotification(`${product.name} added to cart`);
        
        if (redirectToCheckout && cart.length > 0) {
            window.location.href = 'checkout.html';
        }
    },
    getCart: function() {
        return [...cart];
    },
    clearCart: function() {
        cart = [];
        saveCart();
        updateCartUI();
    }
};