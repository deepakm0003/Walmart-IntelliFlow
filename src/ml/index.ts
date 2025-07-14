// ML Module Index - Export all ML-related functionality

export { SalesPredictionModel, type PredictionResult, type SalesData } from './predictionModel';
export { festivals, type Festival, type FestivalItem, getFestivalByDate, getUpcomingFestivals } from './festivalData';
export { historicalSalesData, getSalesDataForMonth, getTotalSalesForMonth } from './historicalData';
export { predictionService, type WarehousePrediction, type GlobalPredictionInsights } from './predictionService';
export { calendarAPI } from './calendarAPI';
export type { CalendarEvent, DailyPrediction, MonthCalendar } from './calendarAPI'; 