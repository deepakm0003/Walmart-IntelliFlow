// Festival data for ML predictions
// Contains popular items and boost multipliers for different Indian festivals

export interface FestivalItem {
  name: string;
  boostMultiplier: number;
  category: string;
  description: string;
}

export interface Festival {
  id: string;
  name: string;
  date: string;
  popularItems: FestivalItem[];
  description: string;
  region: string;
  salesBoost: number;
}

export const festivals: Festival[] = [
  {
    id: 'diwali-2025',
    name: 'Diwali',
    date: '2025-10-23',
    popularItems: [
      {
        name: 'Gift Items',
        boostMultiplier: 3.0,
        category: 'Festival Items',
        description: 'Traditional gifts and sweets'
      },
      {
        name: 'Sweets & Candies',
        boostMultiplier: 2.5,
        category: 'Festival Items',
        description: 'Traditional Indian sweets'
      },
      {
        name: 'Incense Sticks',
        boostMultiplier: 2.0,
        category: 'Festival Items',
        description: 'For religious ceremonies'
      },
      {
        name: 'Decorative Items',
        boostMultiplier: 2.5,
        category: 'Festival Items',
        description: 'Rangoli colors and decorations'
      },
      {
        name: 'Traditional Clothes',
        boostMultiplier: 1.8,
        category: 'Apparel',
        description: 'New clothes for celebrations'
      }
    ],
    description: 'Festival of Lights - Major shopping festival',
    region: 'Pan India',
    salesBoost: 2.5
  },
  {
    id: 'holi-2025',
    name: 'Holi',
    date: '2025-03-14',
    popularItems: [
      {
        name: 'Packaged Snacks',
        boostMultiplier: 2.0,
        category: 'Snacks',
        description: 'Festive snacks and namkeen'
      },
      {
        name: 'Cold Beverages - 500ml',
        boostMultiplier: 1.8,
        category: 'Beverages',
        description: 'Refreshing drinks for celebrations'
      },
      {
        name: 'Gift Items',
        boostMultiplier: 1.5,
        category: 'Festival Items',
        description: 'Holi gifts and sweets'
      },
      {
        name: 'Personal Care Kit',
        boostMultiplier: 1.3,
        category: 'Personal Care',
        description: 'Post-Holi care products'
      }
    ],
    description: 'Festival of Colors - Celebrated with colors and sweets',
    region: 'North India',
    salesBoost: 1.8
  },
  {
    id: 'ganesh-chaturthi-2025',
    name: 'Ganesh Chaturthi',
    date: '2025-08-26',
    popularItems: [
      {
        name: 'Gift Items',
        boostMultiplier: 2.2,
        category: 'Festival Items',
        description: 'Ganesh idols and offerings'
      },
      {
        name: 'Sweets & Candies',
        boostMultiplier: 2.0,
        category: 'Festival Items',
        description: 'Modak and other sweets'
      },
      {
        name: 'Incense Sticks',
        boostMultiplier: 1.8,
        category: 'Festival Items',
        description: 'For religious ceremonies'
      },
      {
        name: 'Fresh Vegetables - Mixed',
        boostMultiplier: 1.5,
        category: 'Fresh Produce',
        description: 'For prasad preparation'
      }
    ],
    description: 'Birthday of Lord Ganesha - Major festival in Maharashtra',
    region: 'Maharashtra',
    salesBoost: 2.0
  },
  {
    id: 'rakhi-2025',
    name: 'Raksha Bandhan',
    date: '2025-08-12',
    popularItems: [
      {
        name: 'Gift Items',
        boostMultiplier: 2.5,
        category: 'Festival Items',
        description: 'Rakhi threads and gifts'
      },
      {
        name: 'Sweets & Candies',
        boostMultiplier: 2.0,
        category: 'Festival Items',
        description: 'Traditional sweets'
      },
      {
        name: 'Traditional Clothes',
        boostMultiplier: 1.6,
        category: 'Apparel',
        description: 'New clothes for siblings'
      },
      {
        name: 'Packaged Snacks',
        boostMultiplier: 1.4,
        category: 'Snacks',
        description: 'Festive snacks'
      }
    ],
    description: 'Rakhi - Festival celebrating brother-sister bond',
    region: 'Pan India',
    salesBoost: 1.8
  },
  {
    id: 'eid-ul-fitr-2025',
    name: 'Eid-ul-Fitr',
    date: '2025-03-31',
    popularItems: [
      {
        name: 'Traditional Clothes',
        boostMultiplier: 2.2,
        category: 'Apparel',
        description: 'New clothes for Eid'
      },
      {
        name: 'Sweets & Candies',
        boostMultiplier: 2.0,
        category: 'Festival Items',
        description: 'Eid sweets and desserts'
      },
      {
        name: 'Gift Items',
        boostMultiplier: 1.8,
        category: 'Festival Items',
        description: 'Eid gifts and presents'
      },
      {
        name: 'Fresh Vegetables - Mixed',
        boostMultiplier: 1.5,
        category: 'Fresh Produce',
        description: 'For festive meals'
      }
    ],
    description: 'Eid-ul-Fitr - End of Ramadan fasting',
    region: 'Pan India',
    salesBoost: 1.9
  },
  {
    id: 'christmas-2025',
    name: 'Christmas',
    date: '2025-12-25',
    popularItems: [
      {
        name: 'Gift Items',
        boostMultiplier: 2.8,
        category: 'Festival Items',
        description: 'Christmas gifts and decorations'
      },
      {
        name: 'Sweets & Candies',
        boostMultiplier: 2.2,
        category: 'Festival Items',
        description: 'Christmas cakes and sweets'
      },
      {
        name: 'Decorative Items',
        boostMultiplier: 2.0,
        category: 'Festival Items',
        description: 'Christmas decorations'
      },
      {
        name: 'Packaged Snacks',
        boostMultiplier: 1.6,
        category: 'Snacks',
        description: 'Festive snacks'
      }
    ],
    description: 'Christmas - Christian festival of joy and giving',
    region: 'Pan India',
    salesBoost: 2.2
  },
  {
    id: 'republic-day-2025',
    name: 'Republic Day',
    date: '2025-01-26',
    popularItems: [
      {
        name: 'Gift Items',
        boostMultiplier: 1.3,
        category: 'Festival Items',
        description: 'Patriotic gifts'
      },
      {
        name: 'Packaged Snacks',
        boostMultiplier: 1.2,
        category: 'Snacks',
        description: 'Celebration snacks'
      },
      {
        name: 'Cold Beverages - 500ml',
        boostMultiplier: 1.1,
        category: 'Beverages',
        description: 'Refreshments for celebrations'
      }
    ],
    description: 'Republic Day - National holiday',
    region: 'Pan India',
    salesBoost: 1.2
  },
  {
    id: 'independence-day-2025',
    name: 'Independence Day',
    date: '2025-08-15',
    popularItems: [
      {
        name: 'Gift Items',
        boostMultiplier: 1.4,
        category: 'Festival Items',
        description: 'Patriotic gifts and flags'
      },
      {
        name: 'Packaged Snacks',
        boostMultiplier: 1.3,
        category: 'Snacks',
        description: 'Celebration snacks'
      },
      {
        name: 'Cold Beverages - 500ml',
        boostMultiplier: 1.2,
        category: 'Beverages',
        description: 'Refreshments for celebrations'
      }
    ],
    description: 'Independence Day - National holiday',
    region: 'Pan India',
    salesBoost: 1.3
  }
];

// Helper function to get festival by date
export const getFestivalByDate = (date: string): Festival | null => {
  return festivals.find(festival => festival.date === date) || null;
};

// Helper function to get festivals in a date range
export const getFestivalsInRange = (startDate: string, endDate: string): Festival[] => {
  return festivals.filter(festival => {
    return festival.date >= startDate && festival.date <= endDate;
  });
};

// Helper function to get upcoming festivals
export const getUpcomingFestivals = (days: number = 30): Festival[] => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return festivals.filter(festival => {
    const festivalDate = new Date(festival.date);
    return festivalDate >= today && festivalDate <= futureDate;
  });
};

// Helper function to get festival boost for specific items
export const getFestivalBoost = (festivalId: string, itemName: string): number => {
  const festival = festivals.find(f => f.id === festivalId);
  if (!festival) return 1.0;
  
  const item = festival.popularItems.find(i => i.name === itemName);
  return item ? item.boostMultiplier : 1.0;
}; 