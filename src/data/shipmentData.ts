import { Shipment, PurchaseOrder, AIAgent } from '../types';

export const generateShipments = (): Shipment[] => [
  {
    id: 'SHIP-001',
    type: 'ship',
    origin: 'Mumbai Port',
    destination: 'Bhiwandi Fulfillment Center',
    warehouseId: 'MH001',
    cargo: ['Cold Beverages - 500ml (5000 units)', 'Cooking Oil - 1L (2000 units)'],
    status: 'in_transit',
    coordinates: [19.0760, 72.8777], // Near Mumbai coast
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
    coordinates: [17.2403, 78.4294], // Near Hyderabad
    estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    priority: 'critical',
    weatherImpact: false
  },
  {
    id: 'SHIP-002',
    type: 'ship',
    origin: 'Chennai Port',
    destination: 'Visakhapatnam Best Price Store',
    warehouseId: 'AP002',
    cargo: ['Rice - 25kg (1000 units)', 'Wheat Flour - 10kg (800 units)'],
    status: 'delayed',
    coordinates: [17.7231, 83.3044], // Near Visakhapatnam coast
    estimatedArrival: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    weatherImpact: true
  },
  {
    id: 'AIR-002',
    type: 'airplane',
    origin: 'Mumbai Airport',
    destination: 'Lucknow Best Price Store',
    warehouseId: 'UP002',
    cargo: ['Detergent Powder - 1kg (2000 units)', 'Tea Leaves - 250g (1200 units)'],
    status: 'loading',
    coordinates: [26.7606, 80.8636], // Lucknow airport
    estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    weatherImpact: false
  },
  {
    id: 'TRUCK-001',
    type: 'truck',
    origin: 'Indore Distribution Center',
    destination: 'Bhopal Best Price Store',
    warehouseId: 'MP001',
    cargo: ['Fresh Vegetables - Mixed (500 units)', 'Milk Powder - 500g (600 units)'],
    status: 'in_transit',
    coordinates: [23.1765, 77.3463], // Between Indore and Bhopal
    estimatedArrival: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    weatherImpact: false
  }
];

export const generatePurchaseOrders = (): PurchaseOrder[] => [
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
  },
  {
    id: 'PO-2025-002',
    warehouseId: 'MH001',
    items: [
      { name: 'Cooking Oil - 1L', quantity: 3000, urgency: 'high' },
      { name: 'Rice - 25kg', quantity: 1500, urgency: 'medium' }
    ],
    totalValue: 2160000,
    supplier: 'Adani Wilmar',
    requestedBy: 'Admin - Rajesh Kumar',
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    shipmentId: 'SHIP-001',
    estimatedDelivery: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'PO-2025-003',
    warehouseId: 'UP002',
    items: [
      { name: 'Personal Care Kit', quantity: 2000, urgency: 'medium' },
      { name: 'Detergent Powder - 1kg', quantity: 1800, urgency: 'low' }
    ],
    totalValue: 1224000,
    supplier: 'Hindustan Unilever Ltd',
    requestedBy: 'AI Agent - Inventory Manager',
    requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'shipped',
    shipmentId: 'AIR-002',
    estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
  }
];

export const aiAgents: AIAgent[] = [
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
  },
  {
    id: 'agent-003',
    name: 'StockMaster AI',
    type: 'inventory_manager',
    status: 'active',
    lastAction: 'Auto-generated PO for Lucknow warehouse',
    recommendations: 35,
    accuracy: 96.1
  },
  {
    id: 'agent-004',
    name: 'WeatherWatch AI',
    type: 'weather_analyst',
    status: 'idle',
    lastAction: 'Issued heavy rain alert for Maharashtra coast',
    recommendations: 12,
    accuracy: 88.7
  }
];