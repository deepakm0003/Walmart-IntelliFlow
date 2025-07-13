import React from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string) => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onDismiss, onAction }) => {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'info':
        return <CheckCircle className="text-blue-500" size={20} />;
    }
  };

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-500" />
          System Alerts ({alerts.length})
        </h2>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 border-b border-gray-100 ${getAlertBg(alert.type)} transition-colors hover:bg-opacity-70`}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1">{alert.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                {alert.actionRequired && onAction && (
                  <button
                    onClick={() => onAction(alert.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Take Action
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
            <p>No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPanel;