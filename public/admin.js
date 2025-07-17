// Global variables
let orders = [];
let menuItems = [];
let qrCodes = [];
let currentFilter = 'all';
let socket;

// DOM elements
const ordersGrid = document.getElementById('ordersGrid');
const qrCodesGrid = document.getElementById('qrCodesGrid');
const addQRBtn = document.getElementById('addQRBtn');
const addQRModal = document.getElementById('addQRModal');
const closeAddQRModal = document.getElementById('closeAddQRModal');
const addQRForm = document.getElementById('addQRForm');
const saveQRCode = document.getElementById('saveQRCode');
const cancelAddQR = document.getElementById('cancelAddQR');

const addMenuItemBtn = document.getElementById('addMenuItemBtn');
const addMenuItemModal = document.getElementById('addMenuItemModal');
const closeAddMenuItemModal = document.getElementById('closeAddMenuItemModal');
const addMenuItemForm = document.getElementById('addMenuItemForm');
const saveMenuItem = document.getElementById('saveMenuItem');
const cancelAddMenuItem = document.getElementById('cancelAddMenuItem');

const orderDetailModal = document.getElementById('orderDetailModal');
const closeOrderDetailModal = document.getElementById('closeOrderDetailModal');
const markPreparing = document.getElementById('markPreparing');
const markReady = document.getElementById('markReady');
const markCompleted = document.getElementById('markCompleted');

// Stats elements
const totalOrders = document.getElementById('totalOrders');
const totalRevenue = document.getElementById('totalRevenue');
const pendingOrders = document.getElementById('pendingOrders');
const completedOrders = document.getElementById('completedOrders');
const popularItems = document.getElementById('popularItems');
const statusChart = document.getElementById('statusChart');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSocket();
    setupEventListeners();
    loadInitialData();
    setupTabNavigation();
    setupOrderFilters();
});

// Initialize Socket.IO connection
function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
        updateConnectionStatus(true);
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        updateConnectionStatus(false);
    });
    
    socket.on('newOrder', (order) => {
        orders.unshift(order);
        renderOrders();
        updateStats();
        showNotification(`New order received: #${order.orderNumber}`, 'success');
    });
    
    socket.on('orderStatusUpdate', ({ id, status }) => {
        const order = orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            renderOrders();
            updateStats();
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });

    // QR Code modal
    addQRBtn.addEventListener('click', () => openModal(addQRModal));
    closeAddQRModal.addEventListener('click', () => closeModal(addQRModal));
    cancelAddQR.addEventListener('click', () => closeModal(addQRModal));
    saveQRCode.addEventListener('click', createQRCode);

    // Menu Item modal
    addMenuItemBtn.addEventListener('click', () => openModal(addMenuItemModal));
    closeAddMenuItemModal.addEventListener('click', () => closeModal(addMenuItemModal));
    cancelAddMenuItem.addEventListener('click', () => closeModal(addMenuItemModal));
    saveMenuItem.addEventListener('click', createMenuItem);

    // Order detail modal
    closeOrderDetailModal.addEventListener('click', () => closeModal(orderDetailModal));
    markPreparing.addEventListener('click', () => updateOrderStatus('preparing'));
    markReady.addEventListener('click', () => updateOrderStatus('ready'));
    markCompleted.addEventListener('click', () => updateOrderStatus('completed'));

    // Reports
    document.getElementById('updateReports').addEventListener('click', updateReports);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

// Setup tab navigation
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Setup order filters
function setupOrderFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderOrders();
        });
    });
}

