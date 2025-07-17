# 🔧 KLEO ORDERING SYSTEM - DEVELOPER TECHNICAL SPECIFICATION
## Complete Technical Architecture & Implementation Guide

**Live System:** https://ales2323.github.io/test/  
**Repository:** https://github.com/Ales2323/test  
**Target:** Hotel restaurant digital ordering platform  
**Stack:** Frontend-only PWA with localStorage persistence

---

## 📖 TABLE OF CONTENTS

### 1. [SYSTEM ARCHITECTURE](#system-architecture)
### 2. [TECHNOLOGY STACK](#technology-stack)
### 3. [DATABASE DESIGN](#database-design)
### 4. [API SPECIFICATIONS](#api-specifications)
### 5. [FRONTEND IMPLEMENTATION](#frontend-implementation)
### 6. [BUSINESS LOGIC](#business-logic)
### 7. [SECURITY & VALIDATION](#security--validation)
### 8. [PERFORMANCE REQUIREMENTS](#performance-requirements)
### 9. [DEPLOYMENT SPECIFICATIONS](#deployment-specifications)
### 10. [TESTING REQUIREMENTS](#testing-requirements)

---

## SYSTEM ARCHITECTURE

### **Architecture Pattern**
- **Type:** Single Page Application (SPA) / Progressive Web App (PWA)
- **Pattern:** Client-side rendered with localStorage persistence
- **Communication:** RESTful API design principles (future backend integration)
- **State Management:** Browser localStorage + in-memory state

### **System Components**
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
├─────────────────┬─────────────────┬─────────────────────┤
│   Customer App  │   Admin Panel   │   QR Generator      │
│   (Mobile-first)│   (Desktop)     │   (Management)      │
└─────────────────┴─────────────────┴─────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                APPLICATION LAYER                        │
├─────────────────┬─────────────────┬─────────────────────┤
│   Order Engine  │  Menu Manager   │  Location Service   │
│   Cart Logic    │  Price Calculator│  QR Code Handler   │
└─────────────────┴─────────────────┴─────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER                             │
├─────────────────┬─────────────────┬─────────────────────┤
│  localStorage   │   Session Data  │   Static Config     │
│  (Orders)       │   (Cart/User)   │   (Menu/Locations)  │
└─────────────────┴─────────────────┴─────────────────────┘
```

### **Request Flow**
```
1. QR Code Scan → URL with parameters → Location Detection
2. Guest Info Collection → Session Storage → Menu Display
3. Cart Management → Real-time Calculations → Checkout
4. Order Submission → localStorage → Admin Dashboard
5. Status Updates → Real-time UI Updates → Completion
```

---

## TECHNOLOGY STACK

### **Core Technologies**
```javascript
Frontend Framework: Vanilla JavaScript (ES6+)
Styling: CSS3 with CSS Variables
HTML: HTML5 semantic markup
Icons: Font Awesome 6.0.0
Storage: Browser localStorage API
QR Generation: QRious.js library
Responsive: CSS Grid + Flexbox
```

### **Development Tools & Standards**
```javascript
Version Control: Git
Code Style: ES6+ with consistent formatting
Browser Support: Chrome 70+, Safari 12+, Firefox 65+
Mobile Support: iOS Safari 12+, Chrome Mobile 70+
Performance Target: <3s initial load, <1s interactions
Accessibility: WCAG 2.1 AA compliance
```

### **External Dependencies**
```javascript
// CDN Dependencies (production)
"font-awesome": "6.0.0",        // Icons
"qrious": "4.0.2"               // QR code generation

