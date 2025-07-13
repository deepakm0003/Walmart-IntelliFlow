import express from 'express';
import cors from 'cors';
import cron from 'node-cron';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced mock data storage
let warehouses = [
  {
    id: 'MH001',
    name: 'Bhiwandi Fulfillment Center',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    type: 'Fulfillment Center (Dark Store)',
    population: 944000,
    coordinates: [19.2948, 73.0634],
    capacity: 50000,
    currentStock: 42000,
    criticalItems: 12,
    monthlyOrders: 8500,
    efficiency: 94
  },
  // Add more warehouses here...
];

let alerts = [
  {
    id: 'alert-001',
    type: 'critical',
    title: 'Critical Stock Level - Hyderabad',
    message: 'Cold Beverages below 15% threshold. Heatwave causing 300% demand spike.',
    timestamp: new Date().toISOString(),
    warehouseId: 'TG001',
    actionRequired: true
  }
];

// New data structures
let shipments = [
  {
    id: 'SHIP-001',
    type: 'ship',
    origin: 'Mumbai Port',
    destination: 'Bhiwandi Fulfillment Center',
    warehouseId: 'MH001',
    cargo: ['Cold Beverages - 500ml (5000 units)', 'Cooking Oil - 1L (2000 units)'],
    status: 'in_transit',
    coordinates: [19.0760, 72.8777],
    estimatedArrival: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    weatherImpact: true
  },
  {
    id: 'AIR-001',
    type: 'airplane',
    origin: 'Delhi Airport',
    destination: 'Hyderabad Best Price Store',
    warehouseId: 'TG001',
    cargo: ['Personal Care Kit (1500 units)', 'Packaged Snacks (3000 units)'],
    status: 'in_transit',
    coordinates: [17.2403, 78.4294],
    estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    priority: 'critical',
    weatherImpact: false
  }
];

let purchaseOrders = [
  {
    id: 'PO-2025-001',
    warehouseId: 'TG001',
    items: [
      { name: 'Cold Beverages - 500ml', quantity: 8000, urgency: 'critical' },
      { name: 'Packaged Snacks', quantity: 5000, urgency: 'high' }
    ],
    totalValue: 425000,
    supplier: 'Coca-Cola India Pvt Ltd',
    requestedBy: 'AI Agent - Demand Forecaster',
    requestedAt: new Date().toISOString(),
    status: 'pending',
    estimatedDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  }
];

let aiAgents = [
  {
    id: 'agent-001',
    name: 'DemandBot Pro',
    type: 'demand_forecaster',
    status: 'active',
    lastAction: 'Generated critical stock alert for Hyderabad beverages',
    recommendations: 47,
    accuracy: 94.2
  },
  {
    id: 'agent-002',
    name: 'RouteOptimizer AI',
    type: 'route_optimizer',
    status: 'processing',
    lastAction: 'Rerouting SHIP-002 due to weather conditions',
    recommendations: 23,
    accuracy: 91.8
  }
];

let inventoryData = {};
let predictions = {};

// Helper functions
const generateInventoryForWarehouse = (warehouseId) => {
  const baseItems = [
    { name: 'Cold Beverages - 500ml', category: 'Beverages', baseStock: 5000, basePrice: 25 },
    { name: 'Cooking Oil - 1L', category: 'Groceries', baseStock: 3000, basePrice: 120 },
    { name: 'Rice - 25kg', category: 'Staples', baseStock: 2000, basePrice: 1200 },
    { name: 'Wheat Flour - 10kg', category: 'Staples', baseStock: 2500, basePrice: 350 },
    { name: 'Detergent Powder - 1kg', category: 'Home Care', baseStock: 1500, basePrice: 180 },
    { name: 'Personal Care Kit', category: 'Personal Care', baseStock: 1200, basePrice: 450 },
    { name: 'Fresh Vegetables - Mixed', category: 'Fresh Produce', baseStock: 800, basePrice: 80 },
    { name: 'Packaged Snacks', category: 'Snacks', baseStock: 4000, basePrice: 35 },
    { name: 'Tea Leaves - 250g', category: 'Beverages', baseStock: 2200, basePrice: 95 },
    { name: 'Milk Powder - 500g', category: 'Dairy', baseStock: 1800, basePrice: 280 }
  ];

  return baseItems.map((item, index) => {
    const variance = Math.random() * 0.4 + 0.8;
    const currentStock = Math.floor(item.baseStock * variance);
    const minThreshold = Math.floor(item.baseStock * 0.2);
    const maxCapacity = Math.floor(item.baseStock * 1.5);
    
    return {
      id: `${warehouseId}-${index + 1}`,
      name: item.name,
      category: item.category,
      currentStock,
      minThreshold,
      maxCapacity,
      demand: Math.floor(Math.random() * 500) + 100,
      price: item.basePrice,
      supplier: getRandomSupplier(),
      lastRestocked: getRandomDate(-30, 0),
      predictedStockout: getRandomDate(5, 30)
    };
  });
};

