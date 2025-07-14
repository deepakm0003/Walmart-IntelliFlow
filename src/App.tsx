import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WarehouseDetailPage from './pages/WarehouseDetailPage';
import ShipmentTrackingPage from './pages/ShipmentTrackingPage';
import AdminActionsPage from './pages/AdminActionsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/warehouse/:warehouseId" element={<WarehouseDetailPage />} />
        <Route path="/shipments" element={<ShipmentTrackingPage />} />
        <Route path="/admin" element={<AdminActionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;