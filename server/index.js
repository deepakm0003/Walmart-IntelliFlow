import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { Server } from 'socket.io';
import http from 'http';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [/^http:\/\/localhost:\d+$/, "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/, "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());

// Enhanced mock data storage with 20 warehouses
let warehouses = [
  // Maharashtra (4 warehouses)
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
  {
    id: 'MH002',
    name: 'Pune Distribution Hub',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'Distribution Center',
    population: 3500000,
    coordinates: [18.5204, 73.8567],
    capacity: 75000,
    currentStock: 68000,
    criticalItems: 8,
    monthlyOrders: 12000,
    efficiency: 96
  },
  {
    id: 'MH003',
    name: 'Nagpur Best Price Store',
    city: 'Nagpur',
    state: 'Maharashtra',
    type: 'Best Price Wholesale Store',
    population: 2800000,
    coordinates: [21.1458, 79.0882],
    capacity: 45000,
    currentStock: 39500,
    criticalItems: 5,
    monthlyOrders: 7800,
    efficiency: 92
  },
  {
    id: 'MH004',
    name: 'Aurangabad Fulfillment Center',
    city: 'Aurangabad',
    state: 'Maharashtra',
    type: 'Fulfillment Center',
    population: 1200000,
    coordinates: [19.8762, 75.3433],
    capacity: 35000,
    currentStock: 29800,
    criticalItems: 7,
    monthlyOrders: 6200,
    efficiency: 89
  },

  // Andhra Pradesh (2 warehouses)
  {
    id: 'AP001',
    name: 'Guntur Best Price Store',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    type: 'Best Price Wholesale Store',
    population: 962000,
    coordinates: [16.3067, 80.4365],
    capacity: 25000,
    currentStock: 18500,
    criticalItems: 8,
    monthlyOrders: 4200,
    efficiency: 89
  },
  {
    id: 'AP002',
    name: 'Visakhapatnam Best Price Store',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    type: 'Best Price Wholesale Store',
    population: 2000000,
    coordinates: [17.6868, 83.2185],
    capacity: 35000,
    currentStock: 31200,
    criticalItems: 5,
    monthlyOrders: 7800,
    efficiency: 92
  },

  // Telangana (2 warehouses)
  {
    id: 'TG001',
    name: 'Hyderabad Best Price Store',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Best Price Wholesale Store',
    population: 11300000,
    coordinates: [17.3850, 78.4867],
    capacity: 55000,
    currentStock: 51800,
    criticalItems: 2,
    monthlyOrders: 12500,
    efficiency: 98
  },
  {
    id: 'TG002',
    name: 'Warangal Distribution Center',
    city: 'Warangal',
    state: 'Telangana',
    type: 'Distribution Center',
    population: 800000,
    coordinates: [17.9689, 79.5941],
    capacity: 30000,
    currentStock: 26500,
    criticalItems: 6,
    monthlyOrders: 5500,
    efficiency: 91
  },

  // Uttar Pradesh (2 warehouses)
  {
    id: 'UP001',
    name: 'Kanpur Best Price Store',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'Best Price Wholesale Store',
    population: 3200000,
    coordinates: [26.4499, 80.3319],
    capacity: 40000,
    currentStock: 35200,
    criticalItems: 4,
    monthlyOrders: 8800,
    efficiency: 93
  },
  {
    id: 'UP002',
    name: 'Lucknow Best Price Store',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'Best Price Wholesale Store',
    population: 3400000,
    coordinates: [26.8467, 80.9462],
    capacity: 45000,
    currentStock: 39800,
    criticalItems: 3,
    monthlyOrders: 9800,
    efficiency: 95
  },

  // Madhya Pradesh (2 warehouses)
  {
    id: 'MP001',
    name: 'Bhopal Best Price Store',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    type: 'Best Price Wholesale Store',
    population: 1900000,
    coordinates: [23.2599, 77.4126],
    capacity: 32000,
    currentStock: 28900,
    criticalItems: 4,
    monthlyOrders: 6800,
    efficiency: 93
  },
  {
    id: 'MP002',
    name: 'Indore Best Price Store',
    city: 'Indore',
    state: 'Madhya Pradesh',
    type: 'Best Price Wholesale Store',
    population: 3000000,
    coordinates: [22.7196, 75.8577],
    capacity: 40000,
    currentStock: 37200,
    criticalItems: 3,
    monthlyOrders: 9200,
    efficiency: 96
  },

  // Punjab (1 warehouse)
  {
    id: 'PB001',
    name: 'Amritsar Best Price Store',
    city: 'Amritsar',
    state: 'Punjab',
    type: 'Best Price Wholesale Store',
    population: 1200000,
    coordinates: [31.6340, 74.8723],
    capacity: 27000,
    currentStock: 24300,
    criticalItems: 6,
    monthlyOrders: 5700,
    efficiency: 90
  },

  // Delhi (1 warehouse)
  {
    id: 'DL001',
    name: 'Delhi Distribution Center',
    city: 'Delhi',
    state: 'Delhi',
    type: 'Fulfillment Center (Dark Store)',
    population: 20000000,
    coordinates: [28.7041, 77.1025],
    capacity: 80000,
    currentStock: 72000,
    criticalItems: 1,
    monthlyOrders: 15000,
    efficiency: 99
  },

  // Karnataka (2 warehouses)
  {
    id: 'KA001',
    name: 'Bangalore Best Price Store',
    city: 'Bangalore',
    state: 'Karnataka',
    type: 'Best Price Wholesale Store',
    population: 12000000,
    coordinates: [12.9716, 77.5946],
    capacity: 60000,
    currentStock: 54800,
    criticalItems: 2,
    monthlyOrders: 11000,
    efficiency: 97
  },
  {
    id: 'KA002',
    name: 'Mysore Fulfillment Center',
    city: 'Mysore',
    state: 'Karnataka',
    type: 'Fulfillment Center',
    population: 1000000,
    coordinates: [12.2958, 76.6394],
    capacity: 28000,
    currentStock: 24500,
    criticalItems: 5,
    monthlyOrders: 4800,
    efficiency: 88
  },

  // Tamil Nadu (2 warehouses)
  {
    id: 'TN001',
    name: 'Chennai Best Price Store',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'Best Price Wholesale Store',
    population: 11000000,
    coordinates: [13.0827, 80.2707],
    capacity: 50000,
    currentStock: 45200,
    criticalItems: 3,
    monthlyOrders: 9500,
    efficiency: 94
  },
  {
    id: 'TN002',
    name: 'Coimbatore Distribution Hub',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    type: 'Distribution Center',
    population: 2100000,
    coordinates: [11.0168, 76.9558],
    capacity: 35000,
    currentStock: 31200,
    criticalItems: 4,
    monthlyOrders: 7200,
    efficiency: 92
  },

  // Gujarat (1 warehouse)
  {
    id: 'GJ001',
    name: 'Ahmedabad Best Price Store',
    city: 'Ahmedabad',
    state: 'Gujarat',
    type: 'Best Price Wholesale Store',
    population: 7200000,
    coordinates: [23.0225, 72.5714],
    capacity: 45000,
    currentStock: 40800,
    criticalItems: 3,
    monthlyOrders: 8900,
    efficiency: 95
  },

  // Rajasthan (1 warehouse)
  {
    id: 'RJ001',
    name: 'Jaipur Best Price Store',
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'Best Price Wholesale Store',
    population: 3500000,
    coordinates: [26.9124, 75.7873],
    capacity: 38000,
    currentStock: 34200,
    criticalItems: 4,
    monthlyOrders: 7600,
    efficiency: 93
  },

  // West Bengal (1 warehouse)
  {
    id: 'WB001',
    name: 'Kolkata Best Price Store',
    city: 'Kolkata',
    state: 'West Bengal',
    type: 'Best Price Wholesale Store',
    population: 15000000,
    coordinates: [22.5726, 88.3639],
    capacity: 55000,
    currentStock: 49800,
    criticalItems: 2,
    monthlyOrders: 10200,
    efficiency: 96
  },

  // Kerala (1 warehouse)
  {
    id: 'KL001',
    name: 'Kochi Fulfillment Center',
    city: 'Kochi',
    state: 'Kerala',
    type: 'Fulfillment Center',
    population: 2200000,
    coordinates: [9.9312, 76.2673],
    capacity: 32000,
    currentStock: 28500,
    criticalItems: 5,
    monthlyOrders: 6400,
    efficiency: 91
  }
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

// Distance calculation function (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Real-time movement simulation
const updateShipmentPositions = () => {
  shipments.forEach(shipment => {
    if (shipment.status === 'in_transit' && shipment.route && shipment.route.length > 1) {
      const currentPoint = shipment.route[shipment.currentRouteIndex];
      const nextPoint = shipment.route[shipment.currentRouteIndex + 1];
      
      if (nextPoint) {
        // Calculate distance to next point
        const distance = calculateDistance(
          currentPoint[0], currentPoint[1],
          nextPoint[0], nextPoint[1]
        );
        
        // Calculate time to reach next point based on speed
        const timeToNext = (distance / shipment.speed) * 3600; // Convert to seconds
        
        // Update position based on time elapsed
        const timeElapsed = (Date.now() - new Date(shipment.lastUpdate).getTime()) / 1000;
        const progress = Math.min(timeElapsed / timeToNext, 1);
        
        if (progress >= 1) {
          // Move to next route point
          shipment.currentRouteIndex++;
          shipment.coordinates = nextPoint;
          
          // Check if reached destination
          if (shipment.currentRouteIndex >= shipment.route.length - 1) {
            shipment.status = 'arrived';
            shipment.coordinates = shipment.route[shipment.route.length - 1];
          }
        } else {
          // Interpolate position
          shipment.coordinates = [
            currentPoint[0] + (nextPoint[0] - currentPoint[0]) * progress,
            currentPoint[1] + (nextPoint[1] - currentPoint[1]) * progress
          ];
        }
        
        shipment.lastUpdate = new Date().toISOString();
      }
    }
  });
  
  // Emit updated data to connected clients
  io.emit('shipments-updated', shipments);
};

// Calculate distances between warehouses and shipments
const calculateWarehouseDistances = () => {
  const distances = {};
  
  warehouses.forEach(warehouse => {
    distances[warehouse.id] = {};
    shipments.forEach(shipment => {
      if (shipment.warehouseId === warehouse.id) {
        const distance = calculateDistance(
          shipment.coordinates[0], shipment.coordinates[1],
          warehouse.coordinates[0], warehouse.coordinates[1]
        );
        distances[warehouse.id][shipment.id] = Math.round(distance * 100) / 100;
      }
    });
  });
  
  return distances;
};

// Enhanced shipments with more vehicles and real-time tracking
let shipments = [
  // Ships
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
    weatherImpact: true,
    speed: 15, // knots
    route: [[19.0760, 72.8777], [19.2948, 73.0634]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'SHIP-002',
    type: 'ship',
    origin: 'Chennai Port',
    destination: 'Visakhapatnam Best Price Store',
    warehouseId: 'AP002',
    cargo: ['Rice - 25kg (1000 units)', 'Wheat Flour - 10kg (800 units)'],
    status: 'delayed',
    coordinates: [17.7231, 83.3044],
    estimatedArrival: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    weatherImpact: true,
    speed: 12,
    route: [[13.0827, 80.2707], [17.6868, 83.2185]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'SHIP-003',
    type: 'ship',
    origin: 'Kolkata Port',
    destination: 'Guntur Best Price Store',
    warehouseId: 'AP001',
    cargo: ['Tea Leaves - 250g (3000 units)', 'Spices - Mixed (1500 units)'],
    status: 'in_transit',
    coordinates: [16.3067, 80.4365],
    estimatedArrival: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    weatherImpact: false,
    speed: 18,
    route: [[22.5726, 88.3639], [16.3067, 80.4365]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  // Airplanes
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
    weatherImpact: false,
    speed: 800, // km/h
    route: [[28.7041, 77.1025], [17.3850, 78.4867]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'AIR-002',
    type: 'airplane',
    origin: 'Mumbai Airport',
    destination: 'Lucknow Best Price Store',
    warehouseId: 'UP002',
    cargo: ['Detergent Powder - 1kg (2000 units)', 'Tea Leaves - 250g (1200 units)'],
    status: 'loading',
    coordinates: [26.7606, 80.8636],
    estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    weatherImpact: false,
    speed: 750,
    route: [[19.0760, 72.8777], [26.8467, 80.9462]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'AIR-003',
    type: 'airplane',
    origin: 'Bangalore Airport',
    destination: 'Amritsar Best Price Store',
    warehouseId: 'PB001',
    cargo: ['Electronics - Mobile Phones (500 units)', 'Fashion Items (800 units)'],
    status: 'in_transit',
    coordinates: [31.6340, 74.8723],
    estimatedArrival: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    priority: 'critical',
    weatherImpact: false,
    speed: 850,
    route: [[12.9716, 77.5946], [31.6340, 74.8723]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  // Trucks - More trucks for comprehensive coverage
  {
    id: 'TRUCK-001',
    type: 'truck',
    origin: 'Indore Distribution Center',
    destination: 'Bhopal Best Price Store',
    warehouseId: 'MP001',
    cargo: ['Fresh Vegetables - Mixed (500 units)', 'Milk Powder - 500g (600 units)'],
    status: 'in_transit',
    coordinates: [23.1765, 77.3463],
    estimatedArrival: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    weatherImpact: false,
    speed: 60, // km/h
    route: [[22.7196, 75.8577], [23.2599, 77.4126]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'TRUCK-002',
    type: 'truck',
    origin: 'Delhi Distribution Center',
    destination: 'Lucknow Best Price Store',
    warehouseId: 'UP002',
    cargo: ['Packaged Foods (1200 units)', 'Beverages (800 units)'],
    status: 'in_transit',
    coordinates: [26.8467, 80.9462],
    estimatedArrival: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    weatherImpact: false,
    speed: 55,
    route: [[28.7041, 77.1025], [26.8467, 80.9462]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'TRUCK-003',
    type: 'truck',
    origin: 'Hyderabad Distribution Center',
    destination: 'Guntur Best Price Store',
    warehouseId: 'AP001',
    cargo: ['Rice - 25kg (800 units)', 'Cooking Oil - 1L (400 units)'],
    status: 'in_transit',
    coordinates: [16.3067, 80.4365],
    estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    weatherImpact: false,
    speed: 65,
    route: [[17.3850, 78.4867], [16.3067, 80.4365]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'TRUCK-004',
    type: 'truck',
    origin: 'Bangalore Distribution Center',
    destination: 'Hyderabad Best Price Store',
    warehouseId: 'TG001',
    cargo: ['Electronics (300 units)', 'Home Appliances (200 units)'],
    status: 'in_transit',
    coordinates: [17.3850, 78.4867],
    estimatedArrival: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    priority: 'critical',
    weatherImpact: false,
    speed: 70,
    route: [[12.9716, 77.5946], [17.3850, 78.4867]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'TRUCK-005',
    type: 'truck',
    origin: 'Mumbai Distribution Center',
    destination: 'Pune Best Price Store',
    warehouseId: 'MH002',
    cargo: ['Fresh Fruits (600 units)', 'Dairy Products (400 units)'],
    status: 'in_transit',
    coordinates: [18.5204, 73.8567],
    estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    weatherImpact: false,
    speed: 50,
    route: [[19.0760, 72.8777], [18.5204, 73.8567]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'TRUCK-006',
    type: 'truck',
    origin: 'Chennai Distribution Center',
    destination: 'Bangalore Best Price Store',
    warehouseId: 'KA001',
    cargo: ['Textiles (1000 units)', 'Footwear (500 units)'],
    status: 'in_transit',
    coordinates: [12.9716, 77.5946],
    estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    weatherImpact: false,
    speed: 60,
    route: [[13.0827, 80.2707], [12.9716, 77.5946]],
    currentRouteIndex: 0,
    lastUpdate: new Date().toISOString()
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

// Add these lists at the top, after warehouses definition
const AIRPORTS = [
  { id: 'DEL', name: 'Delhi Airport', city: 'Delhi', coordinates: [28.5562, 77.1000] },
  { id: 'BOM', name: 'Mumbai Airport', city: 'Mumbai', coordinates: [19.0896, 72.8656] },
  { id: 'BLR', name: 'Bangalore Airport', city: 'Bangalore', coordinates: [13.1986, 77.7066] },
  { id: 'MAA', name: 'Chennai Airport', city: 'Chennai', coordinates: [12.9941, 80.1709] },
  { id: 'HYD', name: 'Hyderabad Airport', city: 'Hyderabad', coordinates: [17.2403, 78.4294] },
];
const SEAPORTS = [
  { id: 'MUM', name: 'Mumbai Port', city: 'Mumbai', coordinates: [18.9633, 72.8436] },
  { id: 'CHP', name: 'Chennai Port', city: 'Chennai', coordinates: [13.0827, 80.2707] },
  { id: 'KOL', name: 'Kolkata Port', city: 'Kolkata', coordinates: [22.5460, 88.3137] },
];

const ORS_API_KEY = process.env.ORS_API_KEY || '5b3ce3597851110001cf6248b8b0b6fa6b1e4e1a8e1e4e1a8e1e4e1a'; // Replace with your own for production

async function getRouteDistance(origin, destination, type) {
  let profile = 'driving-car';
  if (type === 'ship') profile = 'driving-hgv'; // No sea profile, use hgv for demo
  if (type === 'airplane') profile = 'driving-car'; // No air profile, use car for demo
  const url = `https://api.openrouteservice.org/v2/directions/${profile}`;
  const body = {
    coordinates: [
      [origin[1], origin[0]], // [lng, lat]
      [destination[1], destination[0]]
    ]
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data && data.features && data.features[0] && data.features[0].properties && data.features[0].properties.summary) {
      return data.features[0].properties.summary.distance / 1000; // in km
    }
  } catch (e) {
    console.error('OpenRouteService error:', e);
  }
  return null;
}

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial data
  socket.emit('shipments-updated', shipments);
  socket.emit('warehouses-updated', warehouses);
  
  // Handle admin commands
  socket.on('admin-command', (command) => {
    switch (command.type) {
      case 'pause-shipment':
        const shipment = shipments.find(s => s.id === command.shipmentId);
        if (shipment) {
          shipment.status = 'delayed';
          io.emit('shipments-updated', shipments);
        }
        break;
      case 'resume-shipment':
        const resumeShipment = shipments.find(s => s.id === command.shipmentId);
        if (resumeShipment) {
          resumeShipment.status = 'in_transit';
          io.emit('shipments-updated', shipments);
        }
        break;
      case 'add-shipment':
        const newShipment = {
          ...command.shipment,
          id: `NEW-${Date.now()}`,
          lastUpdate: new Date().toISOString(),
          currentRouteIndex: 0
        };
        shipments.push(newShipment);
        io.emit('shipments-updated', shipments);
        break;
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start real-time updates
setInterval(updateShipmentPositions, 5000); // Update every 5 seconds

// Cron job for periodic updates
cron.schedule('*/30 * * * * *', () => {
  updateShipmentPositions();
});

// Routes
app.get('/api/warehouses', (req, res) => {
  res.json(warehouses);
});

app.get('/api/airports', (req, res) => {
  res.json(AIRPORTS);
});

app.get('/api/seaports', (req, res) => {
  res.json(SEAPORTS);
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

// Enhanced API endpoints for live tracking
app.get('/api/shipments', (req, res) => {
  const { type, status, warehouseId } = req.query;
  let filteredShipments = shipments;
  
  if (type && type !== 'all') {
    filteredShipments = filteredShipments.filter(s => s.type === type);
  }
  
  if (status && status !== 'all') {
    filteredShipments = filteredShipments.filter(s => s.status === status);
  }
  
  if (warehouseId) {
    filteredShipments = filteredShipments.filter(s => s.warehouseId === warehouseId);
  }
  
  res.json(filteredShipments);
});

app.get('/api/shipments/:id', (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }
  
  // Calculate distance to destination
  const warehouse = warehouses.find(w => w.id === shipment.warehouseId);
  if (warehouse) {
    const distance = calculateDistance(
      shipment.coordinates[0], shipment.coordinates[1],
      warehouse.coordinates[0], warehouse.coordinates[1]
    );
    
    const response = {
      ...shipment,
      distanceToDestination: Math.round(distance * 100) / 100,
      estimatedTimeRemaining: Math.round((distance / shipment.speed) * 60) // minutes
    };
    
    res.json(response);
  } else {
  res.json(shipment);
  }
});

// Get distances for all shipments
app.get('/api/shipments/:id/distance', (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }
  
  const warehouse = warehouses.find(w => w.id === shipment.warehouseId);
  if (warehouse) {
    const distance = calculateDistance(
      shipment.coordinates[0], shipment.coordinates[1],
      warehouse.coordinates[0], warehouse.coordinates[1]
    );
    
    res.json({
      shipmentId: shipment.id,
      distance: Math.round(distance * 100) / 100,
      estimatedTimeRemaining: Math.round((distance / shipment.speed) * 60),
      unit: shipment.type === 'ship' ? 'nautical miles' : 'kilometers'
    });
  } else {
    res.status(404).json({ error: 'Warehouse not found' });
  }
});

// Get all distances
app.get('/api/distances', (req, res) => {
  const distances = calculateWarehouseDistances();
  res.json(distances);
});

// Admin endpoints for shipment management
app.post('/api/shipments/:id/pause', (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }
  
  shipment.status = 'delayed';
  io.emit('shipments-updated', shipments);
  res.json({ message: 'Shipment paused successfully', shipment });
});

app.post('/api/shipments/:id/resume', (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }
  
  shipment.status = 'in_transit';
  io.emit('shipments-updated', shipments);
  res.json({ message: 'Shipment resumed successfully', shipment });
});

app.post('/api/shipments', async (req, res) => {
  try {
    const { type, originId, destinationId, ...rest } = req.body;
    let originCoords = null;
    let destinationCoords = null;
    let originName = '';
    let destinationName = '';

    // Find origin coordinates and name
    if (type === 'airplane') {
      const airport = AIRPORTS.find(a => a.id === originId);
      if (airport) { 
        originCoords = airport.coordinates; 
        originName = airport.name; 
      }
    } else if (type === 'ship') {
      const port = SEAPORTS.find(p => p.id === originId);
      if (port) { 
        originCoords = port.coordinates; 
        originName = port.name; 
      }
    } else if (type === 'truck') {
      const wh = warehouses.find(w => w.id === originId);
      if (wh) { 
        originCoords = wh.coordinates; 
        originName = wh.name; 
      }
    }

    // Find destination coordinates and name
    if (type === 'airplane') {
      const airport = AIRPORTS.find(a => a.id === destinationId);
      if (airport) { 
        destinationCoords = airport.coordinates; 
        destinationName = airport.name; 
      }
    } else if (type === 'ship') {
      const port = SEAPORTS.find(p => p.id === destinationId);
      if (port) { 
        destinationCoords = port.coordinates; 
        destinationName = port.name; 
      }
    } else if (type === 'truck') {
      const wh = warehouses.find(w => w.id === destinationId);
      if (wh) { 
        destinationCoords = wh.coordinates; 
        destinationName = wh.name; 
      }
    }

    // Validate that we found both origin and destination
    if (!originCoords || !destinationCoords) {
      return res.status(400).json({ 
        error: 'Invalid origin or destination ID for the selected shipment type' 
      });
    }

    const route = [originCoords, destinationCoords];
    let distanceKm = await getRouteDistance(originCoords, destinationCoords, type);
    if (!distanceKm) {
      // Fallback to haversine distance calculation
      distanceKm = calculateDistance(
        originCoords[0], originCoords[1], 
        destinationCoords[0], destinationCoords[1]
      );
    }

    const newShipment = {
      ...req.body,
      id: `NEW-${Date.now()}`,
      lastUpdate: new Date().toISOString(),
      currentRouteIndex: 0,
      coordinates: originCoords,
      route,
      status: 'in_transit',
      origin: originName,
      destination: destinationName,
      distanceKm: Math.round(distanceKm * 100) / 100,
      estimatedArrival: new Date(Date.now() + (distanceKm / (rest.speed || 60)) * 60 * 60 * 1000).toISOString(),
      weatherImpact: false,
      speed: rest.speed || 60
    };

    shipments.push(newShipment);
    io.emit('shipments-updated', shipments);
    
    console.log(`✅ New shipment created: ${newShipment.id} from ${originName} to ${destinationName}`);
    res.status(201).json(newShipment);
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// Get tracking statistics
app.get('/api/tracking/stats', (req, res) => {
  const stats = {
    totalShipments: shipments.length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delayed: shipments.filter(s => s.status === 'delayed').length,
    arrived: shipments.filter(s => s.status === 'arrived').length,
    loading: shipments.filter(s => s.status === 'loading').length,
    byType: {
      truck: shipments.filter(s => s.type === 'truck').length,
      ship: shipments.filter(s => s.type === 'ship').length,
      airplane: shipments.filter(s => s.type === 'airplane').length
    },
    byPriority: {
      critical: shipments.filter(s => s.priority === 'critical').length,
      high: shipments.filter(s => s.priority === 'high').length,
      medium: shipments.filter(s => s.priority === 'medium').length,
      low: shipments.filter(s => s.priority === 'low').length
    }
  };
  
  res.json(stats);
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

// Helper to find nearest port/airport/truck
function findNearestTransport(warehouse, type) {
  let options = type === 'airplane' ? AIRPORTS : type === 'ship' ? SEAPORTS : warehouses;
  let minDist = Infinity, nearest = null;
  for (let opt of options) {
    const dist = calculateDistance(
      warehouse.coordinates[0], warehouse.coordinates[1],
      opt.coordinates[0], opt.coordinates[1]
    );
    if (dist < minDist) { minDist = dist; nearest = opt; }
  }
  return { ...nearest, distance: minDist };
}

// File paths for persistent storage
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const RESTOCK_FILE = path.join(DATA_DIR, 'restockRequests.json');
const SHIPMENTS_FILE = path.join(DATA_DIR, 'shipments.json');
const ACTION_LOG_FILE = path.join(DATA_DIR, 'actionLog.json');

// Helper functions for file I/O
async function readJson(file) {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}
async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

async function appendActionLog(entry) {
  let log = await readJson(ACTION_LOG_FILE);
  log.push(entry);
  await writeJson(ACTION_LOG_FILE, log);
}

// RESTOCK REQUESTS API
// Create a new restock request (pending approval)
app.post('/api/restock-requests', async (req, res) => {
  const { warehouseId, itemId, quantity, itemName } = req.body;
  if (!warehouseId || !itemId || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const restockRequests = await readJson(RESTOCK_FILE);
  const newRequest = {
    id: `RR-${Date.now()}`,
    warehouseId,
    itemId,
    itemName: itemName || '',
    quantity,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };
  restockRequests.push(newRequest);
  await writeJson(RESTOCK_FILE, restockRequests);
  res.status(201).json(newRequest);
});

// List all restock requests
app.get('/api/restock-requests', async (req, res) => {
  const restockRequests = await readJson(RESTOCK_FILE);
  res.json(restockRequests);
});

// Admin approves a restock request, creates a shipment, assigns transport, and auto-delivers
app.post('/api/restock-requests/:id/approve', async (req, res) => {
  const restockRequests = await readJson(RESTOCK_FILE);
  const shipments = await readJson(SHIPMENTS_FILE);
  const inventory = await readJson(INVENTORY_FILE);
  const request = restockRequests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Restock request not found' });
  if (request.status !== 'pending') return res.status(400).json({ error: 'Already processed' });
  request.status = 'approved';
  request.approvedAt = new Date().toISOString();
  // Assign transport type (truck for <500km, airplane for <1500km, else ship)
  const warehouse = warehouses.find(w => w.id === request.warehouseId);
  let transportType = 'truck';
  let origin;
  let dist = 0;
  if (warehouse) {
    const nearestAirport = findNearestTransport(warehouse, 'airplane');
    const nearestPort = findNearestTransport(warehouse, 'ship');
    const nearestWarehouse = findNearestTransport(warehouse, 'truck');
    // Pick transport type based on distance
    if (nearestWarehouse.distance < 500) {
      transportType = 'truck';
      origin = nearestWarehouse;
      dist = nearestWarehouse.distance;
    } else if (nearestAirport.distance < 1500) {
      transportType = 'airplane';
      origin = nearestAirport;
      dist = nearestAirport.distance;
    } else {
      transportType = 'ship';
      origin = nearestPort;
      dist = nearestPort.distance;
    }
  }
  // Estimate speed (km/h)
  const speed = transportType === 'truck' ? 60 : transportType === 'airplane' ? 600 : 35;
  const etaHours = dist / speed;
  const etaMs = Math.max(1, Math.round(etaHours * 60 * 60 * 1000));
  const now = new Date();
  const eta = new Date(now.getTime() + etaMs).toISOString();
  // Create shipment
  const newShipment = {
    id: `SHIP-${Date.now()}`,
    warehouseId: request.warehouseId,
    itemId: request.itemId,
    quantity: request.quantity,
    status: 'in_transit',
    createdAt: now.toISOString(),
    deliveredAt: null,
    origin: origin?.name || 'Unknown',
    destination: warehouse?.name || 'Unknown',
    type: transportType,
    eta,
    speed,
    distance: dist
  };
  shipments.push(newShipment);
  await writeJson(RESTOCK_FILE, restockRequests);
  await writeJson(SHIPMENTS_FILE, shipments);
  res.json({ request, shipment: newShipment });
  // Auto-deliver after ETA
  setTimeout(async () => {
    const shipments2 = await readJson(SHIPMENTS_FILE);
    const restockRequests2 = await readJson(RESTOCK_FILE);
    const inventory2 = await readJson(INVENTORY_FILE);
    const shipment = shipments2.find(s => s.id === newShipment.id);
    if (shipment && shipment.status === 'in_transit') {
      shipment.status = 'delivered';
      shipment.deliveredAt = new Date().toISOString();
      // Update inventory
      let updated = false;
      for (let item of inventory2) {
        if (item.warehouseId === shipment.warehouseId && item.id === shipment.itemId) {
          item.currentStock = Math.min(item.currentStock + shipment.quantity, item.maxCapacity || item.currentStock + shipment.quantity);
          updated = true;
          break;
        }
      }
      if (!updated) {
        inventory2.push({
          warehouseId: shipment.warehouseId,
          id: shipment.itemId,
          currentStock: shipment.quantity
        });
      }
      // Mark restock request as delivered
      const req2 = restockRequests2.find(r => r.id === request.id);
      if (req2) req2.status = 'delivered';
      await writeJson(SHIPMENTS_FILE, shipments2);
      await writeJson(INVENTORY_FILE, inventory2);
      await writeJson(RESTOCK_FILE, restockRequests2);
      await appendActionLog({
        type: 'shipment_arrived',
        shipmentId: shipment.id,
        destination: shipment.destination,
        time: shipment.deliveredAt,
        message: `Shipment ${shipment.id} arrived at ${shipment.destination} at ${shipment.deliveredAt}`
      });
    }
  }, etaMs);
});

// Mark shipment as delivered, update inventory
app.post('/api/shipments/:id/deliver', async (req, res) => {
  const shipments = await readJson(SHIPMENTS_FILE);
  const inventory = await readJson(INVENTORY_FILE);
  const shipment = shipments.find(s => s.id === req.params.id);
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  if (shipment.status !== 'in_transit') return res.status(400).json({ error: 'Already delivered' });
  shipment.status = 'delivered';
  shipment.deliveredAt = new Date().toISOString();
  // Update inventory for the warehouse and item
  let updated = false;
  for (let item of inventory) {
    if (item.warehouseId === shipment.warehouseId && item.id === shipment.itemId) {
      item.currentStock = Math.min(item.currentStock + shipment.quantity, item.maxCapacity || item.currentStock + shipment.quantity);
      updated = true;
      break;
    }
  }
  if (!updated) {
    // If item not found, add it
    inventory.push({
      warehouseId: shipment.warehouseId,
      id: shipment.itemId,
      currentStock: shipment.quantity
    });
  }
  await writeJson(SHIPMENTS_FILE, shipments);
  await writeJson(INVENTORY_FILE, inventory);
  await appendActionLog({
    type: 'shipment_arrived',
    shipmentId: shipment.id,
    destination: shipment.destination,
    time: shipment.deliveredAt,
    message: `Shipment ${shipment.id} arrived at ${shipment.destination} at ${shipment.deliveredAt}`
  });
  res.json({ shipment, inventory });
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

server.listen(PORT, () => {
  console.log(`🚀 Walmart IntelliFlow API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.IO server ready for real-time updates`);
  console.log(`📦 Live tracking with ${shipments.length} active shipments`);
  console.log(`🏭 Monitoring ${warehouses.length} warehouses across India`);
});

export default app;