// No build process required
// No package.json or npm dependencies
// Pure HTML/CSS/JS implementation
```

---

## DATABASE DESIGN

### **Data Models (localStorage Implementation)**

#### **1. Order Model**
```typescript
interface Order {
  id: string;                    // Auto-generated UUID
  orderNumber: string;           // Format: "KLEO-123456"
  guestName: string;             // Required, 2-50 chars
  phoneNumber: string;           // Required, 10-15 chars
  locationKey: string;           // e.g., "room-301", "pool-table-1"
  locationType: 'room' | 'pool'; // Service type identifier
  locationName: string;          // Display name: "Room 301"
  serviceType: string;           // "In-Room Dining" | "Poolside Service"
  status: OrderStatus;           // Workflow state
  orderTime: string;             // ISO datetime string
  lastUpdated: string;           // ISO datetime string
  specialInstructions?: string;  // Optional, max 500 chars
  subtotal: number;              // Calculated field
  tax: number;                   // 8.25% of subtotal
  deliveryFee: number;           // $3.00 (room) | $2.00 (pool)
  finalTotal: number;            // subtotal + tax + deliveryFee
  items: OrderItem[];            // Array of ordered items
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';
```

#### **2. Order Item Model**
```typescript
interface OrderItem {
  itemId: string;                // References MenuItem.id
  itemName: string;              // Denormalized for display
  itemPrice: number;             // Price at time of order
  quantity: number;              // 1-99
  itemTotal: number;             // price * quantity
}
```

#### **3. Menu Item Model**
```typescript
interface MenuItem {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // Item description
  price: number;                 // Base price (USD)
  category: MenuCategory;        // Categorization
  dietaryTags: DietaryTag[];     // Dietary information
  availability: Availability;    // Current availability
  isActive: boolean;             // Admin toggle
}

type MenuCategory = 'starters' | 'mains' | 'desserts' | 'beverages' | 'cocktails';
type DietaryTag = 'VEGETARIAN' | 'VEGAN' | 'GLUTEN-FREE' | 'SPICY';
type Availability = 'available' | 'limited' | 'unavailable';
```

#### **4. Location Model**
```typescript
interface Location {
  locationKey: string;           // Unique key: "room-301"
  locationType: 'room' | 'pool'; // Service type
  locationName: string;          // Display name: "Room 301"
  serviceType: string;           // Service description
  icon: string;                  // Font Awesome class
  isActive: boolean;             // Admin toggle
}
```

### **Storage Implementation**
```javascript
// localStorage Keys
const STORAGE_KEYS = {
  ORDERS: 'kleoOrders',          // Array of Order objects
  ORDER_DATA: 'kleoOrderData',   // Current order session data
  MENU_ITEMS: 'kleoMenuItems',   // Array of MenuItem objects
  LOCATIONS: 'kleoLocations'     // Array of Location objects
};

// Storage Operations
class StorageManager {
  static saveOrder(order: Order): void {
    const orders = this.getAllOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }
  
  static getAllOrders(): Order[] {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  }
  
  static updateOrderStatus(orderNumber: string, status: OrderStatus): void {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      orders[orderIndex].lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }
}
```

---

## API SPECIFICATIONS

### **Future Backend API Design**

#### **Endpoints Structure**
```
Base URL: https://api.kleo-restaurant.com/v1

Authentication: Bearer token (future implementation)
Content-Type: application/json
Rate Limiting: 100 requests/minute per IP
```

#### **Order Management Endpoints**
```http
POST /orders
# Create new order
Request Body: CreateOrderRequest
Response: Order (201 Created)

GET /orders
# Get all orders (admin)
Query Params: ?status=pending&limit=50&offset=0
Response: PaginatedOrderResponse

PUT /orders/{orderNumber}/status
# Update order status
Request Body: { status: OrderStatus }
Response: Order (200 OK)

GET /orders/{orderNumber}
# Get specific order
Response: Order (200 OK)
```

#### **Menu Management Endpoints**
```http
GET /menu/items
# Get all menu items
Query Params: ?category=starters&active=true
Response: MenuItem[]

PUT /menu/items/{itemId}
# Update menu item (admin)
Request Body: UpdateMenuItemRequest
Response: MenuItem (200 OK)

POST /menu/items
# Create menu item (admin)
Request Body: CreateMenuItemRequest
Response: MenuItem (201 Created)
```

#### **Location Endpoints**
```http
GET /locations
# Get all locations
Response: Location[]

GET /locations/{locationKey}
# Get specific location
Response: Location (200 OK)
```

#### **Request/Response Models**
```typescript
interface CreateOrderRequest {
  guestName: string;
  phoneNumber: string;
  locationKey: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
  specialInstructions?: string;
}

interface PaginatedOrderResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}
```

---

## FRONTEND IMPLEMENTATION

### **Application Structure**
```
src/
├── index.html              # Landing page (QR entry point)
├── menu.html              # Menu browsing & cart
├── checkout.html          # Order review & submission
├── admin.html             # Staff order management
├── qr-generator.html      # QR code generation tool
├── styles/
│   ├── main.css          # Global styles & variables
│   ├── components.css    # Reusable component styles
│   └── responsive.css    # Mobile-first responsive rules
├── scripts/
│   ├── app.js           # Main application logic
│   ├── order-manager.js # Order processing logic
│   ├── cart.js          # Shopping cart management
│   ├── location.js      # Location detection & mapping
│   └── utils.js         # Utility functions
└── assets/
    ├── icons/           # Custom icons (if any)
    └── images/          # Images and logos
