import { MapPin, Search, ScanLine, User } from 'lucide-react'
import RealTimeMap from '../features/events/RealTimeMap'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { CrowdOMeter } from '../features/events/CrowdOMeter'

export function MobileShell({ children }: { children?: React.ReactNode }) {
  // Dummy Data for the UI Shell demonstration
  const dummyEvents = [
    { id: '1', name: 'NH7 Weekender Pop-up', lat: 12.9716, lng: 77.5946, density: 85 }
  ];

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Background Map layer */}
      <RealTimeMap events={dummyEvents} focusedEventId="1" />

      {/* Top Floating Nav Layer */}
      <div className="absolute top-0 inset-x-0 p-4 z-10 flex justify-between items-center pointer-events-none">
        <GlassCard className="pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-full flex-1 mr-4">
          <Search className="w-5 h-5 text-white/50" />
          <input 
            type="text" 
            placeholder="Find local fests..." 
            className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-white/40"
          />
        </GlassCard>
        
        <GlassCard className="pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </GlassCard>
      </div>

      {/* Main Content Overlay (Bottom Sheet simulation) */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-4 pb-8 pointer-events-none flex flex-col justify-end">
        <GlassCard className="pointer-events-auto w-full p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="inline-flex items-center space-x-1 bg-white/10 px-2 py-1 rounded text-[10px] text-white/80 font-medium mb-2 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-slow block"></span>
                <span>Live Now</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">NH7 Weekender Pop-up</h2>
              <p className="text-sm text-white/60 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Indiranagar, 2km away
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-primary">₹499</span>
            </div>
          </div>

          <CrowdOMeter currentCapacity={85} maxCapacity={100} />

          <div className="flex space-x-3 mt-6">
            <Button variant="secondary" className="flex-1">
              Details
            </Button>
            <Button variant="neon" className="flex-1">
              Buy Ticket
            </Button>
          </div>
        </GlassCard>

        {/* Bottom Navigation Buttons */}
        <div className="mt-4 flex justify-between items-center px-6 pointer-events-auto">
          <div className="flex flex-col items-center opacity-100">
            <MapPin className="w-6 h-6 text-primary mb-1" />
            <span className="text-[10px] font-medium text-white">Explore</span>
          </div>
          <div className="flex flex-col items-center opacity-50 relative -top-3">
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <ScanLine className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium text-white mt-1">Scan</span>
          </div>
          <div className="flex flex-col items-center opacity-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 mb-1 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <span className="text-[10px] font-medium text-white">Tickets</span>
          </div>
        </div>
      </div>
    </div>
  )
}
