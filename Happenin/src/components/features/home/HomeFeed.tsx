import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Star, Flame, Ticket } from 'lucide-react'
import { useEvents } from '../../../hooks/useEvents'
import { useAuth } from '../../../hooks/useAuth'
import { BuyTicketModal } from '../ticketing/BuyTicketModal'

// ─── Data ───────────────────────────────────────────────
const LANGUAGES = ['English', 'Hindi', 'Korean', 'Telugu', 'Malayalam', 'Punjabi', 'Tamil']
const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
const FORMATS = ['2D', '3D', '4DX', 'IMAX', 'ICE']

const EVENTS = [
  {
    id: 1,
    title: 'Dhurandhar The Revenge',
    category: 'Action',
    rating: '9.4',
    votes: '532K',
    img: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400&h=550',
    tag: 'Fast Filling',
  },
  {
    id: 2,
    title: 'Dacoit',
    category: 'Action',
    rating: null,
    votes: '68.6K Likes',
    img: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&q=80&w=400&h=550',
    tag: null,
  },
  {
    id: 3,
    title: 'Project Hail Mary',
    category: 'Sci-Fi',
    rating: '9.0',
    votes: '46.5K',
    img: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&q=80&w=400&h=550',
    tag: 'Trending',
  },
  {
    id: 4,
    title: 'The Super Mario Galaxy',
    category: 'Animation',
    rating: '8.6',
    votes: '1.8K',
    img: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=400&h=550',
    tag: null,
  },
  {
    id: 5,
    title: 'Hoppers',
    category: 'Comedy',
    rating: '9.2',
    votes: '9.5K',
    img: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=400&h=550',
    tag: 'Must Watch',
  },
  {
    id: 6,
    title: 'NH7 Weekender Live',
    category: 'Music',
    rating: '8.8',
    votes: '21K',
    img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400&h=550',
    tag: 'Fast Filling',
  },
  {
    id: 7,
    title: 'Zakir Khan: Live',
    category: 'Comedy',
    rating: '9.5',
    votes: '14K',
    img: 'https://images.unsplash.com/photo-1507676184212-d0330a15673c?auto=format&fit=crop&q=80&w=400&h=550',
    tag: 'Trending',
  },
  {
    id: 8,
    title: 'Arijit Singh World Tour',
    category: 'Music',
    rating: '9.8',
    votes: '102K',
    img: 'https://images.unsplash.com/photo-1470229722913-7c090be31d4e?auto=format&fit=crop&q=80&w=400&h=550',
    tag: 'Sold Out',
  },
]

// ─── Event Card ──────────────────────────────────────────
interface CardData {
  id: string | number
  title: string
  category: string
  rating: string | null
  votes: string
  img: string
  tag: string | null
  price: number
  location: string
}

function EventCard({ event, onBuy }: { event: CardData; onBuy: (e: CardData) => void }) {
  const tagColors: Record<string, string> = {
    'Fast Filling': 'bg-orange-100 text-orange-600',
    'Trending': 'bg-blue-100 text-blue-600',
    'Must Watch': 'bg-green-100 text-green-600',
    'Sold Out': 'bg-red-100 text-red-600',
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer group w-full"
    >
      <div className="relative rounded-xl overflow-hidden shadow-sm">
        <img
          src={event.img}
          alt={event.title}
          className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Rating Badge */}
        {event.rating && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-8">
            <div className="flex items-center space-x-1 text-white text-xs">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{event.rating}/10</span>
              <span className="text-white/70">• {event.votes} Votes</span>
            </div>
          </div>
        )}
        {/* Tag Badge */}
        {event.tag && (
          <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${tagColors[event.tag] || 'bg-slate-100 text-slate-600'}`}>
            <Flame className="w-2.5 h-2.5" />
            {event.tag}
          </div>
        )}
      </div>
      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{event.category}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-bold text-primary">
            {event.price === 0 ? 'FREE' : `₹${event.price}`}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onBuy(event) }}
            className="flex items-center gap-1 text-[10px] bg-primary text-white px-2 py-1 rounded-full font-semibold hover:bg-purple-700 transition-colors"
          >
            <Ticket className="w-2.5 h-2.5" />
            Book
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Filter Sidebar ───────────────────────────────────────
function FilterSidebar() {
  const [openSections, setOpenSections] = useState({ languages: true, genres: false, formats: false })
  const [selected, setSelected] = useState<Record<string, string[]>>({ languages: [], genres: [], formats: [] })

  const toggle = (section: string, value: string) => {
    setSelected(prev => {
      const current = prev[section] || []
      return {
        ...prev,
        [section]: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
      }
    })
  }

  const clear = (section: string) => setSelected(prev => ({ ...prev, [section]: [] }))

  const FilterSection = ({ id, label, items }: { id: string, label: string, items: string[] }) => (
    <div className="border-b border-slate-100 py-4">
      <div
        className="flex justify-between items-center cursor-pointer mb-3"
        onClick={() => setOpenSections(prev => ({ ...prev, [id]: !prev[id as keyof typeof prev] }))}
      >
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        <div className="flex items-center gap-2">
          {selected[id]?.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); clear(id) }}
              className="text-xs text-primary font-medium hover:underline"
            >
              Clear
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSections[id as keyof typeof openSections] ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {openSections[id as keyof typeof openSections] && (
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <button
              key={item}
              onClick={() => toggle(id, item)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                selected[id]?.includes(item)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sticky top-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Filters</h2>
        <FilterSection id="languages" label="Languages" items={LANGUAGES} />
        <FilterSection id="genres" label="Genres" items={GENRES} />
        <FilterSection id="formats" label="Format" items={FORMATS} />
        <button className="mt-4 w-full border border-primary text-primary font-semibold text-sm py-2 rounded-lg hover:bg-purple-50 transition-colors">
          Browse by Venue
        </button>
      </div>
    </div>
  )
}

// ─── Language Filter Pills ──────────────────────────────
function LanguagePills() {
  const [active, setActive] = useState('All')
  const pills = ['All', ...LANGUAGES]
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {pills.map(lang => (
        <button
          key={lang}
          onClick={() => setActive(lang)}
          className={`text-xs px-4 py-1.5 rounded-full border font-medium transition-all ${
            active === lang
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}

// ─── Main HomeFeed Export ──────────────────────────────
export function HomeFeed() {
  const { events, loading, error } = useEvents()
  const { user } = useAuth()
  const [selectedEvent, setSelectedEvent] = useState<CardData | null>(null)

  // Map Supabase events to EventCard shape
  const cards = events.map(e => ({
    id: e.id,
    title: e.title,
    category: e.category || 'Event',
    rating: null as string | null,
    votes: `${e.max_capacity} capacity`,
    img: e.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400&h=550',
    tag: null as string | null,
    price: e.price ?? 0,
    location: e.location,
  }))

  // Fallback to built-in dummy set if Supabase empty (so UI doesn't look broken during dev)
  const displayEvents = cards.length > 0 ? cards : EVENTS.map(e => ({ ...e, price: 499, location: 'Bangalore' }))

  return (
    <>
    <div className="w-full h-full overflow-y-auto bg-[#f5f5f5]">
      {/* Hero Banner */}
      <div className="w-full max-w-[900px] mx-auto mt-6 px-4">
        <div className="w-full h-44 rounded-xl overflow-hidden relative shadow-md">
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1200"
            alt="Featured Event Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-purple-900/50 to-transparent flex flex-col justify-center p-8">
            <span className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">Happenin</span>
            <h2 className="text-white text-3xl font-black leading-tight">DISCOVER<br />LOCAL EVENTS</h2>
            <p className="text-purple-200 text-sm mt-1">Step into your city's live culture</p>
            <button className="mt-3 bg-primary text-white text-sm font-bold px-5 py-2 rounded-full w-max hover:bg-purple-700 transition-colors shadow-lg">
              Explore Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Grid */}
      <div className="w-full max-w-[900px] mx-auto px-4 py-6 flex gap-6">
        {/* Filters Sidebar */}
        <FilterSidebar />

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Events Near You
              {!loading && <span className="text-slate-400 text-sm font-normal ml-2">({displayEvents.length})</span>}
            </h2>
            <a href="#" className="text-primary text-sm font-medium flex items-center hover:underline">
              See All <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Language Pills */}
          <LanguagePills />

          {/* Label */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full inline-block"></span>
              {loading ? 'Loading Events...' : error ? 'Showing Sample Events' : 'Live Events'}
            </h3>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-[2/3] bg-slate-200 rounded-xl mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error / empty hint */}
          {!loading && error && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              ⚠️ {error} — showing demo events below.
            </div>
          )}

          {/* Event Poster Grid */}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayEvents.map(event => (
                <EventCard key={event.id} event={event} onBuy={setSelectedEvent} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ── Buy Ticket Modal ── */}
    <AnimatePresence>
      {selectedEvent && (
        <BuyTicketModal
          event={{
            id: String(selectedEvent.id),
            title: selectedEvent.title,
            description: '',
            location: selectedEvent.location,
            latitude: 0,
            longitude: 0,
            max_capacity: 0,
            image_url: selectedEvent.img,
            created_at: '',
            price: selectedEvent.price,
            category: selectedEvent.category,
          }}
          userId={user?.id ?? ''}
          userEmail={user?.email ?? ''}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </AnimatePresence>
    </>
  )
}