```

### **Core JavaScript Modules**

#### **App.js - Main Application**
```javascript
class KleoApp {
  constructor() {
    this.orderManager = new OrderManager();
    this.cart = new Cart();
    this.locationService = new LocationService();
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadConfiguration();
    this.detectLocation();
  }
  
  setupEventListeners() {
    // Form submissions
    document.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Cart updates
    document.addEventListener('cart:update', this.handleCartUpdate.bind(this));
    
    // Order status changes
    document.addEventListener('order:statusChange', this.handleStatusChange.bind(this));
  }
}
```

#### **OrderManager.js - Order Processing**
```javascript
class OrderManager {
  constructor() {
    this.orders = StorageManager.getAllOrders();
    this.currentOrder = null;
  }
  
  createOrder(orderData) {
    const order = {
      id: this.generateId(),
      orderNumber: this.generateOrderNumber(),
      ...orderData,
      status: 'pending',
      orderTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    this.validateOrder(order);
    this.calculatePricing(order);
    
    StorageManager.saveOrder(order);
    this.notifyNewOrder(order);
    
    return order;
  }
  
  updateStatus(orderNumber, newStatus) {
    const order = this.getOrderByNumber(orderNumber);
    if (!order) throw new Error('Order not found');
    
    this.validateStatusTransition(order.status, newStatus);
    StorageManager.updateOrderStatus(orderNumber, newStatus);
    
    this.notifyStatusChange(orderNumber, newStatus);
  }
  
  calculatePricing(order) {
    order.subtotal = order.items.reduce((sum, item) => 
      sum + (item.itemPrice * item.quantity), 0);
    order.tax = order.subtotal * 0.0825; // 8.25% Texas tax
    order.deliveryFee = order.locationType === 'room' ? 3.00 : 2.00;
    order.finalTotal = order.subtotal + order.tax + order.deliveryFee;
  }
}
```

#### **Cart.js - Shopping Cart Logic**
```javascript
class Cart {
  constructor() {
    this.items = new Map();
    this.listeners = new Set();
  }
  
  addItem(menuItem, quantity = 1) {
    const existingItem = this.items.get(menuItem.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.set(menuItem.id, {
        itemId: menuItem.id,
        itemName: menuItem.name,
        itemPrice: menuItem.price,
        quantity: quantity,
        itemTotal: menuItem.price * quantity
      });
    }
    
    this.updateItemTotal(menuItem.id);
    this.notifyChange();
  }
  
  removeItem(itemId) {
    this.items.delete(itemId);
    this.notifyChange();
  }
  
  updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    
    const item = this.items.get(itemId);
    if (item) {
      item.quantity = quantity;
      this.updateItemTotal(itemId);
      this.notifyChange();
    }
  }
  
