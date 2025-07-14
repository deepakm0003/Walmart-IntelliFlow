Walmart IntelliFlow 🧠📦🚚
A climate-aware, AI-driven Warehouse Optimization and Logistics Re-routing System for Walmart India — built for internal operations and supply chain administrators.

This platform forecasts warehouse-level demand using seasonal, festival, and behavioral data. It enables intelligent restocking recommendations, detects climate-based disruptions, and automatically re-routes shipments using Google Maps and Weather APIs.

⚙️ Built for Walmart Sparkathon 2025 – Admin Control System

🚀 Features
🧠 Intelligent Demand Forecasting
🌦️ Climate & Season-aware Supply Chain Adaptation
🚢 Import/Export Routing with Auto-Rerouting Logic
📍 Live Shipment Tracking via Google Maps
📊 Admin Dashboard with Replenishment Engine
🤖 AI Agent Assistant for Warehouse Queries
📦 Smart Restock Recommendation with Purchase Order Templates
📈 “What-if” Forecast Simulation Panel
⚠️ Auto-generated Risk Alerts & Route Warnings

🏗️ Architecture Overview
React.js — Admin Dashboard UI

Python + Flask/FastAPI — Backend Logic & APIs

Pandas / scikit-learn / Prophet — ML Forecast Models

Google Maps API — Real-time shipment map + routing

OpenWeatherMap API — Live weather data for rerouting logic

MongoDB / Firebase — Data storage (inventory, orders, warehouse states)

🧩 Core Modules
Module	Description
Replenishment Engine	Forecasts demand and prioritizes restocks per warehouse
Inventory Analyzer	Matches demand vs current stock to identify shortfalls
Shipment Tracker	Maps shipments from ship/air to warehouse; reroutes if needed
Climate-based Rerouting	Detects weather threats and auto-assigns alternate destinations
Festival & Seasonal Filters	Dynamically adjusts product priority based on time context
Forecast Simulator	Simulates demand for future events (festivals/weather)
Admin Agent (WarehouseBot)	AI-based assistant to answer warehouse logistics queries
Smart PO Generator	Auto-generates purchase orders when restocks are needed
Alert System	Issues operational alerts for delays, shortages, risks

📸 Dashboard Preview
[Insert screenshots or gifs here showing dashboard, shipment tracking, smart recommendations]

🧪 Sample Use Case
Warehouse: Mumbai
Incoming Shipment: Electronics (via Ship)
Weather Alert: Storm in Arabian Sea → Auto-rerouted to Goa warehouse
Festival Filter: Diwali → High demand for gift boxes & lights
Action: Restock triggered for gift boxes in 3 warehouses with shortage
