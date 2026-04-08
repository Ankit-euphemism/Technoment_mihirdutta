import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Home, MapPin, ScanLine, Ticket, User as UserIcon, Search, LogOut, ChevronDown, PlusCircle } from 'lucide-react'
import RealTimeMap from '../features/events/RealTimeMap'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { CrowdOMeter } from '../features/events/CrowdOMeter'
import { HomeFeed } from '../features/home/HomeFeed'
import { AuthModal } from '../features/auth/AuthModal'
import { AddEventForm } from '../features/events/AddEventForm'
import { MyTickets } from '../features/ticketing/MyTickets'
import { OrganizerScanner } from '../features/ticketing/OrganizerScanner'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

const NAV_ITEMS = ['Events', 'Music', 'Comedy', 'Sports', 'Fests', 'Workshops', 'Live Pulse']

export function MobileShell({ children }: { children?: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'home' | 'pulse' | 'tickets' | 'profile'>('home')
  const [activeNav, setActiveNav] = useState('Events')
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const { user, loading, signOut } = useAuth()

  // Dummy Data for the UI Shell demonstration
  const dummyEvents = [
    { id: '1', name: 'NH7 Weekender Pop-up', lat: 12.9716, lng: 77.5946, density: 85 }
  ];

  return (
    <div className="relative w-full h-screen bg-[#f5f5f5] overflow-hidden flex flex-col">
      
      {/* ── Top Header (BookMyShow Style) ── */}
      <header className="bg-white border-b border-slate-100 shadow-sm z-50 flex-shrink-0">
        <div className="max-w-[900px] mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            <span className="text-xl font-black tracking-tight">
              <span className="text-slate-900">happ</span>
              <span className="bg-primary text-white px-1 rounded-sm">en</span>
              <span className="text-slate-900">in</span>
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center bg-slate-100 rounded-full px-4 py-2 gap-2 mx-2 hover:bg-slate-200 transition-colors cursor-text">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for Events, Fests, Music and more"
              className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
            />
          </div>

          {/* City Selector */}
          <button className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-primary transition-colors flex-shrink-0 whitespace-nowrap">
            <MapPin className="w-4 h-4 text-primary" />
            Bangalore
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Auth Area */}
          {loading ? (
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-primary animate-spin flex-shrink-0" />
          ) : user ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UserIcon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-primary hidden sm:block">
                Hi, {user.user_metadata?.full_name?.split(' ')[0] || 'You'} ✦
              </span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex-shrink-0 bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-purple-700 transition-colors shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Sub Navigation */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-[900px] mx-auto px-4 flex items-center gap-0 overflow-x-auto hide-scrollbar">
            {NAV_ITEMS.map(item => (
              <button
                key={item}
                onClick={() => {
                  setActiveNav(item)
                  if (item === 'Live Pulse') setActiveTab('pulse')
                  else setActiveTab('home')
                }}
                className={cn(
                  "text-sm font-medium px-4 py-3 border-b-2 whitespace-nowrap transition-colors",
                  activeNav === item
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'home' && <HomeFeed />}

        
        {activeTab === 'pulse' && (
          <div className="w-full h-full relative">
            {/* Background Map layer */}
            <RealTimeMap events={dummyEvents} focusedEventId="1" />
            
            {/* Top Floating Search (Map Only) */}
            <div className="absolute top-0 inset-x-0 p-4 z-10 pointer-events-none">
              <GlassCard className="pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-full flex-1">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search location..." 
                  className="bg-transparent border-none outline-none text-slate-800 w-full text-sm placeholder:text-slate-400"
                />
              </GlassCard>
            </div>

            {/* Event Details Overlay */}
            <div className="absolute bottom-0 inset-x-0 z-20 p-4 pb-20 pointer-events-none flex flex-col justify-end">
              <GlassCard className="pointer-events-auto w-full p-5 bg-white backdrop-blur-md border border-slate-100 shadow-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="inline-flex items-center space-x-1 bg-red-50 px-2 py-1 rounded text-[10px] text-red-600 font-bold mb-2 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-slow block"></span>
                      <span>Live Pulse</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">NH7 Weekender Pop-up</h2>
                    <p className="text-sm text-slate-500 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1" /> Indiranagar, 2km away
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">₹499</span>
                  </div>
                </div>

                <div className="mt-3">
                  <CrowdOMeter currentCapacity={85} maxCapacity={100} />
                </div>

                <div className="flex space-x-3 mt-5">
                  <Button variant="secondary" className="flex-1">
                    Details
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={() => !user && setActiveTab('profile')}
                  >
                    {user ? 'Buy Ticket' : 'Login to Buy'}
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="w-full h-full overflow-hidden">
            {!user ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f5] p-6 text-center">
                <Ticket className="w-16 h-16 text-slate-200 mb-4 mx-auto" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Login Required</h2>
                <p className="text-slate-500 mb-6">Please sign in to view your tickets.</p>
                <Button variant="primary" onClick={() => setActiveTab('profile')}>Sign In</Button>
              </div>
            ) : (
              <MyTickets
                userId={user.id}
                onExplore={() => setActiveTab('home')}
              />
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="w-full h-full bg-background overflow-y-auto pb-24">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
              </div>
            ) : !user ? (
              <div className="p-6 pt-12">
                <AuthModal />
              </div>
            ) : (
              <div className="flex flex-col p-6">
                {/* User Info */}
                <div className="flex items-center space-x-4 mb-5 mt-2">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {user.user_metadata?.full_name || 'Happenin User'}
                    </h2>
                    <p className="text-slate-500 text-sm">{user.email}</p>
                  </div>
                </div>

                {/* ── List Your Event (PRIMARY CTA) ── */}
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="w-full mb-4 bg-primary text-white rounded-xl p-4 flex items-center justify-between shadow-md hover:bg-purple-700 transition-colors"
                >
                  <div className="text-left">
                    <p className="font-bold text-sm">List Your Event</p>
                    <p className="text-purple-200 text-xs mt-0.5">Reach thousands of local attendees</p>
                  </div>
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <PlusCircle className="w-5 h-5 text-white" />
                  </div>
                </button>

                {/* Organizer Scan Option */}
                <GlassCard
                  className="!p-4 border-primary/20 bg-purple-50 flex items-center justify-between cursor-pointer shadow-sm mb-4 hover:bg-purple-100 transition-colors"
                  onClick={() => setShowScanner(true)}
                >
                  <div>
                    <h3 className="font-bold text-primary text-sm mb-0.5">Organizer Access</h3>
                    <p className="text-xs text-slate-600">Tap to scan QR codes for check-in</p>
                  </div>
                  <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
                    <ScanLine className="w-4 h-4" />
                  </div>
                </GlassCard>

                {/* Sign Out */}
                <Button variant="secondary" className="w-full text-red-500 border-red-100 hover:bg-red-50 mt-2" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Event Modal ── */}
      <AnimatePresence>
        {showAddEvent && user && (
          <AddEventForm
            userId={user.id}
            onClose={() => setShowAddEvent(false)}
            onSuccess={() => {
              setShowAddEvent(false)
              setActiveTab('home')
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Organizer Scanner ── */}
      <AnimatePresence>
        {showScanner && (
          <OrganizerScanner onClose={() => setShowScanner(false)} />
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-100 px-6 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-between items-center pb-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={cn("flex flex-col items-center p-2", activeTab === 'home' ? "text-primary" : "text-slate-400")}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('pulse')}
            className={cn("flex flex-col items-center p-2", activeTab === 'pulse' ? "text-primary" : "text-slate-400")}
          >
            <MapPin className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Pulse</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('tickets')}
            className={cn("flex flex-col items-center p-2", activeTab === 'tickets' ? "text-primary" : "text-slate-400")}
          >
            <Ticket className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Tickets</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={cn("flex flex-col items-center p-2", activeTab === 'profile' ? "text-primary" : "text-slate-400")}
          >
            <UserIcon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
