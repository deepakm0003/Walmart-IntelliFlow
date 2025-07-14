import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, Ship, Truck, Filter, RefreshCw, AlertTriangle, Settings, Eye, EyeOff, Navigation, Clock, MapPin } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import ShipmentMap from '../components/ShipmentMap';
import StatsCard from '../components/StatsCard';
import { Shipment, TrackingStats } from '../types';

type RestockShipment = Shipment & {
  eta?: string;
  type?: string;
  origin?: string;
  distance?: number;
  deliveredAt?: string;
};

const ShipmentTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<RestockShipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'ship' | 'airplane' | 'truck'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_transit' | 'delayed' | 'arrived' | 'loading'>('all');
  const [showDistances, setShowDistances] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [trackingStats, setTrackingStats] = useState<TrackingStats | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Use VITE_BACKEND_URL or fallback
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to tracking server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from tracking server');
      setIsConnected(false);
    });

    newSocket.on('shipments-updated', (updatedShipments: Shipment[]) => {
      setShipments(updatedShipments);
      setLastUpdate(new Date());
    });

    // Fetch initial data
    fetchShipments();
    fetchTrackingStats();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/shipments');
      const data = await response.json();
      setShipments(data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const fetchTrackingStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tracking/stats');
      const data = await response.json();
      setTrackingStats(data);
    } catch (error) {
      console.error('Error fetching tracking stats:', error);
    }
  };

  const handleAdminCommand = (command: string, shipmentId?: string) => {
    if (!socket) return;

    switch (command) {
      case 'pause':
        if (shipmentId) {
          socket.emit('admin-command', { type: 'pause-shipment', shipmentId });
        }
        break;
      case 'resume':
        if (shipmentId) {
          socket.emit('admin-command', { type: 'resume-shipment', shipmentId });
        }
        break;
    }
  };

  const handleDeliverShipment = async (shipmentId: string) => {
    await fetch(`http://localhost:3001/api/shipments/${shipmentId}/deliver`, { method: 'POST' });
    fetchShipments();
  };

  const filteredShipments = shipments.filter(shipment => {
    const typeMatch = filterType === 'all' || shipment.type === filterType;
    const statusMatch = filterStatus === 'all' || shipment.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getShipmentTypeIcon = (type: Shipment['type']) => {
    switch (type) {
      case 'airplane': return <Plane size={16} />;
      case 'ship': return <Ship size={16} />;
      case 'truck': return <Truck size={16} />;
    }
  };

  const getStatusColor = (status: Shipment['status']) => {
    switch (status) {
      case 'in_transit': return 'text-blue-600';
      case 'delayed': return 'text-red-600';
      case 'arrived': return 'text-green-600';
      case 'loading': return 'text-yellow-600';
    }
  };

  const getSpeedUnit = (type: Shipment['type']) => {
    return type === 'ship' ? 'knots' : 'km/h';
  };

  const getDistanceUnit = (type: Shipment['type']) => {
    return type === 'ship' ? 'nm' : 'km';
  };

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
                  <Ship className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Live Shipment Tracking</h1>
                  <p className="text-sm text-gray-500">Real-time logistics monitoring</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Live Tracking' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={fetchShipments}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Shipments"
            value={trackingStats?.totalShipments || shipments.length}
            subtitle="Active deliveries"
            icon={Ship}
            color="blue"
          />
          <StatsCard
            title="In Transit"
            value={trackingStats?.inTransit || shipments.filter(s => s.status === 'in_transit').length}
            subtitle="Currently moving"
            icon={Truck}
            color="green"
          />
          <StatsCard
            title="Delayed"
            value={trackingStats?.delayed || shipments.filter(s => s.status === 'delayed').length}
            subtitle="Behind schedule"
            icon={AlertTriangle}
            color="red"
          />
          <StatsCard
            title="Weather Affected"
            value={shipments.filter(s => s.weatherImpact).length}
            subtitle="Climate disruptions"
            icon={AlertTriangle}
            color="yellow"
          />
        </div>

        {/* Map Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Map Controls</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showDistances}
                  onChange={(e) => setShowDistances(e.target.checked)}
                  className="rounded"
                />
                <MapPin size={16} />
                Show Distances
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded"
                />
                <Navigation size={16} />
                Show Routes
              </label>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Live Shipment Map</h2>
                  <div className="flex items-center gap-4">
                    {/* Type Filter */}
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="ship">Ships</option>
                      <option value="airplane">Airplanes</option>
                      <option value="truck">Trucks</option>
                    </select>
                    
                    {/* Status Filter */}
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delayed">Delayed</option>
                      <option value="loading">Loading</option>
                      <option value="arrived">Arrived</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="h-96 lg:h-[600px]">
                <ShipmentMap 
                  shipments={filteredShipments}
                  selectedShipment={selectedShipment}
                  onShipmentSelect={setSelectedShipment}
                  showDistances={showDistances}
                  showRoutes={showRoutes}
                />
              </div>
            </div>
          </div>

          {/* Shipment List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Shipments</h3>
              <p className="text-xs text-gray-500 mt-1">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <div className="max-h-96 lg:max-h-[600px] overflow-y-auto">
              {filteredShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedShipment === shipment.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedShipment(shipment.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getShipmentTypeIcon(shipment.type)}
                      <h4 className="font-medium text-gray-900">{shipment.id}</h4>
                    </div>
                    <span className={`text-xs font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>From:</strong> {shipment.origin}</p>
                    <p><strong>To:</strong> {shipment.destination}</p>
                    <p><strong>Type:</strong> {shipment.type}</p>
                    <p><strong>ETA:</strong> {shipment.eta ? new Date(shipment.eta).toLocaleString() : '-'}</p>
                    {shipment.speed && (
                      <p><strong>Speed:</strong> {shipment.speed} {getSpeedUnit(shipment.type)}</p>
                    )}
                    {shipment.distance && (
                      <p><strong>Distance:</strong> {shipment.distance.toFixed(1)} km</p>
                    )}
                    <p><strong>Arrival:</strong> {shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleString() : '-'}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      shipment.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      shipment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      shipment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {shipment.priority ? shipment.priority.toUpperCase() : ''}
                    </span>
                    {shipment.weatherImpact && (
                      <span className="text-yellow-600 text-xs flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Weather Alert
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredShipments.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Ship size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No shipments match the current filters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span className="text-sm">In Transit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span className="text-sm">Delayed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span className="text-sm">Arrived</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
              <span className="text-sm">Loading</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚛</span>
              <span className="text-sm">Truck</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚢</span>
              <span className="text-sm">Ship</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✈</span>
              <span className="text-sm">Airplane</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏭</span>
              <span className="text-sm">Warehouse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentTrackingPage;