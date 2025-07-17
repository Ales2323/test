# ⚙️ **KLEO ORDERING SYSTEM - ADMIN CONFIGURATION SOP**
## **System Administration & Configuration Guide**

---

## 🎯 **OVERVIEW**

This SOP covers system configuration, customization, and maintenance of the Kleo ordering system for Hotel Indigo Las Colinas. Designed for managers, IT staff, and system administrators.

**System Repository**: https://github.com/Ales2323/test  
**Live System**: https://ales2323.github.io/test/  
**Admin Dashboard**: https://ales2323.github.io/test/admin.html

---

## 🔧 **SYSTEM ARCHITECTURE**

### **📁 File Structure**
```
Kleo Ordering System/
├── index.html          # Customer landing page (QR entry)
├── menu.html           # Restaurant menu & ordering
├── checkout.html       # Order review & confirmation
├── admin.html          # Staff order management dashboard
├── qr-generator.html   # QR code generation tool
└── Documentation/
    ├── TEAM_SOP_ORDER_MANAGEMENT.md
    └── ADMIN_SOP_SYSTEM_CONFIGURATION.md
```

### **🌐 Technology Stack**
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: Browser LocalStorage (no backend required)
- **Hosting**: GitHub Pages (free hosting)
- **Dependencies**: Font Awesome icons, QRious.js library
- **Responsive**: Mobile-first design

---

## 🎨 **CUSTOMIZING BRANDING & APPEARANCE**

### **🏨 Hotel & Restaurant Branding**

#### **Update Hotel Information**
**Files to Edit**: `index.html`, `menu.html`, `checkout.html`, `admin.html`

**Location in Code**:
```html
<div class="hotel-logo">
    <i class="fas fa-crown"></i> Hotel Indigo Las Colinas
</div>
<div class="restaurant-name">Kleo</div>
<div class="tagline">Neighborhood Kitchen & Bar</div>
```

**How to Change**:
1. Replace `"Hotel Indigo Las Colinas"` with your hotel name
2. Replace `"Kleo"` with your restaurant name
3. Replace `"Neighborhood Kitchen & Bar"` with your tagline
4. Change the icon class `fa-crown` to any Font Awesome icon

#### **Update Contact Information**
**Files to Edit**: `index.html`, `menu.html`, `checkout.html`

**Location in Code**:
```html
<div class="footer-info">
    <i class="fas fa-utensils"></i><br>
    Questions? Call (972) 444-0000<br>
    Or speak with any hotel team member
</div>
```

**How to Change**:
1. Replace `(972) 444-0000` with your hotel's phone number
2. Update contact instructions as needed

### **🎨 Color Scheme Customization**

#### **Primary Colors (Current: Gold & Dark)**
**Files to Edit**: All HTML files in `<style>` sections

**Current Color Variables**:
- **Primary Gold**: `#f39c12` (buttons, highlights, branding)
- **Dark Background**: `#1a1a2e` (main background)
- **Card Background**: `#1e1e2e` (content cards)
- **Secondary Dark**: `#374151` (form elements)
- **Text Light**: `#e0e0e0` (main text)
- **Text Muted**: `#9ca3af` (secondary text)

**To Change Colors**:
1. Use Find & Replace (Ctrl+H) in each file
2. Replace color codes with your brand colors
3. Test on mobile devices after changes

#### **Logo Integration**
**Current**: Font Awesome icons used throughout

**To Add Custom Logo**:
1. Upload logo image to repository
2. Replace icon code with:
```html
<img src="your-logo.png" alt="Hotel Logo" style="height: 30px;">
```

---

## 🍽️ **MENU MANAGEMENT**

### **📋 Adding/Editing Menu Items**

#### **Menu Structure**
**File to Edit**: `menu.html`

**Location in Code**: Look for sections like:
```html
<!-- Starters Section -->
<div id="starters" class="menu-section">
    <h2 class="section-title">Starters</h2>
    <!-- Menu items here -->
</div>
```

#### **Adding New Menu Item**
**Template**:
```html
<div class="menu-item">
    <div class="item-header">
        <div class="item-name">ITEM NAME</div>
        <div class="item-price">$XX.XX</div>
    </div>
    <div class="item-description">Description of the item here</div>
    <div class="dietary-tags">
        <span class="dietary-tag">VEGETARIAN</span>
        <span class="dietary-tag spicy-tag">SPICY</span>
    </div>
    <div class="item-actions">
        <div class="quantity-controls">
            <button class="qty-btn" onclick="decreaseQty('item-id')">-</button>
            <span class="qty-display" id="item-id-qty">0</span>
            <button class="qty-btn" onclick="increaseQty('item-id')">+</button>
        </div>
        <button class="add-to-cart" onclick="addToCart('item-id', 'Item Name', XX.XX)">Add to Cart</button>
    </div>
</div>
```

