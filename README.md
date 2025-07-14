
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

### ✈️ Full Shipment Lifecycle Monitoring
- Tracks shipments via:
   -🚢 Ship
   -✈️ Airplane
   -🚛 Truck
 - Displays:
   ETA, 
   Origin/Destination
 - Status: In Transit, Loading, Delayed, Delivered
 - Priority: Low, Medium, High, Critical
 - Shipment rerouting based on real-time weather alerts

### 🔍 Simulation & What-If Panel
- Test new warehouse placement or closure.
- Run delivery simulations for upcoming sales/festivals.
- View impact on margins, carbon footprint, and delivery times.

### 🤖 AI Assistant (WarehouseBot)
- Ask warehouse-level questions like:
  - “What is the most demanded item this week in Mumbai?”
  - “Why was the shipment to Hyderabad rerouted?”
  - “Which warehouse has overstock on electronics?”

---

## Screenshots of Running Website

<img width="1920" height="1428" alt="screencapture-localhost-5173-2025-07-14-22_31_00" src="https://github.com/user-attachments/assets/332dd090-780e-4c10-bd42-3889adbcc2f3" />

<img width="1920" height="1445" alt="screencapture-localhost-5173-shipments-2025-07-14-22_31_12" src="https://github.com/user-attachments/assets/4d53f02a-2c05-46d9-a05d-be367ac443db" />

<img width="1920" height="3312" alt="screencapture-localhost-5173-admin-2025-07-14-22_37_39" src="https://github.com/user-attachments/assets/0466f302-2804-461c-b824-f58c633717db" />


<img width="1920" height="1428" alt="screencapture-localhost-5173-2025-07-14-22_31_37" src="https://github.com/user-attachments/assets/fbb486fd-9fd8-4665-b017-d18121828f99" />

<img width="1920" height="1428" alt="screencapture-localhost-5173-2025-07-14-22_31_46" src="https://github.com/user-attachments/assets/8bd1e1c0-5ba6-461c-9517-5d15dfcf243d" />

<img width="1920" height="1428" alt="screencapture-localhost-5173-2025-07-14-22_31_59" src="https://github.com/user-attachments/assets/593ddbb0-82c0-4194-90e9-bb05a30dc706" />

<img width="1920" height="7173" alt="screencapture-localhost-5173-warehouse-MP001-2025-07-14-22_32_15" src="https://github.com/user-attachments/assets/afe3fa15-d63d-4df0-a089-316257bb741c" />


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
python -m pip install flask flask-cors  OR  pip install flask flask-cors

# 4. Run frontend and backend
npm start       # Frontend
python main.py   # Backend (For ML API used)
node server/index.js -- To run the server of the Shipment and the Admin Action Dashboard and update it.

```

## Backend Functionality Screenshots

<img width="891" height="403" alt="Screenshot 2025-07-14 225442" src="https://github.com/user-attachments/assets/a837089f-30db-4b44-8e99-7908449bbd7f" />

<img width="1201" height="640" alt="Screenshot 2025-07-14 225308" src="https://github.com/user-attachments/assets/4a2c65a0-7dec-4329-b838-b770ff87748f" />

<img width="1074" height="596" alt="Screenshot 2025-07-14 225430" src="https://github.com/user-attachments/assets/898f6d3a-acef-486b-8d31-cc90cfdc657f" />


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
