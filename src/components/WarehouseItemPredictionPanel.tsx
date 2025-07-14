import React, { useState, useEffect } from 'react';
import { predictionService } from '../ml/predictionService';
import { calendarAPI, type DailyPrediction } from '../ml/calendarAPI';
import { warehouses } from '../data/warehouses';
import { weatherService, type WeatherBasedItems } from '../services/weatherService';
import axios from 'axios';

interface WarehouseItemPredictionPanelProps {
  warehouseId?: string;
  isGlobal?: boolean;
  todayPrediction?: DailyPrediction | null;
}

interface ItemPrediction {
  name: string;
  category: string;
  currentStock: number;
  predictedDemand: number;
  confidence: number;
  boostMultiplier: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  supplier: string;
  reorderPoint: number;
  daysUntilStockout: number;
}

const WarehouseItemPredictionPanel: React.FC<WarehouseItemPredictionPanelProps> = ({ 
  warehouseId, 
  isGlobal = false, 
  todayPrediction: propTodayPrediction
}) => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [todayPrediction, setTodayPrediction] = useState<DailyPrediction | null>(null);
  const [itemPredictions, setItemPredictions] = useState<ItemPrediction[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'insights'>('today');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [restockSuccess, setRestockSuccess] = useState<string | null>(null);

  useEffect(() => {
    const updateCurrentDate = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateCurrentDate();
    const interval = setInterval(updateCurrentDate, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (propTodayPrediction) {
      setTodayPrediction(propTodayPrediction);
      setLoading(false);
      return;
    }
    const loadPredictions = async () => {
      setLoading(true);
      try {
        if (isGlobal) {
          // Load global predictions for all warehouses
          const allPredictions = await predictionService.getAllWarehouseCalendarPredictions();
          const totalSales = allPredictions.reduce((sum, pred) => sum + pred.todayPrediction.predictedSales, 0);
          const avgSales = Math.round(totalSales / allPredictions.length);
          
          const globalToday: DailyPrediction = {
            date: calendarAPI.getCurrentDate(),
            dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            isFestival: false,
            predictedSales: avgSales,
            confidence: 0.85,
            topItems: [
              { name: 'Cold Beverages - 500ml', predictedQuantity: 15000, boostMultiplier: 1.0 },
              { name: 'Cooking Oil - 1L', predictedQuantity: 12000, boostMultiplier: 1.0 },
              { name: 'Rice - 25kg', predictedQuantity: 10000, boostMultiplier: 1.0 },
              { name: 'Wheat Flour - 10kg', predictedQuantity: 14000, boostMultiplier: 1.0 },
              { name: 'Detergent Powder - 1kg', predictedQuantity: 11000, boostMultiplier: 1.0 }
            ],
            factors: ['Global average across 20 warehouses']
          };
          
          setTodayPrediction(globalToday);
          setItemPredictions(generateGlobalItemPredictions());
        } else if (warehouseId) {
          // Load predictions for specific warehouse
          const today = await predictionService.getTodayPrediction(warehouseId);
          setTodayPrediction(today);
          const items = await generateWarehouseItemPredictions(warehouseId, today);
          setItemPredictions(items);
        }
      } catch (error) {
        console.error('Error loading predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [warehouseId, isGlobal, propTodayPrediction]);

  const generateWarehouseItemPredictions = async (warehouseId: string, prediction: DailyPrediction): Promise<ItemPrediction[]> => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    const baseMultiplier = prediction.isFestival ? 1.5 : 1.0;
    
    // Get weather-based items for this warehouse
    let weatherItems: WeatherBasedItems | null = null;
    try {
      if (warehouse) {
        weatherItems = await weatherService.getWeatherBasedItems(warehouseId, warehouse.coordinates);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
    
    // Use weather-based items if available, otherwise fall back to default
    const baseItems = weatherItems?.topItems || [
      {
        name: 'Cold Beverages - 500ml',
        category: 'Beverages',
        predictedQuantity: 1200,
        boostMultiplier: 1.0,
        weatherReason: 'Standard item'
      }
    ];
    
    const items: ItemPrediction[] = baseItems.map((item, index) => ({
      name: item.name,
      category: item.category,
      currentStock: Math.floor(Math.random() * 5000) + 2000,
      predictedDemand: Math.round(item.predictedQuantity * baseMultiplier * item.boostMultiplier),
      confidence: 0.85 + (index * 0.02),
      boostMultiplier: item.boostMultiplier * (prediction.isFestival ? 1.5 : 1.0),
      riskLevel: item.predictedQuantity > 2000 ? 'high' : item.predictedQuantity > 1000 ? 'medium' : 'low',
      recommendation: getRecommendation(item, weatherItems),
      supplier: getSupplier(item.name),
      reorderPoint: Math.round(item.predictedQuantity * 0.8),
      daysUntilStockout: Math.floor(Math.random() * 20) + 5
    }));
    
    return items;
  };

  // Helper functions for recommendations and suppliers
  const getRecommendation = (item: any, weatherItems: WeatherBasedItems | null): string => {
    if (weatherItems?.weatherCondition === 'hot' && item.category === 'Beverages') {
      return 'High temperature - increase stock for cooling products';
    } else if (weatherItems?.weatherCondition === 'cold' && item.category === 'Beverages') {
      return 'Cold weather - focus on hot beverages';
    } else if (weatherItems?.weatherCondition === 'rainy') {
      return 'Monsoon season - stock indoor items';
    }
    return 'Maintain current stock levels';
  };

  const getSupplier = (itemName: string): string => {
    const suppliers: { [key: string]: string } = {
      'Cold Beverages - 500ml': 'PepsiCo India',
      'Cooking Oil - 1L': 'Adani Wilmar',
      'Rice - 25kg': 'KRBL Limited',
      'Wheat Flour - 10kg': 'ITC Limited',
      'Detergent Powder - 1kg': 'Hindustan Unilever',
      'Gift Items': 'Various Suppliers',
      'Sweets & Candies': 'Nestle India',
      'Incense Sticks': 'Mangaldeep',
      'Traditional Clothes': 'Various Textile Suppliers',
      'Packaged Snacks': 'PepsiCo India'
    };
    return suppliers[itemName] || 'Various Suppliers';
  };

  const generateGlobalItemPredictions = (): ItemPrediction[] => {
    return [
      {
        name: 'Cold Beverages - 500ml',
        category: 'Beverages',
        currentStock: 45000,
        predictedDemand: 15000,
        confidence: 0.92,
        boostMultiplier: 1.0,
        riskLevel: 'low',
        recommendation: 'Maintain current stock levels across all warehouses',
        supplier: 'PepsiCo India',
        reorderPoint: 15000,
        daysUntilStockout: 18
      },
      {
        name: 'Cooking Oil - 1L',
        category: 'Cooking Essentials',
        currentStock: 32000,
        predictedDemand: 12000,
        confidence: 0.88,
        boostMultiplier: 1.0,
        riskLevel: 'medium',
        recommendation: 'Monitor stock levels in northern warehouses',
        supplier: 'Adani Wilmar',
        reorderPoint: 10000,
        daysUntilStockout: 12
      },
      {
        name: 'Rice - 25kg',
        category: 'Grains',
        currentStock: 28000,
        predictedDemand: 10000,
        confidence: 0.85,
        boostMultiplier: 1.0,
        riskLevel: 'low',
        recommendation: 'Stock levels adequate across network',
        supplier: 'KRBL Limited',
        reorderPoint: 8000,
        daysUntilStockout: 15
      },
      {
        name: 'Gift Items',
        category: 'Gifts',
        currentStock: 15000,
        predictedDemand: 30000,
        confidence: 0.95,
        boostMultiplier: 1.5,
        riskLevel: 'high',
        recommendation: 'Urgent restocking required for upcoming festivals',
        supplier: 'Various Suppliers',
        reorderPoint: 12000,
        daysUntilStockout: 5
      },
      {
        name: 'Sweets & Candies',
        category: 'Confectionery',
        currentStock: 22000,
        predictedDemand: 25000,
        confidence: 0.93,
        boostMultiplier: 1.8,
        riskLevel: 'high',
        recommendation: 'Increase stock immediately for festival season',
        supplier: 'Nestle India',
        reorderPoint: 15000,
        daysUntilStockout: 4
      }
    ];
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredItems = filterCategory === 'all' 
    ? itemPredictions 
    : itemPredictions.filter(item => item.category === filterCategory);

  const categories = ['all', ...Array.from(new Set(itemPredictions.map(item => item.category)))];

  const handleRestock = async (item: ItemPrediction) => {
    if (!warehouseId) return;
    try {
      await axios.post('http://127.0.0.1:5000/restock-request', {
        warehouseId,
        itemName: item.name,
        category: item.category,
        currentStock: item.currentStock,
        predictedDemand: item.predictedDemand,
        supplier: item.supplier,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      });
      setRestockSuccess(`Restock request sent for ${item.name}`);
      setTimeout(() => setRestockSuccess(null), 2000);
    } catch (error) {
      console.error('Restock request error:', error, error?.response);
      setRestockSuccess('Failed to send restock request');
      setTimeout(() => setRestockSuccess(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isGlobal ? 'Global Item Predictions' : 'Warehouse Item Predictions'}
          </h2>
          <p className="text-gray-600">{currentDate}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('today')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'today' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('insights')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'insights' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      {/* Today's Overview */}
      {viewMode === 'today' && todayPrediction && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Today's Item Predictions ({todayPrediction.dayOfWeek})
              </h3>
              {todayPrediction.isFestival && todayPrediction.festival && (
                <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                  <span className="text-2xl">🎉</span>
                  <span className="text-sm font-medium text-yellow-800">
                    {todayPrediction.festival.title} - Festival Boost Active
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {itemPredictions.length}
                </div>
                <div className="text-gray-600 text-sm">Items Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {itemPredictions.filter(item => item.riskLevel === 'low').length}
                </div>
                <div className="text-gray-600 text-sm">Low Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {itemPredictions.filter(item => item.riskLevel === 'medium').length}
                </div>
                <div className="text-gray-600 text-sm">Medium Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {itemPredictions.filter(item => item.riskLevel === 'high').length}
                </div>
                <div className="text-gray-600 text-sm">High Risk</div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Item Predictions Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predicted Demand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommendation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.supplier}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.currentStock.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Days left: {item.daysUntilStockout}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.predictedDemand.toLocaleString()}
                        </div>
                        {item.boostMultiplier > 1 && (
                          <div className="text-xs text-green-600">
                            +{Math.round((item.boostMultiplier - 1) * 100)}% boost
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(item.riskLevel)}`}>
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getConfidenceColor(item.confidence)}`}>
                          {Math.round(item.confidence * 100)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.recommendation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-600 hover:underline font-semibold disabled:opacity-50"
                          onClick={() => handleRestock(item)}
                          disabled={restockSuccess !== null}
                        >
                          {restockSuccess && restockSuccess.includes(item.name) ? "Request Sent" : "Restock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Weekly Item Demand Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemPredictions.slice(0, 6).map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(item.riskLevel)}`}>
                    {item.riskLevel}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className="font-medium">{item.currentStock.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Weekly Demand:</span>
                    <span className="font-medium">{Math.round(item.predictedDemand * 7).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Days Left:</span>
                    <span className="font-medium">{item.daysUntilStockout}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">{item.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights View */}
      {viewMode === 'insights' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">AI Insights & Recommendations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">High Priority Actions</h4>
              <div className="space-y-2">
                {itemPredictions
                  .filter(item => item.riskLevel === 'high')
                  .map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-red-500">⚠️</span>
                      <span className="text-sm">{item.recommendation}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Stock Optimization</h4>
              <div className="space-y-2">
                {itemPredictions
                  .filter(item => item.riskLevel === 'low' && item.daysUntilStockout > 20)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-sm">{item.name} - Stock levels optimal</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Festival Impact Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {itemPredictions.filter(item => item.boostMultiplier > 1).length}
                </div>
                <div className="text-sm text-gray-600">Items with Festival Boost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(itemPredictions.reduce((sum, item) => sum + item.boostMultiplier, 0) / itemPredictions.length * 100)}%
                </div>
                <div className="text-sm text-gray-600">Average Boost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {itemPredictions.filter(item => item.daysUntilStockout < 7).length}
                </div>
                <div className="text-sm text-gray-600">Critical Stock Items</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {restockSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow-lg z-50">
          {restockSuccess}
        </div>
      )}
    </div>
  );
};

export default WarehouseItemPredictionPanel; 