const getRandomSupplier = () => {
  const suppliers = [
    'Hindustan Unilever Ltd',
    'ITC Limited',
    'Britannia Industries',
    'Nestle India',
    'Parle Products',
    'Godrej Consumer Products',
    'Adani Wilmar',
    'Emami Limited'
  ];
  return suppliers[Math.floor(Math.random() * suppliers.length)];
};

const getRandomDate = (minDays, maxDays) => {
  const date = new Date();
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  date.setDate(date.getDate() + randomDays);
  return date.toISOString().split('T')[0];
};

const generatePredictionsForWarehouse = (warehouseId) => {
  const categories = ['Beverages', 'Groceries', 'Staples', 'Home Care'];
  return categories.map(category => ({
    warehouseId,
    category,
    predictedDemand: Math.floor(Math.random() * 5000) + 2000,
    confidence: Math.floor(Math.random() * 20) + 80,
    factors: ['Weather', 'Festival', 'Season'].slice(0, Math.floor(Math.random() * 3) + 1),
    recommendedAction: 'Monitor stock levels and adjust procurement accordingly'
  }));
};

// Initialize data
const initializeData = () => {
  warehouses.forEach(warehouse => {
    inventoryData[warehouse.id] = generateInventoryForWarehouse(warehouse.id);
    predictions[warehouse.id] = generatePredictionsForWarehouse(warehouse.id);
  });
};

// Routes
app.get('/api/warehouses', (req, res) => {
  res.json(warehouses);
});

app.get('/api/warehouses/:id', (req, res) => {
  const warehouse = warehouses.find(w => w.id === req.params.id);
  if (!warehouse) {
    return res.status(404).json({ error: 'Warehouse not found' });
  }
  res.json(warehouse);
});

app.get('/api/warehouses/:id/inventory', (req, res) => {
  const inventory = inventoryData[req.params.id] || [];
  res.json(inventory);
});

app.get('/api/warehouses/:id/predictions', (req, res) => {
  const warehousePredictions = predictions[req.params.id] || [];
  res.json(warehousePredictions);
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/weather-alerts', (req, res) => {
  const weatherAlerts = [
    {
      id: 'weather-001',
      region: 'Maharashtra Coast',
      type: 'heavy_rain',
      severity: 'high',
      description: 'Heavy rainfall expected for next 48 hours. Port operations may be affected.',
      affectedRoutes: ['Mumbai-Pune', 'Mumbai-Nashik'],
      timestamp: new Date().toISOString()
    },
    {
      id: 'weather-002',
      region: 'North India',
      type: 'heat_wave',
      severity: 'medium',
      description: 'Temperature rising to 42°C. Increased demand for cooling products expected.',
      affectedRoutes: ['Delhi-Punjab', 'Rajasthan-MP'],
      timestamp: new Date().toISOString()
    }
  ];
  res.json(weatherAlerts);
});

// New API endpoints
app.get('/api/shipments', (req, res) => {
  res.json(shipments);
});

app.get('/api/shipments/:id', (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }
  res.json(shipment);
});

app.get('/api/purchase-orders', (req, res) => {
  res.json(purchaseOrders);
});

