// Global variables
let menuItems = [];
let cart = [];
let currentCategory = 'all-day';
let currentSubCategory = 'STARTERS';
let currentItem = null;
let currentQuantity = 1;
let currentComments = '';
let deliveryLocation = 'Room';

// DOM elements
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const closeCartModal = document.getElementById('closeCartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartItemCount = document.getElementById('cartItemCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTax = document.getElementById('cartTax');
const cartTotalModal = document.getElementById('cartTotalModal');
const continueShopping = document.getElementById('continueShopping');
const checkoutBtn = document.getElementById('checkoutBtn');

const itemModal = document.getElementById('itemModal');
const closeItemModal = document.getElementById('closeItemModal');
const itemModalTitle = document.getElementById('itemModalTitle');
const itemModalPrice = document.getElementById('itemModalPrice');
const itemComments = document.getElementById('itemComments');
const charCount = document.getElementById('charCount');
const quantityDisplay = document.getElementById('quantityDisplay');
const decreaseQuantity = document.getElementById('decreaseQuantity');
const increaseQuantity = document.getElementById('increaseQuantity');
const itemTotalPrice = document.getElementById('itemTotalPrice');
const addToCartBtn = document.getElementById('addToCartBtn');

const checkoutModal = document.getElementById('checkoutModal');
const checkoutItems = document.getElementById('checkoutItems');
const checkoutSubtotal = document.getElementById('checkoutSubtotal');
const checkoutTax = document.getElementById('checkoutTax');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutForm = document.getElementById('checkoutForm');

const confirmationModal = document.getElementById('confirmationModal');
const closeConfirmationModal = document.getElementById('closeConfirmationModal');
const orderNumber = document.getElementById('orderNumber');
const deliveryTo = document.getElementById('deliveryTo');
const estimatedDelivery = document.getElementById('estimatedDelivery');
const okBtn = document.getElementById('okBtn');

const menuContainer = document.getElementById('menuContainer');
const secondaryNav = document.getElementById('secondaryNav');
const deliveryLocationSpan = document.getElementById('deliveryLocation');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadMenu();
    setupEventListeners();
    updateCartSummary();
    
    // Set delivery location from URL
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 2) {
        const location = pathParts[2];
        setDeliveryLocation(location);
    }
});

// Load menu from API
async function loadMenu() {
    try {
        const response = await fetch('/api/menu');
        menuItems = await response.json();
        renderMenu();
        setupSecondaryNavigation();
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Primary navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderMenu();
            setupSecondaryNavigation();
        });
    });

    // Cart modal
    cartIcon.addEventListener('click', () => openModal(cartModal));
    closeCartModal.addEventListener('click', () => closeModal(cartModal));
    continueShopping.addEventListener('click', () => closeModal(cartModal));
    checkoutBtn.addEventListener('click', () => {
        closeModal(cartModal);
        openCheckoutModal();
    });

    // Item modal
    closeItemModal.addEventListener('click', () => closeModal(itemModal));
    
    // Quantity controls
    decreaseQuantity.addEventListener('click', () => {
        if (currentQuantity > 1) {
            currentQuantity--;
            updateQuantityDisplay();
        }
    });
    
    increaseQuantity.addEventListener('click', () => {
        currentQuantity++;
        updateQuantityDisplay();
    });

    // Comments
    itemComments.addEventListener('input', (e) => {
        currentComments = e.target.value;
        charCount.textContent = e.target.value.length;
    });

    // Add to cart
    addToCartBtn.addEventListener('click', addItemToCart);

    // Checkout form
    checkoutForm.addEventListener('submit', submitOrder);

    // Confirmation modal
    closeConfirmationModal.addEventListener('click', () => closeModal(confirmationModal));
    okBtn.addEventListener('click', () => {
        closeModal(confirmationModal);
        window.location.reload();
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

// Setup secondary navigation
function setupSecondaryNavigation() {
    const categories = [...new Set(menuItems.map(item => item.category))];
    
    secondaryNav.innerHTML = categories.map(category => 
        `<button class="nav-btn ${category === currentSubCategory ? 'active' : ''}" data-category="${category}">${category}</button>`
    ).join('');

    secondaryNav.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            secondaryNav.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentSubCategory = e.target.dataset.category;
            renderMenu();
        });
    });
}

// Render menu items
function renderMenu() {
    const filteredItems = menuItems.filter(item => {
        if (currentCategory === 'all-day') {
            return item.category === currentSubCategory;
        }
        // For breakfast and beverages, you would filter differently
        return item.category === currentSubCategory;
    });

    const sections = {};
    filteredItems.forEach(item => {
        if (!sections[item.category]) {
            sections[item.category] = [];
        }
        sections[item.category].push(item);
    });

    menuContainer.innerHTML = Object.entries(sections).map(([category, items]) => `
        <div class="menu-section">
            <h2 class="section-title">${category}</h2>
            <div class="menu-grid">
                ${items.map(item => `
                    <div class="menu-item" data-item-id="${item.id}">
                        <div class="item-header">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">$${item.price.toFixed(2)}</div>
                        </div>
                        ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Add click listeners to menu items
    menuContainer.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const itemId = parseInt(item.dataset.itemId);
            openItemModal(itemId);
        });
    });
}

