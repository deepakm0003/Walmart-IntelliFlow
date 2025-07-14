import React, { useState, useEffect } from 'react';
import { warehouses } from '../data/warehouses';
import { calendarAPI, type CalendarEvent } from '../ml/calendarAPI';

interface AIInsightsDashboardProps {
  warehouseId?: string;
  isGlobal?: boolean;
}

interface InsightMetric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: string;
}

interface TrendData {
  label: string;
  value: number;
  color: string;
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({ 
  warehouseId, 
  isGlobal = false 
}) => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [upcomingFestivals, setUpcomingFestivals] = useState<CalendarEvent[]>([]);
  const [insights, setInsights] = useState<InsightMetric[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

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
    const loadInsights = async () => {
      setLoading(true);
      try {
        const festivals = await calendarAPI.getUpcomingFestivals(90);
        setUpcomingFestivals(festivals);

        if (isGlobal) {
          generateGlobalInsights();
        } else if (warehouseId) {
          generateWarehouseInsights(warehouseId);
        }
      } catch (error) {
        console.error('Error loading insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [warehouseId, isGlobal]);

  const generateGlobalInsights = () => {
    const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
    const totalStock = warehouses.reduce((sum, w) => sum + w.currentStock, 0);
    const avgEfficiency = Math.round(warehouses.reduce((sum, w) => sum + w.efficiency, 0) / warehouses.length);
    const criticalWarehouses = warehouses.filter(w => w.criticalItems > 5).length;

    const globalInsights: InsightMetric[] = [
      {
        title: 'Total Network Capacity',
        value: totalCapacity.toLocaleString(),
        change: 2.5,
        trend: 'up',
        color: 'text-blue-600',
        icon: '📦'
      },
      {
        title: 'Current Utilization',
        value: `${Math.round((totalStock / totalCapacity) * 100)}%`,
        change: -1.2,
        trend: 'down',
        color: 'text-green-600',
        icon: '📊'
      },
      {
        title: 'Average Efficiency',
        value: `${avgEfficiency}%`,
        change: 0.8,
        trend: 'up',
        color: 'text-purple-600',
        icon: '⚡'
      },
      {
        title: 'Critical Warehouses',
        value: criticalWarehouses,
        change: -1,
        trend: 'down',
        color: 'text-red-600',
        icon: '⚠️'
      },
      {
        title: 'Active Shipments',
        value: Math.floor(Math.random() * 50) + 30,
        change: 5.2,
        trend: 'up',
        color: 'text-indigo-600',
        icon: '🚚'
      },
      {
        title: 'Festival Impact',
        value: upcomingFestivals.length > 0 ? `${Math.round(upcomingFestivals[0].salesImpact * 100)}%` : '0%',
        change: upcomingFestivals.length > 0 ? 15 : 0,
        trend: upcomingFestivals.length > 0 ? 'up' : 'stable',
        color: 'text-yellow-600',
        icon: '🎉'
      }
    ];

    setInsights(globalInsights);

    // Generate trend data
    const trendData: TrendData[] = [
      { label: 'Beverages', value: 25, color: 'bg-blue-500' },
      { label: 'Grains', value: 20, color: 'bg-yellow-500' },
      { label: 'Gifts', value: 35, color: 'bg-purple-500' },
      { label: 'Cleaning', value: 15, color: 'bg-green-500' },
      { label: 'Apparel', value: 30, color: 'bg-red-500' }
    ];

    setTrends(trendData);
  };

  const generateWarehouseInsights = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (!warehouse) return;

    const utilization = Math.round((warehouse.currentStock / warehouse.capacity) * 100);
    const efficiency = warehouse.efficiency;
    const criticalItems = warehouse.criticalItems;
    const monthlyOrders = warehouse.monthlyOrders;

    const warehouseInsights: InsightMetric[] = [
      {
        title: 'Storage Utilization',
        value: `${utilization}%`,
        change: utilization > 85 ? 2.1 : -1.5,
        trend: utilization > 85 ? 'up' : 'down',
        color: utilization > 85 ? 'text-red-600' : 'text-green-600',
        icon: '📦'
      },
      {
        title: 'Efficiency Rating',
        value: `${efficiency}%`,
        change: efficiency > 95 ? 0.5 : -0.8,
        trend: efficiency > 95 ? 'up' : 'down',
        color: efficiency > 95 ? 'text-green-600' : 'text-yellow-600',
        icon: '⚡'
      },
      {
        title: 'Critical Items',
        value: criticalItems,
        change: criticalItems > 5 ? 1 : -1,
        trend: criticalItems > 5 ? 'up' : 'down',
        color: criticalItems > 5 ? 'text-red-600' : 'text-green-600',
        icon: '⚠️'
      },
      {
        title: 'Monthly Orders',
        value: monthlyOrders.toLocaleString(),
        change: 3.2,
        trend: 'up',
        color: 'text-blue-600',
        icon: '📋'
      },
      {
        title: 'Population Served',
        value: warehouse.population.toLocaleString(),
        change: 0,
        trend: 'stable',
        color: 'text-purple-600',
        icon: '👥'
      },
      {
        title: 'Regional Demand',
        value: `${Math.round(warehouse.monthlyOrders / warehouse.population * 1000000 * 100) / 100}%`,
        change: 1.8,
        trend: 'up',
        color: 'text-indigo-600',
        icon: '📈'
      }
    ];

    setInsights(warehouseInsights);

    // Generate warehouse-specific trends
    const trendData: TrendData[] = [
      { label: 'Cold Beverages', value: 30, color: 'bg-blue-500' },
      { label: 'Cooking Oil', value: 25, color: 'bg-yellow-500' },
      { label: 'Rice & Grains', value: 20, color: 'bg-green-500' },
      { label: 'Detergents', value: 15, color: 'bg-purple-500' },
      { label: 'Festival Items', value: 40, color: 'bg-red-500' }
    ];

    setTrends(trendData);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
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
            {isGlobal ? 'Global AI Insights Dashboard' : 'Warehouse AI Insights'}
          </h2>
          <p className="text-gray-600">{currentDate}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Live Data</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {insights.map((insight, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-medium ${getTrendColor(insight.trend)}`}>
                  {getTrendIcon(insight.trend)}
                </span>
                <span className={`text-sm font-medium ${getTrendColor(insight.trend)}`}>
                  {insight.change > 0 ? '+' : ''}{insight.change}%
                </span>
              </div>
            </div>
            <div className={`text-2xl font-bold ${insight.color} mb-1`}>
              {insight.value}
            </div>
            <div className="text-sm text-gray-600">
              {insight.title}
            </div>
          </div>
        ))}
      </div>

      {/* Trends and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demand Trends */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Demand Trends by Category</h3>
          <div className="space-y-3">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${trend.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{trend.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${trend.color}`}
                      style={{ width: `${trend.value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{trend.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Festival Impact */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Festival Impact</h3>
          {upcomingFestivals.length > 0 ? (
            <div className="space-y-4">
              {upcomingFestivals.slice(0, 3).map((festival, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <div className="font-medium text-gray-800">{festival.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(festival.date).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        })} • {festival.region}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      +{Math.round(festival.salesImpact * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Sales Boost</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">📅</span>
              <p className="text-gray-600 mt-2">No upcoming festivals</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-500">⚠️</span>
              <span className="font-medium text-gray-800">High Priority</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Restock gift items for upcoming festivals</li>
              <li>• Monitor critical warehouses (MH001, TG002)</li>
              <li>• Increase beverage inventory for summer</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-500">✅</span>
              <span className="font-medium text-gray-800">Optimization</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Network efficiency at 94% - excellent</li>
              <li>• 15 warehouses operating optimally</li>
              <li>• Seasonal adjustments completed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Real-time Alerts */}
      <div className="mt-6 bg-red-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-red-500">🚨</span>
          <span className="font-medium text-gray-800">Real-time Alerts</span>
        </div>
        <div className="text-sm text-gray-600">
          <p>• Shipment #TRK-2024-001 delayed by 2 hours - Route optimization recommended</p>
          <p>• Temperature alert: Cold storage at MH001 above threshold</p>
          <p>• High demand spike detected for beverages in Delhi region</p>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsDashboard; 