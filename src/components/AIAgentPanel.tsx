import React, { useState } from 'react';
import { Bot, Brain, MessageSquare, Zap, TrendingUp, Send, Mic } from 'lucide-react';
import { AIAgent } from '../types';

interface AIAgentPanelProps {
  agents: AIAgent[];
}

const AIAgentPanel: React.FC<AIAgentPanelProps> = ({ agents }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'agent',
      message: 'Hello! I\'m your AI assistant. I can help you with warehouse operations, demand forecasting, and supply chain optimization. What would you like to know?',
      timestamp: new Date().toISOString()
    }
  ]);

  const getAgentStatusColor = (status: AIAgent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentIcon = (type: AIAgent['type']) => {
    switch (type) {
      case 'demand_forecaster': return <TrendingUp size={16} />;
      case 'route_optimizer': return <Zap size={16} />;
      case 'inventory_manager': return <Bot size={16} />;
      case 'weather_analyst': return <Brain size={16} />;
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      type: 'user',
      message: chatMessage,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on current data, I recommend increasing cold beverage stock in Hyderabad by 40% due to the ongoing heatwave.",
        "Weather analysis shows heavy rain in Maharashtra. I've automatically rerouted 2 shipments to avoid delays.",
        "Demand forecast indicates 25% increase in gift items for upcoming Ganesh Chaturthi. Shall I generate purchase orders?",
        "Critical stock alert: 3 warehouses are below minimum threshold for cooking oil. Emergency restocking recommended.",
        "Route optimization complete. New delivery schedule will save 15% in transportation costs and reduce carbon footprint."
      ];

      const aiResponse = {
        type: 'agent',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const quickActions = [
    "Show critical stock alerts",
    "Generate demand forecast",
    "Check weather disruptions",
    "Optimize delivery routes",
    "Create purchase orders"
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bot size={20} className="text-purple-500" />
            AI Command Center
          </h2>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <MessageSquare size={16} />
            {chatOpen ? 'Close Chat' : 'Open Chat'}
          </button>
        </div>
      </div>

      {/* AI Agents Status */}
      <div className="p-4 space-y-3">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                {getAgentIcon(agent.type)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-600">{agent.lastAction}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getAgentStatusColor(agent.status)}`}>
                {agent.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {agent.recommendations} actions • {agent.accuracy}% accuracy
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Chat Interface */}
      {chatOpen && (
        <div className="border-t border-gray-200">
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
            <div className="flex flex-wrap gap-1">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setChatMessage(action)}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI assistant..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentPanel;