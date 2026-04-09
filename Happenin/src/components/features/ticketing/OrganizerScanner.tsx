import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, ScanLine, ZapOff } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../../../lib/supabase'

type ScanState = 'scanning' | 'verifying' | 'success' | 'error' | 'already_checked'

interface ScanResult {
  state: ScanState
  ticketNumber?: string
  eventTitle?: string
  message?: string
}

interface Props {
  onClose: () => void
}

const SCANNER_ID = 'organizer-qr-scanner'

export function OrganizerScanner({ onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isProcessingRef = useRef(false)

  const [result, setResult] = useState<ScanResult | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // ── Start scanner ─────────────────────────────────────
  useEffect(() => {
    void startScanner()
    return () => {
      void stopScanner()
    }
  }, [])

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {} // ignore per-frame errors
      )
    } catch (err: any) {
      setCameraError(err?.message || 'Camera access denied')
    }
  }

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      }
    } catch {
      // ignore cleanup errors
    }
  }

  // ── Handle a successful scan ──────────────────────────
  const onScanSuccess = async (qrCode: string) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    // Pause scanning visually
    setResult({ state: 'verifying' })
    await verifyTicket(qrCode)

    // Re-arm after 4 seconds
    setTimeout(() => {
      isProcessingRef.current = false
    }, 4000)
  }

  // ── Verify QR against Supabase ────────────────────────
  const verifyTicket = async (qrCode: string) => {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, is_checked_in, event_id, qr_code_expires_at')
        .eq('qr_code', qrCode)
        .single()

      if (error || !ticket) {
        setResult({ state: 'error', message: 'Ticket not found — invalid QR code' })
        return
      }

      if (new Date(ticket.qr_code_expires_at) < new Date()) {
        setResult({ state: 'error', message: 'QR code has expired', ticketNumber: ticket.ticket_number })
        return
      }

      if (ticket.is_checked_in) {
        setResult({ state: 'already_checked', ticketNumber: ticket.ticket_number, message: 'Already used for entry!' })
        return
      }

      // Get event name
      const { data: event } = await supabase
        .from('events')
        .select('title')
        .eq('id', ticket.event_id)
        .single()

      // Mark checked in
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ is_checked_in: true, updated_at: new Date().toISOString() })
        .eq('id', ticket.id)

      if (updateError) throw updateError

      setResult({
        state: 'success',
        ticketNumber: ticket.ticket_number,
        eventTitle: event?.title || 'Event',
        message: 'Entry granted!',
      })
    } catch (e: any) {
      setResult({ state: 'error', message: e.message || 'Verification failed' })
    }
  }

  const resetScan = () => {
    setResult(null)
    isProcessingRef.current = false
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-6 pb-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-primary" />
          <span className="text-white font-bold text-sm">Organizer Check-In</span>
        </div>
        <button
          onClick={handleClose}
          title="Close scanner"
          aria-label="Close scanner"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Camera Error */}
      {cameraError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
          <ZapOff className="w-12 h-12 text-slate-400" />
          <p className="text-white font-semibold">Camera unavailable</p>
          <p className="text-slate-400 text-sm">{cameraError}</p>
          <button onClick={handleClose} className="mt-4 bg-primary text-white px-6 py-2 rounded-full font-semibold text-sm">
            Close
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative">
          {/* html5-qrcode renders into this div */}
          <div
            id={SCANNER_ID}
            className="w-full h-full min-h-[60vh]"
          />

          {/* Scan frame overlay */}
          {!result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Dimmed edges */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Scan box */}
              <div className="relative w-[70vw] h-[70vw] max-w-60 max-h-60 z-10">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                {/* Animated scan line */}
                <motion.div
                  className="absolute inset-x-2 h-0.5 bg-primary/80 rounded-full"
                  animate={{ top: ['8%', '88%', '8%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <p className="z-10 mt-8 text-white/80 text-sm font-medium text-center px-8">
                Point camera at ticket QR code
              </p>
            </div>
          )}

          {/* Result Bottom Sheet */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-4 sm:p-6 shadow-2xl z-30 max-h-[70vh] overflow-y-auto"
              >
                {result.state === 'verifying' && (
                  <div className="flex flex-col items-center py-6">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin mb-3" />
                    <p className="font-bold text-slate-700 text-lg">Verifying ticket...</p>
                  </div>
                )}

                {result.state === 'success' && (
                  <div className="flex flex-col items-center text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-slate-900">Entry Granted!</h3>
                    <p className="text-slate-500 text-sm mt-1">{result.eventTitle}</p>
                    <span className="mt-2 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-full text-slate-600">
                      {result.ticketNumber}
                    </span>
                    <button
                      onClick={resetScan}
                      className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      ✓ Scan Next Ticket
                    </button>
                  </div>
                )}

                {result.state === 'already_checked' && (
                  <div className="flex flex-col items-center text-center">
                    <XCircle className="w-16 h-16 text-orange-400 mb-3" />
                    <h3 className="text-2xl font-black text-slate-900">Already Used</h3>
                    <p className="text-slate-500 text-sm mt-1">{result.message}</p>
                    <span className="mt-2 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-full text-slate-600">
                      {result.ticketNumber}
                    </span>
                    <button
                      onClick={resetScan}
                      className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      Scan Next →
                    </button>
                  </div>
                )}

                {result.state === 'error' && (
                  <div className="flex flex-col items-center text-center">
                    <XCircle className="w-16 h-16 text-red-500 mb-3" />
                    <h3 className="text-2xl font-black text-slate-900">Invalid Ticket</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-xs">{result.message}</p>
                    <button
                      onClick={resetScan}
                      className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
