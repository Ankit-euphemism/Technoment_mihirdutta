import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// ──────────────────────────────────────────────
// Fix Leaflet's broken default marker icons in Vite/Webpack builds.
// Without this, marker images 404 because the asset URLs get mangled.
// ──────────────────────────────────────────────
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface EventMarker {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
}

// ──────────────────────────────────────────────
// Sample seed data (replace with Supabase real-time data)
// ──────────────────────────────────────────────
const SAMPLE_EVENTS: EventMarker[] = [
  {
    id: '1',
    title: 'Summer Music Fest',
    description: 'Live performances all day 🎸',
    lat: 51.505,
    lng: -0.09,
  },
  {
    id: '2',
    title: 'Food Street Market',
    description: 'Local vendors & gourmet bites 🍔',
    lat: 51.51,
    lng: -0.1,
  },
  {
    id: '3',
    title: 'Art Exhibition',
    description: 'Contemporary artists showcase 🎨',
    lat: 51.5,
    lng: -0.08,
  },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
const RealTimeMap: React.FC = () => {
  const defaultCenter: [number, number] = [51.505, -0.09];

  useEffect(() => {
    // TODO: Subscribe to Supabase Realtime channel for live event updates
    // supabase.channel('events').on('postgres_changes', ...).subscribe()
  }, []);

  return (
    <div
      style={{
        height: '480px',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        border: '1px solid #e5e7eb',
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Event Markers */}
        {SAMPLE_EVENTS.map((event) => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <strong style={{ fontSize: '14px' }}>{event.title}</strong>
              <br />
              <span style={{ color: '#555', fontSize: '12px' }}>{event.description}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RealTimeMap;
