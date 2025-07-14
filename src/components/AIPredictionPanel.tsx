import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Calendar, Target, AlertTriangle, CheckCircle, BarChart3, Zap } from 'lucide-react';
import { predictionService, WarehousePrediction, GlobalPredictionInsights } from '../ml/predictionService';

interface AIPredictionPanelProps {
  warehouseId?: string;
  warehouseName?: string;
  showGlobal?: boolean;
}

const AIPredictionPanel: React.FC<AIPredictionPanelProps> = ({ 
  warehouseId, 
  warehouseName, 
  showGlobal = false 
}) => {
  const [predictions, setPredictions] = useState<WarehousePrediction | null>(null);
  const [globalInsights, setGlobalInsights] = useState<GlobalPredictionInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [activeTab, setActiveTab] = useState<'predictions' | 'insights' | 'calendar'>('predictions');

  useEffect(() => {
    loadPredictions();
  }, [warehouseId, selectedMonth, showGlobal]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      if (showGlobal) {
        const insights = await predictionService.getGlobalInsights();
        setGlobalInsights(insights);
      } else if (warehouseId && warehouseName) {
        const warehousePred = await predictionService.getWarehousePredictions(
          warehouseId, 
          warehouseName, 
          selectedMonth
        );
        setPredictions(warehousePred);
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading AI predictions...</span>
        </div>
      </div>
    );
  }

  if (showGlobal && globalInsights) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Global AI Insights</h2>
              <p className="text-sm text-gray-600">Cross-warehouse predictions and recommendations</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Warehouses</p>
                  <p className="text-2xl font-bold text-blue-900">{globalInsights.totalWarehouses}</p>
                </div>
                <BarChart3 className="text-blue-600" size={24} />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Avg Confidence</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(globalInsights.averageConfidence * 100)}%
                  </p>
                </div>
                <Target className="text-green-600" size={24} />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Upcoming Festivals</p>
                  <p className="text-2xl font-bold text-purple-900">{globalInsights.upcomingFestivals.length}</p>
                </div>
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          {/* Top Performing Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600" />
              Top Performing Items
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalInsights.topPerformingItems.slice(0, 6).map((item, index) => (
                <div key={item} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap size={20} className="text-yellow-600" />
              AI Recommendations
            </h3>
            <div className="space-y-3">
              {globalInsights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Festivals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" />
              Upcoming Festivals
            </h3>
            <div className="space-y-3">
              {globalInsights.upcomingFestivals.slice(0, 3).map((festival) => (
                <div key={festival.date} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{festival.name}</p>
                    <p className="text-sm text-gray-600">{festival.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">
                      +{Math.round(festival.expectedBoost * 100)}% boost
                    </p>
                    <p className="text-xs text-gray-500">
                      {festival.popularItems.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!predictions) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">No predictions available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Predictions & Recommendations</h2>
              <p className="text-sm text-gray-600">{predictions.warehouseName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={5}>May 2025</option>
              <option value={6}>June 2025</option>
              <option value={7}>July 2025</option>
              <option value={8}>August 2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'predictions'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Predictions
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'insights'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Daily Forecast
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'predictions' && (
          <div>
            {/* Month Predictions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                Month {selectedMonth} Predictions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-600">Predicted Sales</p>
                  <p className="text-2xl font-bold text-green-900">
                    ₹{predictions.monthPredictions.totalPredictedSales.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-600">Confidence</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round(predictions.monthPredictions.confidence * 100)}%
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Top Predicted Items</h4>
                <div className="space-y-2">
                  {predictions.monthPredictions.predictedItems.slice(0, 5).map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                        <span className="text-sm text-gray-900">{item.name}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{item.predictedQuantity} units</p>
                        <p className="text-xs text-gray-500">{Math.round(item.confidence * 100)}% confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Day Prediction */}
            {predictions.nextDayPrediction && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target size={20} className="text-blue-600" />
                  Next Day Prediction
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Predicted Sales</p>
                      <p className="text-xl font-bold text-blue-900">
                        ₹{predictions.nextDayPrediction.totalPredictedSales.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Confidence</p>
                      <p className="text-xl font-bold text-blue-900">
                        {Math.round(predictions.nextDayPrediction.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Top Items for Tomorrow:</p>
                    <div className="space-y-1">
                      {predictions.nextDayPrediction.predictedItems.slice(0, 3).map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="font-medium text-gray-900">{item.predictedQuantity} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Seasonal Trend</h4>
                <p className="text-sm text-purple-700">{predictions.insights.seasonalTrend}</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Model Confidence</h4>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(predictions.insights.confidence * 100)}%
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Top Items This Month</h4>
              <div className="space-y-2">
                {predictions.insights.topItems.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className="text-sm text-gray-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {predictions.insights.festivalImpact.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-purple-600" />
                  Festival Impact
                </h4>
                <div className="space-y-2">
                  {predictions.insights.festivalImpact.map((impact, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-purple-50 rounded">
                      <AlertTriangle size={16} className="text-purple-600 mt-0.5" />
                      <p className="text-sm text-purple-700">{impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(predictions.dailyPredictions.entries()).slice(0, 15).map(([date, prediction]) => (
                <div key={date} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      prediction.confidence > 0.8 
                        ? 'bg-green-100 text-green-800' 
                        : prediction.confidence > 0.6 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(prediction.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    ₹{prediction.totalPredictedSales.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {prediction.predictedItems.length} items
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPredictionPanel; 