import React from 'react'

interface CrowdOMeterProps {
  currentCapacity: number
  maxCapacity: number
}

export function CrowdOMeter({ currentCapacity, maxCapacity }: CrowdOMeterProps) {
  const percentage = Math.min(100, Math.max(0, (currentCapacity / maxCapacity) * 100))
  
  // Determine color based on density
  let colorClass = 'bg-green-500' // Low
  if (percentage > 50) colorClass = 'bg-yellow-500' // Medium
  if (percentage > 80) colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]' // High/Full

  return (
    <div className="w-full space-y-2 mt-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-white/60 font-medium">Live Crowd</span>
        <span className="text-white font-semibold">{percentage.toFixed(0)}% Capacity</span>
      </div>
      
      <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-white/40">
        <span>Quiet</span>
        <span>Packed</span>
      </div>
    </div>
  )
}
