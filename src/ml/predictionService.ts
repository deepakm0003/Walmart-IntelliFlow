// Prediction Service - Main interface for ML predictions
// Integrates the prediction model with frontend components

import { SalesPredictionModel, PredictionResult, SalesData } from './predictionModel';
import { festivals, getFestivalByDate, getUpcomingFestivals } from './festivalData';
import { historicalSalesData } from './historicalData';
import { calendarAPI, type CalendarEvent, type DailyPrediction, type MonthCalendar } from './calendarAPI';
import { weatherService, type WeatherBasedItems } from '../services/weatherService';

export interface WarehousePrediction {
  warehouseId: string;
  warehouseName: string;
  monthPredictions: PredictionResult;
  dailyPredictions: Map<string, PredictionResult>;
  nextDayPrediction?: PredictionResult;
  insights: {
    topItems: string[];
    seasonalTrend: string;
    festivalImpact: string[];
    confidence: number;
  };
}

export interface GlobalPredictionInsights {
  totalWarehouses: number;
  averageConfidence: number;
  topPerformingItems: string[];
  upcomingFestivals: Array<{
    name: string;
    date: string;
    expectedBoost: number;
    popularItems: string[];
  }>;
  seasonalTrends: string[];
  recommendations: string[];
}

class PredictionService {
  private model: SalesPredictionModel;
  private warehouseModels: Map<string, SalesPredictionModel> = new Map();

  constructor() {
    this.model = new SalesPredictionModel();
    this.initializeModel();
  }

  private initializeModel() {
    // Add historical data to the model
    historicalSalesData.forEach(data => {
      this.model.addHistoricalData(data);
    });

    // Add festival data to the model
    festivals.forEach(festival => {
      this.model.addFestivalData({
        name: festival.name,
        date: festival.date,
        popularItems: festival.popularItems.map(item => ({
          name: item.name,
          boostMultiplier: item.boostMultiplier,
          category: item.category
        })),
        actionRequired: false
      });
    });
  }

  // Get predictions for a specific warehouse
  async getWarehousePredictions(
    warehouseId: string, 
    warehouseName: string, 
    targetMonth: number = 5
  ): Promise<WarehousePrediction> {
    // Create or get warehouse-specific model
    if (!this.warehouseModels.has(warehouseId)) {
      const warehouseModel = new SalesPredictionModel();
      // Add warehouse-specific historical data (you can customize this)
      historicalSalesData.forEach(data => {
        warehouseModel.addHistoricalData(data);
      });
      festivals.forEach(festival => {
        warehouseModel.addFestivalData({
          name: festival.name,
          date: festival.date,
          popularItems: festival.popularItems.map(item => ({
            name: item.name,
            boostMultiplier: item.boostMultiplier,
            category: item.category
          })),
          actionRequired: false
        });
      });
      this.warehouseModels.set(warehouseId, warehouseModel);
    }

    const warehouseModel = this.warehouseModels.get(warehouseId)!;

    // Get month predictions
    const monthPredictions = warehouseModel.predictMonthSales(targetMonth, warehouseId);

    // Get daily predictions for the month
    const currentYear = new Date().getFullYear();
    const dailyPredictions = warehouseModel.predictDailySalesForMonth(targetMonth, currentYear, warehouseId);

    // Get next day prediction
    const lastKnownDate = historicalSalesData[historicalSalesData.length - 1].date;
    const nextDayPrediction = warehouseModel.predictNextDaySales(lastKnownDate, warehouseId);

    // Generate insights
    const insights = this.generateWarehouseInsights(warehouseModel, targetMonth);

    return {
      warehouseId,
      warehouseName,
      monthPredictions,
      dailyPredictions,
      nextDayPrediction,
      insights
    };
  }

  // Get predictions for all warehouses
  async getAllWarehousePredictions(targetMonth: number = 5): Promise<WarehousePrediction[]> {
    const warehouses = [
      { id: 'MH001', name: 'Bhiwandi Fulfillment Center' },
      { id: 'MH002', name: 'Pune Distribution Hub' },
      { id: 'MH003', name: 'Nagpur Best Price Store' },
      { id: 'MH004', name: 'Aurangabad Fulfillment Center' },
      { id: 'AP001', name: 'Guntur Best Price Store' },
      { id: 'AP002', name: 'Visakhapatnam Best Price Store' },
      { id: 'TG001', name: 'Hyderabad Best Price Store' },
      { id: 'TG002', name: 'Warangal Distribution Center' },
      { id: 'UP001', name: 'Kanpur Best Price Store' },
      { id: 'UP002', name: 'Lucknow Best Price Store' },
      { id: 'MP001', name: 'Bhopal Best Price Store' },
      { id: 'MP002', name: 'Indore Best Price Store' },
      { id: 'PB001', name: 'Amritsar Best Price Store' },
      { id: 'DL001', name: 'Delhi Distribution Center' },
      { id: 'KA001', name: 'Bangalore Best Price Store' },
      { id: 'KA002', name: 'Mysore Fulfillment Center' },
      { id: 'TN001', name: 'Chennai Best Price Store' },
      { id: 'TN002', name: 'Coimbatore Distribution Hub' },
      { id: 'GJ001', name: 'Ahmedabad Best Price Store' },
      { id: 'RJ001', name: 'Jaipur Best Price Store' },
      { id: 'WB001', name: 'Kolkata Best Price Store' },
      { id: 'KL001', name: 'Kochi Fulfillment Center' }
    ];

    const predictions = await Promise.all(
      warehouses.map(warehouse => 
        this.getWarehousePredictions(warehouse.id, warehouse.name, targetMonth)
      )
    );

    return predictions;
  }

