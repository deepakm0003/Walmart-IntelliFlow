import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Cloud, Sun, CloudRain, Thermometer, Droplets, TrendingUp, Package, AlertTriangle, Star, Target, Zap, BarChart3, DollarSign, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { festivals2025, Festival, FestivalPrediction, WeatherData, advancedFestivalPredictor, enhancedWeatherService } from '../data/festivalData';

interface FestivalCalendarProps {
  onClose: () => void;
  onFestivalSelect?: (festival: Festival) => void;
}

const FestivalCalendar: React.FC<FestivalCalendarProps> = ({ onClose, onFestivalSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [predictions, setPredictions] = useState<FestivalPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'predictions' | 'analytics'>('calendar');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const currentMonthFestivals = festivals2025.filter(festival => {
    const festivalDate = parseISO(festival.date);
    return isSameMonth(festivalDate, currentDate);
  });

  useEffect(() => {
    if (selectedFestival) {
      loadFestivalData(selectedFestival);
    }
  }, [selectedFestival]);

  const loadFestivalData = async (festival: Festival) => {
    setLoading(true);
    try {
      // Load weather data for all regions
      const regions = ['Maharashtra', 'Andhra Pradesh', 'Telangana', 'Uttar Pradesh', 'Punjab', 'Madhya Pradesh', 'Chhattisgarh', 'Jammu & Kashmir'];
      const weatherResults = await enhancedWeatherService.getWeatherForecast(regions, 14);
      setWeatherData(weatherResults);

      // Generate comprehensive ML predictions for all warehouses
      const festivalPredictions = advancedFestivalPredictor.predictAllWarehouses(festival, weatherResults);
      setPredictions(festivalPredictions);
    } catch (error) {
      console.error('Error loading festival data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFestivalsForDate = (date: Date): Festival[] => {
    return festivals2025.filter(festival => {
      const festivalDate = parseISO(festival.date);
      return isSameDay(festivalDate, date);
    });
  };

  const getDateClasses = (date: Date): string => {
    const festivals = getFestivalsForDate(date);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isToday = isSameDay(date, new Date());
    
    let classes = 'w-10 h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-colors relative ';
    
    if (isSelected) {
      classes += 'bg-blue-600 text-white ';
    } else if (isToday) {
      classes += 'bg-blue-100 text-blue-800 font-semibold ';
    } else if (festivals.length > 0) {
      const highSignificance = festivals.some(f => f.significance === 'high');
      classes += highSignificance ? 'bg-orange-100 text-orange-800 font-medium ' : 'bg-yellow-100 text-yellow-800 ';
    } else {
      classes += 'hover:bg-gray-100 text-gray-700 ';
    }
    
    return classes;
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear': return <Sun size={16} className="text-yellow-500" />;
      case 'cloudy': return <Cloud size={16} className="text-gray-500" />;
      case 'rain': return <CloudRain size={16} className="text-blue-500" />;
      default: return <Cloud size={16} className="text-gray-500" />;
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const festivals = getFestivalsForDate(date);
    if (festivals.length > 0) {
      setSelectedFestival(festivals[0]);
      setActiveTab('predictions');
    } else {
      setSelectedFestival(null);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Analytics calculations
  const totalPredictedRevenue = predictions.reduce((sum, pred) => 
    sum + pred.predictedDemand.reduce((demandSum, demand) => demandSum + demand.expectedRevenue, 0), 0
  );

  const averageOpportunityScore = predictions.length > 0 
    ? predictions.reduce((sum, pred) => sum + pred.opportunityScore, 0) / predictions.length 
    : 0;

  const topWarehousesByOpportunity = predictions
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 5);

  const categoryDemandData = selectedFestival ? 
    predictions.reduce((acc, pred) => {
      pred.predictedDemand.forEach(demand => {
        if (!acc[demand.category]) {
          acc[demand.category] = { category: demand.category, totalDemand: 0, totalRevenue: 0 };
        }
        acc[demand.category].totalDemand += demand.demandIncrease;
        acc[demand.category].totalRevenue += demand.expectedRevenue;
      });
      return acc;
    }, {} as any) : {};

  const chartData = Object.values(categoryDemandData);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const warehouseRegionMap: { [warehouseId: string]: string } = {
    'MH001': 'Maharashtra',
    'MH002': 'Maharashtra',
    'MH003': 'Maharashtra',
    'MH004': 'Maharashtra',
    'AP001': 'Andhra Pradesh',
    'AP002': 'Andhra Pradesh',
    'TG001': 'Telangana',
    'TG002': 'Telangana',
    'UP001': 'Uttar Pradesh',
    'UP002': 'Uttar Pradesh',
    'MP001': 'Madhya Pradesh',
    'MP002': 'Madhya Pradesh',
    'PB001': 'Punjab',
    'DL001': 'Delhi',
    'KA001': 'Karnataka',
    'KA002': 'Karnataka',
    'TN001': 'Tamil Nadu',
    'TN002': 'Tamil Nadu',
    'GJ001': 'Gujarat',
    'RJ001': 'Rajasthan',
    'WB001': 'West Bengal',
    'KL001': 'Kerala'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-[95vw] w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={28} />
              <div>
                <h2 className="text-2xl font-bold">Festival & Weather Intelligence 2025</h2>
                <p className="text-blue-100">AI-Powered Demand Forecasting for All Warehouses</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'calendar' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setActiveTab('predictions')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'predictions' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
              disabled={!selectedFestival}
            >
              ML Predictions
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'analytics' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
              disabled={!selectedFestival}
            >
              Analytics Dashboard
            </button>
          </div>
        </div>

        <div className="h-[calc(95vh-180px)] overflow-y-auto">
          {activeTab === 'calendar' && (
            <div className="flex">
              {/* Calendar Section */}
              <div className="w-1/2 p-6 border-r border-gray-200">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {format(currentDate, 'MMMM yyyy')}
                  </h3>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map(date => {
                    const festivals = getFestivalsForDate(date);
                    return (
                      <div
                        key={date.toISOString()}
                        className={getDateClasses(date)}
                        onClick={() => handleDateClick(date)}
                      >
                        {format(date, 'd')}
                        {festivals.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{festivals.length}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Month Festivals Summary */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Festivals This Month</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {currentMonthFestivals.map(festival => (
                      <div
                        key={festival.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => setSelectedFestival(festival)}
                      >
                        <div>
                          <p className="font-medium text-gray-900">{festival.name}</p>
                          <p className="text-sm text-gray-600">{format(parseISO(festival.date), 'MMM dd')}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSignificanceColor(festival.significance)}`}>
                          {festival.significance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Festival Details Section */}
              <div className="w-1/2 p-6">
                {selectedFestival ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedFestival.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>📅 {format(parseISO(selectedFestival.date), 'MMMM dd, yyyy')}</span>
                        <span>⏱️ {selectedFestival.duration} days</span>
                        <span className={`px-2 py-1 rounded ${getSignificanceColor(selectedFestival.significance)}`}>
                          {selectedFestival.significance} significance
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Expected demand increase: <span className="font-bold text-green-600">{selectedFestival.expectedDemandIncrease}%</span>
                      </p>
                    </div>

                    {/* Popular Items */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Popular Items</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedFestival.popularItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <Package size={16} className="text-blue-600" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Regions */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Primary Regions</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFestival.region.map((region, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Weather Impact */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Weather Sensitivity</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedFestival.weatherImpact === 'high' ? 'bg-red-500' :
                          selectedFestival.weatherImpact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm text-gray-700 capitalize">{selectedFestival.weatherImpact} weather impact</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('predictions');
                        loadFestivalData(selectedFestival);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating AI Predictions...
                        </>
                      ) : (
                        <>
                          <TrendingUp size={16} />
                          View AI Predictions
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
                      <p>Select a date with festivals to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'predictions' && selectedFestival && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ML Predictions for {selectedFestival.name}
                </h3>
                <p className="text-gray-600">AI-powered demand forecasting across all Walmart warehouses</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="text-blue-600" size={20} />
                    <span className="font-medium text-blue-900">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">₹{(totalPredictedRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-green-600" size={20} />
                    <span className="font-medium text-green-900">Avg Opportunity</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{averageOpportunityScore.toFixed(0)}/100</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-orange-600" size={20} />
                    <span className="font-medium text-orange-900">Warehouses</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{predictions.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-purple-600" size={20} />
                    <span className="font-medium text-purple-900">High Priority</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {predictions.filter(p => p.opportunityScore > 70).length}
                  </p>
                </div>
              </div>

              {/* Warehouse Predictions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {predictions.map((prediction) => {
                  // Map warehouseId to region
                  const region = warehouseRegionMap[prediction.warehouseId];
                  const warehouseWeather = weatherData.find(w => w.region === region);
                  return (
                    <div key={prediction.warehouseId} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">{prediction.warehouseName}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prediction.opportunityScore > 80 ? 'bg-green-100 text-green-800' :
                            prediction.opportunityScore > 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {prediction.opportunityScore}/100
                          </span>
                        </div>
                      </div>
                      {/* Show temperature for this warehouse */}
                      <div className="mb-2 text-sm text-blue-600 font-medium flex items-center gap-2">
                        <Thermometer size={16} />
                        {warehouseWeather ? `${warehouseWeather.temperature.toFixed(1)}°C` : '--'}
                      </div>
                      {/* Demand Categories */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">Predicted Demand by Category</h5>
                        <div className="space-y-2">
                          {prediction.predictedDemand.slice(0, 3).map((demand, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{demand.category}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-green-600">+{demand.demandIncrease}%</span>
                                <span className="text-xs text-gray-500">₹{(demand.expectedRevenue / 1000).toFixed(0)}K</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Stock Recommendations */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">Top Stock Recommendations</h5>
                        <div className="space-y-2">
                          {prediction.recommendedStock.slice(0, 3).map((stock, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{stock.item}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(stock.urgency)}`}>
                                {stock.urgency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Weather Considerations */}
                      {prediction.weatherConsiderations.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">Weather Impact</h5>
                          <div className="text-sm text-gray-600">
                            {prediction.weatherConsiderations[0]}
                          </div>
                        </div>
                      )}
                      {/* Risk Factors */}
                      {prediction.riskFactors.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">Risk Factors</h5>
                          <div className="flex flex-wrap gap-1">
                            {prediction.riskFactors.slice(0, 2).map((risk, index) => (
                              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                {risk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Optimal stocking: {format(parseISO(prediction.optimalStockingDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && selectedFestival && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Analytics Dashboard - {selectedFestival.name}
                </h3>
                <p className="text-gray-600">Comprehensive insights and visualizations</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Demand Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Demand by Category</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [value, name === 'totalDemand' ? 'Demand Increase %' : 'Revenue ₹']} />
                        <Bar dataKey="totalDemand" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Revenue Distribution</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalRevenue"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`₹${(value / 1000).toFixed(0)}K`, 'Revenue']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Performing Warehouses */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Top Opportunity Warehouses</h4>
                  <div className="space-y-3">
                    {topWarehousesByOpportunity.map((warehouse, index) => (
                      <div key={warehouse.warehouseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{warehouse.warehouseName}</p>
                            <p className="text-sm text-gray-600">
                              Revenue: ₹{
                                (warehouse.predictedDemand.reduce((sum, d) => sum + (typeof d.expectedRevenue === 'number' ? d.expectedRevenue : 0), 0) / 1000).toFixed(0)
                              }K
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{warehouse.opportunityScore}/100</p>
                          <p className="text-xs text-gray-500">Opportunity Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather Impact Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Weather Impact Analysis</h4>
                  <div className="space-y-4">
                    {weatherData.slice(0, 5).map((weather, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getWeatherIcon(weather.condition)}
                          <div>
                            <p className="font-medium text-gray-900">{weather.region}</p>
                            <p className="text-sm text-gray-600">{weather.condition}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{weather.temperature.toFixed(0)}°C</p>
                          <p className="text-xs text-gray-500">{weather.rainfall.toFixed(0)}mm rain</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FestivalCalendar;