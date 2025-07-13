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
  Zap
} from 'lucide-react';
import { warehouses } from '../data/warehouses';
import { generateInventoryData, generatePredictions } from '../data/mockData';
import StatsCard from '../components/StatsCard';
import InventoryChart from '../components/InventoryChart';
import PredictionPanel from '../components/PredictionPanel';
import { InventoryItem, Prediction } from '../types';

const WarehouseDetailPage: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const warehouse = warehouses.find(w => w.id === warehouseId);

  useEffect(() => {
    if (warehouseId) {
      setInventory(generateInventoryData(warehouseId));
      setPredictions(generatePredictions().filter(p => p.warehouseId === warehouseId));
    }
  }, [warehouseId]);

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
        <div className="mt-8">
          <PredictionPanel predictions={predictions} />
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
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Restock
                        </button>
                        <button className="text-green-600 hover:text-green-900">
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
    </div>
  );
};

export default WarehouseDetailPage;