app.post('/api/purchase-orders', (req, res) => {
  const newOrder = {
    id: `PO-2025-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
    ...req.body,
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };
  purchaseOrders.push(newOrder);
  res.json(newOrder);
});

app.put('/api/purchase-orders/:id/approve', (req, res) => {
  const order = purchaseOrders.find(po => po.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Purchase order not found' });
  }
  
  order.status = 'approved';
  order.approvedAt = new Date().toISOString();
  
  // Simulate sending to external systems
  console.log(`📧 Sending PO ${order.id} to supplier: ${order.supplier}`);
  console.log(`📦 Notifying logistics for warehouse: ${order.warehouseId}`);
  console.log(`📊 Updating inventory management system`);
  
  res.json(order);
});

app.delete('/api/purchase-orders/:id', (req, res) => {
  purchaseOrders = purchaseOrders.filter(po => po.id !== req.params.id);
  res.json({ success: true });
});

app.get('/api/ai-agents', (req, res) => {
  res.json(aiAgents);
});

app.post('/api/ai-chat', (req, res) => {
  const { message } = req.body;
  
  // Simple AI response simulation
  const responses = [
    `Based on current data analysis, I recommend increasing cold beverage inventory in Hyderabad by 40% due to the ongoing heatwave affecting the region.`,
    `Weather monitoring shows heavy rainfall in Maharashtra. I've automatically initiated rerouting protocols for 2 active shipments to prevent delays.`,
    `Demand forecasting indicates a 25% increase in gift items for the upcoming Ganesh Chaturthi festival. Shall I generate emergency purchase orders?`,
    `Critical inventory alert: 3 warehouses have fallen below minimum threshold for cooking oil. I recommend immediate emergency restocking from backup suppliers.`,
    `Route optimization analysis complete. The new delivery schedule will reduce transportation costs by 15% and decrease carbon footprint by 12%.`
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  setTimeout(() => {
    res.json({
      message: response,
      timestamp: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 20) + 80
    });
  }, 1000 + Math.random() * 2000); // Simulate processing time
});

app.post('/api/alerts/:id/dismiss', (req, res) => {
  alerts = alerts.filter(alert => alert.id !== req.params.id);
  res.json({ success: true });
});

// Enhanced real-time data simulation
cron.schedule('*/30 * * * * *', () => {
  // Update stock levels randomly
  warehouses.forEach(warehouse => {
    if (Math.random() < 0.1) { // 10% chance of update
      warehouse.currentStock += Math.floor(Math.random() * 200) - 100;
      warehouse.currentStock = Math.max(0, Math.min(warehouse.capacity, warehouse.currentStock));
      warehouse.criticalItems = Math.floor(Math.random() * 15);
    }
  });
  
  // Update shipment positions
  shipments.forEach(shipment => {
    if (shipment.status === 'in_transit' && Math.random() < 0.3) {
      shipment.coordinates = [
        shipment.coordinates[0] + (Math.random() - 0.5) * 0.1,
        shipment.coordinates[1] + (Math.random() - 0.5) * 0.1
      ];
    }
  });
  
  // Update AI agent activities
  aiAgents.forEach(agent => {
    if (Math.random() < 0.1) {
      agent.recommendations += Math.floor(Math.random() * 3);
      agent.accuracy = Math.max(85, Math.min(99, agent.accuracy + (Math.random() - 0.5) * 2));
    }
  });
  
  // Generate new alerts occasionally
  if (Math.random() < 0.05) { // 5% chance
    const newAlert = {
      id: `alert-${Date.now()}`,
      type: Math.random() < 0.3 ? 'critical' : 'warning',
      title: 'System Generated Alert',
      message: 'Automated monitoring detected an anomaly requiring attention.',
      timestamp: new Date().toISOString(),
      warehouseId: warehouses[Math.floor(Math.random() * warehouses.length)].id,
      actionRequired: Math.random() < 0.6
    };
    alerts.push(newAlert);
    
    // Keep only last 10 alerts
    if (alerts.length > 10) {
      alerts = alerts.slice(-10);
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    warehouses: warehouses.length,
    alerts: alerts.length,
    shipments: shipments.length,
    purchaseOrders: purchaseOrders.length,
    aiAgents: aiAgents.length
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Initialize and start server
initializeData();

app.listen(PORT, () => {
  console.log(`Walmart IntelliFlow API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;