// Open item modal
function openItemModal(itemId) {
    currentItem = menuItems.find(item => item.id === itemId);
    if (!currentItem) return;

    itemModalTitle.textContent = currentItem.name;
    itemModalPrice.textContent = `$${currentItem.price.toFixed(2)}`;
    currentQuantity = 1;
    currentComments = '';
    itemComments.value = '';
    charCount.textContent = '0';
    
    updateQuantityDisplay();
    openModal(itemModal);
}

// Update quantity display
function updateQuantityDisplay() {
    quantityDisplay.textContent = currentQuantity;
    itemTotalPrice.textContent = `$${(currentItem.price * currentQuantity).toFixed(2)}`;
}

// Add item to cart
function addItemToCart() {
    if (!currentItem) return;

    const cartItem = {
        id: Date.now(),
        itemId: currentItem.id,
        name: currentItem.name,
        price: currentItem.price,
        quantity: currentQuantity,
        comments: currentComments,
        total: currentItem.price * currentQuantity
    };

    cart.push(cartItem);
    updateCartSummary();
    closeModal(itemModal);
    
    // Show success feedback
    showNotification('Item added to cart!', 'success');
}

// Update cart summary
function updateCartSummary() {
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
    cartItemCount.textContent = `(${itemCount})`;
    
    // Show/hide cart summary
    const cartSummary = document.getElementById('cartSummary');
    if (cart.length > 0) {
        cartSummary.style.display = 'flex';
    } else {
        cartSummary.style.display = 'none';
    }
}

// Open cart modal
function openCartModal() {
    renderCartItems();
    openModal(cartModal);
}

// Render cart items
function renderCartItems() {
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                ${item.comments ? `<div class="cart-item-comments">${item.comments}</div>` : ''}
            </div>
            <div class="cart-item-price">$${item.total.toFixed(2)}</div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.11; // 11% tax
    const total = subtotal + 4 + tax; // $4 delivery fee

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartTax.textContent = `$${tax.toFixed(2)}`;
    cartTotalModal.textContent = `$${total.toFixed(2)}`;
}

// Open checkout modal
function openCheckoutModal() {
    renderCheckoutItems();
    openModal(checkoutModal);
}

// Render checkout items
function renderCheckoutItems() {
    checkoutItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.quantity} x ${item.name}</span>
            <span>$${item.total.toFixed(2)}</span>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.11;
    const total = subtotal + 4 + tax;

    checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    checkoutTax.textContent = `$${tax.toFixed(2)}`;
    checkoutTotal.textContent = `$${total.toFixed(2)}`;
}

// Submit order
async function submitOrder(e) {
    e.preventDefault();

    const formData = new FormData(checkoutForm);
    const orderData = {
        items: cart,
        customer: {
            roomNumber: formData.get('roomNumber') || document.getElementById('roomNumber').value,
            firstName: formData.get('firstName') || document.getElementById('firstName').value,
            lastName: formData.get('lastName') || document.getElementById('lastName').value
        },
        deliveryLocation: deliveryLocation,
        subtotal: cart.reduce((sum, item) => sum + item.total, 0),
        deliveryFee: 4,
        tax: cart.reduce((sum, item) => sum + item.total, 0) * 0.11,
        total: cart.reduce((sum, item) => sum + item.total, 0) + 4 + (cart.reduce((sum, item) => sum + item.total, 0) * 0.11)
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const order = await response.json();
            showOrderConfirmation(order);
            cart = [];
            updateCartSummary();
            closeModal(checkoutModal);
        } else {
            throw new Error('Failed to submit order');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        showNotification('Failed to submit order. Please try again.', 'error');
    }
}

// Show order confirmation
function showOrderConfirmation(order) {
    orderNumber.textContent = order.orderNumber;
    deliveryTo.textContent = `${deliveryLocation} ${order.customer.roomNumber}`;
    
    // Calculate estimated delivery time
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    const timeString = deliveryTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    estimatedDelivery.textContent = `Today, ${timeString}`;
    
    openModal(confirmationModal);
}

// Set delivery location
function setDeliveryLocation(location) {
    const locationMap = {
        'room-231': 'Room 231',
        'pool-main': 'Main Pool',
        'cabana-1': 'Cabana 1',
        'cabana-2': 'Cabana 2'
    };
    
    deliveryLocation = locationMap[location] || location;
    deliveryLocationSpan.textContent = deliveryLocation;
}

// Modal functions
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal);
        }
    }
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}