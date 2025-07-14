import React, { useState, useEffect } from 'react';
import { BarChart3, Warehouse, AlertTriangle, TrendingUp, MapPin, Users, Ship, Settings, Bot, Calendar, Brain } from 'lucide-react';
import IndiaMap from '../components/IndiaMap';
import StatsCard from '../components/StatsCard';
import AlertPanel from '../components/AlertPanel';
import FestivalCalendar from '../components/FestivalCalendar';
import AIPredictionPanel from '../components/AIPredictionPanel';
import CalendarPredictionPanel from '../components/CalendarPredictionPanel';
import WarehouseItemPredictionPanel from '../components/WarehouseItemPredictionPanel';
import AIInsightsDashboard from '../components/AIInsightsDashboard';
import { useNavigate } from 'react-router-dom';
import { warehouses } from '../data/warehouses';
import { generateAlerts } from '../data/mockData';
import { Alert } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setAlerts(generateAlerts());
  }, []);

  const totalWarehouses = warehouses.length;
  const criticalWarehouses = warehouses.filter(w => w.criticalItems > 8).length;
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
  const totalCurrentStock = warehouses.reduce((sum, w) => sum + w.currentStock, 0);
  const avgEfficiency = Math.round(warehouses.reduce((sum, w) => sum + w.efficiency, 0) / warehouses.length);
  const totalCriticalItems = warehouses.reduce((sum, w) => sum + w.criticalItems, 0);

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleTakeAction = (alertId: string) => {
    console.log(`Taking action for alert: ${alertId}`);
    // Implement action logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Warehouse className="text-white" size={20} />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Walmart IntelliFlow</h1>
              </div>
              <span className="text-sm text-gray-500 hidden sm:block">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/shipments')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Ship size={16} />
                <span className="hidden sm:inline">Track Shipments</span>
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Admin Actions</span>
              </button>
              <button
                onClick={() => setShowCalendar(true)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Calendar size={16} />
                <span className="hidden sm:inline">Festival Calendar</span>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>AI Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Executive Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Warehouses"
              value={totalWarehouses}
              subtitle="Across India"
              icon={Warehouse}
              color="blue"
            />
            <StatsCard
              title="Critical Alerts"
              value={criticalWarehouses}
              subtitle="Requiring attention"
              icon={AlertTriangle}
              color="red"
              trend="down"
              trendValue="2 from yesterday"
            />
            <StatsCard
              title="Average Efficiency"
              value={`${avgEfficiency}%`}
              subtitle="Operational performance"
              icon={TrendingUp}
              color="green"
              trend="up"
              trendValue="3% from last week"
            />
            <StatsCard
              title="Total Critical Items"
              value={totalCriticalItems}
              subtitle="Low stock items"
              icon={BarChart3}
              color="yellow"
              trend="neutral"
              trendValue="Stable"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* India Map - Large Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-500" />
                    Warehouse Network Map
                  </h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Healthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Critical</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-96 lg:h-[600px]">
                {!showCalendar && <IndiaMap />}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-green-500" />
                Network Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Capacity</span>
                  <span className="font-semibold">{totalCapacity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Stock</span>
                  <span className="font-semibold">{totalCurrentStock.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-semibold text-green-600">
                    {Math.round((totalCurrentStock / totalCapacity) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(totalCurrentStock / totalCapacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Alerts Panel */}
            <AlertPanel 
              alerts={alerts} 
              onDismiss={handleDismissAlert}
              onAction={handleTakeAction}
            />
          </div>
        </div>

                  {/* Global AI Insights */}
          <div className="mt-8 space-y-8">
            {/* <AIInsightsDashboard isGlobal={true} /> */}
            {/* <CalendarPredictionPanel isGlobal={true} /> */}
            {/* <WarehouseItemPredictionPanel isGlobal={true} /> */}
          </div>

        {/* Bottom Info Panel */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Bot className="text-blue-600" size={20} />
            AI-Powered Walmart IntelliFlow System
          </h3>
          <p className="text-gray-700 mb-4">
            Advanced supply chain management with real-time tracking, AI predictions, and automated decision-making 
            for optimal warehouse operations across India.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">📍</div>
              <span>Click warehouses for detailed analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🚢</div>
              <span>Track live shipments & logistics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🤖</div>
              <span>AI agents provide smart recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">⚡</div>
              <span>Automated purchase orders & approvals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Festival Calendar Modal */}
      {showCalendar && (
        <FestivalCalendar 
          onClose={() => setShowCalendar(false)}
          onFestivalSelect={(festival) => {
            console.log('Selected festival:', festival);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;