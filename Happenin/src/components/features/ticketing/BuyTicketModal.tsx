import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ticket, CheckCircle, AlertCircle, Minus, Plus, CreditCard, Zap } from 'lucide-react'
import {
  loadRazorpayScript,
  createRazorpayOrder,
  verifyPayment,
  formatAmountToPaise,
} from '../../../services/razorpayService'
import { Button } from '../../ui/Button'
import type { Event } from '../../../types'

interface Props {
  event: Event
  userId: string
  userEmail: string
  onClose: () => void
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function BuyTicketModal({ event, userId, userEmail, onClose }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const price = event.price ?? 0
  const isFree = price === 0
  const total = price * quantity

  const handleBuy = async () => {
    setStatus('loading')
    setErrorMsg(null)

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) throw new Error('Could not load Razorpay. Check your internet connection.')

      if (isFree) {
        // Free event — directly insert ticket without payment
        const { supabase } = await import('../../../lib/supabase')
        const now = new Date()
        const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24h from now
        const { error } = await supabase.from('tickets').insert({
          id: crypto.randomUUID(),
          event_id: event.id,
          user_id: userId,
          ticket_number: `TKT-${Date.now()}`,
          qr_code: crypto.randomUUID(),
          qr_code_expires_at: expires.toISOString(),
          is_checked_in: false,
          purchase_date: now.toISOString(),
          updated_at: now.toISOString(),
        })
        if (error) throw error
        setStatus('success')
        return
      }

      // 2. Create Razorpay order via Supabase Edge Function
      const order = await createRazorpayOrder(
        event.id,
        userId,
        quantity,
        formatAmountToPaise(total)
      )

      // 3. Open Razorpay Checkout Modal
      await new Promise<void>((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          order_id: order.id,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Happenin',
          description: `${event.title} — ${quantity} Ticket${quantity > 1 ? 's' : ''}`,
          prefill: { email: userEmail },
          theme: { color: '#9333ea' },
          handler: async (response: any) => {
            try {
              // 4. Verify payment on backend & create ticket
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                event_id: event.id,
                user_id: userId,
                quantity,
              })
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      })

      setStatus('success')
    } catch (err: any) {
      if (err?.message === 'Payment cancelled') {
        setStatus('idle') // User dismissed — don't show error
      } else {
        setErrorMsg(err?.message || 'Payment failed. Please try again.')
        setStatus('error')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Success State */}
        {status === 'success' && (
          <div className="p-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            </motion.div>
            <h2 className="text-xl font-bold text-slate-900">Ticket Confirmed! 🎉</h2>
            <p className="text-slate-500 text-sm mt-2">
              Your ticket for <strong>{event.title}</strong> is booked. Check the Tickets tab for your QR code.
            </p>
            <Button variant="primary" className="w-full mt-6" onClick={onClose}>
              View My Tickets
            </Button>
          </div>
        )}

        {/* Normal State */}
        {status !== 'success' && (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-slate-900">Buy Ticket</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Event Info */}
            <div className="px-6 pt-5">
              <div className="flex gap-3 items-start">
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{event.title}</h3>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-1">{event.location}</p>
                  <div className="mt-1">
                    {isFree
                      ? <span className="text-green-600 font-bold text-sm">FREE</span>
                      : <span className="text-primary font-bold text-sm">₹{price} / ticket</span>
                    }
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isFree && (
                <div className="mt-5 flex items-center justify-between bg-slate-50 rounded-xl p-4">
                  <span className="text-sm font-medium text-slate-700">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <span className="font-bold text-slate-900 w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(10, q + 1))}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>
              )}

              {/* Total */}
              {!isFree && (
                <div className="mt-3 flex justify-between items-center px-1">
                  <span className="text-slate-500 text-sm">Total</span>
                  <span className="text-lg font-black text-primary">₹{total.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {status === 'error' && errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 p-3 bg-red-50 rounded-lg flex items-start gap-2 text-sm text-red-600"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 mt-2">
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleBuy}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isFree ? (
                  <>
                    <Zap className="w-4 h-4" /> Get Free Ticket
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay ₹{total.toLocaleString('en-IN')}
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-slate-400 mt-3">
                {isFree ? 'No payment required' : 'Secured by Razorpay · UPI, Cards, Netbanking accepted'}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