  // Get global insights across all warehouses
  async getGlobalInsights(): Promise<GlobalPredictionInsights> {
    const warehousePredictions = await this.getAllWarehousePredictions();
    const upcomingFestivals = getUpcomingFestivals(90); // Next 90 days

    // Calculate average confidence
    const totalConfidence = warehousePredictions.reduce((sum, pred) => sum + pred.insights.confidence, 0);
    const averageConfidence = totalConfidence / warehousePredictions.length;

    // Get top performing items across all warehouses
    const itemPerformance = new Map<string, number>();
    warehousePredictions.forEach(prediction => {
      prediction.monthPredictions.predictedItems.forEach(item => {
        const current = itemPerformance.get(item.name) || 0;
        itemPerformance.set(item.name, current + item.predictedQuantity);
      });
    });

    const topPerformingItems = Array.from(itemPerformance.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

    // Generate recommendations
    const recommendations = this.generateGlobalRecommendations(warehousePredictions, upcomingFestivals);

    return {
      totalWarehouses: warehousePredictions.length,
      averageConfidence,
      topPerformingItems,
      upcomingFestivals: upcomingFestivals.map(festival => ({
        name: festival.name,
        date: festival.date,
        expectedBoost: festival.salesBoost,
        popularItems: festival.popularItems.map(item => item.name)
      })),
      seasonalTrends: [
        'Summer months (March-June) show 30% increase in beverage sales',
        'Winter months (October-February) show 20% increase in food staples',
        'Festival periods show 50-100% boost in gift items',
        'Weekends show 40% higher overall sales'
      ],
      recommendations
    };
  }

  // Get festival-specific predictions
  async getFestivalPredictions(festivalId: string): Promise<{
    festival: any;
    predictions: PredictionResult;
    affectedWarehouses: string[];
  }> {
    const festival = festivals.find(f => f.id === festivalId);
    if (!festival) {
      throw new Error('Festival not found');
    }

    // Get predictions for the festival date
    const festivalDate = new Date(festival.date);
    const month = festivalDate.getMonth() + 1;
    
    const warehousePredictions = await this.getAllWarehousePredictions(month);
    
    // Find warehouses that will be most affected by this festival
    const affectedWarehouses = warehousePredictions
      .filter(pred => {
        const dailyPred = pred.dailyPredictions.get(festival.date);
        return dailyPred && dailyPred.confidence > 0.8;
      })
      .map(pred => pred.warehouseName);

    // Generate festival-specific predictions
    const festivalPredictions = this.model.predictMonthSales(month, 'festival');

    return {
      festival,
      predictions: festivalPredictions,
      affectedWarehouses
    };
  }

  // Generate warehouse-specific insights
  private generateWarehouseInsights(model: SalesPredictionModel, month: number) {
    const modelInsights = model.getModelInsights();
    const seasonalTrend = this.getSeasonalTrendDescription(month);
    const upcomingFestivals = getUpcomingFestivals(30);
    
    const festivalImpact = upcomingFestivals
      .filter(festival => {
        const festivalDate = new Date(festival.date);
        return festivalDate.getMonth() + 1 === month;
      })
      .map(festival => `${festival.name} (${festival.date}): Expected ${Math.round(festival.salesBoost * 100)}% sales boost`);

    return {
      topItems: modelInsights.topPerformingItems.slice(0, 5),
      seasonalTrend,
      festivalImpact,
      confidence: modelInsights.averageConfidence
    };
  }

  // Generate global recommendations
  private generateGlobalRecommendations(
    warehousePredictions: WarehousePrediction[], 
    upcomingFestivals: any[]
  ): string[] {
    const recommendations: string[] = [];

    // Check for low stock items
    const lowStockItems = warehousePredictions
      .flatMap(pred => pred.monthPredictions.predictedItems)
      .filter(item => item.confidence > 0.8)
      .sort((a, b) => b.predictedQuantity - a.predictedQuantity)
      .slice(0, 3)
      .map(item => item.name);

    if (lowStockItems.length > 0) {
      recommendations.push(`Increase inventory for: ${lowStockItems.join(', ')}`);
    }

    // Festival recommendations
    if (upcomingFestivals.length > 0) {
      const nextFestival = upcomingFestivals[0];
      recommendations.push(`Prepare for ${nextFestival.name} on ${nextFestival.date} - stock up on ${nextFestival.popularItems.slice(0, 3).map(item => item.name).join(', ')}`);
    }

    // Seasonal recommendations
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 3 && currentMonth <= 6) {
      recommendations.push('Summer season approaching - increase cold beverage inventory by 30%');
    } else if (currentMonth >= 10 || currentMonth <= 2) {
      recommendations.push('Winter season - increase food staples and warm beverage inventory');
    }

    // Performance recommendations
    const lowConfidenceWarehouses = warehousePredictions.filter(pred => pred.insights.confidence < 0.7);
    if (lowConfidenceWarehouses.length > 0) {
      recommendations.push(`Improve data quality for warehouses: ${lowConfidenceWarehouses.map(w => w.warehouseName).join(', ')}`);
    }

    return recommendations;
  }

  // Get seasonal trend description
  private getSeasonalTrendDescription(month: number): string {
    if (month >= 3 && month <= 6) {
      return 'Summer season - High demand for beverages and cooling products';
    } else if (month >= 7 && month <= 9) {
      return 'Monsoon season - Moderate sales with focus on essentials';
    } else {
      return 'Winter season - High demand for food staples and warm products';
    }
  }

  // Add new sales data to the model
  addNewSalesData(salesData: SalesData) {
    this.model.addHistoricalData(salesData);
    
    // Update all warehouse models
    this.warehouseModels.forEach(model => {
      model.addHistoricalData(salesData);
    });
  }

  // Get model performance metrics
  getModelPerformance() {
    const insights = this.model.getModelInsights();
    return {
      totalPredictions: insights.totalPredictions,
      averageConfidence: insights.averageConfidence,
      topPerformingItems: insights.topPerformingItems,
      seasonalTrends: insights.seasonalTrends,
      lastUpdated: new Date().toISOString()
    };
  }