#### **Menu Categories**
**Current Categories**: Starters, Main Courses, Desserts, Beverages, Cocktails

**To Add New Category**:
1. Add button to navigation:
```html
<button class="category-btn" onclick="showCategory('new-category')">New Category</button>
```

2. Add section content:
```html
<div id="new-category" class="menu-section" style="display: none;">
    <h2 class="section-title">New Category</h2>
    <!-- Add menu items here -->
</div>
```

#### **Dietary Tags Available**
- `dietary-tag` (default green) - for VEGETARIAN, VEGAN, GLUTEN-FREE
- `dietary-tag spicy-tag` (red) - for SPICY items

### **💰 Pricing & Tax Configuration**

#### **Tax Rate**
**File to Edit**: `checkout.html`

**Location in Code**:
```javascript
const tax = subtotal * 0.0825; // 8.25% Texas tax
```

**How to Change**: Replace `0.0825` with your local tax rate (e.g., `0.06` for 6%)

#### **Delivery Fees**
**File to Edit**: `checkout.html`

**Location in Code**:
```javascript
const deliveryFee = orderData.service === 'room' ? 3.00 : 2.00;
```

**How to Change**: 
- Room service fee: Change `3.00` to desired amount
- Pool service fee: Change `2.00` to desired amount

---

## 📍 **LOCATION MANAGEMENT**

### **🏨 Room Configuration**

#### **Adding/Removing Rooms**
**Files to Edit**: `index.html`, `qr-generator.html`

**Location in Code** (`index.html`):
```javascript
const locationData = {
    'room-101': { type: 'room', name: 'Room 101', icon: 'fa-bed', service: 'In-Room Dining' },
    'room-201': { type: 'room', name: 'Room 201', icon: 'fa-bed', service: 'In-Room Dining' },
    // Add more rooms here
};
```

**To Add Rooms**:
1. Add room entries to `locationData` object
2. Follow the format: `'room-XXX': { type: 'room', name: 'Room XXX', icon: 'fa-bed', service: 'In-Room Dining' }`
3. Update QR generator options in `qr-generator.html`

### **🏊 Pool Area Configuration**

#### **Pool Locations**
**Current Locations**: Main Pool, Cabanas 1-2, Pool Tables 1-2, Pool Bar

**To Add Pool Areas**:
```javascript
'pool-newarea': { type: 'pool', name: 'New Area Name', icon: 'fa-swimming-pool', service: 'Poolside Service' }
```

**Available Icons**:
- `fa-swimming-pool` (pool areas)
- `fa-umbrella-beach` (cabanas)
- `fa-cocktail` (bar areas)
- `fa-hot-tub` (spa areas)

---

## 🔗 **QR CODE MANAGEMENT**

### **📱 QR Code Generation**

#### **Access QR Generator**
**URL**: https://ales2323.github.io/test/qr-generator.html

#### **QR Code Formats**
**Room Service QR Codes**:
```
https://ales2323.github.io/test/?room=301
https://ales2323.github.io/test/?room=425
```

**Pool Service QR Codes**:
```
https://ales2323.github.io/test/?location=pool-table-1
https://ales2323.github.io/test/?location=pool-cabana-2
```

#### **Bulk QR Code Generation**
**For Multiple Rooms**:
1. Use QR generator bulk options
2. Generate range of room numbers
3. Download as ZIP file (future enhancement)
4. Print and laminate for durability

### **🖨️ QR Code Deployment**

#### **Room Placement**:
- **Location**: Nightstand or desk area
- **Material**: Laminated card stock
- **Size**: 3" x 3" minimum for easy scanning
- **Text**: "Scan to order from Kleo Restaurant"

#### **Pool Placement**:
- **Location**: Tables, chairs, cabana areas
- **Material**: Weatherproof laminated cards
- **Mounting**: Table tents or adhesive backing
- **Visibility**: Ensure clear sight lines

---

## 🔄 **SYSTEM MAINTENANCE**

### **📈 Performance Monitoring**

#### **Daily Checks**:
- Monitor order volume through admin dashboard
- Check for any browser compatibility issues
- Verify QR codes are scanning properly
- Test notification sounds on staff devices

