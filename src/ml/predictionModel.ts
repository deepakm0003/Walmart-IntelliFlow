// ML Prediction Model for Walmart IntelliFlow Dashboard
// Handles sales forecasting, item popularity prediction, and festival-based adjustments

export interface SalesData {
  month: number;
  day?: number;
  items: {
    name: string;
    quantity: number;
    category: string;
    price: number;
  }[];
  totalSales: number;
  date: string;
}

export interface FestivalData {
  name: string;
  date: string;
  popularItems: {
    name: string;
    boostMultiplier: number;
    category: string;
  }[];
  description: string;
}

export interface PredictionResult {
  predictedItems: {
    name: string;
    predictedQuantity: number;
    confidence: number;
    category: string;
    price: number;
  }[];
  totalPredictedSales: number;
  confidence: number;
  factors: string[];
  nextDayPrediction?: {
    date: string;
    items: {
      name: string;
      predictedQuantity: number;
      confidence: number;
    }[];
  };
}

export class SalesPredictionModel {
  private historicalData: SalesData[] = [];
  private festivals: FestivalData[] = [];
  private itemCategories: string[] = [];
  private baseItemDemand: Map<string, number> = new Map();

  constructor() {
    this.initializeBaseData();
  }

  private initializeBaseData() {
    // Initialize base item demand patterns
    this.baseItemDemand.set('Cold Beverages - 500ml', 1200);
    this.baseItemDemand.set('Cooking Oil - 1L', 800);
    this.baseItemDemand.set('Rice - 25kg', 600);
    this.baseItemDemand.set('Wheat Flour - 10kg', 900);
    this.baseItemDemand.set('Detergent Powder - 1kg', 700);
    this.baseItemDemand.set('Personal Care Kit', 500);
    this.baseItemDemand.set('Fresh Vegetables - Mixed', 400);
    this.baseItemDemand.set('Packaged Snacks', 1500);
    this.baseItemDemand.set('Tea Leaves - 250g', 800);
    this.baseItemDemand.set('Milk Powder - 500g', 600);
    this.baseItemDemand.set('Gift Items', 300);
    this.baseItemDemand.set('Sweets & Candies', 1000);
    this.baseItemDemand.set('Incense Sticks', 200);
    this.baseItemDemand.set('Decorative Items', 150);
    this.baseItemDemand.set('Traditional Clothes', 100);
  }

  // Add historical sales data
  addHistoricalData(data: SalesData) {
    this.historicalData.push(data);
  }

  // Add festival data
  addFestivalData(festival: FestivalData) {
    this.festivals.push(festival);
  }

  // Get festival for a specific date
  private getFestivalForDate(date: string): FestivalData | null {
    return this.festivals.find(festival => festival.date === date) || null;
  }

  // Calculate seasonal trends
  private calculateSeasonalTrend(month: number): number {
    // Summer months (March-June) - higher beverage sales
    if (month >= 3 && month <= 6) return 1.3;
    // Monsoon months (July-September) - moderate sales
    if (month >= 7 && month <= 9) return 0.9;
    // Winter months (October-February) - higher food sales
    return 1.1;
  }

  // Calculate day-of-week patterns
  private calculateDayOfWeekPattern(dayOfWeek: number): number {
    // Weekend boost
    if (dayOfWeek === 0 || dayOfWeek === 6) return 1.4;
    // Mid-week dip
    if (dayOfWeek === 2 || dayOfWeek === 3) return 0.8;
    // Regular weekdays
    return 1.0;
  }

  // Predict sales for a specific month based on historical data
  predictMonthSales(targetMonth: number, warehouseId: string): PredictionResult {
    const historicalMonths = this.historicalData.filter(data => data.month < targetMonth);
    
    if (historicalMonths.length === 0) {
      return this.predictWithBaseData(targetMonth);
    }

    // Calculate average sales patterns from historical data
    const itemAverages = this.calculateItemAverages(historicalMonths);
    const seasonalTrend = this.calculateSeasonalTrend(targetMonth);
    
    // Generate predictions for each item
    const predictedItems = Array.from(this.baseItemDemand.entries()).map(([itemName, baseDemand]) => {
      const avgQuantity = itemAverages.get(itemName) || baseDemand;
      const predictedQuantity = Math.round(avgQuantity * seasonalTrend * (0.9 + Math.random() * 0.2));
      
      return {
        name: itemName,
        predictedQuantity,
        confidence: 0.75 + Math.random() * 0.2,
        category: this.getItemCategory(itemName),
        price: this.getItemPrice(itemName)
      };
    });

    // Sort by predicted quantity
    predictedItems.sort((a, b) => b.predictedQuantity - a.predictedQuantity);

    return {
      predictedItems: predictedItems.slice(0, 10), // Top 10 items
      totalPredictedSales: predictedItems.reduce((sum, item) => sum + (item.predictedQuantity * item.price), 0),
      confidence: 0.8,
      factors: ['Historical Data', 'Seasonal Trends', 'Base Demand Patterns']
    };
  }

  // Predict next day sales based on recent data
  predictNextDaySales(lastKnownDate: string, warehouseId: string): PredictionResult | null {
    const recentData = this.historicalData.filter(data => data.date <= lastKnownDate);
    
    if (recentData.length === 0) {
      return null;
    }

    // Get the next day
    const nextDate = new Date(lastKnownDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    // Check if there's a festival on the next day
    const festival = this.getFestivalForDate(nextDateStr);
    
    // Calculate recent trends (last 7 days)
    const recentWeekData = recentData.slice(-7);
    const recentTrends = this.calculateRecentTrends(recentWeekData);
    
    // Generate predictions
    const predictedItems = Array.from(this.baseItemDemand.entries()).map(([itemName, baseDemand]) => {
      let predictedQuantity = baseDemand;
      
      // Apply recent trends
      const trend = recentTrends.get(itemName) || 1.0;
      predictedQuantity *= trend;
      
      // Apply festival boost if applicable
      if (festival) {
        const festivalItem = festival.popularItems.find(item => item.name === itemName);
        if (festivalItem) {
          predictedQuantity *= festivalItem.boostMultiplier;
        }
      }
      
      // Apply day-of-week pattern
      const dayOfWeek = nextDate.getDay();
      predictedQuantity *= this.calculateDayOfWeekPattern(dayOfWeek);
      
      // Add some randomness
      predictedQuantity *= (0.85 + Math.random() * 0.3);
      
      return {
        name: itemName,
        predictedQuantity: Math.round(predictedQuantity),
        confidence: 0.85,
        category: this.getItemCategory(itemName),
        price: this.getItemPrice(itemName)
      };
    });

    // Sort by predicted quantity
    predictedItems.sort((a, b) => b.predictedQuantity - a.predictedQuantity);

    return {
      predictedItems: predictedItems.slice(0, 8),
      totalPredictedSales: predictedItems.reduce((sum, item) => sum + (item.predictedQuantity * item.price), 0),
      confidence: 0.85,
      factors: festival ? ['Recent Trends', 'Festival Boost', 'Day-of-Week Pattern'] : ['Recent Trends', 'Day-of-Week Pattern'],
      nextDayPrediction: {
        date: nextDateStr,
        items: predictedItems.slice(0, 5).map(item => ({
          name: item.name,
          predictedQuantity: item.predictedQuantity,
          confidence: item.confidence
        }))
      }
    };
  }

  // Predict daily sales for a month with festival adjustments
  predictDailySalesForMonth(month: number, year: number, warehouseId: string): Map<string, PredictionResult> {
    const dailyPredictions = new Map<string, PredictionResult>();
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Get base month prediction
    const monthPrediction = this.predictMonthSales(month, warehouseId);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if there's recorded data for this day
      const recordedData = this.historicalData.find(data => data.date === dateStr);
      
      if (recordedData) {
        // Use recorded data
        const recordedItems = recordedData.items.map(item => ({
          name: item.name,
          predictedQuantity: item.quantity,
          confidence: 1.0,
          category: item.category,
          price: item.price
        }));
        
        dailyPredictions.set(dateStr, {
          predictedItems: recordedItems,
          totalPredictedSales: recordedData.totalSales,
          confidence: 1.0,
          factors: ['Recorded Data']
        });
      } else {
        // Predict based on month pattern and festivals
        const festival = this.getFestivalForDate(dateStr);
        const dayOfWeek = date.getDay();
        const dayPattern = this.calculateDayOfWeekPattern(dayOfWeek);
        
        const dailyItems = monthPrediction.predictedItems.map(item => {
          let quantity = item.predictedQuantity / daysInMonth; // Distribute monthly prediction
          quantity *= dayPattern;
          
          // Apply festival boost
          if (festival) {
            const festivalItem = festival.popularItems.find(fi => fi.name === item.name);
            if (festivalItem) {
              quantity *= festivalItem.boostMultiplier;
            }
          }
          
          return {
            ...item,
            predictedQuantity: Math.round(quantity)
          };
        });
        
        dailyPredictions.set(dateStr, {
          predictedItems: dailyItems,
          totalPredictedSales: dailyItems.reduce((sum, item) => sum + (item.predictedQuantity * item.price), 0),
          confidence: festival ? 0.9 : 0.75,
          factors: festival ? ['Month Pattern', 'Festival Boost', 'Day Pattern'] : ['Month Pattern', 'Day Pattern']
        });
      }
    }
    
    return dailyPredictions;
  }

