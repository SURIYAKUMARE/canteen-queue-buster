import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initialMenuItems } from './data/menu.js';
import { initialForecastBuckets, computeForecastMetrics } from './data/historicalForecast.js';
import { assignPickupSlot, formatMinutesToSlotTime, generateSlots } from './utils/scheduler.js';
import { parseNaturalLanguageOrder } from './utils/nlpParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory data store
let menuItems = [...initialMenuItems];
let forecastBuckets = JSON.parse(JSON.stringify(initialForecastBuckets));
let maxCapacityPerSlot = 6; // max items per 5-min slot
let baseSimulatedMinutes = 12 * 60; // 12:00 PM
let tokenCounter = 104;

// SSE connected clients
let sseClients = [];

function broadcast(eventType, payload) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
}

// Initial seed orders
let orders = [
  {
    id: 'ord-101',
    tokenNumber: 'TK-101',
    studentName: 'Rohan Sharma',
    studentPhone: '+91 98765 43210',
    items: [
      { id: 'item-1', name: 'Veg Thali Deluxe', quantity: 1, price: 80, emoji: '🍱', modifiers: ['No Onion/Garlic'] },
      { id: 'item-9', name: 'Kulhad Masala Chai', quantity: 1, price: 15, emoji: '☕', modifiers: ['Less / No Sugar'] }
    ],
    totalItems: 2,
    totalAmount: 95,
    paymentMethod: 'Campus RFID Wallet',
    paymentStatus: 'PAID',
    pickupSlot: '12:05 PM',
    status: 'ready', // confirmed -> preparing -> ready -> completed
    notes: 'Please pack chai in thermal takeaway lid',
    counterBay: 'Bay 1',
    placedAt: '11:58 AM',
    readyAt: '12:04 PM',
    source: 'app'
  },
  {
    id: 'ord-102',
    tokenNumber: 'TK-102',
    studentName: 'Ananya Iyer',
    studentPhone: '+91 98123 45678',
    items: [
      { id: 'item-3', name: 'Crispy Masala Dosa', quantity: 2, price: 55, emoji: '🥞', modifiers: ['Extra Chutney'] },
      { id: 'item-10', name: 'Cold Coffee with Ice Cream', quantity: 1, price: 45, emoji: '🥤', modifiers: [] }
    ],
    totalItems: 3,
    totalAmount: 155,
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'PAID',
    pickupSlot: '12:10 PM',
    status: 'preparing',
    notes: 'Extra crispy dosa please',
    counterBay: 'Bay 2',
    placedAt: '12:01 PM',
    source: 'app'
  },
  {
    id: 'ord-103',
    tokenNumber: 'TK-103',
    studentName: 'Arjun Verma',
    studentPhone: '+91 97234 56789',
    items: [
      { id: 'item-4', name: 'Chole Bhature (2 Pcs)', quantity: 1, price: 70, emoji: '🫓', modifiers: [] },
      { id: 'item-7', name: 'Butter Pav Bhaji', quantity: 1, price: 65, emoji: '🥘', modifiers: ['Extra Butter'] }
    ],
    totalItems: 2,
    totalAmount: 135,
    paymentMethod: 'UPI (Paytm)',
    paymentStatus: 'PAID',
    pickupSlot: '12:10 PM',
    status: 'confirmed',
    notes: '',
    counterBay: 'Bay 1',
    placedAt: '12:03 PM',
    source: 'app'
  }
];

// Helper to compute slot aggregations
function getSlotAggregations() {
  const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'completed');
  const slotMap = {};

  // Pre-populate upcoming 10 slots
  const upcomingSlots = generateSlots(baseSimulatedMinutes, 10);
  upcomingSlots.forEach(s => {
    slotMap[s] = {
      slotTime: s,
      orders: [],
      totalItems: 0,
      itemCounts: {},
      isFull: false,
      capacityPct: 0
    };
  });

  // Populate from active orders
  activeOrders.forEach(ord => {
    const slot = ord.pickupSlot;
    if (!slotMap[slot]) {
      slotMap[slot] = {
        slotTime: slot,
        orders: [],
        totalItems: 0,
        itemCounts: {},
        isFull: false,
        capacityPct: 0
      };
    }

    slotMap[slot].orders.push(ord);
    slotMap[slot].totalItems += ord.totalItems || 1;

    ord.items.forEach(it => {
      slotMap[slot].itemCounts[it.name] = (slotMap[slot].itemCounts[it.name] || 0) + it.quantity;
    });
  });

  // Calculate capacities
  Object.values(slotMap).forEach(s => {
    s.capacityPct = Math.min(100, Math.round((s.totalItems / maxCapacityPerSlot) * 100));
    s.isFull = s.totalItems >= maxCapacityPerSlot;
  });

  return slotMap;
}

