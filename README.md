# KLEO Restaurant - In-Room Dining & Pool/Cabana Ordering System

A comprehensive ordering system for Hotel Indigo's KLEO restaurant, designed for in-room dining and pool/cabana ordering via QR codes.

## Features

### Guest-Facing Interface
- **Modern, responsive design** based on industry-leading hotel ordering systems
- **QR code-based ordering** for different locations (rooms, pool, cabanas)
- **Real-time menu browsing** with categories and subcategories
- **Shopping cart functionality** with item customization
- **Order confirmation** with delivery estimates
- **Mobile-optimized** interface for seamless guest experience

### Admin Dashboard
- **Real-time order management** with live updates via WebSocket
- **QR code generation** for different hotel areas
- **Menu management** with pricing and availability controls
- **Order status tracking** (pending, preparing, ready, completed)
- **Analytics and reporting** with revenue metrics and popular items
- **POS system integration** ready for server confirmation

## Technology Stack

- **Backend**: Node.js with Express.js
- **Real-time Communication**: Socket.IO
- **Frontend**: Vanilla JavaScript with modern CSS
- **QR Code Generation**: qrcode library
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kleo-restaurant-ordering
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Guest ordering: `http://localhost:3000/order/room-231`
   - Admin dashboard: `http://localhost:3000/admin`

## Usage

### For Guests

1. **Scan QR Code**: Guests scan QR codes placed in their room, by the pool, or in cabanas
2. **Browse Menu**: Navigate through menu categories (Breakfast, All Day Dining, Beverages)
3. **Add Items**: Click on menu items to add them to cart with customizations
4. **Checkout**: Enter room number and personal details
5. **Confirmation**: Receive order confirmation with delivery estimate

### For Staff

1. **Admin Dashboard**: Access via `/admin` route
2. **Order Management**: View and manage incoming orders in real-time
3. **Status Updates**: Update order status as it progresses through the kitchen
4. **QR Code Management**: Generate new QR codes for different locations
5. **Menu Management**: Add, edit, and manage menu items and pricing
6. **Reports**: View analytics and revenue metrics

## API Endpoints

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Add new menu item

### QR Codes
- `GET /api/qr-codes` - Get all QR codes
- `POST /api/qr-codes` - Generate new QR code

### Analytics
- `GET /api/stats` - Get restaurant statistics

## QR Code Locations

The system supports QR codes for:
- **Rooms**: Individual room numbers (e.g., Room 231)
- **Pool Areas**: Main pool, poolside areas
- **Cabanas**: Individual cabana numbers
- **Lobby**: Hotel lobby areas

## Order Flow

1. **Order Placed**: Guest submits order through mobile interface
2. **Real-time Notification**: Admin dashboard receives instant notification
3. **Kitchen Processing**: Staff can update order status (preparing, ready)
4. **Delivery**: Order marked as completed upon delivery
5. **Payment**: Cash, card, or room charge upon delivery

## Customization

### Menu Categories
The system supports flexible menu categories:
- STARTERS
- 10' HEARTH FIRED PIZZAS
- LARGE PLATES
- ADD-ONS
- SIDES
- DESSERTS
- BEVERAGES

### Pricing
- Base item pricing
- Add-on pricing
- Delivery fee ($4.00)
- Tax calculation (11%)

### Operating Hours
- Configurable opening/closing times
- Item availability controls
- Service area restrictions

## Security Features

- **Rate limiting** on API endpoints
- **Input validation** and sanitization
- **CORS protection**
- **Helmet.js** security headers
- **Compression** for performance

## Performance Features

- **Real-time updates** via WebSocket
- **Responsive design** for all devices
- **Optimized loading** with compression
- **Caching** for static assets
- **Mobile-first** approach

## Deployment

### Production Setup
1. Set environment variables:
   ```bash
   PORT=3000
   NODE_ENV=production
   ```

2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name kleo-restaurant
   ```

3. Set up reverse proxy (nginx recommended)

### Database Integration
For production use, replace in-memory storage with:
- PostgreSQL for orders and menu items
- Redis for real-time features
- File storage for QR code images

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For technical support or questions:
- Email: support@kleorestaurant.com
- Phone: (555) 123-4567

## Roadmap

### Phase 2 Features
- [ ] Payment gateway integration
- [ ] Loyalty program integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Inventory management
- [ ] Staff scheduling integration
- [ ] Customer feedback system
- [ ] Push notifications

### Phase 3 Features
- [ ] AI-powered order recommendations
- [ ] Predictive analytics
- [ ] Advanced reporting
- [ ] Third-party delivery integration
- [ ] Mobile app development
- [ ] Voice ordering capabilities

---

**KLEO Restaurant** - Elevating the hotel dining experience through technology.