  // Helper methods
  private predictWithBaseData(month: number): PredictionResult {
    const seasonalTrend = this.calculateSeasonalTrend(month);
    
    const predictedItems = Array.from(this.baseItemDemand.entries()).map(([itemName, baseDemand]) => ({
      name: itemName,
      predictedQuantity: Math.round(baseDemand * seasonalTrend),
      confidence: 0.6,
      category: this.getItemCategory(itemName),
      price: this.getItemPrice(itemName)
    }));

    return {
      predictedItems: predictedItems.slice(0, 10),
      totalPredictedSales: predictedItems.reduce((sum, item) => sum + (item.predictedQuantity * item.price), 0),
      confidence: 0.6,
      factors: ['Base Demand Patterns', 'Seasonal Trends']
    };
  }

  private calculateItemAverages(historicalData: SalesData[]): Map<string, number> {
    const itemTotals = new Map<string, number>();
    const itemCounts = new Map<string, number>();
    
    historicalData.forEach(data => {
      data.items.forEach(item => {
        const current = itemTotals.get(item.name) || 0;
        itemTotals.set(item.name, current + item.quantity);
        
        const count = itemCounts.get(item.name) || 0;
        itemCounts.set(item.name, count + 1);
      });
    });
    
    const averages = new Map<string, number>();
    itemTotals.forEach((total, itemName) => {
      const count = itemCounts.get(itemName) || 1;
      averages.set(itemName, total / count);
    });
    
    return averages;
  }

  private calculateRecentTrends(recentData: SalesData[]): Map<string, number> {
    const trends = new Map<string, number>();
    
    recentData.forEach(data => {
      data.items.forEach(item => {
        const current = trends.get(item.name) || 0;
        trends.set(item.name, current + item.quantity);
      });
    });
    
    // Normalize trends
    const maxTrend = Math.max(...Array.from(trends.values()));
    trends.forEach((value, key) => {
      trends.set(key, value / maxTrend);
    });
    
    return trends;
  }

  private getItemCategory(itemName: string): string {
    if (itemName.includes('Beverages')) return 'Beverages';
    if (itemName.includes('Oil') || itemName.includes('Rice') || itemName.includes('Flour')) return 'Groceries';
    if (itemName.includes('Detergent')) return 'Home Care';
    if (itemName.includes('Personal Care')) return 'Personal Care';
    if (itemName.includes('Vegetables')) return 'Fresh Produce';
    if (itemName.includes('Snacks')) return 'Snacks';
    if (itemName.includes('Tea')) return 'Beverages';
    if (itemName.includes('Milk')) return 'Dairy';
    if (itemName.includes('Gift') || itemName.includes('Sweets') || itemName.includes('Incense')) return 'Festival Items';
    return 'General';
  }

  private getItemPrice(itemName: string): number {
    const priceMap: Map<string, number> = new Map([
      ['Cold Beverages - 500ml', 25],
      ['Cooking Oil - 1L', 120],
      ['Rice - 25kg', 1200],
      ['Wheat Flour - 10kg', 350],
      ['Detergent Powder - 1kg', 180],
      ['Personal Care Kit', 450],
      ['Fresh Vegetables - Mixed', 80],
      ['Packaged Snacks', 35],
      ['Tea Leaves - 250g', 95],
      ['Milk Powder - 500g', 280],
      ['Gift Items', 200],
      ['Sweets & Candies', 50],
      ['Incense Sticks', 30],
      ['Decorative Items', 150],
      ['Traditional Clothes', 500]
    ]);
    
    return priceMap.get(itemName) || 100;
  }

  // Get model insights
  getModelInsights(): {
    totalPredictions: number;
    averageConfidence: number;
    topPerformingItems: string[];
    seasonalTrends: string[];
  } {
    const totalPredictions = this.historicalData.length;
    const averageConfidence = 0.8;
    
    const itemPerformance = new Map<string, number>();
    this.historicalData.forEach(data => {
      data.items.forEach(item => {
        const current = itemPerformance.get(item.name) || 0;
        itemPerformance.set(item.name, current + item.quantity);
      });
    });
    
    const topPerformingItems = Array.from(itemPerformance.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
    
    const seasonalTrends = [
      'Summer months show 30% increase in beverage sales',
      'Winter months show 20% increase in food staples',
      'Festival periods show 50-100% boost in gift items',
      'Weekends show 40% higher overall sales'
    ];
    
    return {
      totalPredictions,
      averageConfidence,
      topPerformingItems,
      seasonalTrends
    };
  }
} 