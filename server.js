const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// In-memory data storage (in production, use a database)
let orders = [];
let menuItems = [
  {
    id: 1,
    name: "Truffle & Pecorino Fries",
    description: "Crispy fries with truffle oil and pecorino cheese",
    price: 14.00,
    category: "STARTERS",
    available: true
  },
  {
    id: 2,
    name: "Chicken Wings",
    description: "Nashville Hot, BBQ or Buffalo sauce",
    price: 19.00,
    category: "STARTERS",
    available: true
  },
  {
    id: 3,
    name: "Gem Lettuce Caesar",
    description: "Fresh gem lettuce with classic caesar dressing",
    price: 16.00,
    category: "STARTERS",
    available: true
  },
  {
    id: 4,
    name: "Vesuvio Pizza",
    description: "Tomato Sauce, Stracciatella, Hearth Roasted Tomato, Basil",
    price: 19.00,
    category: "10' HEARTH FIRED PIZZAS",
    available: true
  },
  {
    id: 5,
    name: "Salsiccia Pizza",
    description: "Tomato, Mozzarella, Palato Fennel Sausage, Hot Honey",
    price: 21.00,
    category: "10' HEARTH FIRED PIZZAS",
    available: true
  },
  {
    id: 6,
    name: "Fra' Mani Pepperoni Pizza",
    description: "Tomato, Mozzarella, Pepperoni",
    price: 20.00,
    category: "10' HEARTH FIRED PIZZAS",
    available: true
  },
  {
    id: 7,
    name: "Add Chicken Breast",
    description: "Add grilled chicken breast to any dish",
    price: 12.00,
    category: "ADD-ONS",
    available: true
  },
  {
    id: 8,
    name: "Add Shrimp",
    description: "Add grilled shrimp to any dish",
    price: 16.00,
    category: "ADD-ONS",
    available: true
  },
  {
    id: 9,
    name: "Add Salmon",
    description: "Add grilled salmon to any dish",
    price: 16.00,
    category: "ADD-ONS",
    available: true
  },
  {
    id: 10,
    name: "Fries",
    description: "Crispy golden fries",
    price: 8.00,
    category: "SIDES",
    available: true
  }
];

let qrCodes = [
  {
    id: "room-231",
    name: "Room 231",
    type: "room",
    qrData: "https://kleo-restaurant.com/order/room-231"
  },
  {
    id: "pool-main",
    name: "Main Pool",
    type: "pool",
    qrData: "https://kleo-restaurant.com/order/pool-main"
  },
  {
    id: "cabana-1",
    name: "Cabana 1",
    type: "cabana",
    qrData: "https://kleo-restaurant.com/order/cabana-1"
  },
  {
    id: "cabana-2",
    name: "Cabana 2",
    type: "cabana",
    qrData: "https://kleo-restaurant.com/order/cabana-2"
  }
];

// API Routes
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const order = {
    id: uuidv4(),
    ...req.body,
    status: 'pending',
    createdAt: new Date(),
    orderNumber: Math.floor(10000000 + Math.random() * 90000000)
  };
  orders.push(order);
  
  // Emit to admin dashboard
  io.emit('newOrder', order);
  
  res.json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    order.updatedAt = new Date();
    
    // Emit status update
    io.emit('orderStatusUpdate', { id, status });
    
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.get('/api/qr-codes', (req, res) => {
  res.json(qrCodes);
});

app.post('/api/qr-codes', async (req, res) => {
  const { name, type } = req.body;
  const id = `${type}-${Date.now()}`;
  const qrData = `https://kleo-restaurant.com/order/${id}`;
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    
    const newQRCode = {
      id,
      name,
      type,
      qrData,
      qrCodeImage: qrCodeDataURL,
      createdAt: new Date()
    };
    
    qrCodes.push(newQRCode);
    res.json(newQRCode);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get('/api/stats', (req, res) => {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
  
  const popularItems = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      popularItems[item.name] = (popularItems[item.name] || 0) + item.quantity;
    });
  });
  
  res.json({
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue: totalRevenue.toFixed(2),
    popularItems: Object.entries(popularItems)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/order/:location', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`KLEO Restaurant ordering system running on port ${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`Guest ordering: http://localhost:${PORT}/order/room-231`);
});