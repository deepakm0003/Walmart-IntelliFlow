import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import AIAgentPanel from '../components/AIAgentPanel';
import PurchaseOrderPanel from '../components/PurchaseOrderPanel';
import { generatePurchaseOrders, aiAgents } from '../data/shipmentData';
import { PurchaseOrder } from '../types';

const AdminActionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [actionLog, setActionLog] = useState([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      action: 'Purchase Order PO-2025-001 approved and sent to Coca-Cola India Pvt Ltd',
      type: 'approval',
      status: 'completed'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      action: 'Emergency stock alert sent to Hyderabad warehouse management',
      type: 'alert',
      status: 'completed'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      action: 'Shipment SHIP-002 rerouted due to weather conditions',
      type: 'logistics',
      status: 'completed'
    }
  ]);

  useEffect(() => {
    setPurchaseOrders(generatePurchaseOrders());
  }, []);

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

  const pendingOrders = purchaseOrders.filter(order => order.status === 'pending');
  const approvedOrders = purchaseOrders.filter(order => order.status === 'approved');
  const totalValue = purchaseOrders.reduce((sum, order) => sum + order.totalValue, 0);

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
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Settings className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Control Center</h1>
                  <p className="text-sm text-gray-500">AI-powered operations management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total PO Value</p>
                <p className="text-lg font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>AI Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">{approvedOrders.length}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Agents Active</p>
                <p className="text-2xl font-bold text-purple-600">{aiAgents.filter(a => a.status === 'active').length}</p>
              </div>
              <Settings className="text-purple-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actions Today</p>
                <p className="text-2xl font-bold text-blue-600">{actionLog.length}</p>
              </div>
              <Send className="text-blue-500" size={32} />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Agents Panel */}
          <div className="lg:col-span-1">
            <AIAgentPanel agents={aiAgents} />
          </div>

          {/* Purchase Orders Panel */}
          <div className="lg:col-span-2">
            <PurchaseOrderPanel 
              orders={purchaseOrders}
              onApprove={handleApproveOrder}
              onReject={handleRejectOrder}
              onCreateOrder={handleCreateOrder}
            />
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
            {actionLog.map((action) => (
              <div key={action.id} className="p-4 border-b border-gray-100 flex items-start gap-3">
                {getActionIcon(action.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{action.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(action.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  action.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {action.status}
                </span>
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
      </div>
    </div>
  );
};

export default AdminActionsPage;