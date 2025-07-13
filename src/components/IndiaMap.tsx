import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { warehouses } from '../data/warehouses';
import { Warehouse } from '../types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom warehouse icons
const createWarehouseIcon = (warehouse: Warehouse) => {
  const criticalLevel = warehouse.criticalItems > 8 ? 'high' : warehouse.criticalItems > 5 ? 'medium' : 'low';
  const color = criticalLevel === 'high' ? '#ef4444' : criticalLevel === 'medium' ? '#f59e0b' : '#10b981';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 10px;
      ">
        ${warehouse.criticalItems}
      </div>
    `,
    className: 'custom-warehouse-icon',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

interface IndiaMapProps {
  onWarehouseClick?: (warehouseId: string) => void;
}

const MapEvents: React.FC<{ onWarehouseClick?: (warehouseId: string) => void }> = ({ onWarehouseClick }) => {
  const map = useMap();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMarkerClick = (warehouse: Warehouse) => {
      if (onWarehouseClick) {
        onWarehouseClick(warehouse.id);
      } else {
        navigate(`/warehouse/${warehouse.id}`);
      }
    };

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add warehouse markers
    warehouses.forEach((warehouse) => {
      const marker = L.marker(warehouse.coordinates, {
        icon: createWarehouseIcon(warehouse)
      });
      
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #0071ce;">${warehouse.name}</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>City:</strong> ${warehouse.city}, ${warehouse.state}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Type:</strong> ${warehouse.type}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Population:</strong> ${warehouse.population.toLocaleString()}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Critical Items:</strong> <span style="color: ${warehouse.criticalItems > 8 ? '#ef4444' : warehouse.criticalItems > 5 ? '#f59e0b' : '#10b981'}">${warehouse.criticalItems}</span></p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Efficiency:</strong> ${warehouse.efficiency}%</p>
          <button 
            onclick="window.navigateToWarehouse('${warehouse.id}')"
            style="
              background: #0071ce; 
              color: white; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 4px; 
              cursor: pointer; 
              margin-top: 8px;
              font-size: 12px;
              font-weight: bold;
            "
          >
            View Details →
          </button>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      marker.addTo(map);
      
      marker.on('click', () => handleMarkerClick(warehouse));
    });

    // Global function for popup button clicks
    (window as any).navigateToWarehouse = (warehouseId: string) => {
      if (onWarehouseClick) {
        onWarehouseClick(warehouseId);
      } else {
        navigate(`/warehouse/${warehouseId}`);
      }
    };

    return () => {
      delete (window as any).navigateToWarehouse;
    };
  }, [map, navigate, onWarehouseClick]);

  return null;
};

const IndiaMap: React.FC<IndiaMapProps> = ({ onWarehouseClick }) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-xl">
      <MapContainer
        center={[20.5937, 78.9629]} // Center of India
        zoom={5}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents onWarehouseClick={onWarehouseClick} />
      </MapContainer>
    </div>
  );
};

export default IndiaMap;