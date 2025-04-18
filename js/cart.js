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

// Load cart items
document.addEventListener('DOMContentLoaded', () => {
    displayCartItems();
    updateCartSummary();
    
    if (checkoutItemsContainer) {
        displayCheckoutItems();
        updateCheckoutSummary();
    }
});

// Display cart items
function displayCartItems() {
    if (!cartItemsContainer) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty!</h2>
                <p>You have no items in your shopping cart.</p>
                <a href="products.html" class="btn">Continue Shopping</a>
            </div>
        `;
        cartItemCount.textContent = '0 items';
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    cartItemCount.textContent = `${cart.reduce((total, item) => total + item.quantity, 0)} items`;
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image-container">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                ${item.color ? `<p class="cart-item-color">Color: ${item.color}</p>` : ''}
                ${item.size ? `<p class="cart-item-size">Size: ${item.size}</p>` : ''}
                <p class="cart-item-price">TZS ${item.price.toLocaleString()}</p>
                <div class="cart-item-actions">
                    <span class="remove-item" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">Remove</span>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="${item.stock}" class="quantity-input" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">
                    <button class="quantity-btn plus" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                <p class="cart-item-total-price">TZS ${(item.price * item.quantity).toLocaleString()}</p>
                ${item.originalPrice > item.price ? 
                    `<p class="cart-item-save">You save TZS ${((item.originalPrice - item.price) * item.quantity).toLocaleString()}</p>` : ''}
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const color = btn.dataset.color;
            const size = btn.dataset.size;
            removeFromCart(id, color, size);
        });
    });
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const color = btn.dataset.color;
            const size = btn.dataset.size;
            updateCartItemQuantity(id, color, size, -1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const color = btn.dataset.color;
            const size = btn.dataset.size;
            updateCartItemQuantity(id, color, size, 1);
        });
    });
    
    // Add event listeners to quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = parseInt(input.dataset.id);
            const color = input.dataset.color;
            const size = input.dataset.size;
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
            window.location.href = 'checkout.html';
        });
    }
}

// Display checkout items
function displayCheckoutItems() {
    if (!checkoutItemsContainer) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    checkoutItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'summary-item';
        checkoutItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="summary-item-image">
            <div class="summary-item-details">
                <h4 class="summary-item-title">${item.name}</h4>
                <p class="summary-item-price">TZS ${item.price.toLocaleString()}</p>
                ${item.color ? `<p class="summary-item-quantity">Color: ${item.color}</p>` : ''}
                ${item.size ? `<p class="summary-item-quantity">Size: ${item.size}</p>` : ''}
                <p class="summary-item-quantity">Qty: ${item.quantity}</p>
            </div>
        `;
        
        checkoutItemsContainer.appendChild(checkoutItem);
    });
}

// Update cart summary
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const delivery = subtotal > 100000 ? 0 : 10000;
    const discount = 0; // Will be calculated when applying coupons
    const total = subtotal + delivery - discount;
    
    cartSubtotal.textContent = `TZS ${subtotal.toLocaleString()}`;
    deliveryCharge.textContent = `TZS ${delivery.toLocaleString()}`;
    cartDiscount.textContent = `-TZS ${discount.toLocaleString()}`;
    cartTotal.textContent = `TZS ${total.toLocaleString()}`;
}

// Update checkout summary
function updateCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const delivery = subtotal > 100000 ? 0 : 10000;
    const discount = 0; // Will be calculated when applying coupons
    const total = subtotal + delivery - discount;
    
    checkoutSubtotal.textContent = `TZS ${subtotal.toLocaleString()}`;
    checkoutDelivery.textContent = `TZS ${delivery.toLocaleString()}`;
    checkoutDiscount.textContent = `-TZS ${discount.toLocaleString()}`;
    checkoutTotal.textContent = `TZS ${total.toLocaleString()}`;
}

// Remove item from cart
function removeFromCart(id, color, size) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart = cart.filter(
        item => !(item.id === id && item.color === color && item.size === size)
    );
    
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartSummary();
    
    if (checkoutItemsContainer) {
        displayCheckoutItems();
        updateCheckoutSummary();
    }
    
    // Update cart count in header
    updateCartCount();
    
    // Show notification
    showNotification('Item removed from cart');
}

// Update item quantity in cart
function updateCartItemQuantity(id, color, size, change, newQuantity = null) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const itemIndex = cart.findIndex(
        item => item.id === id && item.color === color && item.size === size
    );
    
    if (itemIndex >= 0) {
        if (newQuantity !== null) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            cart[itemIndex].quantity += change;
        }
        
        // Remove if quantity is 0 or less
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartSummary();
    
    if (checkoutItemsContainer) {
        displayCheckoutItems();
        updateCheckoutSummary();
    }
    
    // Update cart count in header
    updateCartCount();
}

// Apply coupon code
if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', applyCoupon);
}

if (couponCodeInput) {
    couponCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyCoupon();
        }
    });
}

availableCoupons.forEach(coupon => {
    coupon.addEventListener('click', () => {
        couponCodeInput.value = coupon.dataset.code;
        applyCoupon();
    });
});

function applyCoupon() {
    const couponCode = couponCodeInput.value.trim();
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    let discount = 0;
    let message = '';
    
    switch (couponCode.toUpperCase()) {
        case 'WELCOME10':
            discount = subtotal * 0.1;
            message = '10% discount applied!';
            break;
        case 'FREESHIP':
            discount = subtotal > 100000 ? 0 : 10000;
            message = 'Free delivery applied!';
            break;
        case 'SAVE20':
            if (subtotal >= 100000) {
                discount = subtotal * 0.2;
                message = '20% discount applied!';
            } else {
                message = 'Coupon requires minimum purchase of TZS 100,000';
            }
            break;
        default:
            message = 'Invalid coupon code';
    }
    
    if (discount > 0) {
        cartDiscount.textContent = `-TZS ${discount.toLocaleString()}`;
        checkoutDiscount.textContent = `-TZS ${discount.toLocaleString()}`;
        
        const delivery = subtotal > 100000 ? 0 : 10000;
        const total = subtotal + delivery - discount;
        
        cartTotal.textContent = `TZS ${total.toLocaleString()}`;
        checkoutTotal.textContent = `TZS ${total.toLocaleString()}`;
    }
    
    showNotification(message);
}

// Show notification
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

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = totalItems;
    });
}