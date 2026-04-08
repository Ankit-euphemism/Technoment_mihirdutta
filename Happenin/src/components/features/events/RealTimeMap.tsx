import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Event } from '../../../types';

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

interface RealTimeMapProps {
  events: Event[];
  loading: boolean;
  error: string | null;
}

// ──────────────────────────────────────────────
// Sample seed data (replace with Supabase real-time data)
// ──────────────────────────────────────────────
// const SAMPLE_EVENTS: EventMarker[] = [
//   {
//     id: '1',
//     title: 'Summer Music Fest',
//     description: 'Live performances all day 🎸',
//     lat: 51.505,
//     lng: -0.09,
//   },
//   {
//     id: '2',
//     title: 'Food Street Market',
//     description: 'Local vendors & gourmet bites 🍔',
//     lat: 51.51,
//     lng: -0.1,
//   },
//   {
//     id: '3',
//     title: 'Art Exhibition',
//     description: 'Contemporary artists showcase 🎨',
//     lat: 51.5,
//     lng: -0.08,
//   },
// ];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
const RealTimeMap: React.FC<RealTimeMapProps> = ({ events, loading, error }) => {

  const eventMarkers = useMemo<EventMarker[]>(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description ?? 'No description provided',
        lat: event.latitude,
        lng: event.longitude,
      })),
    [events]
  );

  const defaultCenter: [number, number] = useMemo(() => {
    if (eventMarkers.length > 0) {
      return [eventMarkers[0].lat, eventMarkers[0].lng];
    }

    return [26.8393, 80.9231];
  }, [eventMarkers]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading events map...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Failed to load events: {error}</div>;
  }

  if (eventMarkers.length === 0) {
    return <div className="p-6 text-center text-gray-500">No live events available right now.</div>;
  }

  return (
    <div className="h-120 w-full overflow-hidden rounded-xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Event Markers */}
        {eventMarkers.map((event) => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <strong className="text-sm">{event.title}</strong>
              <br />
              <span className="text-xs text-gray-600">{event.description}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RealTimeMap;
