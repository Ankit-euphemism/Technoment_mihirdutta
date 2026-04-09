import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ticket, MapPin, QrCode, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../ui/Button'

interface TicketWithEvent {
  id: string
  ticket_number: string
  qr_code: string
  qr_code_expires_at: string
  purchase_date: string
  is_checked_in: boolean
  event_id: string
  events?: {
    title?: string
    location?: string
    image_url?: string
  } | null
}

interface Props {
  userId: string
  onExplore: () => void
}

export function MyTickets({ userId, onExplore }: Props) {
  const [tickets, setTickets] = useState<TicketWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedQR, setExpandedQR] = useState<string | null>(null)

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try with explicit FK hint first
      let { data, error: err } = await supabase
        .from('tickets')
        .select('*, events!tickets_event_id_fkey(title, location, image_url)')
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false })

      // Fallback: if join fails due to FK ambiguity, fetch tickets only
      if (err?.message?.includes('relationship') || err?.message?.includes('embed') || err?.message?.includes('does not exist')) {
        const fallback = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', userId)
          .order('purchase_date', { ascending: false })
        data = fallback.data
        err = fallback.error
      }

      if (err) throw err
      setTickets((data as TicketWithEvent[]) || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [userId])

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f5] p-6 pb-24 sm:pb-28">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Loading your tickets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f5] p-6 pb-24 sm:pb-28 text-center">
        <p className="text-red-500 text-sm mb-4">⚠️ {error}</p>
        <Button variant="primary" onClick={fetchTickets}>Try Again</Button>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f5] p-6 pb-24 sm:pb-28 text-center">
        <Ticket className="w-16 h-16 text-primary mb-4 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Your Tickets</h2>
        <p className="text-slate-500 text-center mt-2 max-w-xs">
          No tickets yet. Find something awesome to attend!
        </p>
        <Button variant="primary" className="mt-6" onClick={onExplore}>
          Explore Events
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-[#f5f5f5] pb-24 sm:pb-28">
      <div className="max-w-[600px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">
            My Tickets
            <span className="ml-2 text-sm font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {tickets.length}
            </span>
          </h2>
          <button
            onClick={fetchTickets}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Ticket Cards */}
        <div className="space-y-4">
          {tickets.map((ticket, i) => {
            const ev = ticket.events
            const expired = new Date(ticket.qr_code_expires_at) < new Date()
            const purchaseDate = new Date(ticket.purchase_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100"
              >
                {/* Top: Event Image + Info */}
                <div className="flex gap-4 p-4">
                  {ev?.image_url ? (
                    <img
                      src={ev.image_url}
                      alt={ev?.title || 'Event'}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-7 h-7 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                      {ev?.title || 'Event'}
                    </h3>
                    {ev?.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {ev.location}
                      </p>
                    )}
                    {/* Status Badge */}
                    <div className="mt-2 flex items-center gap-2">
                      {ticket.is_checked_in ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Checked In
                        </span>
                      ) : expired ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-500 font-semibold px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                          <Ticket className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dashed divider (ticket tear) */}
                <div className="relative mx-4">
                  <div className="border-t-2 border-dashed border-slate-100" />
                  <div className="absolute -top-2 -left-6 w-4 h-4 rounded-full bg-[#f5f5f5]" />
                  <div className="absolute -top-2 -right-6 w-4 h-4 rounded-full bg-[#f5f5f5]" />
                </div>

                {/* Bottom: Ticket Number + QR Toggle */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ticket No.</p>
                    <p className="text-xs font-mono font-bold text-slate-700">{ticket.ticket_number}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Booked {purchaseDate}</p>
                  </div>
                  <button
                    onClick={() => setExpandedQR(expandedQR === ticket.id ? null : ticket.id)}
                    className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-primary hover:text-white text-slate-600 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {expandedQR === ticket.id ? 'Hide QR' : 'Show QR'}
                  </button>
                </div>

                {/* QR Code (expanded) */}
                {expandedQR === ticket.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 flex flex-col items-center gap-2"
                  >
                    <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                      {/* QR rendered as grid — in production use a QR library */}
                      <div className="w-28 h-28 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center mb-2">
                        <QrCode className="w-16 h-16 text-slate-800" />
                      </div>
                      <p className="text-[10px] text-slate-500 text-center font-mono break-all px-4">
                        {ticket.qr_code.slice(0, 24)}...
                      </p>
                      {expired && (
                        <p className="text-[10px] text-red-500 mt-1 font-semibold">QR code has expired</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
