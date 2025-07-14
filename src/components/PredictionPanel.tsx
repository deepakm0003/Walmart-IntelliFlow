import React from 'react';
import { TrendingUp, Brain, Target } from 'lucide-react';
import { Prediction } from '../types';

interface PredictionPanelProps {
  predictions: Prediction[];
}

const PredictionPanel: React.FC<PredictionPanelProps> = ({ predictions }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Brain size={20} className="text-purple-500" />
          AI Predictions & Recommendations
        </h2>
      </div>
      <div className="p-4 space-y-4">
        {predictions.map((prediction, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                <h3 className="font-medium text-gray-900">{prediction.category}</h3>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                {prediction.confidence}% Confidence
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Predicted Demand</p>
                <p className="text-2xl font-bold text-gray-900">{prediction.predictedDemand.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Key Factors</p>
                <div className="flex flex-wrap gap-1">
                  {prediction.factors.map((factor, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-start gap-2">
                <Target size={16} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Recommended Action</p>
                  <p className="text-sm text-yellow-700">{prediction.recommendedAction}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionPanel;