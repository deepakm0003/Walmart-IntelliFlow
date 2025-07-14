import React, { useState } from 'react';
import { ShoppingCart, Clock, CheckCircle, Truck, AlertTriangle, Send } from 'lucide-react';
import { PurchaseOrder } from '../types';

interface PurchaseOrderPanelProps {
  orders: PurchaseOrder[];
  onApprove?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onCreateOrder?: (order: Partial<PurchaseOrder>) => void;
}

const PurchaseOrderPanel: React.FC<PurchaseOrderPanelProps> = ({ 
  orders, 
  onApprove, 
  onReject, 
  onCreateOrder 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    warehouseId: '',
    items: [{ name: '', quantity: 0, urgency: 'medium' as const }],
    supplier: '',
    estimatedDelivery: ''
  });

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      case 'approved': return <CheckCircle className="text-green-500" size={16} />;
      case 'shipped': return <Truck className="text-blue-500" size={16} />;
      case 'delivered': return <CheckCircle className="text-green-600" size={16} />;
    }
  };

  const getStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const handleCreateOrder = () => {
    if (onCreateOrder && newOrder.warehouseId && newOrder.items[0].name) {
      onCreateOrder({
        ...newOrder,
        totalValue: newOrder.items.reduce((sum, item) => sum + (item.quantity * 100), 0), // Mock calculation
        requestedBy: 'Admin User',
        requestedAt: new Date().toISOString(),
        status: 'pending'
      });
      setShowCreateForm(false);
      setNewOrder({
        warehouseId: '',
        items: [{ name: '', quantity: 0, urgency: 'medium' }],
        supplier: '',
        estimatedDelivery: ''
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-500" />
            Purchase Orders ({orders.length})
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            + Create Order
          </button>
        </div>
      </div>

      {/* Create Order Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Create New Purchase Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
              <select
                value={newOrder.warehouseId}
                onChange={(e) => setNewOrder({...newOrder, warehouseId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Warehouse</option>
                <option value="TG001">Hyderabad Best Price Store</option>
                <option value="MH001">Bhiwandi Fulfillment Center</option>
                <option value="UP002">Lucknow Best Price Store</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <input
                type="text"
                value={newOrder.supplier}
                onChange={(e) => setNewOrder({...newOrder, supplier: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Supplier name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={newOrder.items[0].name}
                onChange={(e) => setNewOrder({
                  ...newOrder, 
                  items: [{...newOrder.items[0], name: e.target.value}]
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={newOrder.items[0].quantity}
                onChange={(e) => setNewOrder({
                  ...newOrder, 
                  items: [{...newOrder.items[0], quantity: parseInt(e.target.value) || 0}]
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quantity"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreateOrder}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              Submit Order
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="max-h-96 overflow-y-auto">
        {orders.map((order) => (
          <div key={order.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <h3 className="font-medium text-gray-900">{order.id}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{order.totalValue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{order.supplier}</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">{item.quantity} units</span>
                    <span className={`px-2 py-1 rounded text-xs ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>Requested by: {order.requestedBy}</span>
              <span>ETA: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
            </div>

            {order.shipmentId && (
              <div className="flex items-center gap-2 text-xs text-blue-600 mb-3">
                <Truck size={12} />
                <span>Shipment: {order.shipmentId}</span>
              </div>
            )}

            {order.status === 'pending' && onApprove && onReject && (
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(order.id)}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(order.id)}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No purchase orders</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderPanel;