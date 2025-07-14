// Weather Service - Uses OpenWeather API for location-based weather data
// Provides weather-based item recommendations for each warehouse

export interface WeatherData {
  temperature: number;
  humidity: number;
  weatherCondition: string;
  feelsLike: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export interface WeatherBasedItems {
  warehouseId: string;
  city: string;
  weatherCondition: string;
  temperature: number;
  topItems: Array<{
    name: string;
    category: string;
    predictedQuantity: number;
    boostMultiplier: number;
    weatherReason: string;
  }>;
  seasonalAdjustments: {
    summer: number;
    winter: number;
    monsoon: number;
    spring: number;
  };
}

class WeatherService {
  private apiKey = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual API key
  private baseURL = 'https://api.openweathermap.org/data/2.5/weather';
  private cache: Map<string, { data: WeatherData; timestamp: number }> = new Map();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  // Get weather data for a specific location
  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = `${lat},${lon}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // For demo purposes, we'll use mock weather data
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseURL}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`);
      // const data = await response.json();
      
      const mockWeather = this.getMockWeatherData(lat, lon);
      
      this.cache.set(cacheKey, {
        data: mockWeather,
        timestamp: Date.now()
      });
      
      return mockWeather;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this.getMockWeatherData(lat, lon);
    }
  }

  // Get mock weather data based on location
  private getMockWeatherData(lat: number, lon: number): WeatherData {
    // Generate weather based on location and current season
    const now = new Date();
    const month = now.getMonth() + 1;
    
    // Northern India (higher latitudes) - colder in winter
    if (lat > 25) {
      if (month >= 11 || month <= 2) {
        // Winter
        return {
          temperature: Math.floor(Math.random() * 15) + 5,
          humidity: Math.floor(Math.random() * 30) + 40,
          weatherCondition: 'cold',
          feelsLike: Math.floor(Math.random() * 10) + 2,
          windSpeed: Math.floor(Math.random() * 10) + 5,
          description: 'Cold and dry',
          icon: '❄️'
        };
      } else if (month >= 6 && month <= 9) {
        // Monsoon
        return {
          temperature: Math.floor(Math.random() * 10) + 25,
          humidity: Math.floor(Math.random() * 30) + 70,
          weatherCondition: 'rainy',
          feelsLike: Math.floor(Math.random() * 8) + 28,
          windSpeed: Math.floor(Math.random() * 15) + 10,
          description: 'Humid and rainy',
          icon: '🌧️'
        };
      } else {
        // Summer/Spring
        return {
          temperature: Math.floor(Math.random() * 15) + 30,
          humidity: Math.floor(Math.random() * 40) + 30,
          weatherCondition: 'hot',
          feelsLike: Math.floor(Math.random() * 10) + 35,
          windSpeed: Math.floor(Math.random() * 8) + 3,
          description: 'Hot and dry',
          icon: '☀️'
        };
      }
    } else {
      // Southern India - more tropical
      if (month >= 6 && month <= 9) {
        // Monsoon
        return {
          temperature: Math.floor(Math.random() * 8) + 28,
          humidity: Math.floor(Math.random() * 20) + 80,
          weatherCondition: 'rainy',
          feelsLike: Math.floor(Math.random() * 5) + 32,
          windSpeed: Math.floor(Math.random() * 12) + 8,
          description: 'Heavy monsoon',
          icon: '🌧️'
        };
      } else {
        // Hot throughout the year
        return {
          temperature: Math.floor(Math.random() * 10) + 28,
          humidity: Math.floor(Math.random() * 30) + 60,
          weatherCondition: 'hot',
          feelsLike: Math.floor(Math.random() * 8) + 32,
          windSpeed: Math.floor(Math.random() * 6) + 2,
          description: 'Hot and humid',
          icon: '☀️'
        };
      }
    }
  }

  // Get weather-based items for a warehouse
  async getWeatherBasedItems(warehouseId: string, coordinates: [number, number]): Promise<WeatherBasedItems> {
    const weather = await this.getWeatherData(coordinates[0], coordinates[1]);
    const warehouse = this.getWarehouseInfo(warehouseId);
    
    const items = this.getItemsByWeather(warehouseId, weather, warehouse.city);
    
    return {
      warehouseId,
      city: warehouse.city,
      weatherCondition: weather.weatherCondition,
      temperature: weather.temperature,
      topItems: items,
      seasonalAdjustments: this.getSeasonalAdjustments(weather)
    };
  }

  // Get warehouse information
  private getWarehouseInfo(warehouseId: string) {
    const warehouseMap: { [key: string]: { city: string; region: string } } = {
      'MH001': { city: 'Bhiwandi', region: 'Western' },
      'MH002': { city: 'Pune', region: 'Western' },
      'MH003': { city: 'Nagpur', region: 'Central' },
      'MH004': { city: 'Aurangabad', region: 'Western' },
      'AP001': { city: 'Guntur', region: 'Southern' },
      'AP002': { city: 'Visakhapatnam', region: 'Southern' },
      'TG001': { city: 'Hyderabad', region: 'Southern' },
      'TG002': { city: 'Warangal', region: 'Southern' },
      'UP001': { city: 'Kanpur', region: 'Northern' },
      'UP002': { city: 'Lucknow', region: 'Northern' },
      'MP001': { city: 'Bhopal', region: 'Central' },
      'MP002': { city: 'Indore', region: 'Central' },
      'PB001': { city: 'Amritsar', region: 'Northern' },
      'DL001': { city: 'Delhi', region: 'Northern' },
      'KA001': { city: 'Bangalore', region: 'Southern' },
      'KA002': { city: 'Mysore', region: 'Southern' },
      'TN001': { city: 'Chennai', region: 'Southern' },
      'TN002': { city: 'Coimbatore', region: 'Southern' },
      'GJ001': { city: 'Ahmedabad', region: 'Western' },
      'RJ001': { city: 'Jaipur', region: 'Northern' },
      'WB001': { city: 'Kolkata', region: 'Eastern' },
      'KL001': { city: 'Kochi', region: 'Southern' }
    };
    
    return warehouseMap[warehouseId] || { city: 'Unknown', region: 'Unknown' };
  }

  // Utility: Seeded random number generator based on warehouseId
  private seededRandom(warehouseId: string, min: number, max: number, salt: string = ""): number {
    let hash = 0;
    const str = warehouseId + salt;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash) % 10000;
    const rand = (Math.sin(seed) + 1) / 2; // 0..1
    return Math.floor(rand * (max - min + 1)) + min;
  }

  // Utility: Seeded shuffle for unique product selection per warehouse
  private seededShuffle<T>(array: T[], warehouseId: string): T[] {
    let arr = array.slice();
    let hash = 0;
    for (let i = 0; i < warehouseId.length; i++) {
      hash = ((hash << 5) - hash) + warehouseId.charCodeAt(i);
      hash |= 0;
    }
    for (let i = arr.length - 1; i > 0; i--) {
      hash = ((hash << 5) - hash) + i;
      hash |= 0;
      const j = Math.abs(hash) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Large pool of possible items
  private getAllPossibleItems(): any[] {
    return [
      { name: 'Rice - 25kg', category: 'Grains' },
      { name: 'Cooking Oil - 1L', category: 'Cooking Essentials' },
      { name: 'Cold Beverages - 500ml', category: 'Beverages' },
      { name: 'Ice Cream - 1L', category: 'Dairy' },
      { name: 'Packaged Snacks', category: 'Snacks' },
      { name: 'Hot Beverages - Tea/Coffee', category: 'Beverages' },
      { name: 'Warm Food Items', category: 'Ready to Eat' },
      { name: 'Blankets & Warmers', category: 'Home & Living' },
      { name: 'Umbrellas & Raincoats', category: 'Apparel' },
      { name: 'Hot Soups & Broths', category: 'Ready to Eat' },
      { name: 'Indoor Games & Books', category: 'Entertainment' },
      { name: 'Textiles & Fabrics', category: 'Apparel' },
      { name: 'Bakery Products', category: 'Bakery' },
      { name: 'Oranges', category: 'Fruits' },
      { name: 'Paithani Sarees', category: 'Apparel' },
      { name: 'Chilies', category: 'Spices' },
      { name: 'Seafood', category: 'Fresh Food' },
      { name: 'Biryani Mixes', category: 'Ready to Eat' },
      { name: 'Cotton Products', category: 'Apparel' },
      { name: 'Leather Goods', category: 'Apparel' },
      { name: 'Chikan Embroidery', category: 'Apparel' },
      { name: 'Namkeen Snacks', category: 'Snacks' },
      { name: 'Poha & Jalebi', category: 'Breakfast' },
      { name: 'Punjabi Sweets', category: 'Confectionery' },
      { name: 'Street Food Items', category: 'Ready to Eat' },
      { name: 'Organic Products', category: 'Health & Wellness' },
      { name: 'Sandalwood Products', category: 'Personal Care' },
      { name: 'Traditional Spices', category: 'Cooking Essentials' },
      { name: 'Cotton Textiles', category: 'Apparel' },
      { name: 'Garments', category: 'Apparel' },
      { name: 'Handicrafts', category: 'Home Decor' },
      { name: 'Sweet Products', category: 'Confectionery' },
      { name: 'Spices', category: 'Cooking Essentials' }
    ];
  }

  // Get unique top items for a warehouse
  private getUniqueTopItems(warehouseId: string, weather: WeatherData): any[] {
    const allItems = this.getAllPossibleItems();
    const shuffled = this.seededShuffle(allItems, warehouseId);
    // Pick top 5 unique items
    return shuffled.slice(0, 5).map((item, idx) => ({
      ...item,
      predictedQuantity: this.seededRandom(warehouseId, 500, 2500, item.name),
      boostMultiplier: 1.0 + (this.seededRandom(warehouseId, 0, 20, item.category) / 100),
      weatherReason: `Selected for ${warehouseId}`
    }));
  }

  // Update getItemsByWeather to use unique top items as main predictions
  private getItemsByWeather(warehouseId: string, weather: WeatherData, city: string) {
    const uniqueTopItems = this.getUniqueTopItems(warehouseId, weather);
    // Optionally, add weather/regional/base items for further adjustment
    // const weatherItems = this.getWeatherSpecificItems(weather, city, warehouseId);
    // const regionalItems = this.getRegionalItems(city, warehouseId);
    // const baseItems = this.getBaseItems(warehouseId);
    // const allItems = [...uniqueTopItems, ...weatherItems, ...regionalItems, ...baseItems];
    // Remove duplicates and get top 5
    // const unique = allItems.filter((item, index, self) => index === self.findIndex(t => t.name === item.name));
    // return unique.slice(0, 5);
    return uniqueTopItems;
  }

  // Get base items for all warehouses (now unique per warehouse)
  private getBaseItems(warehouseId: string) {
    return [
      {
        name: 'Rice - 25kg',
        category: 'Grains',
        predictedQuantity: this.seededRandom(warehouseId, 600, 1200, 'base_rice'),
        boostMultiplier: 1.0 + (this.seededRandom(warehouseId, 0, 10, 'base_bm1') / 100),
        weatherReason: 'Essential staple'
      },
      {
        name: 'Cooking Oil - 1L',
        category: 'Cooking Essentials',
        predictedQuantity: this.seededRandom(warehouseId, 800, 1500, 'base_oil'),
        boostMultiplier: 1.0 + (this.seededRandom(warehouseId, 0, 10, 'base_bm2') / 100),
        weatherReason: 'Daily cooking need'
      }
    ];
  }

  // Get weather-specific items (now unique per warehouse)
  private getWeatherSpecificItems(weather: WeatherData, city: string, warehouseId: string) {
    const items: any[] = [];
    if (weather.weatherCondition === 'hot') {
      items.push(
        {
          name: 'Cold Beverages - 500ml',
          category: 'Beverages',
          predictedQuantity: this.seededRandom(warehouseId, 1500, 2500, 'weather_coldbev'),
          boostMultiplier: 2.5 + (this.seededRandom(warehouseId, 0, 10, 'weather_bm1') / 100),
          weatherReason: 'High temperature - cooling needed'
        },
        {
          name: 'Ice Cream - 1L',
          category: 'Dairy',
          predictedQuantity: this.seededRandom(warehouseId, 800, 1300, 'weather_icecream'),
          boostMultiplier: 2.0 + (this.seededRandom(warehouseId, 0, 10, 'weather_bm2') / 100),
          weatherReason: 'Hot weather refreshment'
        },
        {
          name: 'Packaged Snacks',
          category: 'Snacks',
          predictedQuantity: this.seededRandom(warehouseId, 1200, 2000, 'weather_snacks'),
          boostMultiplier: 1.8 + (this.seededRandom(warehouseId, 0, 10, 'weather_bm3') / 100),
          weatherReason: 'Light snacks for hot weather'
        }
      );
    } else if (weather.weatherCondition === 'cold') {
      items.push(
        {
          name: 'Hot Beverages - Tea/Coffee',
          category: 'Beverages',
          predictedQuantity: this.seededRandom(warehouseId, 1200, 2000, 'weather_hotbev'),
          boostMultiplier: 2.2 + (this.seededRandom(warehouseId, 0, 10, 'weather_bm4') / 100),
          weatherReason: 'Cold weather warming'
        },
        {
          name: 'Warm Food Items',
          category: 'Ready to Eat',
          predictedQuantity: this.seededRandom(warehouseId, 900, 1500, 'weather_warmfood'),
          boostMultiplier: 1.9 + (this.seededRandom(warehouseId, 0, 10, 'weather_bm5') / 100),
          weatherReason: 'Cold weather comfort food'
        },
        {
          name: 'Blankets & Warmers',
          category: 'Home & Living',
          predictedQuantity: this.seededRandom(warehouseId, 500, 900, 'weather_blankets'),
          boostMultiplier: 2.5 + (this.seededRandom(warehouseId, 0, 10, 'weather_bm6') / 100),
          weatherReason: 'Cold weather essentials'
        }
      );
    } else if (weather.weatherCondition === 'rainy') {
      items.push(
        {
          name: 'Umbrellas & Raincoats',
          category: 'Apparel',
          predictedQuantity: this.seededRandom(warehouseId, 600, 1000, 'weather_umbrella'),
          boostMultiplier: 3.0 + (this.seededRandom(warehouseId, 0, 10, 'weather_bm7') / 100),
          weatherReason: 'Monsoon protection'
        },
        {
          name: 'Hot Soups & Broths',
          category: 'Ready to Eat',
          predictedQuantity: this.seededRandom(warehouseId, 700, 1200, 'weather_soups'),
          boostMultiplier: 2.1 + (this.seededRandom(warehouseId, 0, 10, 'weather_bm8') / 100),
          weatherReason: 'Rainy weather comfort'
        },
        {
          name: 'Indoor Games & Books',
          category: 'Entertainment',
          predictedQuantity: this.seededRandom(warehouseId, 400, 700, 'weather_games'),
          boostMultiplier: 1.7 + (this.seededRandom(warehouseId, 0, 10, 'weather_bm9') / 100),
          weatherReason: 'Indoor activities during rain'
        }
      );
    }
    return items;
  }

  // Get regional items based on city and warehouseId
  private getRegionalItems(city: string, warehouseId: string) {
    // Expanded to cover all 20 warehouse cities
    const regionalItems: { [key: string]: any[] } = {
      'Bhiwandi': [
        {
          name: 'Textiles & Fabrics',
          category: 'Apparel',
          predictedQuantity: this.seededRandom(warehouseId, 400, 900, 'textiles'),
          boostMultiplier: 1.3 + (this.seededRandom(warehouseId, 0, 20, 'bm1') / 100),
          weatherReason: 'Major textile hub'
        }
      ],
      'Pune': [
        {
          name: 'Bakery Products',
          category: 'Bakery',
          predictedQuantity: this.seededRandom(warehouseId, 300, 800, 'bakery'),
          boostMultiplier: 1.2 + (this.seededRandom(warehouseId, 0, 15, 'bm2') / 100),
          weatherReason: 'Popular bakery culture'
        }
      ],
      'Nagpur': [
        {
          name: 'Oranges',
          category: 'Fruits',
          predictedQuantity: this.seededRandom(warehouseId, 500, 1000, 'oranges'),
          boostMultiplier: 1.4 + (this.seededRandom(warehouseId, 0, 10, 'bm3') / 100),
          weatherReason: 'Famous for oranges'
        }
      ],
      'Aurangabad': [
        {
          name: 'Paithani Sarees',
          category: 'Apparel',
          predictedQuantity: this.seededRandom(warehouseId, 200, 600, 'paithani'),
          boostMultiplier: 1.5 + (this.seededRandom(warehouseId, 0, 10, 'bm4') / 100),
          weatherReason: 'Traditional specialty'
        }
      ],
      'Guntur': [
        {
          name: 'Chilies',
          category: 'Spices',
          predictedQuantity: this.seededRandom(warehouseId, 600, 1200, 'chilies'),
          boostMultiplier: 1.6 + (this.seededRandom(warehouseId, 0, 10, 'bm5') / 100),
          weatherReason: 'Chili capital'
        }
      ],
      'Visakhapatnam': [
        {
          name: 'Seafood',
          category: 'Fresh Food',
          predictedQuantity: this.seededRandom(warehouseId, 400, 900, 'seafood'),
          boostMultiplier: 1.3 + (this.seededRandom(warehouseId, 0, 10, 'bm6') / 100),
          weatherReason: 'Coastal city'
        }
      ],
      'Hyderabad': [
        {
          name: 'Biryani Mixes',
          category: 'Ready to Eat',
          predictedQuantity: this.seededRandom(warehouseId, 400, 800, 'biryani'),
          boostMultiplier: 1.6 + (this.seededRandom(warehouseId, 0, 10, 'bm7') / 100),
          weatherReason: 'Hyderabadi cuisine'
        }
      ],
      'Warangal': [
        {
          name: 'Cotton Products',
          category: 'Apparel',
          predictedQuantity: this.seededRandom(warehouseId, 300, 700, 'cotton'),
          boostMultiplier: 1.2 + (this.seededRandom(warehouseId, 0, 10, 'bm8') / 100),
          weatherReason: 'Cotton industry'
        }
      ],
      'Kanpur': [
        {
          name: 'Leather Goods',
          category: 'Apparel',
          predictedQuantity: this.seededRandom(warehouseId, 350, 850, 'leather'),
          boostMultiplier: 1.5 + (this.seededRandom(warehouseId, 0, 10, 'bm9') / 100),
          weatherReason: 'Leather industry'
        }
      ],
      'Lucknow': [
        {
          name: 'Chikan Embroidery',
          category: 'Apparel',
          predictedQuantity: this.seededRandom(warehouseId, 250, 700, 'chikan'),
          boostMultiplier: 1.4 + (this.seededRandom(warehouseId, 0, 10, 'bm10') / 100),
          weatherReason: 'Traditional craft'
        }
      ],
      'Bhopal': [
        {
          name: 'Namkeen Snacks',
          category: 'Snacks',
          predictedQuantity: this.seededRandom(warehouseId, 300, 800, 'namkeen'),
          boostMultiplier: 1.3 + (this.seededRandom(warehouseId, 0, 10, 'bm11') / 100),
          weatherReason: 'Popular snacks'
        }
      ],
      'Indore': [
        {
          name: 'Poha & Jalebi',
          category: 'Breakfast',
          predictedQuantity: this.seededRandom(warehouseId, 350, 900, 'poha'),
          boostMultiplier: 1.5 + (this.seededRandom(warehouseId, 0, 10, 'bm12') / 100),
          weatherReason: 'Famous breakfast'
        }
      ],
      'Amritsar': [
        {
          name: 'Punjabi Sweets',
          category: 'Confectionery',
          predictedQuantity: this.seededRandom(warehouseId, 400, 1000, 'punjabi'),
          boostMultiplier: 1.6 + (this.seededRandom(warehouseId, 0, 10, 'bm13') / 100),
          weatherReason: 'Sweet culture'
        }
      ],
      'Delhi': [
        {
          name: 'Street Food Items',
          category: 'Ready to Eat',
          predictedQuantity: this.seededRandom(warehouseId, 600, 1200, 'streetfood'),
          boostMultiplier: 1.8 + (this.seededRandom(warehouseId, 0, 10, 'bm14') / 100),
          weatherReason: 'Capital city food culture'
        }
      ],
      'Bangalore': [
        {
          name: 'Organic Products',
          category: 'Health & Wellness',
          predictedQuantity: this.seededRandom(warehouseId, 500, 1000, 'organic'),
          boostMultiplier: 1.6 + (this.seededRandom(warehouseId, 0, 10, 'bm15') / 100),
          weatherReason: 'IT hub health consciousness'
        }
      ],
      'Mysore': [
        {
          name: 'Sandalwood Products',
          category: 'Personal Care',
          predictedQuantity: this.seededRandom(warehouseId, 200, 600, 'sandalwood'),
          boostMultiplier: 1.5 + (this.seededRandom(warehouseId, 0, 10, 'bm16') / 100),
          weatherReason: 'Famous for sandalwood'
        }
      ],
      'Chennai': [
        {
          name: 'Traditional Spices',
          category: 'Cooking Essentials',
          predictedQuantity: this.seededRandom(warehouseId, 400, 900, 'spices'),
          boostMultiplier: 1.4 + (this.seededRandom(warehouseId, 0, 10, 'bm17') / 100),
          weatherReason: 'South Indian cuisine'
        }
      ],
      'Coimbatore': [
        {
          name: 'Cotton Textiles',
          category: 'Apparel',
          predictedQuantity: this.seededRandom(warehouseId, 300, 800, 'cottontextile'),
          boostMultiplier: 1.3 + (this.seededRandom(warehouseId, 0, 10, 'bm18') / 100),
          weatherReason: 'Textile industry'
        }
      ],
      'Ahmedabad': [
        {
          name: 'Garments',
          category: 'Apparel',
          predictedQuantity: this.seededRandom(warehouseId, 400, 900, 'garments'),
          boostMultiplier: 1.4 + (this.seededRandom(warehouseId, 0, 10, 'bm19') / 100),
          weatherReason: 'Garment hub'
        }
      ],
      'Jaipur': [
        {
          name: 'Handicrafts',
          category: 'Home Decor',
          predictedQuantity: this.seededRandom(warehouseId, 300, 700, 'handicrafts'),
          boostMultiplier: 1.5 + (this.seededRandom(warehouseId, 0, 10, 'bm20') / 100),
          weatherReason: 'Handicraft tradition'
        }
      ],
      'Kolkata': [
        {
          name: 'Sweet Products',
          category: 'Confectionery',
          predictedQuantity: this.seededRandom(warehouseId, 700, 1200, 'sweets'),
          boostMultiplier: 1.7 + (this.seededRandom(warehouseId, 0, 10, 'bm21') / 100),
          weatherReason: 'Bengali sweet culture'
        }
      ],
      'Kochi': [
        {
          name: 'Spices',
          category: 'Cooking Essentials',
          predictedQuantity: this.seededRandom(warehouseId, 400, 900, 'kochispices'),
          boostMultiplier: 1.5 + (this.seededRandom(warehouseId, 0, 10, 'bm22') / 100),
          weatherReason: 'Spice trade hub'
        }
      ]
    };
    return regionalItems[city] || [];
  }

  // Get seasonal adjustments
  private getSeasonalAdjustments(weather: WeatherData) {
    const now = new Date();
    const month = now.getMonth() + 1;
    
    if (month >= 3 && month <= 6) {
      return { summer: 1.3, winter: 0.7, monsoon: 0.9, spring: 1.1 };
    } else if (month >= 7 && month <= 9) {
      return { summer: 0.8, winter: 0.6, monsoon: 1.4, spring: 0.9 };
    } else if (month >= 10 || month <= 2) {
      return { summer: 0.6, winter: 1.3, monsoon: 0.7, spring: 0.8 };
    } else {
      return { summer: 1.0, winter: 1.0, monsoon: 1.0, spring: 1.0 };
    }
  }

  // Get weather-based sales prediction for a specific day
  async getDaySpecificPrediction(warehouseId: string, date: string): Promise<{
    date: string;
    weather: WeatherData;
    topItems: any[];
    totalPredictedSales: number;
    weatherImpact: string;
  }> {
    const warehouse = this.getWarehouseInfo(warehouseId);
    const coordinates = this.getWarehouseCoordinates(warehouseId);
    const weather = await this.getWeatherData(coordinates[0], coordinates[1]);
    const items = await this.getWeatherBasedItems(warehouseId, coordinates);
    
    // Adjust quantities based on day of week
    const dayOfWeek = new Date(date).getDay();
    const dayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.4 : 1.0;
    
    const adjustedItems = items.topItems.map(item => ({
      ...item,
      predictedQuantity: Math.round(item.predictedQuantity * dayMultiplier * item.boostMultiplier)
    }));
    
    const totalSales = adjustedItems.reduce((sum, item) => sum + item.predictedQuantity, 0);
    
    return {
      date,
      weather,
      topItems: adjustedItems,
      totalPredictedSales: totalSales,
      weatherImpact: this.getWeatherImpactDescription(weather)
    };
  }

  // Get warehouse coordinates
  private getWarehouseCoordinates(warehouseId: string): [number, number] {
    const coordinates: { [key: string]: [number, number] } = {
      'MH001': [19.2948, 73.0634],
      'MH002': [18.5204, 73.8567],
      'MH003': [21.1458, 79.0882],
      'MH004': [19.8762, 75.3433],
      'AP001': [16.3067, 80.4365],
      'AP002': [17.6868, 83.2185],
      'TG001': [17.3850, 78.4867],
      'TG002': [17.9689, 79.5941],
      'UP001': [26.4499, 80.3319],
      'UP002': [26.8467, 80.9462],
      'MP001': [23.2599, 77.4126],
      'MP002': [22.7196, 75.8577],
      'PB001': [31.6340, 74.8723],
      'DL001': [28.7041, 77.1025],
      'KA001': [12.9716, 77.5946],
      'KA002': [12.2958, 76.6394],
      'TN001': [13.0827, 80.2707],
      'TN002': [11.0168, 76.9558],
      'GJ001': [23.0225, 72.5714],
      'RJ001': [26.9124, 75.7873],
      'WB001': [22.5726, 88.3639],
      'KL001': [9.9312, 76.2673]
    };
    
    return coordinates[warehouseId] || [20.5937, 78.9629]; // Default to India center
  }

  // Get weather impact description
  private getWeatherImpactDescription(weather: WeatherData): string {
    if (weather.weatherCondition === 'hot') {
      return `High temperature (${weather.temperature}°C) - Increased demand for cooling products`;
    } else if (weather.weatherCondition === 'cold') {
      return `Low temperature (${weather.temperature}°C) - Increased demand for warming products`;
    } else if (weather.weatherCondition === 'rainy') {
      return `Rainy weather - Increased demand for protection and indoor items`;
    }
    return `Moderate weather (${weather.temperature}°C) - Normal demand patterns`;
  }
}

// Export singleton instance
export const weatherService = new WeatherService(); 