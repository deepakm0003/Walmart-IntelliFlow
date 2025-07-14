
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pause, Play, AlertTriangle, Settings, Send, CheckCircle, Clock, Truck, Ship, Plane, MapPin, Navigation } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Shipment, TrackingStats, PurchaseOrder } from '../types';
import PurchaseOrderPanel from '../components/PurchaseOrderPanel';
import { generatePurchaseOrders } from '../data/shipmentData';
import { warehouses } from '../data/warehouses';
import { getAllInventoryItems } from '../data/mockData';
import axios from 'axios';

const AIRPORTS = [
  { id: 'DEL', name: 'Delhi Airport', city: 'Delhi', coordinates: [28.5562, 77.1000] },
  { id: 'BOM', name: 'Mumbai Airport', city: 'Mumbai', coordinates: [19.0896, 72.8656] },
  { id: 'BLR', name: 'Bangalore Airport', city: 'Bangalore', coordinates: [13.1986, 77.7066] },
  { id: 'MAA', name: 'Chennai Airport', city: 'Chennai', coordinates: [12.9941, 80.1709] },
  { id: 'HYD', name: 'Hyderabad Airport', city: 'Hyderabad', coordinates: [17.2403, 78.4294] },
];
const SEAPORTS = [
  { id: 'MUM', name: 'Mumbai Port', city: 'Mumbai', coordinates: [18.9633, 72.8436] },
  { id: 'CHP', name: 'Chennai Port', city: 'Chennai', coordinates: [13.0827, 80.2707] },
  { id: 'KOL', name: 'Kolkata Port', city: 'Kolkata', coordinates: [22.5460, 88.3137] },
];

type RestockShipment = Shipment & {
  itemId?: string;
  quantity?: number;
  eta?: string;
  type?: string;
  origin?: string;
  distance?: number;
};

const AdminActionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<RestockShipment[]>([]);
  const [trackingStats, setTrackingStats] = useState<TrackingStats | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<string>('');
  const [showAddShipment, setShowAddShipment] = useState(false);
  const [newShipment, setNewShipment] = useState({
    type: 'truck' as 'truck' | 'ship' | 'airplane',
    originId: '',
    destinationId: '',
    warehouseId: '',
    cargo: [''],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    speed: 60
  });

  // Original admin functionality
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [actionLog, setActionLog] = useState<any[]>([]);

  const [restockRequests, setRestockRequests] = useState<any[]>([]);
  const allItems = getAllInventoryItems();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | '' }>({ message: '', type: '' });
  const prevRestockCount = useRef(0);
  const [restockStatus, setRestockStatus] = useState<{ [itemId: string]: string }>({}); // Add this state

  useEffect(() => {
    let interval: any;
    // Use VITE_BACKEND_URL or fallback
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Admin connected to tracking server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Admin disconnected from tracking server');
      setIsConnected(false);
    });

    newSocket.on('shipments-updated', (updatedShipments: Shipment[]) => {
      setShipments(updatedShipments);
    });

    // Fetch initial data
    fetchShipments();
    fetchTrackingStats();
    setPurchaseOrders(generatePurchaseOrders());
    fetch('/api/restock-requests').then(res => res.json()).then(data => {
      setRestockRequests(data);
      prevRestockCount.current = data.length;
    });
    fetch('/api/shipments').then(res => res.json()).then(setShipments);
    interval = setInterval(() => {
      fetch('/api/restock-requests').then(res => res.json()).then(data => {
        setRestockRequests(data);
        // Show toast if new request arrives
        if (prevRestockCount.current < data.length) {
          setToast({ message: 'New restock request received!', type: 'info' });
          setTimeout(() => setToast({ message: '', type: '' }), 3000);
        }
        prevRestockCount.current = data.length;
      });
      fetch('/api/shipments').then(res => res.json()).then(setShipments);
    }, 5000);

    // Fetch action log on mount and every 10 seconds
    const fetchActionLog = () => fetch('/api/action-log').then(res => res.json()).then(setActionLog);
    fetchActionLog();
    const logInterval = setInterval(fetchActionLog, 10000);
    return () => {
      newSocket.close();
      clearInterval(interval);
      clearInterval(logInterval);
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

  const handleAdminCommand = async (command: string, shipmentId?: string) => {
    try {
      switch (command) {
        case 'pause':
          if (shipmentId) {
            const response = await fetch(`http://localhost:3001/api/shipments/${shipmentId}/pause`, {
              method: 'POST'
            });
            if (response.ok) {
              await fetchShipments();
            }
          }
          break;
        case 'resume':
          if (shipmentId) {
            const response = await fetch(`http://localhost:3001/api/shipments/${shipmentId}/resume`, {
              method: 'POST'
            });
            if (response.ok) {
              await fetchShipments();
            }
          }
          break;
        case 'add':
          if (!newShipment.originId || !newShipment.destinationId || !newShipment.warehouseId) {
            alert('Please fill in all required fields');
            return;
          }
          
          const response = await fetch('http://localhost:3001/api/shipments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...newShipment,
              cargo: ['General Cargo']
            })
          });
          
          if (response.ok) {
            const newShipmentData = await response.json();
            console.log('New shipment created:', newShipmentData);
            setShowAddShipment(false);
            setNewShipment({
              type: 'truck',
              originId: '',
              destinationId: '',
              warehouseId: '',
              cargo: [''],
              priority: 'medium',
              speed: 60
            });
            await fetchShipments();
            
            // Add to action log
            const newAction = {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              action: `New shipment ${newShipmentData.id} created from ${newShipmentData.origin} to ${newShipmentData.destination}`,
              type: 'logistics',
              status: 'completed'
            };
            setActionLog(prev => [newAction, ...prev]);
          } else {
            const error = await response.json();
            alert(`Failed to create shipment: ${error.error}`);
          }
          break;
      }
    } catch (error) {
      console.error('Error in admin command:', error);
      alert('An error occurred while processing the command');
    }
  };

  // Original admin functions
  const handleApproveOrder = (orderId: string) => {
    setPurchaseOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'approved', approvedAt: new Date().toISOString() }
        : order
    ));

    // Add to action log
    const newAction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: `Purchase Order ${orderId} approved and sent to supplier`,
      type: 'approval',
      status: 'completed'
    };
    setActionLog(prev => [newAction, ...prev]);

    // Simulate sending to external systems
    setTimeout(() => {
      alert(`✅ Order ${orderId} has been sent to:\n• Supplier procurement system\n• Logistics coordination center\n• Warehouse management system`);
    }, 1000);
  };

  const handleRejectOrder = (orderId: string) => {
    setPurchaseOrders(prev => prev.filter(order => order.id !== orderId));
    
    const newAction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: `Purchase Order ${orderId} rejected and removed from queue`,
      type: 'rejection',
      status: 'completed'
    };
    setActionLog(prev => [newAction, ...prev]);
  };

  const handleCreateOrder = (orderData: Partial<PurchaseOrder>) => {
    const newOrder: PurchaseOrder = {
      id: `PO-2025-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      warehouseId: orderData.warehouseId!,
      items: orderData.items!,
      totalValue: orderData.totalValue!,
      supplier: orderData.supplier!,
      requestedBy: orderData.requestedBy!,
      requestedAt: orderData.requestedAt!,
      status: 'pending',
      estimatedDelivery: orderData.estimatedDelivery!
    };

    setPurchaseOrders(prev => [newOrder, ...prev]);

    const newAction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: `New Purchase Order ${newOrder.id} created for ${newOrder.supplier}`,
      type: 'creation',
      status: 'pending'
    };
    setActionLog(prev => [newAction, ...prev]);
  };

  const handleApproveRestock = async (id: string) => {
    await fetch(`/api/restock-requests/${id}/approve`, { method: 'POST' });
    fetch('/api/restock-requests').then(res => res.json()).then(setRestockRequests);
    fetch('/api/shipments').then(res => res.json()).then(setShipments);
    setToast({ message: 'Restock request approved and shipment created!', type: 'success' });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };
  const handleDeliverShipment = async (id: string) => {
    await fetch(`/api/shipments/${id}/deliver`, { method: 'POST' });
    fetch('/api/shipments').then(res => res.json()).then(setShipments);
    fetch('/api/restock-requests').then(res => res.json()).then(setRestockRequests);
  };

  const handleUpdateRestockStatus = async (idx: number, newStatus: string) => {
    const req = restockRequests[idx];
    try {
      // PATCH request to backend (mocked if not implemented)
      await axios.patch(`http://127.0.0.1:5000/restock-request/${idx}`, { status: newStatus });
      // Update UI immediately
      setRestockRequests(prev => prev.map((r, i) => i === idx ? { ...r, status: newStatus } : r));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle className="text-green-500" size={16} />;
      case 'rejection': return <AlertTriangle className="text-red-500" size={16} />;
      case 'alert': return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'logistics': return <Send className="text-blue-500" size={16} />;
      case 'creation': return <Clock className="text-purple-500" size={16} />;
      default: return <Settings className="text-gray-500" size={16} />;
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

  const getPriorityColor = (priority: Shipment['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const getTypeIcon = (type: Shipment['type']) => {
    switch (type) {
      case 'truck': return <Truck size={16} />;
      case 'ship': return <Ship size={16} />;
      case 'airplane': return <Plane size={16} />;
    }
  };

  const pendingOrders = purchaseOrders.filter(order => order.status === 'pending');
  const approvedOrders = purchaseOrders.filter(order => order.status === 'approved');
  const totalValue = purchaseOrders.reduce((sum, order) => sum + order.totalValue, 0);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/restock-requests')
      .then(res => setRestockRequests(res.data))
      .catch(err => console.error(err));
  }, []);

  const safeRequests = restockRequests.map(r => ({
    ...r,
    status: r.status || 'pending'
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>{toast.message}</div>
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
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Settings className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Control Center</h1>
                  <p className="text-sm text-gray-500">AI-powered operations & shipment management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total PO Value</p>
                <p className="text-lg font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={() => setShowAddShipment(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={16} />
                Add Shipment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">{approvedOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actions Today</p>
                <p className="text-2xl font-bold text-purple-600">{actionLog.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Send className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-blue-600">{trackingStats?.totalShipments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Orders Panel
        <div className="bg-white rounded-lg shadow-md">
          <PurchaseOrderPanel 
            orders={purchaseOrders}
            onApprove={handleApproveOrder}
            onReject={handleRejectOrder}
            onCreateOrder={handleCreateOrder}
          />
        </div> */}

        {/* Restock Requests Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Restock Requests</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-center">Warehouse</th>
                <th className="px-4 py-2 text-center">Item</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-center">Requested At</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {safeRequests.map((req, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-center">{req.warehouseId}</td>
                  <td className="px-4 py-2 text-center">{req.itemName || req.item || '-'}</td>
                  <td className="px-4 py-2 text-center">{req.quantity || req.predictedDemand || '-'}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={
                      req.status === 'approved'
                        ? 'text-green-600 font-semibold'
                        : req.status === 'rejected'
                        ? 'text-red-600 font-semibold'
                        : ''
                    }>
                      {typeof req.status === 'string'
                        ? req.status.charAt(0).toUpperCase() + req.status.slice(1)
                        : <span className="text-gray-400 italic">Unknown</span>
                      }
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{req.requestedAt ? new Date(req.requestedAt).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 text-center">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={async () => await handleUpdateRestockStatus(idx, 'approved')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => await handleUpdateRestockStatus(idx, 'rejected')}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={req.status === 'approved' ? 'text-green-600 font-semibold' : req.status === 'rejected' ? 'text-red-600 font-semibold' : ''}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Shipments Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Restock Shipments</h3>
          <table className="w-full">
            <thead><tr><th>Shipment</th><th>Warehouse</th><th>Item</th><th>Qty</th><th>Status</th><th>Type</th><th>Origin</th><th>ETA</th><th>Action</th></tr></thead>
            <tbody>
              {shipments.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.warehouseId}</td>
                  <td>{s.itemId}</td>
                  <td>{s.quantity}</td>
                  <td>{s.status}</td>
                  <td>{s.type}</td>
                  <td>{s.origin}</td>
                  <td>{s.eta ? new Date(s.eta).toLocaleString() : '-'}</td>
                  <td>
                    {s.status === 'in_transit' && (
                      <span className="text-yellow-600">Auto-delivering...</span>
                    )}
                    {s.status === 'delivered' && (
                      <span className="text-green-600">Delivered</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Shipment Management */}
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Live Shipment Management</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor and control all active shipments</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{shipment.id}</div>
                        <div className="text-sm text-gray-500">{shipment.origin} → {shipment.destination}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(shipment.type)}
                        <span className="text-sm text-gray-900">{shipment.type.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(shipment.priority)}`}>
                        {shipment.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(shipment.estimatedArrival).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {shipment.status === 'in_transit' && (
                          <button
                            onClick={() => handleAdminCommand('pause', shipment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Pause size={16} />
                          </button>
                        )}
                        {shipment.status === 'delayed' && (
                          <button
                            onClick={() => handleAdminCommand('resume', shipment.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Play size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Log */}
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Send size={20} className="text-blue-500" />
              Recent Actions & System Communications
            </h2>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {actionLog.length === 0 && (
              <div className="p-4 text-gray-500">No recent actions.</div>
            )}
            {actionLog.slice().reverse().map((action, idx) => (
              <div key={idx} className="p-4 border-b border-gray-100 flex items-start gap-3">
                <CheckCircle className="text-green-500" size={16} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{action.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(action.time).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">External System Integration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Supplier Systems</p>
                <p className="text-sm text-gray-600">Connected & Syncing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Logistics Network</p>
                <p className="text-sm text-gray-600">Real-time Updates</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Warehouse Management</p>
                <p className="text-sm text-gray-600">Live Data Feed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Shipment Modal */}
        {showAddShipment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Shipment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={newShipment.type}
                      onChange={(e) => setNewShipment({ ...newShipment, type: e.target.value as any, originId: '', destinationId: '' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="truck">Truck</option>
                      <option value="ship">Ship</option>
                      <option value="airplane">Airplane</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Origin (Port/Airport/Warehouse)</label>
                    <select
                      value={newShipment.originId || ''}
                      onChange={(e) => setNewShipment({ ...newShipment, originId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select origin</option>
                      <optgroup label="Airports">
                        {AIRPORTS.map((airport) => (
                          <option key={airport.id} value={airport.id}>{airport.name} - {airport.city}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Seaports">
                        {SEAPORTS.map((port) => (
                          <option key={port.id} value={port.id}>{port.name} - {port.city}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Warehouses">
                        {warehouses.map((wh) => (
                          <option key={wh.id} value={wh.id}>{wh.name} - {wh.city}, {wh.state}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination (Port/Airport/Warehouse)</label>
                    <select
                      value={newShipment.destinationId || ''}
                      onChange={(e) => setNewShipment({ ...newShipment, destinationId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select destination</option>
                      <optgroup label="Airports">
                        {AIRPORTS.map((airport) => (
                          <option key={airport.id} value={airport.id}>{airport.name} - {airport.city}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Seaports">
                        {SEAPORTS.map((port) => (
                          <option key={port.id} value={port.id}>{port.name} - {port.city}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Warehouses">
                        {warehouses.map((wh) => (
                          <option key={wh.id} value={wh.id}>{wh.name} - {wh.city}, {wh.state}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination Warehouse</label>
                    <select
                      value={newShipment.warehouseId}
                      onChange={(e) => setNewShipment({...newShipment, warehouseId: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.city}, {warehouse.state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={newShipment.priority}
                      onChange={(e) => setNewShipment({...newShipment, priority: e.target.value as any})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Speed</label>
                    <input
                      type="number"
                      value={newShipment.speed}
                      onChange={(e) => setNewShipment({...newShipment, speed: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="60"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAddShipment(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAdminCommand('add')}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                  >
                    Add Shipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActionsPage;