import React, { useState, useEffect } from 'react';
import { predictionService } from '../ml/predictionService';
import { calendarAPI, type DailyPrediction, type MonthCalendar, type CalendarEvent } from '../ml/calendarAPI';
import { warehouses } from '../data/warehouses';
import { weatherService, type WeatherData } from '../services/weatherService';

interface CalendarPredictionPanelProps {
  warehouseId?: string;
  isGlobal?: boolean;
  todayPrediction?: DailyPrediction | null;
}

const CalendarPredictionPanel: React.FC<CalendarPredictionPanelProps> = ({ 
  warehouseId, 
  isGlobal = false, 
  todayPrediction: propTodayPrediction
}) => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [todayPrediction, setTodayPrediction] = useState<DailyPrediction | null>(null);
  const [weekPredictions, setWeekPredictions] = useState<DailyPrediction[]>([]);
  const [monthCalendar, setMonthCalendar] = useState<MonthCalendar | null>(null);
  const [upcomingFestivals, setUpcomingFestivals] = useState<CalendarEvent[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('today');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    date: string;
    weather: WeatherData;
    topItems: any[];
    totalPredictedSales: number;
    weatherImpact: string;
  } | null>(null);

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
    const interval = setInterval(updateCurrentDate, 60000); // Update every minute

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
          // Use the topItems from the first warehouse's prediction, or empty if none
          const globalTopItems = allPredictions[0]?.todayPrediction?.topItems || [];
          // Create a global "today" prediction
          const globalToday: DailyPrediction = {
            date: calendarAPI.getCurrentDate(),
            dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            isFestival: upcomingFestivals.some(f => f.date === calendarAPI.getCurrentDate()),
            predictedSales: avgSales,
            confidence: 0.85,
            topItems: globalTopItems,
            factors: ['Global average across 20 warehouses']
          };
          
          setTodayPrediction(globalToday);
          setWeekPredictions(allPredictions[0]?.weekPredictions || []);
          setMonthCalendar(allPredictions[0]?.monthInsights ? {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            days: [],
            totalPredictedSales: allPredictions.reduce((sum, pred) => sum + pred.monthInsights.totalPredictedSales, 0),
            festivals: upcomingFestivals,
            insights: {
              bestDay: allPredictions[0]?.monthInsights.bestDay || '',
              worstDay: allPredictions[0]?.monthInsights.worstDay || '',
              festivalDays: allPredictions[0]?.monthInsights.festivalDays || 0,
              averageConfidence: 0.85
            }
          } : null);
        } else if (warehouseId) {
          // Load predictions for specific warehouse
          const [today, week, month, festivals] = await Promise.all([
            predictionService.getTodayPrediction(warehouseId),
            predictionService.getNextWeekPredictions(warehouseId),
            predictionService.getCalendarPredictions(warehouseId),
            calendarAPI.getUpcomingFestivals(90)
          ]);
          
          setTodayPrediction(today);
          setWeekPredictions(week);
          setMonthCalendar(month.currentMonth);
          setUpcomingFestivals(festivals);
        }
      } catch (error) {
        console.error('Error loading predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [warehouseId, isGlobal, propTodayPrediction]);

  const getFestivalIcon = (festivalId: string) => {
    const icons: { [key: string]: string } = {
      'diwali': '🎆',
      'holi': '🎨',
      'ganesh-chaturthi': '🐘',
      'rakhi': '🪢',
      'eid-ul-fitr': '☪️',
      'christmas': '🎄',
      'republic-day': '🇮🇳',
      'independence-day': '🇮🇳'
    };
    return icons[festivalId] || '🎉';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSalesColor = (sales: number) => {
    if (sales >= 8000) return 'text-green-600';
    if (sales >= 6000) return 'text-blue-600';
    if (sales >= 4000) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Handle day selection for detailed view
  const handleDaySelection = async (date: string) => {
    setSelectedDay(date);
    setLoading(true);
    
    try {
      if (warehouseId) {
        const dayDetails = await weatherService.getDaySpecificPrediction(warehouseId, date);
        setSelectedDayDetails(dayDetails);
      } else if (isGlobal) {
        // For global view, use a sample warehouse
        const sampleWarehouseId = 'MH001';
        const dayDetails = await weatherService.getDaySpecificPrediction(sampleWarehouseId, date);
        setSelectedDayDetails(dayDetails);
      }
    } catch (error) {
      console.error('Error loading day details:', error);
    } finally {
      setLoading(false);
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
            {isGlobal ? 'Global AI Predictions' : 'Warehouse AI Predictions'}
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
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Today's Prediction */}
      {viewMode === 'today' && todayPrediction && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Today's Prediction ({todayPrediction.dayOfWeek})
              </h3>
              {todayPrediction.isFestival && todayPrediction.festival && (
                <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                  <span className="text-2xl">{getFestivalIcon(todayPrediction.festival.id)}</span>
                  <span className="text-sm font-medium text-yellow-800">
                    {todayPrediction.festival.title}
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getSalesColor(todayPrediction.predictedSales)}`}>
                  {todayPrediction.predictedSales.toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm">Predicted Sales</div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${getConfidenceColor(todayPrediction.confidence)}`}>
                  {Math.round(todayPrediction.confidence * 100)}%
                </div>
                <div className="text-gray-600 text-sm">Confidence</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {todayPrediction.topItems.length}
                </div>
                <div className="text-gray-600 text-sm">Top Items</div>
              </div>
            </div>

            {/* Top Items */}
            {todayPrediction.topItems && todayPrediction.topItems.length > 0 ? (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Predicted Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {todayPrediction.topItems.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                      <div>
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.predictedQuantity.toLocaleString()} units
                        </div>
                      </div>
                      {item.boostMultiplier > 1 && (
                        <div className="text-green-600 font-semibold">
                          +{Math.round((item.boostMultiplier - 1) * 100)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-gray-500">No predicted items for today.</div>
            )}

            {/* Factors */}
            {todayPrediction.factors.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Influencing Factors</h4>
                <div className="flex flex-wrap gap-2">
                  {todayPrediction.factors.map((factor, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Week Predictions */}
      {viewMode === 'week' && weekPredictions.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Next 7 Days Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weekPredictions.map((prediction, index) => (
              <div 
                key={index} 
                className={`bg-gray-50 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedDay === prediction.date ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleDaySelection(prediction.date)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {new Date(prediction.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600">{prediction.dayOfWeek}</div>
                  </div>
                  {prediction.isFestival && prediction.festival && (
                    <span className="text-2xl">{getFestivalIcon(prediction.festival.id)}</span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sales:</span>
                    <span className={`font-semibold ${getSalesColor(prediction.predictedSales)}`}>
                      {prediction.predictedSales.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className={`font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                      {Math.round(prediction.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {prediction.isFestival && prediction.festival && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-yellow-800">
                      {prediction.festival.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {prediction.festival.description}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="text-xs text-blue-600 font-medium">
                    Click for detailed analysis →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Day Details */}
          {selectedDayDetails && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Detailed Analysis for {new Date(selectedDayDetails.date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <button 
                  onClick={() => setSelectedDayDetails(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weather Information */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-2xl mr-2">{selectedDayDetails.weather.icon}</span>
                    Weather Conditions
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-medium">{selectedDayDetails.weather.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Feels Like:</span>
                      <span className="font-medium">{selectedDayDetails.weather.feelsLike}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity:</span>
                      <span className="font-medium">{selectedDayDetails.weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wind Speed:</span>
                      <span className="font-medium">{selectedDayDetails.weather.windSpeed} km/h</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
                    {selectedDayDetails.weatherImpact}
                  </div>
                </div>

                {/* Top 5 Items */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-semibold text-gray-800 mb-3">Top 5 Predicted Items</h5>
                  <div className="space-y-3">
                    {selectedDayDetails.topItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {item.predictedQuantity.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">units</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                    Total Predicted Sales: {selectedDayDetails.totalPredictedSales.toLocaleString()} units
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Month Calendar */}
      {viewMode === 'month' && monthCalendar && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              {new Date(monthCalendar.year, monthCalendar.month - 1).toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
              })} Predictions
            </h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {monthCalendar.totalPredictedSales.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Predicted Sales</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Month Insights</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Festival Days:</span>
                  <span className="font-semibold">{monthCalendar.insights.festivalDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Day:</span>
                  <span className="font-semibold text-green-600">
                    {new Date(monthCalendar.insights.bestDay).toLocaleDateString('en-US', { 
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Worst Day:</span>
                  <span className="font-semibold text-red-600">
                    {new Date(monthCalendar.insights.worstDay).toLocaleDateString('en-US', { 
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Confidence:</span>
                  <span className="font-semibold">
                    {Math.round(monthCalendar.insights.averageConfidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Upcoming Festivals</h4>
              <div className="space-y-2">
                {upcomingFestivals.slice(0, 5).map((festival, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-xl">{getFestivalIcon(festival.id)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{festival.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(festival.date).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        })} • {festival.region}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      +{Math.round(festival.salesImpact * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Selector for Global View */}
      {isGlobal && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Warehouse Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.slice(0, 6).map((warehouse) => (
              <div key={warehouse.id} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-800">{warehouse.name}</div>
                <div className="text-sm text-gray-600">{warehouse.city}, {warehouse.state}</div>
                <div className="text-sm text-gray-600">
                  Efficiency: {warehouse.efficiency}% • Orders: {warehouse.monthlyOrders.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPredictionPanel; 