  // Calendar API based predictions
  async getCalendarPredictions(warehouseId: string): Promise<{
    currentWeek: DailyPrediction[];
    currentMonth: MonthCalendar;
    upcomingFestivals: CalendarEvent[];
  }> {
    const baseSales = 5000; // Base daily sales for the warehouse
    const current = calendarAPI.getCurrentMonth();
    
    const [currentWeek, currentMonth, upcomingFestivals] = await Promise.all([
      calendarAPI.getCurrentWeekPredictions(baseSales, warehouseId),
      calendarAPI.getMonthCalendar(current.year, current.month, baseSales, warehouseId),
      calendarAPI.getUpcomingFestivals(90)
    ]);

    return {
      currentWeek,
      currentMonth,
      upcomingFestivals
    };
  }

  // Get real-time daily prediction for today
  async getTodayPrediction(warehouseId: string): Promise<DailyPrediction> {
    const baseSales = 5000;
    const today = calendarAPI.getCurrentDate();
    return await calendarAPI.getDailyPrediction(today, baseSales, warehouseId);
  }

  // Get predictions for next 7 days
  async getNextWeekPredictions(warehouseId: string): Promise<DailyPrediction[]> {
    const baseSales = 5000;
    const today = new Date();
    const predictions: DailyPrediction[] = [];
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const prediction = await calendarAPI.getDailyPrediction(dateStr, baseSales, warehouseId);
      predictions.push(prediction);
    }
    
    return predictions;
  }

  // Get all warehouse calendar predictions
  async getAllWarehouseCalendarPredictions(): Promise<{
    warehouseId: string;
    warehouseName: string;
    todayPrediction: DailyPrediction;
    weekPredictions: DailyPrediction[];
    monthInsights: {
      totalPredictedSales: number;
      festivalDays: number;
      bestDay: string;
      worstDay: string;
    };
  }[]> {
    const warehouses = [
      { id: 'MH001', name: 'Bhiwandi Fulfillment Center' },
      { id: 'MH002', name: 'Pune Distribution Hub' },
      { id: 'MH003', name: 'Nagpur Best Price Store' },
      { id: 'MH004', name: 'Aurangabad Fulfillment Center' },
      { id: 'AP001', name: 'Guntur Best Price Store' },
      { id: 'AP002', name: 'Visakhapatnam Best Price Store' },
      { id: 'TG001', name: 'Hyderabad Best Price Store' },
      { id: 'TG002', name: 'Warangal Distribution Center' },
      { id: 'UP001', name: 'Kanpur Best Price Store' },
      { id: 'UP002', name: 'Lucknow Best Price Store' },
      { id: 'MP001', name: 'Bhopal Best Price Store' },
      { id: 'MP002', name: 'Indore Best Price Store' },
      { id: 'PB001', name: 'Amritsar Best Price Store' },
      { id: 'DL001', name: 'Delhi Distribution Center' },
      { id: 'KA001', name: 'Bangalore Best Price Store' },
      { id: 'KA002', name: 'Mysore Fulfillment Center' },
      { id: 'TN001', name: 'Chennai Best Price Store' },
      { id: 'TN002', name: 'Coimbatore Distribution Hub' },
      { id: 'GJ001', name: 'Ahmedabad Best Price Store' },
      { id: 'RJ001', name: 'Jaipur Best Price Store' },
      { id: 'WB001', name: 'Kolkata Best Price Store' },
      { id: 'KL001', name: 'Kochi Fulfillment Center' }
    ];

    const predictions = await Promise.all(
      warehouses.map(async (warehouse) => {
        const [todayPrediction, weekPredictions, monthCalendar] = await Promise.all([
          this.getTodayPrediction(warehouse.id),
          this.getNextWeekPredictions(warehouse.id),
          calendarAPI.getMonthCalendar(
            calendarAPI.getCurrentMonth().year,
            calendarAPI.getCurrentMonth().month,
            5000,
            warehouse.id
          )
        ]);

        return {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          todayPrediction,
          weekPredictions,
          monthInsights: {
            totalPredictedSales: monthCalendar.totalPredictedSales,
            festivalDays: monthCalendar.insights.festivalDays,
            bestDay: monthCalendar.insights.bestDay,
            worstDay: monthCalendar.insights.worstDay
          }
        };
      })
    );

    return predictions;
  }
}

// Export singleton instance
export const predictionService = new PredictionService(); 