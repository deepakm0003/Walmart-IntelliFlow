export interface Warehouse {
  id: string;
  name: string;
  city: string;
  state: string;
  type: 'Best Price Wholesale Store' | 'Fulfillment Center (Dark Store)';
  population: number;
  coordinates: [number, number]; // [lat, lng]
  capacity: number;
  currentStock: number;
  criticalItems: number;
  monthlyOrders: number;
  efficiency: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  maxCapacity: number;
  demand: number;
  price: number;
  supplier: string;
  lastRestocked: string;
  predictedStockout: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  warehouseId: string;
  actionRequired: boolean;
}

export interface WeatherAlert {
  id: string;
  region: string;
  type: 'heavy_rain' | 'cyclone' | 'heat_wave' | 'flood';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedRoutes: string[];
  timestamp: string;
}

export interface Prediction {
  warehouseId: string;
  category: string;
  predictedDemand: number;
  confidence: number;
  factors: string[];
  recommendedAction: string;
}

export interface Shipment {
  id: string;
  type: 'ship' | 'airplane' | 'truck';
  origin: string;
  destination: string;
  warehouseId: string;
  cargo: string[];
  status: 'in_transit' | 'delayed' | 'arrived' | 'loading';
  coordinates: [number, number];
  estimatedArrival: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  weatherImpact: boolean;
  speed?: number;
  route?: [number, number][];
  currentRouteIndex?: number;
  lastUpdate?: string;
  distanceToDestination?: number;
  estimatedTimeRemaining?: number;
}

export interface TrackingStats {
  totalShipments: number;
  inTransit: number;
  delayed: number;
  arrived: number;
  loading: number;
  byType: {
    truck: number;
    ship: number;
    airplane: number;
  };
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface DistanceInfo {
  shipmentId: string;
  distance: number;
  estimatedTimeRemaining: number;
  unit: string;
}

export interface PurchaseOrder {
  id: string;
  warehouseId: string;
  items: {
    name: string;
    quantity: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }[];
  totalValue: number;
  supplier: string;
  requestedBy: string;
  requestedAt: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered';
  shipmentId?: string;
  estimatedDelivery: string;
}

export interface AIAgent {
  id: string;
  name: string;
  type: 'demand_forecaster' | 'route_optimizer' | 'inventory_manager' | 'weather_analyst';
  status: 'active' | 'processing' | 'idle';
  lastAction: string;
  recommendations: number;
  accuracy: number;
}