import React from 'react';
import { type DailyPrediction } from '../ml/calendarAPI';

interface WarehouseAIPredictionBlockProps {
  todayPrediction: DailyPrediction;
  enrichedItems: any[];
  next7DaysPredictions: DailyPrediction[];
  next7DaysEnrichedItems?: any[]; // New prop for enriched top items per day
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.8) return 'text-blue-600';
  if (confidence >= 0.7) return 'text-yellow-600';
  return 'text-red-600';
};

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getFestivalIcon = (festival?: any) => {
  if (!festival) return null;
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
  return icons[festival.id] || '🎉';
};

const WarehouseAIPredictionBlock: React.FC<WarehouseAIPredictionBlockProps> = ({ todayPrediction, enrichedItems, next7DaysPredictions, next7DaysEnrichedItems = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header for today's prediction */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Today's Prediction ({todayPrediction.dayOfWeek})
      </h2>
      {/* Summary */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-gray-600">{new Date(todayPrediction.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-700">{todayPrediction.predictedSales.toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Predicted Sales</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getConfidenceColor(todayPrediction.confidence)}`}>{Math.round(todayPrediction.confidence * 100)}%</div>
              <div className="text-gray-600 text-sm">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{enrichedItems.length}</div>
              <div className="text-gray-600 text-sm">Top Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Predictions Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Predicted Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Demand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrichedItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentStock.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.predictedDemand.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(item.riskLevel)}`}>{item.riskLevel}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getConfidenceColor(item.confidence)}`}>{Math.round(item.confidence * 100)}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next 7 Days' Predictions */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next 7 Days' Predictions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Sales</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Festival</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Items</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(next7DaysEnrichedItems.length > 0 ? next7DaysEnrichedItems : next7DaysPredictions).map((pred: any, idx: number) => (
                <tr key={idx} className={pred.isFestival ? 'bg-yellow-50 font-semibold' : ''}>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(pred.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{pred.dayOfWeek}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{pred.predictedSales?.toLocaleString?.() ?? pred.totalPredictedSales?.toLocaleString?.() ?? '-'}</td>
                  <td className={`px-4 py-2 whitespace-nowrap ${getConfidenceColor(pred.confidence ?? 0.85)}`}>{Math.round((pred.confidence ?? 0.85) * 100)}%</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {pred.isFestival && pred.festival ? (
                      <span className="flex items-center gap-1 text-yellow-700">
                        <span>{getFestivalIcon(pred.festival)}</span>
                        <span>{pred.festival.title}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <ul className="space-y-1">
                      {(pred.enrichedTopItems || pred.topItems?.slice(0, 3) || []).map((item: any, i: number) => (
                        <li key={i} className="text-sm">
                          <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                            <span className="font-medium text-gray-800">{item.name}</span>
                            <span className="text-xs text-gray-500">{item.category}</span>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(item.riskLevel)}`}>{item.riskLevel}</span>
                            <span className={`text-xs font-medium ${getConfidenceColor(item.confidence)}`}>{Math.round((item.confidence ?? 0.85) * 100)}%</span>
                            <span className="text-xs text-gray-600">{item.recommendation}</span>
                          </div>
                          <div className="text-xs text-gray-600">Demand: {item.predictedDemand?.toLocaleString?.() ?? item.predictedQuantity?.toLocaleString?.() ?? '-'} units</div>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarehouseAIPredictionBlock; 