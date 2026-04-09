import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Calendar, Users, Tag, Image, FileText, IndianRupee, CheckCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../ui/Button'

const CATEGORIES = ['Music', 'Comedy', 'Tech', 'Sports', 'Art', 'Food', 'Fashion', 'Education', 'Other']

// ─── Moved OUTSIDE the parent so React never remounts it on state change ───
interface InputFieldProps {
  icon: React.ElementType
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}

function InputField({ icon: Icon, label, value, onChange, type = 'text', placeholder, required = false }: InputFieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
        <Icon className="w-3.5 h-3.5" />
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-slate-400"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export function AddEventForm({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    latitude: '',
    longitude: '',
    event_date: '',
    max_capacity: '',
    price: '',
    image_url: '',
  })

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build payload — only include base columns that definitely exist in schema
      const payload: Record<string, any> = {
        id: crypto.randomUUID(),   // generate UUID since column has no DB default
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
        max_capacity: parseInt(form.max_capacity) || 100,
      }

      // Optional columns — only add if values exist AND column may exist
      // Run this SQL in Supabase to enable these:
      // ALTER TABLE events ADD COLUMN IF NOT EXISTS category TEXT,
      //   ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
      //   ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ,
      //   ADD COLUMN IF NOT EXISTS created_by UUID;
      if (form.event_date)  payload.event_date = form.event_date
      if (form.image_url)   payload.image_url  = form.image_url.trim()

      // Try full insert, fall back to base columns only if optional columns missing
      let { error: insertError } = await supabase.from('events').insert(payload)

      if (insertError?.message?.includes('category') || insertError?.message?.includes('price') || insertError?.message?.includes('event_date') || insertError?.message?.includes('created_by')) {
        // Schema missing optional columns — retry with base only
        const basePayload = {
          title: payload.title,
          description: payload.description,
          location: payload.location,
          latitude: payload.latitude,
          longitude: payload.longitude,
          max_capacity: payload.max_capacity,
          image_url: payload.image_url,
        }
        const retry = await supabase.from('events').insert(basePayload)
        insertError = retry.error
      }

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1800)
    } catch (err: any) {
      setError(err.message || 'Failed to create event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isStep1Valid = form.title && form.category && form.description
  const isStep2Valid = form.location && form.event_date && form.max_capacity

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          </motion.div>
          <h2 className="text-xl font-bold text-slate-900">Event Created!</h2>
          <p className="text-slate-500 text-sm mt-1 text-center">Your event is now live on Happenin.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">List Your Event</h2>
            <p className="text-xs text-slate-500 mt-0.5">Step {step} of 2 — {step === 1 ? 'Basic Info' : 'Details & Logistics'}</p>
          </div>
          <button
            onClick={onClose}
            title="Close"
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 flex-shrink-0">
          <motion.div
            animate={{ width: step === 1 ? '50%' : '100%' }}
            transition={{ duration: 0.3 }}
            className="h-full bg-primary"
          />
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                className="space-y-4"
              >
                <InputField
                  icon={FileText}
                  label="Event Title"
                  value={form.title}
                  onChange={v => set('title', v)}
                  placeholder="e.g. NH7 Weekender Pop-up"
                  required
                />

                {/* Category Picker */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Category <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => set('category', cat)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                          form.category === cat
                            ? 'bg-primary text-white border-primary'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="What makes your event special? Describe it here..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none placeholder:text-slate-400"
                  />
                </div>

                <InputField
                  icon={Image}
                  label="Banner Image URL"
                  value={form.image_url}
                  onChange={v => set('image_url', v)}
                  placeholder="https://..."
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                className="space-y-4"
              >
                <InputField
                  icon={MapPin}
                  label="Location / Venue"
                  value={form.location}
                  onChange={v => set('location', v)}
                  placeholder="e.g. Indiranagar Social, Bangalore"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField icon={MapPin} label="Latitude" value={form.latitude} onChange={v => set('latitude', v)} type="number" placeholder="12.9716" />
                  <InputField icon={MapPin} label="Longitude" value={form.longitude} onChange={v => set('longitude', v)} type="number" placeholder="77.5946" />
                </div>

                <InputField
                  icon={Calendar}
                  label="Event Date & Time"
                  value={form.event_date}
                  onChange={v => set('event_date', v)}
                  type="datetime-local"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField icon={Users} label="Max Capacity" value={form.max_capacity} onChange={v => set('max_capacity', v)} type="number" placeholder="200" required />
                  <InputField icon={IndianRupee} label="Ticket Price (₹)" value={form.price} onChange={v => set('price', v)} type="number" placeholder="499 or 0 for free" />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    ⚠️ {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          {step === 1 ? (
            <>
              <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
              >
                Next →
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmit}
                disabled={!isStep2Valid || loading}
              >
                {loading ? 'Saving...' : 'Publish Event 🚀'}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}