  getTotal() {
    return Array.from(this.items.values())
      .reduce((sum, item) => sum + item.itemTotal, 0);
  }
}
```

### **CSS Architecture**

#### **CSS Variables (Design System)**
```css
:root {
  /* Colors */
  --color-primary: #1a1a2e;
  --color-container: #1e1e2e;
  --color-card: #374151;
  --color-text-primary: #e0e0e0;
  --color-text-secondary: #9ca3af;
  --color-accent: #f39c12;
  --color-success: #27ae60;
  --color-warning: #f39c12;
  --color-error: #e74c3c;
  
  /* Typography */
  --font-family: 'Arial', sans-serif;
  --font-size-h1: 28px;
  --font-size-h2: 20px;
  --font-size-h3: 18px;
  --font-size-body: 14px;
  --font-size-small: 12px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  
  /* Layout */
  --container-max-width: 480px;
  --border-radius: 8px;
  --border-radius-sm: 4px;
  --border-radius-lg: 12px;
}
```

#### **Component Styles**
```css
/* Button Component */
.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-body);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-accent), #e67e22);
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

/* Card Component */
.card {
  background: var(--color-card);
  border: 1px solid #4b5563;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
}

/* Input Component */
.input {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid #4b5563;
  border-radius: var(--border-radius);
  background: var(--color-card);
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
  transition: border-color 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-accent);
}
```

---

## BUSINESS LOGIC

### **Order Workflow State Machine**
```javascript
const ORDER_STATES = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered'
};

const STATE_TRANSITIONS = {
  [ORDER_STATES.PENDING]: [ORDER_STATES.PREPARING],
  [ORDER_STATES.PREPARING]: [ORDER_STATES.READY],
  [ORDER_STATES.READY]: [ORDER_STATES.DELIVERED],
  [ORDER_STATES.DELIVERED]: [] // Terminal state
};

class OrderStateMachine {
  static validateTransition(currentState, newState) {
    const allowedTransitions = STATE_TRANSITIONS[currentState] || [];
    if (!allowedTransitions.includes(newState)) {
      throw new Error(`Invalid transition from ${currentState} to ${newState}`);
    }
    return true;
  }
  
  static getAvailableActions(currentState) {
    switch (currentState) {
      case ORDER_STATES.PENDING:
        return [{ action: 'accept', label: 'Accept Order', nextState: ORDER_STATES.PREPARING }];
      case ORDER_STATES.PREPARING:
        return [{ action: 'ready', label: 'Mark Ready', nextState: ORDER_STATES.READY }];
      case ORDER_STATES.READY:
        return [{ action: 'deliver', label: 'Mark Delivered', nextState: ORDER_STATES.DELIVERED }];
      case ORDER_STATES.DELIVERED:
        return []; // No actions available
      default:
        return [];
    }
  }
}
```

### **Pricing Engine**
```javascript
class PricingEngine {
  static TAX_RATE = 0.0825; // 8.25% Texas tax rate
  static DELIVERY_FEES = {
    room: 3.00,
    pool: 2.00
  };
  
  static calculateOrderTotal(items, locationType) {
    const subtotal = this.calculateSubtotal(items);
    const tax = this.calculateTax(subtotal);
    const deliveryFee = this.getDeliveryFee(locationType);
    
    return {
      subtotal: this.roundCurrency(subtotal),
      tax: this.roundCurrency(tax),
      deliveryFee: this.roundCurrency(deliveryFee),
      total: this.roundCurrency(subtotal + tax + deliveryFee)
    };
  }
  
  static calculateSubtotal(items) {
    return items.reduce((sum, item) => 
      sum + (item.itemPrice * item.quantity), 0);
  }
  
  static calculateTax(subtotal) {
    return subtotal * this.TAX_RATE;
  }
  
  static getDeliveryFee(locationType) {
    return this.DELIVERY_FEES[locationType] || 0;
  }
  
  static roundCurrency(amount) {
    return Math.round(amount * 100) / 100;
  }
}
```

### **Location Service**
```javascript
class LocationService {
  static LOCATION_MAP = {
    // Room locations
    'room-101': { type: 'room', name: 'Room 101', service: 'In-Room Dining', icon: 'fa-bed' },
    'room-201': { type: 'room', name: 'Room 201', service: 'In-Room Dining', icon: 'fa-bed' },
    'room-301': { type: 'room', name: 'Room 301', service: 'In-Room Dining', icon: 'fa-bed' },
    
    // Pool locations
    'pool-main': { type: 'pool', name: 'Main Pool Area', service: 'Poolside Service', icon: 'fa-swimming-pool' },
    'pool-table-1': { type: 'pool', name: 'Pool Table #1', service: 'Poolside Service', icon: 'fa-swimming-pool' },
    'pool-cabana-1': { type: 'pool', name: 'Cabana #1', service: 'Poolside Service', icon: 'fa-umbrella-beach' }
  };
  
  static detectFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    // Check for room parameter
    if (params.has('room')) {
      const roomNumber = params.get('room');
      return this.getLocation(`room-${roomNumber}`);
    }
    
    // Check for location parameter
    if (params.has('location')) {
      const locationKey = params.get('location');
      // Handle both full keys and shorthand
      const fullKey = locationKey.startsWith('pool-') ? locationKey : `pool-${locationKey}`;
      return this.getLocation(fullKey);
    }
    
    // Default fallback
    return this.getLocation('room-301');
  }
  
  static getLocation(locationKey) {
    const location = this.LOCATION_MAP[locationKey];
    if (!location) {
      throw new Error(`Unknown location: ${locationKey}`);
    }
    
    return {
      key: locationKey,
      ...location,
      estimatedDelivery: this.getEstimatedDelivery(location.type)
    };
  }
  
  static getEstimatedDelivery(locationType) {
    return locationType === 'room' ? '15-25 minutes' : '20-30 minutes';
  }
}
```

---

## SECURITY & VALIDATION

### **Input Validation**
```javascript
class Validator {
  static validateGuestName(name) {
    if (!name || typeof name !== 'string') {
      throw new ValidationError('Guest name is required');
    }
    
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      throw new ValidationError('Guest name must be 2-50 characters');
    }
    
    // Basic XSS prevention
    if (/<script|javascript:|on\w+=/i.test(trimmed)) {
      throw new ValidationError('Invalid characters in guest name');
    }
    