// Load initial data
async function loadInitialData() {
    try {
        await Promise.all([
            loadOrders(),
            loadMenuItems(),
            loadQRCodes(),
            loadStats()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Failed to load data', 'error');
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        orders = await response.json();
        renderOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Load menu items
async function loadMenuItems() {
    try {
        const response = await fetch('/api/menu');
        menuItems = await response.json();
        renderMenuItems();
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

// Load QR codes
async function loadQRCodes() {
    try {
        const response = await fetch('/api/qr-codes');
        qrCodes = await response.json();
        renderQRCodes();
    } catch (error) {
        console.error('Error loading QR codes:', error);
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        updateStatsDisplay(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Render orders
function renderOrders() {
    const filteredOrders = currentFilter === 'all' 
        ? orders 
        : orders.filter(order => order.status === currentFilter);

    ordersGrid.innerHTML = filteredOrders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-number">#${order.orderNumber}</div>
                <div class="order-status ${order.status}">${order.status}</div>
            </div>
            <div class="customer-info">
                <div class="customer-name">${order.customer.firstName} ${order.customer.lastName}</div>
                <div class="customer-room">Room ${order.customer.roomNumber}</div>
            </div>
            <div class="order-summary">
                <div class="order-items-count">${order.items.length} items</div>
                <div class="order-total">$${order.total.toFixed(2)}</div>
            </div>
            <div class="order-time">
                ${new Date(order.createdAt).toLocaleTimeString()}
            </div>
        </div>
    `).join('');

    // Add click listeners to order cards
    ordersGrid.querySelectorAll('.order-card').forEach(card => {
        card.addEventListener('click', () => {
            const orderId = card.dataset.orderId;
            openOrderDetail(orderId);
        });
    });
}

// Render menu items
function renderMenuItems() {
    const categories = {
        'STARTERS': document.getElementById('startersList'),
        '10\' HEARTH FIRED PIZZAS': document.getElementById('pizzasList'),
        'ADD-ONS': document.getElementById('addonsList'),
        'SIDES': document.getElementById('sidesList')
    };

    Object.entries(categories).forEach(([category, container]) => {
        const items = menuItems.filter(item => item.category === category);
        container.innerHTML = items.map(item => `
            <div class="menu-item-card" data-item-id="${item.id}">
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
                    <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="menu-item-actions">
                    <button class="edit-item" onclick="editMenuItem(${item.id})">Edit</button>
                    <button class="delete-item" onclick="deleteMenuItem(${item.id})">Delete</button>
                </div>
            </div>
        `).join('');
    });
}

// Render QR codes
function renderQRCodes() {
    qrCodesGrid.innerHTML = qrCodes.map(qr => `
        <div class="qr-code-card">
            <img src="${qr.qrCodeImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI3NSIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlFSIENvZGU8L3RleHQ+Cjwvc3ZnPgo='}" 
                 alt="QR Code" class="qr-code-image">
            <div class="qr-code-info">
                <h4>${qr.name}</h4>
                <div class="qr-code-type">${qr.type}</div>
            </div>
            <div class="qr-code-actions">
                <button class="btn-secondary" onclick="downloadQRCode('${qr.id}')">Download</button>
                <button class="btn-secondary" onclick="deleteQRCode('${qr.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Create QR code
async function createQRCode() {
    const formData = new FormData(addQRForm);
    const name = formData.get('qrLocationName') || document.getElementById('qrLocationName').value;
    const type = formData.get('qrLocationType') || document.getElementById('qrLocationType').value;

    if (!name || !type) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch('/api/qr-codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, type })
        });

        if (response.ok) {
            const newQRCode = await response.json();
            qrCodes.push(newQRCode);
            renderQRCodes();
            closeModal(addQRModal);
            addQRForm.reset();
            showNotification('QR Code created successfully', 'success');
        } else {
            throw new Error('Failed to create QR code');
        }
    } catch (error) {
        console.error('Error creating QR code:', error);
        showNotification('Failed to create QR code', 'error');
    }
}

// Create menu item
async function createMenuItem() {
    const formData = new FormData(addMenuItemForm);
    const itemData = {
        name: formData.get('itemName') || document.getElementById('itemName').value,
        description: formData.get('itemDescription') || document.getElementById('itemDescription').value,
        price: parseFloat(formData.get('itemPrice') || document.getElementById('itemPrice').value),
        category: formData.get('itemCategory') || document.getElementById('itemCategory').value,
        available: document.getElementById('itemAvailable').checked
    };

    if (!itemData.name || !itemData.price || !itemData.category) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        if (response.ok) {
            const newItem = await response.json();
            menuItems.push(newItem);
            renderMenuItems();
            closeModal(addMenuItemModal);
            addMenuItemForm.reset();
            showNotification('Menu item created successfully', 'success');
        } else {
            throw new Error('Failed to create menu item');
        }
    } catch (error) {
        console.error('Error creating menu item:', error);
        showNotification('Failed to create menu item', 'error');
    }
}

// Open order detail
function openOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Populate order detail modal
    document.getElementById('detailOrderNumber').textContent = order.orderNumber;
    document.getElementById('detailOrderStatus').textContent = order.status;
    document.getElementById('detailCustomerName').textContent = `${order.customer.firstName} ${order.customer.lastName}`;
    document.getElementById('detailCustomerRoom').textContent = order.customer.roomNumber;
    document.getElementById('detailDeliveryLocation').textContent = order.deliveryLocation;
    
    // Populate order items
    const orderItemsContainer = document.getElementById('detailOrderItems');
    orderItemsContainer.innerHTML = order.items.map(item => `
        <div class="order-item-detail">
            <div class="order-item-name">${item.quantity}x ${item.name}</div>
            <div class="order-item-price">$${item.total.toFixed(2)}</div>
        </div>
    `).join('');

    // Populate order summary
    document.getElementById('detailSubtotal').textContent = `$${order.subtotal.toFixed(2)}`;
    document.getElementById('detailDeliveryFee').textContent = `$${order.deliveryFee.toFixed(2)}`;
    document.getElementById('detailTax').textContent = `$${order.tax.toFixed(2)}`;
    document.getElementById('detailTotal').textContent = `$${order.total.toFixed(2)}`;

    // Store current order ID for status updates
    orderDetailModal.dataset.orderId = orderId;

    openModal(orderDetailModal);
}

// Update order status
async function updateOrderStatus(status) {
    const orderId = orderDetailModal.dataset.orderId;
    if (!orderId) return;

    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            const updatedOrder = await response.json();
            const orderIndex = orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                orders[orderIndex] = updatedOrder;
                renderOrders();
                updateStats();
                closeModal(orderDetailModal);
                showNotification(`Order status updated to ${status}`, 'success');
            }
        } else {
            throw new Error('Failed to update order status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Failed to update order status', 'error');
    }
}

// Update stats display
function updateStatsDisplay(stats) {
    totalOrders.textContent = stats.totalOrders;
    totalRevenue.textContent = `$${stats.totalRevenue}`;
    pendingOrders.textContent = stats.pendingOrders;
    completedOrders.textContent = stats.completedOrders;

    // Update popular items
    popularItems.innerHTML = stats.popularItems.map(item => `
        <div class="popular-item">
            <div class="popular-item-name">${item.name}</div>
            <div class="popular-item-count">${item.count}</div>
        </div>
    `).join('');

    // Update status chart
    const statusCounts = {
        pending: stats.pendingOrders,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: stats.completedOrders
    };

    statusChart.innerHTML = Object.entries(statusCounts).map(([status, count]) => `
        <div class="status-item">
            <div class="status-label">${status.charAt(0).toUpperCase() + status.slice(1)}</div>
            <div class="status-count">${count}</div>
        </div>
    `).join('');
}

// Update stats
function updateStats() {
    const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        totalRevenue: orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.total, 0)
            .toFixed(2),
        popularItems: getPopularItems()
    };

    updateStatsDisplay(stats);
}

// Get popular items
function getPopularItems() {
    const itemCounts = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
    });

    return Object.entries(itemCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
}

// Update reports
function updateReports() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'error');
        return;
    }

    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return orderDate >= start && orderDate <= end;
    });

    // Update stats with filtered data
    const stats = {
        totalOrders: filteredOrders.length,
        pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
        completedOrders: filteredOrders.filter(o => o.status === 'completed').length,
        totalRevenue: filteredOrders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.total, 0)
            .toFixed(2),
        popularItems: getPopularItemsFromOrders(filteredOrders)
    };

    updateStatsDisplay(stats);
    showNotification('Reports updated', 'success');
}

