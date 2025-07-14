
# 🧠 Walmart IntelliFlow: AI-Powered Admin Platform for Adaptive Supply Chain Optimization

Walmart IntelliFlow is an advanced, admin-focused supply chain optimization dashboard built for Walmart’s operations team. This solution dynamically monitors, predicts, and routes product inventory based on live warehouse data, AI-driven demand forecasts, real-time climate events, and global shipment conditions.

Built for Walmart Sparkathon 2025, this platform enables Walmart to anticipate demand, avoid delivery disruptions, and manage warehouse stock in real-time using artificial intelligence and predictive simulations.

---

## 🚀 Key Features

### 🧠 AI Demand Forecast Engine
- Predicts demand using time-series order data, customer history, and external indicators.
- Automatically generates a list of items to restock based on population-level demand around each warehouse.

### 🌦️ Climate-Aware Routing with Auto-Rerouting
- Integrates Google Maps API + OpenWeatherMap API to monitor conditions during product shipment.
- Reroutes incoming goods from ship/air based on real-time climate threats (e.g. monsoon, storms).
- Selects nearest best-suited warehouse if default warehouse is blocked.

### 🎉 Festival & Season-Aware Inventory Planning
- Detects upcoming festivals and seasons using prebuilt datasets and adjusts restocking priority.
- Dynamically forecasts items in demand based on festival calendar + previous seasonal patterns.

### 📦 Intelligent Replenishment Engine
- Evaluates stock vs. predicted demand at every warehouse.
- Triggers auto-generation of purchase orders for admins to approve or modify.

### 🗺️ Live Admin Dashboard (React.js)
- Visualize shipment paths, delivery delays, and rerouting plans on a map.
- See dynamic restock suggestions for each warehouse with reasons and filters applied.
- Includes 4 demand filters:
  - No Filter
  - Season-based Filter
  - Festival-based Filter
  - Customer History-based Filter

### 🔍 Simulation & What-If Panel
- Test new warehouse placement or closure.
- Run delivery simulations for upcoming sales/festivals.
- View impact on margins, carbon footprint, delivery times.

### 🤖 AI Assistant (WarehouseBot)
- Ask warehouse-level questions like:
  - “What is the most demanded item this week in Mumbai?”
  - “Why was the shipment to Hyderabad rerouted?”
  - “Which warehouse has overstock on electronics?”

---

## 🛠️ Tech Stack

| Layer         | Technology                                 |
|---------------|---------------------------------------------|
| Frontend      | React.js, TailwindCSS, Leaflet/Mapbox       |
| Backend       | Node.js + Express.js, Flask (optional ML)   |
| AI/ML         | scikit-learn, Prophet, TensorFlow, Pandas   |
| APIs          | Google Maps API, OpenWeatherMap API, Holiday Calendar |
| Database      | MongoDB or Firebase                         |
| Dev Tools     | GitHub, Vercel, Postman                     |

---

## ⚙️ How to Run

```bash
# 1. Clone the repository
[git clone https://github.com/yourusername/walmart-intelliflow.git]

# 2. Install frontend dependencies
cd project
npm install

# 3. Install backend dependencies (optional Flask APIs)
pip install -r requirements.txt

# 4.

# 5. Run frontend and backend
npm start       # Frontend
python main.py   # Backend (if ML API used)
node server/index.js -- To run the server of the Shipment and the Admin Action Dashboard and update it.

```

---

## 🔮 Future Enhancements

- Blockchain traceability for shipment validation
- Satellite data + drone integration for rural warehouse visibility
- IoT integration for temperature monitoring in transit
- AI-powered supplier scoring and adaptive lead time adjustment

---

## 🏆 Built For

Walmart Sparkathon 2025  
Team: Admin AI Optimization Squad  
Track: Smart Supply Chain & Logistics

---

> © 2025 Walmart IntelliFlow — Smart Warehousing, Smarter Decisions.
> Made By Deepak 
