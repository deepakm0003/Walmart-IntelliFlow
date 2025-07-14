// Historical sales data for ML model training
// Contains sales data for the first 4 months (January-April 2025)

import { SalesData } from './predictionModel';

export const historicalSalesData: SalesData[] = [
  // January 2025 - Month 1
  {
    month: 1,
    day: 1,
    items: [
      { name: 'Cold Beverages - 500ml', quantity: 1200, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 850, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 650, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 950, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 720, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 520, category: 'Personal Care', price: 450 },
      { name: 'Fresh Vegetables - Mixed', quantity: 420, category: 'Fresh Produce', price: 80 },
      { name: 'Packaged Snacks', quantity: 1600, category: 'Snacks', price: 35 },
      { name: 'Tea Leaves - 250g', quantity: 880, category: 'Beverages', price: 95 },
      { name: 'Milk Powder - 500g', quantity: 620, category: 'Dairy', price: 280 }
    ],
    totalSales: 125000,
    date: '2025-01-01'
  },
  {
    month: 1,
    day: 15,
    items: [
      { name: 'Cold Beverages - 500ml', quantity: 1100, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 780, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 600, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 900, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 680, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 480, category: 'Personal Care', price: 450 },
      { name: 'Fresh Vegetables - Mixed', quantity: 380, category: 'Fresh Produce', price: 80 },
      { name: 'Packaged Snacks', quantity: 1500, category: 'Snacks', price: 35 },
      { name: 'Tea Leaves - 250g', quantity: 820, category: 'Beverages', price: 95 },
      { name: 'Milk Powder - 500g', quantity: 580, category: 'Dairy', price: 280 }
    ],
    totalSales: 118000,
    date: '2025-01-15'
  },
  {
    month: 1,
    day: 26,
    items: [
      { name: 'Gift Items', quantity: 350, category: 'Festival Items', price: 200 },
      { name: 'Packaged Snacks', quantity: 1800, category: 'Snacks', price: 35 },
      { name: 'Cold Beverages - 500ml', quantity: 1400, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 900, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 700, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 1000, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 750, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 550, category: 'Personal Care', price: 450 },
      { name: 'Fresh Vegetables - Mixed', quantity: 450, category: 'Fresh Produce', price: 80 },
      { name: 'Tea Leaves - 250g', quantity: 950, category: 'Beverages', price: 95 }
    ],
    totalSales: 145000,
    date: '2025-01-26'
  },

  // February 2025 - Month 2
  {
    month: 2,
    day: 1,
    items: [
      { name: 'Cold Beverages - 500ml', quantity: 1150, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 820, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 630, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 920, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 700, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 500, category: 'Personal Care', price: 450 },
      { name: 'Fresh Vegetables - Mixed', quantity: 400, category: 'Fresh Produce', price: 80 },
      { name: 'Packaged Snacks', quantity: 1550, category: 'Snacks', price: 35 },
      { name: 'Tea Leaves - 250g', quantity: 850, category: 'Beverages', price: 95 },
      { name: 'Milk Powder - 500g', quantity: 600, category: 'Dairy', price: 280 }
    ],
    totalSales: 122000,
    date: '2025-02-01'
  },
  {
    month: 2,
    day: 14,
    items: [
      { name: 'Gift Items', quantity: 800, category: 'Festival Items', price: 200 },
      { name: 'Sweets & Candies', quantity: 1200, category: 'Festival Items', price: 50 },
      { name: 'Packaged Snacks', quantity: 2000, category: 'Snacks', price: 35 },
      { name: 'Cold Beverages - 500ml', quantity: 1600, category: 'Beverages', price: 25 },
      { name: 'Personal Care Kit', quantity: 700, category: 'Personal Care', price: 450 },
      { name: 'Cooking Oil - 1L', quantity: 950, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 750, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 1100, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 800, category: 'Home Care', price: 180 },
      { name: 'Fresh Vegetables - Mixed', quantity: 500, category: 'Fresh Produce', price: 80 }
    ],
    totalSales: 180000,
    date: '2025-02-14'
  },
  {
    month: 2,
    day: 28,
    items: [
      { name: 'Cold Beverages - 500ml', quantity: 1250, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 880, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 680, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 980, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 720, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 520, category: 'Personal Care', price: 450 },
      { name: 'Fresh Vegetables - Mixed', quantity: 420, category: 'Fresh Produce', price: 80 },
      { name: 'Packaged Snacks', quantity: 1650, category: 'Snacks', price: 35 },
      { name: 'Tea Leaves - 250g', quantity: 900, category: 'Beverages', price: 95 },
      { name: 'Milk Powder - 500g', quantity: 650, category: 'Dairy', price: 280 }
    ],
    totalSales: 128000,
    date: '2025-02-28'
  },

  // March 2025 - Month 3
  {
    month: 3,
    day: 1,
    items: [
      { name: 'Cold Beverages - 500ml', quantity: 1400, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 900, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 700, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 1000, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 750, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 550, category: 'Personal Care', price: 450 },
      { name: 'Fresh Vegetables - Mixed', quantity: 450, category: 'Fresh Produce', price: 80 },
      { name: 'Packaged Snacks', quantity: 1800, category: 'Snacks', price: 35 },
      { name: 'Tea Leaves - 250g', quantity: 950, category: 'Beverages', price: 95 },
      { name: 'Milk Powder - 500g', quantity: 680, category: 'Dairy', price: 280 }
    ],
    totalSales: 135000,
    date: '2025-03-01'
  },
  {
    month: 3,
    day: 14,
    items: [
      { name: 'Packaged Snacks', quantity: 2500, category: 'Snacks', price: 35 },
      { name: 'Cold Beverages - 500ml', quantity: 2000, category: 'Beverages', price: 25 },
      { name: 'Gift Items', quantity: 600, category: 'Festival Items', price: 200 },
      { name: 'Personal Care Kit', quantity: 900, category: 'Personal Care', price: 450 },
      { name: 'Cooking Oil - 1L', quantity: 1000, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 800, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 1200, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 850, category: 'Home Care', price: 180 },
      { name: 'Fresh Vegetables - Mixed', quantity: 550, category: 'Fresh Produce', price: 80 },
      { name: 'Tea Leaves - 250g', quantity: 1100, category: 'Beverages', price: 95 }
    ],
    totalSales: 220000,
    date: '2025-03-14'
  },
  {
    month: 3,
    day: 31,
    items: [
      { name: 'Traditional Clothes', quantity: 400, category: 'Apparel', price: 500 },
      { name: 'Sweets & Candies', quantity: 1500, category: 'Festival Items', price: 50 },
      { name: 'Gift Items', quantity: 700, category: 'Festival Items', price: 200 },
      { name: 'Fresh Vegetables - Mixed', quantity: 600, category: 'Fresh Produce', price: 80 },
      { name: 'Cold Beverages - 500ml', quantity: 1600, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 950, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 750, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 1100, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 800, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 600, category: 'Personal Care', price: 450 }
    ],
    totalSales: 200000,
    date: '2025-03-31'
  },

  // April 2025 - Month 4
  {
    month: 4,
    day: 1,
    items: [
      { name: 'Cold Beverages - 500ml', quantity: 1600, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 950, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 750, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 1100, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 800, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 600, category: 'Personal Care', price: 450 },
      { name: 'Fresh Vegetables - Mixed', quantity: 500, category: 'Fresh Produce', price: 80 },
      { name: 'Packaged Snacks', quantity: 2000, category: 'Snacks', price: 35 },
      { name: 'Tea Leaves - 250g', quantity: 1000, category: 'Beverages', price: 95 },
      { name: 'Milk Powder - 500g', quantity: 720, category: 'Dairy', price: 280 }
    ],
    totalSales: 145000,
    date: '2025-04-01'
  },
  {
    month: 4,
    day: 15,
    items: [
      { name: 'Cold Beverages - 500ml', quantity: 1800, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 1000, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 800, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 1200, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 850, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 650, category: 'Personal Care', price: 450 },
      { name: 'Fresh Vegetables - Mixed', quantity: 550, category: 'Fresh Produce', price: 80 },
      { name: 'Packaged Snacks', quantity: 2200, category: 'Snacks', price: 35 },
      { name: 'Tea Leaves - 250g', quantity: 1100, category: 'Beverages', price: 95 },
      { name: 'Milk Powder - 500g', quantity: 750, category: 'Dairy', price: 280 }
    ],
    totalSales: 155000,
    date: '2025-04-15'
  },
  {
    month: 4,
    day: 30,
    items: [
      { name: 'Cold Beverages - 500ml', quantity: 2000, category: 'Beverages', price: 25 },
      { name: 'Cooking Oil - 1L', quantity: 1100, category: 'Groceries', price: 120 },
      { name: 'Rice - 25kg', quantity: 850, category: 'Groceries', price: 1200 },
      { name: 'Wheat Flour - 10kg', quantity: 1300, category: 'Groceries', price: 350 },
      { name: 'Detergent Powder - 1kg', quantity: 900, category: 'Home Care', price: 180 },
      { name: 'Personal Care Kit', quantity: 700, category: 'Personal Care', price: 450 },
      { name: 'Fresh Vegetables - Mixed', quantity: 600, category: 'Fresh Produce', price: 80 },
      { name: 'Packaged Snacks', quantity: 2400, category: 'Snacks', price: 35 },
      { name: 'Tea Leaves - 250g', quantity: 1200, category: 'Beverages', price: 95 },
      { name: 'Milk Powder - 500g', quantity: 800, category: 'Dairy', price: 280 }
    ],
    totalSales: 165000,
    date: '2025-04-30'
  }
];

// Helper function to get sales data for a specific month
export const getSalesDataForMonth = (month: number): SalesData[] => {
  return historicalSalesData.filter(data => data.month === month);
};

// Helper function to get sales data for a specific date range
export const getSalesDataForRange = (startDate: string, endDate: string): SalesData[] => {
  return historicalSalesData.filter(data => {
    return data.date >= startDate && data.date <= endDate;
  });
};

// Helper function to get total sales for a month
export const getTotalSalesForMonth = (month: number): number => {
  const monthData = getSalesDataForMonth(month);
  return monthData.reduce((total, data) => total + data.totalSales, 0);
};

// Helper function to get top selling items for a month
export const getTopSellingItemsForMonth = (month: number, limit: number = 5): Array<{name: string, totalQuantity: number}> => {
  const monthData = getSalesDataForMonth(month);
  const itemTotals = new Map<string, number>();
  
  monthData.forEach(data => {
    data.items.forEach(item => {
      const current = itemTotals.get(item.name) || 0;
      itemTotals.set(item.name, current + item.quantity);
    });
  });
  
  return Array.from(itemTotals.entries())
    .map(([name, totalQuantity]) => ({ name, totalQuantity }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);
}; 