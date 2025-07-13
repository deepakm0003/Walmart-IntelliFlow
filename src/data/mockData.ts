import { InventoryItem, Alert, WeatherAlert, Prediction } from '../types';

export const generateInventoryData = (warehouseId: string): InventoryItem[] => {
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
    const variance = Math.random() * 0.4 + 0.8; // 80% to 120% of base
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

const getRandomSupplier = (): string => {
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

const getRandomDate = (minDays: number, maxDays: number): string => {
  const date = new Date();
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  date.setDate(date.getDate() + randomDays);
  return date.toISOString().split('T')[0];
};

export const generateAlerts = (): Alert[] => [
  {
    id: 'alert-001',
    type: 'critical',
    title: 'Critical Stock Level - Hyderabad',
    message: 'Cold Beverages below 15% threshold. Heatwave causing 300% demand spike.',
    timestamp: new Date().toISOString(),
    warehouseId: 'TG001',
    actionRequired: true
  },
  {
    id: 'alert-002',
    type: 'warning',
    title: 'Festival Rush - Ganesh Chaturthi',
    message: 'Gift Hampers expected to run out in 3 warehouses within 48 hours.',
    timestamp: new Date().toISOString(),
    warehouseId: 'MH001',
    actionRequired: true
  },
  {
    id: 'alert-003',
    type: 'critical',
    title: 'Weather Disruption - Mumbai Port',
    message: 'Heavy rain alert. Container 92A rerouted to Goa warehouse.',
    timestamp: new Date().toISOString(),
    warehouseId: 'MH001',
    actionRequired: false
  },
  {
    id: 'alert-004',
    type: 'warning',
    title: 'Supplier Delay - Punjab Region',
    message: 'Cooking Oil shipment delayed by 2 days. Consider backup supplier.',
    timestamp: new Date().toISOString(),
    warehouseId: 'PB002',
    actionRequired: true
  }
];

export const generateWeatherAlerts = (): WeatherAlert[] => [
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

export const generatePredictions = (): Prediction[] => [
  {
    warehouseId: 'TG001',
    category: 'Beverages',
    predictedDemand: 8500,
    confidence: 94,
    factors: ['Heatwave', 'Weekend', 'Local Festival'],
    recommendedAction: 'Increase stock by 40% for next 7 days'
  },
  {
    warehouseId: 'MH001',
    category: 'Gift Items',
    predictedDemand: 3200,
    confidence: 89,
    factors: ['Ganesh Chaturthi', 'School Reopening'],
    recommendedAction: 'Emergency restock from Delhi warehouse'
  },
  {
    warehouseId: 'UP002',
    category: 'Staples',
    predictedDemand: 6800,
    confidence: 91,
    factors: ['Monsoon Season', 'Bulk Buying Trend'],
    recommendedAction: 'Maintain current levels, monitor daily'
  }
];