// ----------------- SSE ENDPOINT -----------------
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial connection state
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// ----------------- REST API ROUTES -----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', systemTime: formatMinutesToSlotTime(baseSimulatedMinutes), activeClients: sseClients.length });
});

// Menu
app.get('/api/menu', (req, res) => {
  res.json({ success: true, menu: menuItems });
});

// Config & Capacities
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    maxCapacityPerSlot,
    simulatedCurrentTime: formatMinutesToSlotTime(baseSimulatedMinutes),
    baseSimulatedMinutes,
    slots: getSlotAggregations()
  });
});

app.post('/api/config', (req, res) => {
  const { capacity, advanceMinutes } = req.body;
  if (typeof capacity === 'number' && capacity >= 1) {
    maxCapacityPerSlot = capacity;
  }
  if (typeof advanceMinutes === 'number') {
    baseSimulatedMinutes += advanceMinutes;
  }

  broadcast('CONFIG_UPDATED', {
    maxCapacityPerSlot,
    simulatedCurrentTime: formatMinutesToSlotTime(baseSimulatedMinutes)
  });

  res.json({
    success: true,
    maxCapacityPerSlot,
    simulatedCurrentTime: formatMinutesToSlotTime(baseSimulatedMinutes)
  });
});

// Orders
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    orders,
    slotAggregations: getSlotAggregations(),
    maxCapacityPerSlot
  });
});

app.post('/api/orders', (req, res) => {
  const { items = [], studentName = 'Student', studentPhone = '+91 98765 00000', paymentMethod = 'UPI', notes = '', source = 'app' } = req.body;

  if (!items.length) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Run slot scheduler
  const slotAssignment = assignPickupSlot({
    existingOrders: orders,
    orderItemCount: totalItems,
    maxCapacityPerSlot,
    baseMinutes: baseSimulatedMinutes,
    minPrepMinutes: 5
  });

  const newOrder = {
    id: `ord-${tokenCounter}`,
    tokenNumber: `TK-${tokenCounter++}`,
    studentName,
    studentPhone,
    items,
    totalItems,
    totalAmount,
    paymentMethod,
    paymentStatus: 'PAID',
    pickupSlot: slotAssignment.assignedSlot,
    status: 'confirmed',
    notes,
    counterBay: totalItems > 3 ? 'Bay 2 (Bulk)' : 'Bay 1 (Express)',
    placedAt: formatMinutesToSlotTime(baseSimulatedMinutes),
    schedulingInfo: slotAssignment,
    source
  };

  orders.unshift(newOrder);

  // Update actual count in forecast bucket if matches
  const bucketKey = slotAssignment.assignedSlot.split(' ')[0]; // e.g. "12:10"
  const fBucket = forecastBuckets.find(b => b.time === bucketKey);
  if (fBucket) {
    fBucket.actual += totalItems;
  }

  broadcast('ORDER_CREATED', { order: newOrder, slotAggregations: getSlotAggregations() });

  res.status(201).json({
    success: true,
    order: newOrder,
    slotScheduling: slotAssignment
  });
});

// Update order status (Staff Kitchen Action)
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = orders.find(o => o.id === id || o.tokenNumber === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const validStatuses = ['confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  order.status = status;
  if (status === 'ready') {
    order.readyAt = formatMinutesToSlotTime(baseSimulatedMinutes);
  } else if (status === 'completed') {
    order.completedAt = formatMinutesToSlotTime(baseSimulatedMinutes);
  }

  broadcast('ORDER_STATUS_CHANGED', { order, slotAggregations: getSlotAggregations() });

  res.json({ success: true, order });
});

// Natural Language Walk-in Parser
app.post('/api/nlp/parse', (req, res) => {
  const { text } = req.body;
  const parsedResult = parseNaturalLanguageOrder(text, menuItems);
  res.json({ success: true, result: parsedResult });
});

// Forecast data
app.get('/api/forecast', (req, res) => {
  const metrics = computeForecastMetrics(forecastBuckets);
  res.json({
    success: true,
    buckets: forecastBuckets,
    metrics
  });
});