    return trimmed;
  }
  
  static validatePhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
      throw new ValidationError('Phone number is required');
    }
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length < 10 || digits.length > 15) {
      throw new ValidationError('Phone number must be 10-15 digits');
    }
    
    return digits;
  }
  
  static validateOrderItem(item) {
    if (!item.itemId || !item.quantity) {
      throw new ValidationError('Invalid order item');
    }
    
    if (item.quantity < 1 || item.quantity > 99) {
      throw new ValidationError('Quantity must be between 1 and 99');
    }
    
    if (item.itemPrice <= 0) {
      throw new ValidationError('Invalid item price');
    }
    
    return true;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### **Data Sanitization**
```javascript
class Sanitizer {
  static sanitizeText(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML chars
      .slice(0, 500); // Limit length
  }
  
  static sanitizeNumber(input) {
    const num = parseFloat(input);
    return isNaN(num) ? 0 : Math.max(0, num);
  }
  
  static sanitizeOrderData(orderData) {
    return {
      guestName: this.sanitizeText(orderData.guestName),
      phoneNumber: this.sanitizeText(orderData.phoneNumber),
      locationKey: this.sanitizeText(orderData.locationKey),
      specialInstructions: this.sanitizeText(orderData.specialInstructions || ''),
      items: (orderData.items || []).map(item => ({
        itemId: this.sanitizeText(item.itemId),
        itemName: this.sanitizeText(item.itemName),
        itemPrice: this.sanitizeNumber(item.itemPrice),
        quantity: Math.max(1, Math.min(99, parseInt(item.quantity) || 1))
      }))
    };
  }
}
```

---

## PERFORMANCE REQUIREMENTS

### **Performance Targets**
```javascript
const PERFORMANCE_TARGETS = {
  // Loading Performance
  initialLoad: '< 3 seconds',
  subsequentLoads: '< 1 second',
  imageLoad: '< 2 seconds',
  
  // Interaction Performance
  buttonResponse: '< 100ms',
  formSubmission: '< 500ms',
  cartUpdate: '< 200ms',
  statusUpdate: '< 300ms',
  
  // Mobile Performance
  mobileLoad: '< 4 seconds (3G)',
  touchResponse: '< 50ms',
  scrollPerformance: '60fps',
  
  // Bundle Size
  totalJavaScript: '< 100KB gzipped',
  totalCSS: '< 50KB gzipped',
  totalHTML: '< 200KB',
  
  // Memory Usage
  maxMemoryUsage: '< 50MB',
  memoryLeakTolerance: '< 1MB/hour'
};
```

### **Optimization Strategies**
```javascript
// Lazy Loading Implementation
class LazyLoader {
  static observeImages() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Debounced Event Handlers
class PerformanceUtils {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Memory Management
class MemoryManager {
  static cleanup() {
    // Clear expired session data
    this.clearExpiredSessions();
    
    // Remove old event listeners
    this.removeOrphanedListeners();
    
    // Clear unused image cache
    this.clearImageCache();
  }
  
  static clearExpiredSessions() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('kleo')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.timestamp && (now - data.timestamp) > maxAge) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Invalid data, remove it
          localStorage.removeItem(key);
        }
      }
    });
  }
}
```

---

## DEPLOYMENT SPECIFICATIONS

### **Build Process**
```bash
# No build process required for current implementation
# Pure HTML/CSS/JS - ready for deployment

# For production optimization (optional):
# 1. Minify CSS/JS
# 2. Optimize images
# 3. Enable gzip compression
# 4. Set up CDN
```

### **Environment Configuration**
```javascript
// Environment-specific configuration
const CONFIG = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    enableLogging: true,
    enableDebugMode: true,
    qrCodeBaseUrl: 'http://localhost:3000'
  },
  
  staging: {
    apiBaseUrl: 'https://staging-api.kleo-restaurant.com/api',
    enableLogging: true,
    enableDebugMode: false,
    qrCodeBaseUrl: 'https://staging.kleo-restaurant.com'
  },
  
  production: {
    apiBaseUrl: 'https://api.kleo-restaurant.com/api',
    enableLogging: false,
    enableDebugMode: false,
    qrCodeBaseUrl: 'https://kleo-restaurant.com'
  }
};

// Runtime environment detection
const getEnvironment = () => {
  if (window.location.hostname === 'localhost') return 'development';
  if (window.location.hostname.includes('staging')) return 'staging';
  return 'production';
};
```

### **Hosting Requirements**
```yaml
# Static hosting (current implementation)
Provider: GitHub Pages / Netlify / Vercel
Requirements:
  - HTTPS support
  - Custom domain support
  - Gzip compression
  - Cache headers
  - CDN distribution

# Future backend hosting
Provider: AWS / Google Cloud / Azure
Requirements:
  - Node.js runtime
  - PostgreSQL database
  - Redis cache
  - Load balancer
  - SSL certificate
  - Monitoring & logging
```

---

## TESTING REQUIREMENTS

### **Unit Tests**
```javascript
// Jest test examples
describe('PricingEngine', () => {
  test('should calculate correct subtotal', () => {
    const items = [
      { itemPrice: 10.00, quantity: 2 },
      { itemPrice: 15.50, quantity: 1 }
    ];
    
    const subtotal = PricingEngine.calculateSubtotal(items);
    expect(subtotal).toBe(35.50);
  });
  
  test('should calculate correct tax', () => {
    const tax = PricingEngine.calculateTax(100.00);
    expect(tax).toBe(8.25);
  });
  
  test('should round currency correctly', () => {
    const rounded = PricingEngine.roundCurrency(10.999);
    expect(rounded).toBe(11.00);
  });
});

describe('OrderStateMachine', () => {
  test('should allow valid state transitions', () => {
    expect(() => {
      OrderStateMachine.validateTransition('pending', 'preparing');
    }).not.toThrow();
  });
  
  test('should reject invalid state transitions', () => {
    expect(() => {
      OrderStateMachine.validateTransition('pending', 'delivered');
    }).toThrow('Invalid transition');
  });
});
```

### **Integration Tests**
```javascript
describe('Order Flow Integration', () => {
  test('complete order flow', async () => {
    // 1. Location detection
    const location = LocationService.detectFromURL('?room=301');
    expect(location.key).toBe('room-301');
    
    // 2. Cart management
    const cart = new Cart();
    cart.addItem({ id: 'burger', name: 'Burger', price: 15.00 }, 2);
    expect(cart.getTotal()).toBe(30.00);
    
    // 3. Order creation
    const orderManager = new OrderManager();
    const order = orderManager.createOrder({
      guestName: 'John Doe',
      phoneNumber: '5551234567',
      locationKey: 'room-301',
      locationType: 'room',
      items: Array.from(cart.items.values())
    });
    
    expect(order.orderNumber).toMatch(/^KLEO-\d{6}$/);
    expect(order.status).toBe('pending');
    expect(order.finalTotal).toBeGreaterThan(30.00); // Including tax and delivery
    
    // 4. Status updates
    orderManager.updateStatus(order.orderNumber, 'preparing');
    const updatedOrder = orderManager.getOrderByNumber(order.orderNumber);
    expect(updatedOrder.status).toBe('preparing');
  });
});
```

### **E2E Tests (Playwright/Cypress)**
```javascript
// Cypress test example
describe('Customer Order Flow', () => {
  it('should complete full order process', () => {
    // Visit landing page with QR parameter
    cy.visit('/?room=301');
    
    // Verify location detection
    cy.contains('Room 301').should('be.visible');
    
    // Fill guest information
    cy.get('[data-cy=guest-name]').type('John Doe');
    cy.get('[data-cy=phone-number]').type('(555) 123-4567');
    cy.get('[data-cy=continue-btn]').click();
    
    // Navigate to menu
    cy.url().should('include', '/menu.html');
    
    // Add items to cart
    cy.get('[data-cy=add-item-burger]').click();
    cy.get('[data-cy=cart-total]').should('contain', '$');
    
    // Proceed to checkout
    cy.get('[data-cy=checkout-btn]').click();
    
    // Review and submit order
    cy.get('[data-cy=confirm-order]').click();
    
    // Verify confirmation
    cy.contains('Order Confirmed').should('be.visible');
    cy.get('[data-cy=order-number]').should('match', /KLEO-\d{6}/);
  });
});
```

### **Performance Tests**
```javascript
// Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm start',
      url: ['http://localhost:3000', 'http://localhost:3000/menu.html']
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.8}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['error', {minScore: 0.8}],
        'categories:seo': ['error', {minScore: 0.8}]
      }
    }
  }
};
```

---

## SUMMARY

### **Key Technical Decisions**
1. **Frontend-only architecture** for rapid deployment and zero hosting costs
2. **localStorage persistence** for offline capability and simplicity
3. **Vanilla JavaScript** for performance and minimal dependencies
4. **Mobile-first responsive design** for primary use case
5. **Progressive Web App** patterns for app-like experience

### **Scalability Considerations**
1. **Database migration path** to PostgreSQL/MongoDB
2. **API layer** design for future backend integration
3. **State management** upgrade to Redux/Zustand
4. **Real-time features** via WebSocket/Server-Sent Events
5. **Microservices architecture** for horizontal scaling

### **Development Timeline Estimate**
```
Week 1: Core architecture & database models
Week 2: Customer-facing pages (landing, menu, checkout)
Week 3: Admin dashboard & order management
Week 4: QR generation, testing, optimization
Week 5: Integration testing, performance tuning
Week 6: Deployment, documentation, training
```

This technical specification provides developers with all the information needed to build a production-ready hotel restaurant ordering system that matches the functionality and user experience of the original Kleo system.

---

*Document Version: Developer Technical Specification 1.0*  
*Created: December 2024*  
*Live Reference: https://ales2323.github.io/test/*