import React from 'react';
import CrowdOMeter from './CrowdOMeter';
import TicketPurchase from './TicketPurchase';
import type { Event } from '../../../types';

interface EventDetailProps {
  event: Event;
  userId: string;
  onClose?: () => void;
}

/**
 * EVENT DETAIL VIEW
 * 
 * Shows event with:
 * ✅ Event info & map location
 * ✅ Real-time crowd-o-meter
 * ✅ Ticket purchase form
 * ✅ Responsive design for mobile
 */
const EventDetail: React.FC<EventDetailProps> = ({ event, userId, onClose }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        {onClose && (
          <button
            onClick={onClose}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            ← Back to Events
          </button>
        )}

        <div
          className="w-full h-48 bg-linear-to-br from-blue-500 to-indigo-700 rounded-lg overflow-hidden mb-4 flex items-center justify-center"
          style={{
            backgroundImage: event.image_url ? `url(${event.image_url})` : undefined,
          }}
        >
          {!event.image_url && (
            <div className="text-center text-white">
              <p className="text-4xl">🎉</p>
              <p className="text-sm font-medium mt-2">Event Image</p>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
  <p className="text-gray-600 mb-4">{event.description ?? 'No description provided.'}</p>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">📍 Location</p>
            <p className="font-medium text-gray-900">{event.location}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">🎫 Capacity</p>
            <p className="font-medium text-gray-900">{event.max_capacity} people</p>
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Crowd + Purchase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Crowd Meter */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Live Crowd Status</h2>
          <CrowdOMeter eventId={event.id} />
        </div>

        {/* Right: Ticket Purchase */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Get Your Ticket</h2>
          <TicketPurchase
            event={event}
            userId={userId}
            onSuccess={() => {
              // Optionally refresh crowd meter after purchase
              console.log('Ticket purchased! Crowd meter will auto-update.');
            }}
          />
        </div>
      </div>

      {/* Event Coordinates (for map) */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
        <p>📍 Coordinates: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</p>
      </div>
    </div>
  );
};

export default EventDetail;