// Get popular items from specific orders
function getPopularItemsFromOrders(orderList) {
    const itemCounts = {};
    orderList.forEach(order => {
        order.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
    });

    return Object.entries(itemCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
}

// Switch tab
function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        }
    });
}

// Update connection status
function updateConnectionStatus(connected) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-indicator span');
    
    if (connected) {
        statusDot.style.color = '#27ae60';
        statusText.textContent = 'Live Orders';
    } else {
        statusDot.style.color = '#e74c3c';
        statusText.textContent = 'Disconnected';
    }
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
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
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

// Utility functions
function editMenuItem(itemId) {
    // Implementation for editing menu items
    showNotification('Edit functionality coming soon', 'info');
}

function deleteMenuItem(itemId) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        // Implementation for deleting menu items
        showNotification('Delete functionality coming soon', 'info');
    }
}

function downloadQRCode(qrId) {
    // Implementation for downloading QR codes
    showNotification('Download functionality coming soon', 'info');
}

function deleteQRCode(qrId) {
    if (confirm('Are you sure you want to delete this QR code?')) {
        // Implementation for deleting QR codes
        showNotification('Delete functionality coming soon', 'info');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal);
        }
    }
});

// Auto-refresh stats every 30 seconds
setInterval(() => {
    if (document.querySelector('#reports-tab').classList.contains('active')) {
        updateStats();
    }
}, 30000);