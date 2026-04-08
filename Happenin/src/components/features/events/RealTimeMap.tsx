import React from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// We will use a custom dot for the live pulse markers.
const livePulseIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: '<div class="live-pulse-marker"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// Focus the map on a specific coordinate if needed
function UpdateView({ center }: { center: [number, number] }) {
  const map = useMap()
  map.setView(center, map.getZoom())
  return null
}

interface EventLocation {
  id: string
  name: string
  lat: number
  lng: number
  density: number
}

interface RealTimeMapProps {
  events: EventLocation[]
  focusedEventId?: string | null
}

export default function RealTimeMap({ events, focusedEventId }: RealTimeMapProps) {
  // Default center (e.g. Bangalore or standard center)
  const defaultCenter: [number, number] = [12.9716, 77.5946]
  
  const focusedEvent = events.find(e => e.id === focusedEventId)
  const mapCenter = focusedEvent ? [focusedEvent.lat, focusedEvent.lng] as [number, number] : defaultCenter

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        zoomControl={false}
        className="w-full h-full bg-[#0a0a0a]"
      >
        <UpdateView center={mapCenter} />
        {/* Dark Mode CartoDB tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {events.map((event) => (
          <Marker 
            key={event.id}
            position={[event.lat, event.lng]} 
            icon={livePulseIcon}
          />
        ))}
      </MapContainer>
    </div>
  )
}
