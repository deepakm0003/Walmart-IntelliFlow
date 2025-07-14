// Calendar API Service - Real-time calendar integration
// Uses external APIs for accurate festival dates and current time

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'festival' | 'holiday' | 'event';
  description: string;
  region: string;
  isPublicHoliday: boolean;
  salesImpact: number; // 0-1 scale
}

export interface DailyPrediction {
  date: string;
  dayOfWeek: string;
  isFestival: boolean;
  festival?: CalendarEvent;
  predictedSales: number;
  confidence: number;
  topItems: Array<{
    name: string;
    predictedQuantity: number;
    boostMultiplier: number;
  }>;
  factors: string[];
}

export interface MonthCalendar {
  year: number;
  month: number;
  days: DailyPrediction[];
  totalPredictedSales: number;
  festivals: CalendarEvent[];
  insights: {
    bestDay: string;
    worstDay: string;
    festivalDays: number;
    averageConfidence: number;
  };
}

class CalendarAPIService {
  private baseURL = 'https://calendarific.com/api/v2';
  private apiKey = 'YOUR_API_KEY'; // Replace with actual API key
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  // Get current date in YYYY-MM-DD format
  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get current month and year
  getCurrentMonth(): { year: number; month: number } {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  }

  // Get next N months
  getNextMonths(count: number = 6): Array<{ year: number; month: number }> {
    const months = [];
    const current = this.getCurrentMonth();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(current.year, current.month - 1 + i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1
      });
    }
    
    return months;
  }

  // Get holidays and festivals for a specific month
  async getMonthEvents(year: number, month: number, country: string = 'IN'): Promise<CalendarEvent[]> {
    const cacheKey = `events_${year}_${month}_${country}`;
    
    // Check cache first
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > Date.now()) {
      return this.cache.get(cacheKey);
    }

    try {
      // For demo purposes, we'll use a mock API response
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseURL}/holidays?api_key=${this.apiKey}&year=${year}&month=${month}&country=${country}`);
      
      const mockEvents = this.getMockEvents(year, month);
      
      // Cache for 1 hour
      this.cache.set(cacheKey, mockEvents);
      this.cacheExpiry.set(cacheKey, Date.now() + 3600000);
      
      return mockEvents;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return this.getMockEvents(year, month);
    }
  }

  // Get mock events for demonstration
  private getMockEvents(year: number, month: number): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    
    // Add festivals based on month
    if (month === 1) {
      events.push({
        id: 'republic-day',
        title: 'Republic Day',
        date: `${year}-01-26`,
        type: 'festival',
        description: 'National holiday celebrating the adoption of the Constitution',
        region: 'Pan India',
        isPublicHoliday: true,
        salesImpact: 0.2
      });
    }
    
    if (month === 3) {
      events.push({
        id: 'holi',
        title: 'Holi',
        date: `${year}-03-14`,
        type: 'festival',
        description: 'Festival of Colors',
        region: 'North India',
        isPublicHoliday: true,
        salesImpact: 0.8
      });
      
      events.push({
        id: 'eid-ul-fitr',
        title: 'Eid-ul-Fitr',
        date: `${year}-03-31`,
        type: 'festival',
        description: 'End of Ramadan fasting',
        region: 'Pan India',
        isPublicHoliday: true,
        salesImpact: 0.9
      });
    }
    
    if (month === 8) {
      events.push({
        id: 'independence-day',
        title: 'Independence Day',
        date: `${year}-08-15`,
        type: 'festival',
        description: 'National Independence Day',
        region: 'Pan India',
        isPublicHoliday: true,
        salesImpact: 0.3
      });
      
      events.push({
        id: 'rakhi',
        title: 'Raksha Bandhan',
        date: `${year}-08-12`,
        type: 'festival',
        description: 'Brother-Sister bond festival',
        region: 'Pan India',
        isPublicHoliday: false,
        salesImpact: 0.8
      });
      
      events.push({
        id: 'ganesh-chaturthi',
        title: 'Ganesh Chaturthi',
        date: `${year}-08-26`,
        type: 'festival',
        description: 'Birthday of Lord Ganesha',
        region: 'Maharashtra',
        isPublicHoliday: true,
        salesImpact: 1.0
      });
    }
    
    if (month === 10) {
      events.push({
        id: 'diwali',
        title: 'Diwali',
        date: `${year}-10-23`,
        type: 'festival',
        description: 'Festival of Lights',
        region: 'Pan India',
        isPublicHoliday: true,
        salesImpact: 1.0
      });
    }
    
    if (month === 12) {
      events.push({
        id: 'christmas',
        title: 'Christmas',
        date: `${year}-12-25`,
        type: 'festival',
        description: 'Christian festival of joy and giving',
        region: 'Pan India',
        isPublicHoliday: true,
        salesImpact: 0.9
      });
    }
    
    return events;
  }

  // Get daily prediction for a specific date
  async getDailyPrediction(
    date: string, 
    baseSales: number, 
    warehouseId: string
  ): Promise<DailyPrediction> {
    const events = await this.getMonthEvents(
      new Date(date).getFullYear(),
      new Date(date).getMonth() + 1
    );
    
    const event = events.find(e => e.date === date);
    const dayOfWeek = new Date(date).getDay();
    
    // Calculate day-of-week impact
    let dayMultiplier = 1.0;
    if (dayOfWeek === 0 || dayOfWeek === 6) dayMultiplier = 1.4; // Weekend
    else if (dayOfWeek === 2 || dayOfWeek === 3) dayMultiplier = 0.8; // Mid-week
    
    // Calculate festival impact
    let festivalMultiplier = 1.0;
    let topItems = this.getBaseItems();
    
    if (event) {
      festivalMultiplier = 1 + event.salesImpact;
      topItems = this.getFestivalItems(event.id);
    }
    
    const predictedSales = Math.round(baseSales * dayMultiplier * festivalMultiplier);
    const confidence = event ? 0.9 : 0.75;
    
    const factors = [];
    if (event) factors.push(`${event.title} boost`);
    if (dayMultiplier > 1) factors.push('Weekend boost');
    if (dayMultiplier < 1) factors.push('Mid-week dip');
    
    return {
      date,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      isFestival: !!event,
      festival: event,
      predictedSales,
      confidence,
      topItems,
      factors
    };
  }

  // Get month calendar with predictions
  async getMonthCalendar(
    year: number, 
    month: number, 
    baseSales: number,
    warehouseId: string
  ): Promise<MonthCalendar> {
    const events = await this.getMonthEvents(year, month);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: DailyPrediction[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const prediction = await this.getDailyPrediction(date, baseSales, warehouseId);
      days.push(prediction);
    }
    
    const totalPredictedSales = days.reduce((sum, day) => sum + day.predictedSales, 0);
    const festivalDays = days.filter(day => day.isFestival).length;
    const averageConfidence = days.reduce((sum, day) => sum + day.confidence, 0) / days.length;
    
    const bestDay = days.reduce((best, current) => 
      current.predictedSales > best.predictedSales ? current : best
    ).date;
    
    const worstDay = days.reduce((worst, current) => 
      current.predictedSales < worst.predictedSales ? current : worst
    ).date;
    
    return {
      year,
      month,
      days,
      totalPredictedSales,
      festivals: events,
      insights: {
        bestDay,
        worstDay,
        festivalDays,
        averageConfidence
      }
    };
  }

  // Get upcoming festivals
  async getUpcomingFestivals(days: number = 90): Promise<CalendarEvent[]> {
    const current = this.getCurrentMonth();
    const upcoming: CalendarEvent[] = [];
    
    for (let i = 0; i < Math.ceil(days / 30); i++) {
      const date = new Date(current.year, current.month - 1 + i, 1);
      const events = await this.getMonthEvents(date.getFullYear(), date.getMonth() + 1);
      
      events.forEach(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= days) {
          upcoming.push(event);
        }
      });
    }
    
    return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Get base items for regular days
  private getBaseItems() {
    return [
      { name: 'Cold Beverages - 500ml', predictedQuantity: 1200, boostMultiplier: 1.0 },
      { name: 'Cooking Oil - 1L', predictedQuantity: 800, boostMultiplier: 1.0 },
      { name: 'Rice - 25kg', predictedQuantity: 600, boostMultiplier: 1.0 },
      { name: 'Wheat Flour - 10kg', predictedQuantity: 900, boostMultiplier: 1.0 },
      { name: 'Detergent Powder - 1kg', predictedQuantity: 700, boostMultiplier: 1.0 }
    ];
  }

  // Get festival-specific items
  private getFestivalItems(festivalId: string) {
    const festivalItems: { [key: string]: any[] } = {
      'diwali': [
        { name: 'Gift Items', predictedQuantity: 3000, boostMultiplier: 3.0 },
        { name: 'Sweets & Candies', predictedQuantity: 2500, boostMultiplier: 2.5 },
        { name: 'Incense Sticks', predictedQuantity: 2000, boostMultiplier: 2.0 },
        { name: 'Decorative Items', predictedQuantity: 2500, boostMultiplier: 2.5 },
        { name: 'Traditional Clothes', predictedQuantity: 1800, boostMultiplier: 1.8 }
      ],
      'holi': [
        { name: 'Packaged Snacks', predictedQuantity: 2000, boostMultiplier: 2.0 },
        { name: 'Cold Beverages - 500ml', predictedQuantity: 1800, boostMultiplier: 1.8 },
        { name: 'Gift Items', predictedQuantity: 1500, boostMultiplier: 1.5 },
        { name: 'Personal Care Kit', predictedQuantity: 1300, boostMultiplier: 1.3 }
      ],
      'ganesh-chaturthi': [
        { name: 'Gift Items', predictedQuantity: 2200, boostMultiplier: 2.2 },
        { name: 'Sweets & Candies', predictedQuantity: 2000, boostMultiplier: 2.0 },
        { name: 'Incense Sticks', predictedQuantity: 1800, boostMultiplier: 1.8 },
        { name: 'Fresh Vegetables - Mixed', predictedQuantity: 1500, boostMultiplier: 1.5 }
      ],
      'rakhi': [
        { name: 'Gift Items', predictedQuantity: 2500, boostMultiplier: 2.5 },
        { name: 'Sweets & Candies', predictedQuantity: 2000, boostMultiplier: 2.0 },
        { name: 'Traditional Clothes', predictedQuantity: 1600, boostMultiplier: 1.6 },
        { name: 'Packaged Snacks', predictedQuantity: 1400, boostMultiplier: 1.4 }
      ],
      'eid-ul-fitr': [
        { name: 'Traditional Clothes', predictedQuantity: 2200, boostMultiplier: 2.2 },
        { name: 'Sweets & Candies', predictedQuantity: 2000, boostMultiplier: 2.0 },
        { name: 'Gift Items', predictedQuantity: 1800, boostMultiplier: 1.8 },
        { name: 'Fresh Vegetables - Mixed', predictedQuantity: 1500, boostMultiplier: 1.5 }
      ],
      'christmas': [
        { name: 'Gift Items', predictedQuantity: 2800, boostMultiplier: 2.8 },
        { name: 'Sweets & Candies', predictedQuantity: 2200, boostMultiplier: 2.2 },
        { name: 'Decorative Items', predictedQuantity: 2000, boostMultiplier: 2.0 },
        { name: 'Packaged Snacks', predictedQuantity: 1600, boostMultiplier: 1.6 }
      ]
    };
    
    return festivalItems[festivalId] || this.getBaseItems();
  }

  // Get current week predictions
  async getCurrentWeekPredictions(baseSales: number, warehouseId: string): Promise<DailyPrediction[]> {
    const today = new Date();
    const weekPredictions: DailyPrediction[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const prediction = await this.getDailyPrediction(dateStr, baseSales, warehouseId);
      weekPredictions.push(prediction);
    }
    
    return weekPredictions;
  }
}

// Export singleton instance
export const calendarAPI = new CalendarAPIService(); 