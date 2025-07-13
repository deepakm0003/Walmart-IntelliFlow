import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Plane, Ship, Truck, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Shipment } from '../types';
import { warehouses } from '../data/warehouses';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createShipmentIcon = (shipment: Shipment) => {
  const getIconColor = () => {
    switch (shipment.status) {
      case 'delayed': return '#ef4444';
      case 'in_transit': return '#3b82f6';
      case 'loading': return '#f59e0b';
      case 'arrived': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getIconSymbol = () => {
    switch (shipment.type) {
      case 'airplane': return '✈';
      case 'ship': return '🚢';
      case 'truck': return '🚛';
      default: return '📦';
    }
  };

  return L.divIcon({
    html: `
      <div style="
        background-color: ${getIconColor()};
        width: 32px;
        height: 32px;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        animation: ${shipment.status === 'in_transit' ? 'pulse 2s infinite' : 'none'};
      ">
        ${getIconSymbol()}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'custom-shipment-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
};

const createWarehouseIcon = (isDestination: boolean = false) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${isDestination ? '#10b981' : '#6b7280'};
        width: 24px;
        height: 24px;
        border: 2px solid white;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        🏭
      </div>
    `,
    className: 'warehouse-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

interface ShipmentMapProps {
  shipments: Shipment[];
  selectedShipment?: string;
  onShipmentSelect?: (shipmentId: string) => void;
}

const MapEvents: React.FC<ShipmentMapProps> = ({ shipments, selectedShipment, onShipmentSelect }) => {
  const map = useMap();

  useEffect(() => {
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add warehouse markers
    warehouses.forEach((warehouse) => {
      const isDestination = shipments.some(s => s.warehouseId === warehouse.id);
      const marker = L.marker(warehouse.coordinates, {
        icon: createWarehouseIcon(isDestination)
      });
      
      marker.bindPopup(`
        <div style="min-width: 180px;">
          <h4 style="margin: 0 0 8px 0; font-weight: bold;">${warehouse.name}</h4>
          <p style="margin: 4px 0; font-size: 12px;">${warehouse.city}, ${warehouse.state}</p>
          ${isDestination ? '<p style="color: #10b981; font-weight: bold; font-size: 12px;">📦 Incoming Shipments</p>' : ''}
        </div>
      `);
      
      marker.addTo(map);
    });

    // Add shipment markers and routes
    shipments.forEach((shipment) => {
      const warehouse = warehouses.find(w => w.warehouseId === shipment.warehouseId || w.id === shipment.warehouseId);
      
      if (warehouse) {
        // Add route line
        const routeLine = L.polyline([shipment.coordinates, warehouse.coordinates], {
          color: shipment.status === 'delayed' ? '#ef4444' : '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: shipment.status === 'delayed' ? '10, 10' : undefined
        });
        routeLine.addTo(map);

        // Add shipment marker
        const marker = L.marker(shipment.coordinates, {
          icon: createShipmentIcon(shipment)
        });

        const statusIcon = shipment.status === 'delayed' ? '⚠️' : 
                          shipment.status === 'arrived' ? '✅' : 
                          shipment.status === 'loading' ? '⏳' : '🚀';

        const popupContent = `
          <div style="min-width: 220px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #0071ce;">
              ${statusIcon} ${shipment.id}
            </h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Type:</strong> ${shipment.type.toUpperCase()}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>From:</strong> ${shipment.origin}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>To:</strong> ${shipment.destination}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> 
              <span style="color: ${shipment.status === 'delayed' ? '#ef4444' : '#10b981'}">${shipment.status.replace('_', ' ').toUpperCase()}</span>
            </p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Priority:</strong> 
              <span style="color: ${shipment.priority === 'critical' ? '#ef4444' : shipment.priority === 'high' ? '#f59e0b' : '#10b981'}">${shipment.priority.toUpperCase()}</span>
            </p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>ETA:</strong> ${new Date(shipment.estimatedArrival).toLocaleString()}</p>
            <div style="margin-top: 8px; padding: 8px; background: #f3f4f6; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; font-weight: bold;">Cargo:</p>
              ${shipment.cargo.map(item => `<p style="margin: 2px 0; font-size: 11px;">• ${item}</p>`).join('')}
            </div>
            ${shipment.weatherImpact ? '<p style="margin: 8px 0 0 0; color: #f59e0b; font-size: 12px;">⚠️ Weather Impact Alert</p>' : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.addTo(map);
        
        if (onShipmentSelect) {
          marker.on('click', () => onShipmentSelect(shipment.id));
        }
      }
    });

    // Auto-fit bounds to show all markers
    if (shipments.length > 0) {
      const group = new L.FeatureGroup();
      shipments.forEach(shipment => {
        const warehouse = warehouses.find(w => w.warehouseId === shipment.warehouseId || w.id === shipment.warehouseId);
        if (warehouse) {
          group.addLayer(L.marker(shipment.coordinates));
          group.addLayer(L.marker(warehouse.coordinates));
        }
      });
      map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [map, shipments, selectedShipment, onShipmentSelect]);

  return null;
};

const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipments, selectedShipment, onShipmentSelect }) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-xl">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents 
          shipments={shipments} 
          selectedShipment={selectedShipment}
          onShipmentSelect={onShipmentSelect}
        />
      </MapContainer>
    </div>
  );
};

export default ShipmentMap;