// Simulation: Generate lunch rush orders
app.post('/api/simulate/rush', (req, res) => {
  const sampleStudents = ['Priya Nair', 'Vikram Patel', 'Siddharth Roy', 'Sneha Kulkarni', 'Aditya Sen'];
  const createdOrders = [];

  for (let i = 0; i < 4; i++) {
    const student = sampleStudents[i % sampleStudents.length];
    const randomMenu1 = menuItems[Math.floor(Math.random() * 4)]; // meals/fast
    const randomMenu2 = menuItems[8 + (i % 2)]; // tea/coffee

    const items = [
      { id: randomMenu1.id, name: randomMenu1.name, price: randomMenu1.price, emoji: randomMenu1.emoji, quantity: 1, modifiers: [] },
      { id: randomMenu2.id, name: randomMenu2.name, price: randomMenu2.price, emoji: randomMenu2.emoji, quantity: 1, modifiers: [] }
    ];

    const totalItems = items.reduce((s, it) => s + it.quantity, 0);
    const totalAmount = items.reduce((s, it) => s + (it.price * it.quantity), 0);

    const slotAssignment = assignPickupSlot({
      existingOrders: orders,
      orderItemCount: totalItems,
      maxCapacityPerSlot,
      baseMinutes: baseSimulatedMinutes,
      minPrepMinutes: 5
    });

    const newOrder = {
      id: `ord-${tokenCounter}`,
      tokenNumber: `TK-${tokenCounter++}`,
      studentName: student,
      studentPhone: `+91 99000 ${1000 + i}`,
      items,
      totalItems,
      totalAmount,
      paymentMethod: 'Campus RFID Wallet',
      paymentStatus: 'PAID',
      pickupSlot: slotAssignment.assignedSlot,
      status: 'confirmed',
      notes: 'Rush-hour simulated order',
      counterBay: 'Bay 1',
      placedAt: formatMinutesToSlotTime(baseSimulatedMinutes),
      schedulingInfo: slotAssignment,
      source: 'simulated_rush'
    };

    orders.unshift(newOrder);
    createdOrders.push(newOrder);
  }

  broadcast('RUSH_SIMULATED', { createdOrders, slotAggregations: getSlotAggregations() });

  res.json({
    success: true,
    message: 'Generated 4 rush pre-orders across slots',
    createdOrders,
    slotAggregations: getSlotAggregations()
  });
});

// Reset to initial demo state
app.post('/api/reset', (req, res) => {
  orders = [
    {
      id: 'ord-101',
      tokenNumber: 'TK-101',
      studentName: 'Rohan Sharma',
      studentPhone: '+91 98765 43210',
      items: [
        { id: 'item-1', name: 'Veg Thali Deluxe', quantity: 1, price: 80, emoji: '🍱', modifiers: ['No Onion/Garlic'] },
        { id: 'item-9', name: 'Kulhad Masala Chai', quantity: 1, price: 15, emoji: '☕', modifiers: ['Less / No Sugar'] }
      ],
      totalItems: 2,
      totalAmount: 95,
      paymentMethod: 'Campus RFID Wallet',
      paymentStatus: 'PAID',
      pickupSlot: '12:05 PM',
      status: 'ready',
      notes: 'Please pack chai in thermal takeaway lid',
      counterBay: 'Bay 1',
      placedAt: '11:58 AM',
      readyAt: '12:04 PM',
      source: 'app'
    },
    {
      id: 'ord-102',
      tokenNumber: 'TK-102',
      studentName: 'Ananya Iyer',
      studentPhone: '+91 98123 45678',
      items: [
        { id: 'item-3', name: 'Crispy Masala Dosa', quantity: 2, price: 55, emoji: '🥞', modifiers: ['Extra Chutney'] },
        { id: 'item-10', name: 'Cold Coffee with Ice Cream', quantity: 1, price: 45, emoji: '🥤', modifiers: [] }
      ],
      totalItems: 3,
      totalAmount: 155,
      paymentMethod: 'UPI (Google Pay)',
      paymentStatus: 'PAID',
      pickupSlot: '12:10 PM',
      status: 'preparing',
      notes: 'Extra crispy dosa please',
      counterBay: 'Bay 2',
      placedAt: '12:01 PM',
      source: 'app'
    },
    {
      id: 'ord-103',
      tokenNumber: 'TK-103',
      studentName: 'Arjun Verma',
      studentPhone: '+91 97234 56789',
      items: [
        { id: 'item-4', name: 'Chole Bhature (2 Pcs)', quantity: 1, price: 70, emoji: '🫓', modifiers: [] },
        { id: 'item-7', name: 'Butter Pav Bhaji', quantity: 1, price: 65, emoji: '🥘', modifiers: ['Extra Butter'] }
      ],
      totalItems: 2,
      totalAmount: 135,
      paymentMethod: 'UPI (Paytm)',
      paymentStatus: 'PAID',
      pickupSlot: '12:10 PM',
      status: 'confirmed',
      notes: '',
      counterBay: 'Bay 1',
      placedAt: '12:03 PM',
      source: 'app'
    }
  ];
  forecastBuckets = JSON.parse(JSON.stringify(initialForecastBuckets));
  maxCapacityPerSlot = 6;
  baseSimulatedMinutes = 12 * 60;
  tokenCounter = 104;

  broadcast('SYSTEM_RESET', { orders, slotAggregations: getSlotAggregations() });
  res.json({ success: true, message: 'Reset canteen state successfully' });
});

// Serve static frontend files if built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Smart Canteen Server] Running on http://localhost:${PORT}`);
});
