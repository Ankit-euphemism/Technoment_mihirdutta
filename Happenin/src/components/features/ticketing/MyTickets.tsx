import React, { useState } from 'react';
import { useUserTickets } from '../../hooks/useCrowd';
import { checkInTicket } from '../../services/ticketService';

interface MyTicketsProps {
  userId: string | null;
}

/**
 * MY TICKETS COMPONENT
 * 
 * Shows user's purchased tickets with check-in capability
 * ✅ Real-time ticket status
 * ✅ QR code validation on backend (prevents spoofing)
 */
const MyTickets: React.FC<MyTicketsProps> = ({ userId }) => {
  const { tickets, loading, error } = useUserTickets(userId);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [checkInMessage, setCheckInMessage] = useState<{
    ticketId: string;
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!userId) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
        <p className="text-yellow-800">👤 Please sign in to view your tickets</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading your tickets...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-600">📭 You don't have any tickets yet</p>
        <p className="text-gray-500 text-sm mt-2">Browse events and purchase tickets to get started</p>
      </div>
    );
  }

  const handleCheckIn = async (ticketId: string, qrCode: string) => {
    setCheckingIn(ticketId);
    try {
      await checkInTicket(ticketId, qrCode);
      setCheckInMessage({
        ticketId,
        type: 'success',
        text: '✅ Successfully checked in! Welcome to the event.',
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Check-in failed. Please try again.';
      setCheckInMessage({
        ticketId,
        type: 'error',
        text: errorMsg,
      });
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Ticket Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ticket #{ticket.ticket_number}</h3>
                <p className="text-sm text-gray-600 mt-1">Event ID: {ticket.event_id}</p>
              </div>
              {ticket.is_checked_in ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                  ✅ Checked In
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded">
                  ⏳ Pending
                </span>
              )}
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-600">Purchased</p>
                <p className="font-medium text-gray-900">
                  {new Date(ticket.purchase_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Expires</p>
                <p className="font-medium text-gray-900">
                  {new Date(ticket.qr_code_expires_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Message */}
            {checkInMessage?.ticketId === ticket.id && (
              <div
                className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                  checkInMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {checkInMessage.text}
              </div>
            )}

            {/* Actions */}
            {!ticket.is_checked_in && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleCheckIn(ticket.id, ticket.qr_code)}
                  disabled={checkingIn !== null}
                  className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {checkingIn === ticket.id ? '🔄 Check In...' : '📱 Check In at Entry'}
                </button>
                <button
                  onClick={() => {
                    // TODO: Show QR code in modal
                    console.log('Show QR code:', ticket.qr_code);
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-900 font-semibold rounded hover:bg-gray-300 transition-colors"
                >
                  🎫 View QR Code
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTickets;
