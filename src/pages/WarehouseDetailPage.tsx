import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Warehouse, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  MapPin,
  Users,
  Clock,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import { warehouses } from '../data/warehouses';
import { generateInventoryData, generatePredictions, getAllInventoryItems } from '../data/mockData';
import StatsCard from '../components/StatsCard';
import InventoryChart from '../components/InventoryChart';
import PredictionPanel from '../components/PredictionPanel';
import AIPredictionPanel from '../components/AIPredictionPanel';
import CalendarPredictionPanel from '../components/CalendarPredictionPanel';
import WarehouseItemPredictionPanel from '../components/WarehouseItemPredictionPanel';
import AIInsightsDashboard from '../components/AIInsightsDashboard';
import WarehouseAIPredictionBlock from '../components/WarehouseAIPredictionBlock';
import { InventoryItem, Prediction } from '../types';
import { predictionService } from '../ml/predictionService';
import { type DailyPrediction } from '../ml/calendarAPI';
import { weatherService } from '../services/weatherService';
import axios from 'axios';

const WarehouseDetailPage: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [restockRequests, setRestockRequests] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [warehouseTodayPrediction, setWarehouseTodayPrediction] = useState<DailyPrediction | null>(null);
  const [enrichedItems, setEnrichedItems] = useState<any[]>([]);
  const [next7DaysPredictions, setNext7DaysPredictions] = useState<any[]>([]);
  const [next7DaysEnrichedItems, setNext7DaysEnrichedItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [restockStatus, setRestockStatus] = useState<{ [itemId: string]: string }>({});

  const warehouse = warehouses.find(w => w.id === warehouseId);

  useEffect(() => {
    if (warehouseId) {
      fetch(`/api/warehouses/${warehouseId}/inventory`).then(res => res.json()).then(setInventory);
      fetch('/api/restock-requests').then(res => res.json()).then(setRestockRequests);
      fetch('/api/shipments').then(res => res.json()).then(setShipments);
      // Generate complete inventory for this warehouse
      const allItems = getAllInventoryItems();
      const seededRandom = (seed: string, min: number, max: number) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
        const rand = Math.abs(Math.sin(hash)) % 1;
        return Math.floor((rand * (max - min + 1)) + min);
      };
      const inv = allItems.map((item, idx) => {
        const stock = seededRandom(`${warehouseId}-${item.name}`, Math.floor(item.baseStock * 0.7), Math.floor(item.baseStock * 1.2));
        const minThreshold = Math.floor(item.baseStock * 0.2);
        const maxCapacity = Math.floor(item.baseStock * 1.5);
        return {
          id: `${warehouseId}-${idx + 1}`,
          name: item.name,
          category: item.category,
          currentStock: stock,
          minThreshold,
          maxCapacity,
          demand: seededRandom(`${warehouseId}-demand-${item.name}`, 100, 800),
          price: item.basePrice,
          supplier: 'Various Suppliers',
          lastRestocked: new Date(Date.now() - seededRandom(`${warehouseId}-restock-${item.name}`, 1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedStockout: new Date(Date.now() + seededRandom(`${warehouseId}-stockout-${item.name}`, 5, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      });
      setInventory(inv);
      setPredictions(generatePredictions().filter(p => p.warehouseId === warehouseId));
      predictionService.getTodayPrediction(warehouseId).then(async (today) => {
        setWarehouseTodayPrediction(today);
        // Generate enriched items
        const warehouse = warehouses.find(w => w.id === warehouseId);
        let weatherItems = null;
        if (warehouse) {
          weatherItems = await weatherService.getWeatherBasedItems(warehouseId, warehouse.coordinates);
        }
        const baseMultiplier = today.isFestival ? 1.5 : 1.0;
        const items = (weatherItems?.topItems || today.topItems).map((item: any, index: number) => ({
          name: item.name,
          category: item.category || '-',
          currentStock: Math.floor(Math.random() * 5000) + 2000,
          predictedDemand: Math.round(item.predictedQuantity * baseMultiplier * (item.boostMultiplier || 1)),
          confidence: 0.85 + (index * 0.02),
          boostMultiplier: (item.boostMultiplier || 1) * (today.isFestival ? 1.5 : 1.0),
          riskLevel: item.predictedQuantity > 2000 ? 'high' : item.predictedQuantity > 1000 ? 'medium' : 'low',
          recommendation: weatherItems?.weatherCondition === 'rainy' ? 'Monsoon season - stock indoor items' : 'Maintain current stock levels',
          supplier: 'Various Suppliers',
          reorderPoint: Math.round(item.predictedQuantity * 0.8),
          daysUntilStockout: Math.floor(Math.random() * 20) + 5
        }));
        setEnrichedItems(items);
      });
      // Fetch next 7 days' predictions
      predictionService.getNextWeekPredictions(warehouseId).then(async (preds) => {
        setNext7DaysPredictions(preds);
        // Enrich top items for each day
        const warehouse = warehouses.find(w => w.id === warehouseId);
        if (warehouse) {
          const enriched = await Promise.all(preds.map(async (pred: any) => {
            // Use weatherService to get enriched top items for the date
            const dayDetails = await weatherService.getDaySpecificPrediction(warehouseId, pred.date);
            // Map top 3 items with enrichment
            return {
              ...pred,
              enrichedTopItems: dayDetails.topItems.slice(0, 3).map((item: any, index: number) => ({
                name: item.name,
                category: item.category || '-',
                currentStock: Math.floor(Math.random() * 5000) + 2000,
                predictedDemand: item.predictedQuantity,
                confidence: 0.85 + (index * 0.02),
                boostMultiplier: item.boostMultiplier || 1,
                riskLevel: item.predictedQuantity > 2000 ? 'high' : item.predictedQuantity > 1000 ? 'medium' : 'low',
                recommendation: dayDetails.weather.weatherCondition === 'rainy' ? 'Monsoon season - stock indoor items' : 'Maintain current stock levels',
                supplier: 'Various Suppliers',
                reorderPoint: Math.round(item.predictedQuantity * 0.8),
                daysUntilStockout: Math.floor(Math.random() * 20) + 5
              }))
            };
          }));
          setNext7DaysEnrichedItems(enriched);
        } else {
          setNext7DaysEnrichedItems([]);
        }
      });
    }
  }, [warehouseId]);

  const handleRestock = async (item: InventoryItem) => {
    setRestockStatus(prev => ({ ...prev, [item.id]: 'pending' }));
    try {
      await axios.post('http://127.0.0.1:5000/restock-request', {
        warehouseId,
        itemName: item.name,
        quantity: Math.floor(item.maxCapacity * 0.2), // or any logic for quantity
        requestedAt: new Date().toISOString(),
      });
      setRestockStatus(prev => ({ ...prev, [item.id]: 'sent' }));
      setToast({ message: 'Restock request sent to admin!', type: 'success' });
    } catch (error) {
      setRestockStatus(prev => ({ ...prev, [item.id]: 'idle' }));
      setToast({ message: 'Failed to send restock request.', type: 'error' });
    }
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
    // Refresh both restock requests and shipments
    fetch('/api/restock-requests').then(res => res.json()).then(setRestockRequests);
    fetch('/api/shipments').then(res => res.json()).then(setShipments);
  };

  if (!warehouse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Warehouse Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const criticalItems = inventory.filter(item => 
    item.currentStock <= item.minThreshold
  );

  const lowStockItems = inventory.filter(item => 
    item.currentStock > item.minThreshold && 
    item.currentStock <= item.minThreshold * 2
  );

  const utilizationRate = Math.round((warehouse.currentStock / warehouse.capacity) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
      )}
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Warehouse className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{warehouse.name}</h1>
                  <p className="text-sm text-gray-500">{warehouse.city}, {warehouse.state}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warehouse Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <MapPin size={24} />
              <div>
                <p className="text-blue-100">Location</p>
                <p className="font-semibold">{warehouse.city}, {warehouse.state}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users size={24} />
              <div>
                <p className="text-blue-100">Population Served</p>
                <p className="font-semibold">{warehouse.population.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package size={24} />
              <div>
                <p className="text-blue-100">Facility Type</p>
                <p className="font-semibold">{warehouse.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target size={24} />
              <div>
                <p className="text-blue-100">Efficiency Rating</p>
                <p className="font-semibold">{warehouse.efficiency}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Storage Utilization"
            value={`${utilizationRate}%`}
            subtitle={`${warehouse.currentStock.toLocaleString()} / ${warehouse.capacity.toLocaleString()}`}
            icon={Package}
            color={utilizationRate > 90 ? 'red' : utilizationRate > 75 ? 'yellow' : 'green'}
          />
          <StatsCard
            title="Critical Items"
            value={criticalItems.length}
            subtitle="Below minimum threshold"
            icon={AlertTriangle}
            color={criticalItems.length > 5 ? 'red' : criticalItems.length > 2 ? 'yellow' : 'green'}
          />
          <StatsCard
            title="Monthly Orders"
            value={warehouse.monthlyOrders.toLocaleString()}
            subtitle="This month"
            icon={TrendingUp}
            color="blue"
            trend="up"
            trendValue="12%"
          />
          <StatsCard
            title="Low Stock Items"
            value={lowStockItems.length}
            subtitle="Needs attention"
            icon={Clock}
            color="yellow"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inventory Chart */}
          <div className="lg:col-span-2">
            <InventoryChart items={inventory} />
          </div>

          {/* Critical Items List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap size={20} className="text-red-500" />
                Critical Stock Alerts
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {criticalItems.map((item) => (
                <div key={item.id} className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      Critical
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Current: <span className="font-medium">{item.currentStock}</span></p>
                    <p>Minimum: <span className="font-medium">{item.minThreshold}</span></p>
                    <p>Predicted stockout: <span className="font-medium text-red-600">{item.predictedStockout}</span></p>
                  </div>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                    Generate PO
                  </button>
                </div>
              ))}
              {criticalItems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Package size={48} className="mx-auto mb-2 text-green-500" />
                  <p>No critical stock alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="mt-8 space-y-8">
          <AIInsightsDashboard warehouseId={warehouseId} />
          {warehouseTodayPrediction && (
            <WarehouseAIPredictionBlock
              todayPrediction={warehouseTodayPrediction}
              enrichedItems={enrichedItems}
              next7DaysPredictions={next7DaysPredictions}
              next7DaysEnrichedItems={next7DaysEnrichedItems}
            />
          )}
        </div>

        {/* Detailed Inventory Table */}
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Complete Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => {
                  const req = restockRequests.find(r => r.itemId === item.id && r.warehouseId === warehouseId && r.status !== 'delivered');
                  let restockStatus = req ? req.status : null;
                  const stockPercentage = (item.currentStock / item.maxCapacity) * 100;
                  const status = stockPercentage < 25 ? 'critical' : stockPercentage < 50 ? 'low' : 'healthy';
                  const statusColors = {
                    critical: 'bg-red-100 text-red-800',
                    low: 'bg-yellow-100 text-yellow-800',
                    healthy: 'bg-green-100 text-green-800'
                  };

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.currentStock.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.demand}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.supplier}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleRestock(item)}
                          disabled={!!restockStatus && restockStatus !== 'delivered'}
                        >
                          {restockStatus ? `Restock: ${restockStatus}` : 'Restock'}
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => setSelectedItem(item)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Item Details</h3>
            <div className="space-y-2 text-sm">
              <div><b>Name:</b> {selectedItem.name}</div>
              <div><b>Category:</b> {selectedItem.category}</div>
              <div><b>Current Stock:</b> {selectedItem.currentStock}</div>
              <div><b>Min Threshold:</b> {selectedItem.minThreshold}</div>
              <div><b>Max Capacity:</b> {selectedItem.maxCapacity}</div>
              <div><b>Demand:</b> {selectedItem.demand}</div>
              <div><b>Price:</b> ₹{selectedItem.price}</div>
              <div><b>Supplier:</b> {selectedItem.supplier}</div>
              <div><b>Last Restocked:</b> {selectedItem.lastRestocked}</div>
              <div><b>Predicted Stockout:</b> {selectedItem.predictedStockout}</div>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setSelectedItem(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseDetailPage;