#### **Weekly Reviews**:
- Review order data and popular items
- Check for any broken QR codes
- Update menu items or pricing as needed
- Staff feedback on system performance

### **🔧 Technical Updates**

#### **Updating Menu Items**:
1. Edit `menu.html` file
2. Test changes on staging environment
3. Commit changes to GitHub repository
4. Changes deploy automatically via GitHub Pages

#### **System Backups**:
- **Code**: Automatically backed up in GitHub repository
- **Order Data**: Stored in browser localStorage (ephemeral)
- **Configuration**: Document any customizations made

### **🐛 Bug Fixes & Updates**

#### **Common Issues & Solutions**:

**Orders Not Appearing**:
- Check internet connectivity
- Clear browser cache
- Refresh admin dashboard

**QR Codes Not Working**:
- Verify URL format is correct
- Check for typos in location parameters
- Regenerate QR codes if needed

**Mobile Display Issues**:
- Test on various devices
- Check CSS media queries
- Verify viewport meta tag

---

## 📊 **ANALYTICS & REPORTING**

### **📈 Built-in Metrics**

#### **Admin Dashboard Shows**:
- Total orders today
- Pending orders count
- Preparing orders count
- Order timing and status

#### **Manual Tracking**:
- Export order data from PMS system
- Track popular menu items
- Monitor average order values
- Calculate delivery times

### **📋 Custom Reporting**

#### **Daily Reports**:
- Orders by time of day
- Popular menu items
- Average order value
- Service delivery times

#### **Weekly Analysis**:
- Room service vs. pool service ratio
- Peak ordering hours
- Guest satisfaction feedback
- Revenue impact

---

## 🔒 **SECURITY & PRIVACY**

### **🛡️ Data Protection**

#### **Guest Information**:
- No payment processing (PCI compliance not required)
- Guest names and phone numbers stored temporarily
- No sensitive data permanently stored
- GDPR compliance through minimal data collection

#### **System Security**:
- No backend database to secure
- Static file hosting on GitHub Pages
- HTTPS encryption automatically provided
- No admin login required (physical device security)

### **🔐 Access Control**

#### **Staff Access**:
- Admin dashboard accessible to all staff
- No user accounts or passwords required
- Device-based security (keep tablets secure)
- Clear screen policies when unattended

---

## 🚀 **DEPLOYMENT & UPDATES**

### **📤 Making Changes Live**

#### **GitHub Pages Deployment**:
1. Edit files in repository
2. Commit changes to main branch
3. Changes automatically deploy within 5-10 minutes
4. Test changes on live system

#### **Emergency Updates**:
- Access GitHub repository directly
- Make urgent changes to menu or pricing
- Changes deploy automatically
- Staff notification of updates

### **🔄 Version Control**

#### **Best Practices**:
- Document all changes in commit messages
- Test changes before deployment
- Keep backup of working configurations
- Track when menu updates are made

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **🆘 Technical Support Contacts**

#### **System Issues**:
- **GitHub Repository**: https://github.com/Ales2323/test
- **Documentation**: Available in repository
- **Updates**: Automatic via GitHub Pages

#### **Training & Setup**:
- Use this SOP for staff training
- Practice with test orders before going live
- Regular staff refresher training recommended

### **📚 Additional Resources**

#### **Documentation**:
- Team SOP: `TEAM_SOP_ORDER_MANAGEMENT.md`
- System Overview: `workflow_next_steps.md`
- Technical Notes: Comments in HTML files

#### **External Resources**:
- **Font Awesome Icons**: https://fontawesome.com/icons
- **GitHub Pages Help**: https://pages.github.com/
- **QR Code Best Practices**: Industry standards for QR deployment

---

## ✅ **CONFIGURATION CHECKLIST**

### **🎯 Initial Setup**
- [ ] Update hotel/restaurant branding
- [ ] Configure contact information
- [ ] Set local tax rates
- [ ] Configure delivery fees
- [ ] Add all room numbers
- [ ] Add pool service areas
- [ ] Generate and deploy QR codes
- [ ] Train staff on system
- [ ] Test complete order workflow

### **🔄 Ongoing Maintenance**
- [ ] Review menu items monthly
- [ ] Update pricing as needed
- [ ] Monitor system performance
- [ ] Replace damaged QR codes
- [ ] Staff refresher training quarterly
- [ ] Document any customizations made

---

**⚙️ For technical questions or advanced customizations, refer to the HTML file comments or consult with IT department.**