import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Plane, Ship, Truck, Clock, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import { Shipment, Warehouse } from '../types';
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

  const getPulseAnimation = () => {
    if (shipment.status === 'in_transit') {
      return 'pulse 2s infinite';
    } else if (shipment.status === 'delayed') {
      return 'blink 1s infinite';
    }
    return 'none';
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
        animation: ${getPulseAnimation()};
        position: relative;
      ">
        ${getIconSymbol()}
        ${shipment.priority === 'critical' ? '<div style="position: absolute; top: -5px; right: -5px; width: 12px; height: 12px; background: #ef4444; border-radius: 50%; border: 2px solid white;"></div>' : ''}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
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
  showDistances?: boolean;
  showRoutes?: boolean;
}

const MapEvents: React.FC<ShipmentMapProps> = ({ 
  shipments, 
  selectedShipment, 
  onShipmentSelect, 
  showDistances = true,
  showRoutes = true 
}) => {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);
  const linesRef = useRef<L.Polyline[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);

  useEffect(() => {
    // Clear existing markers and lines
    markersRef.current.forEach(marker => map.removeLayer(marker));
    linesRef.current.forEach(line => map.removeLayer(line));
    circlesRef.current.forEach(circle => map.removeLayer(circle));
    
    markersRef.current = [];
    linesRef.current = [];
    circlesRef.current = [];

    // Add warehouse markers
    warehouses.forEach((warehouse) => {
      const isDestination = shipments.some(s => s.warehouseId === warehouse.id);
      const marker = L.marker(warehouse.coordinates, {
        icon: createWarehouseIcon(isDestination)
      });
      
      const incomingShipments = shipments.filter(s => s.warehouseId === warehouse.id);
      const popupContent = `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; font-weight: bold;">${warehouse.name}</h4>
          <p style="margin: 4px 0; font-size: 12px;">${warehouse.city}, ${warehouse.state}</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Capacity:</strong> ${warehouse.capacity.toLocaleString()}</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Current Stock:</strong> ${warehouse.currentStock.toLocaleString()}</p>
          ${incomingShipments.length > 0 ? `<p style="color: #10b981; font-weight: bold; font-size: 12px;">📦 ${incomingShipments.length} Incoming Shipments</p>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Add shipment markers, routes, and distance circles
    shipments.forEach((shipment) => {
      const warehouse = warehouses.find(w => w.id === shipment.warehouseId);
      
      if (warehouse) {
        // Add route line if enabled
        if (showRoutes && shipment.route && shipment.route.length > 1) {
          const routeLine = L.polyline(shipment.route, {
            color: shipment.status === 'delayed' ? '#ef4444' : '#3b82f6',
            weight: 3,
            opacity: 0.7,
            dashArray: shipment.status === 'delayed' ? '10, 10' : undefined
          });
          routeLine.addTo(map);
          linesRef.current.push(routeLine);
        }

        // Add direct line to destination
        const directLine = L.polyline([shipment.coordinates, warehouse.coordinates], {
          color: shipment.status === 'delayed' ? '#ef4444' : '#10b981',
          weight: 2,
          opacity: 0.5,
          dashArray: '5, 5'
        });
        directLine.addTo(map);
        linesRef.current.push(directLine);

        // Add distance circle if enabled
        if (showDistances && shipment.distanceToDestination) {
          const circle = L.circle(shipment.coordinates, {
            radius: shipment.distanceToDestination * 1000, // Convert km to meters
            color: shipment.status === 'delayed' ? '#ef4444' : '#3b82f6',
            fillColor: shipment.status === 'delayed' ? '#ef4444' : '#3b82f6',
            fillOpacity: 0.1,
            weight: 1
          });
          circle.addTo(map);
          circlesRef.current.push(circle);
        }

        // Add shipment marker
        const marker = L.marker(shipment.coordinates, {
          icon: createShipmentIcon(shipment)
        });

        const statusIcon = shipment.status === 'delayed' ? '⚠️' : 
                          shipment.status === 'arrived' ? '✅' : 
                          shipment.status === 'loading' ? '⏳' : '🚀';

        const speedUnit = shipment.type === 'ship' ? 'knots' : 'km/h';
        const distanceUnit = shipment.type === 'ship' ? 'nm' : 'km';

        const popupContent = `
          <div style="min-width: 250px;">
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
            <p style="margin: 4px 0; font-size: 14px;"><strong>Speed:</strong> ${shipment.speed || 'N/A'} ${speedUnit}</p>
            ${shipment.distanceToDestination ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Distance:</strong> ${shipment.distanceToDestination} ${distanceUnit}</p>` : ''}
            ${shipment.estimatedTimeRemaining ? `<p style="margin: 4px 0; font-size: 14px;"><strong>ETA:</strong> ${shipment.estimatedTimeRemaining} minutes</p>` : ''}
            <p style="margin: 4px 0; font-size: 14px;"><strong>Arrival:</strong> ${new Date(shipment.estimatedArrival).toLocaleString()}</p>
            <div style="margin-top: 8px; padding: 8px; background: #f3f4f6; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; font-weight: bold;">Cargo:</p>
              ${shipment.cargo.map(item => `<p style="margin: 2px 0; font-size: 11px;">• ${item}</p>`).join('')}
            </div>
            ${shipment.weatherImpact ? '<p style="margin: 8px 0 0 0; color: #f59e0b; font-size: 12px;">⚠️ Weather Impact Alert</p>' : ''}
            ${shipment.lastUpdate ? `<p style="margin: 4px 0; font-size: 11px; color: #6b7280;">Last Update: ${new Date(shipment.lastUpdate).toLocaleTimeString()}</p>` : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.addTo(map);
        markersRef.current.push(marker);
        
        if (onShipmentSelect) {
          marker.on('click', () => onShipmentSelect(shipment.id));
        }

        // Highlight selected shipment
        if (selectedShipment === shipment.id) {
          const highlightCircle = L.circle(shipment.coordinates, {
            radius: 50000, // 50km radius
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 2
          });
          highlightCircle.addTo(map);
          circlesRef.current.push(highlightCircle);
        }
      }
    });

    // Auto-fit bounds to show all markers
    if (shipments.length > 0) {
      const group = new L.FeatureGroup();
      shipments.forEach(shipment => {
        const warehouse = warehouses.find(w => w.id === shipment.warehouseId);
        if (warehouse) {
          group.addLayer(L.marker(shipment.coordinates));
          group.addLayer(L.marker(warehouse.coordinates));
        }
      });
      map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [map, shipments, selectedShipment, onShipmentSelect, showDistances, showRoutes]);

  return null;
};

const MapRefSetter = ({ setMapRef }: { setMapRef: (map: any) => void }) => {
  const map = useMap();
  useEffect(() => { setMapRef(map); }, [map, setMapRef]);
  return null;
};

const ShipmentMap = forwardRef<unknown, ShipmentMapProps>(({ shipments, selectedShipment, onShipmentSelect, showDistances = true, showRoutes = true }, ref) => {
  const mapInstance = useRef<any>(null);
  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (mapInstance.current) {
        const group = new L.FeatureGroup();
        shipments.forEach(shipment => {
          const warehouse = warehouses.find(w => w.id === shipment.warehouseId);
          if (warehouse) {
            group.addLayer(L.marker(shipment.coordinates));
            group.addLayer(L.marker(warehouse.coordinates));
          }
        });
        if (group.getLayers().length > 0) {
          mapInstance.current.fitBounds(group.getBounds().pad(0.1));
        }
      }
    }
  }), [shipments]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-xl">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={true}
      >
        <MapRefSetter setMapRef={(map: any) => { mapInstance.current = map; }} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents 
          shipments={shipments} 
          selectedShipment={selectedShipment}
          onShipmentSelect={onShipmentSelect}
          showDistances={showDistances}
          showRoutes={showRoutes}
        />
      </MapContainer>
    </div>
  );
});

export default ShipmentMap;