interface CrowdOMeterProps {
  currentCapacity: number
  maxCapacity: number
  tone?: 'light' | 'dark'
}

export function CrowdOMeter({ currentCapacity, maxCapacity, tone = 'light' }: CrowdOMeterProps) {
  const percentage = Math.min(100, Math.max(0, (currentCapacity / maxCapacity) * 100))
  
  // Determine color based on density
  let colorClass = 'bg-green-500' // Low
  if (percentage > 50) colorClass = 'bg-yellow-500' // Medium
  if (percentage > 80) colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]' // High/Full

  const textPrimary = tone === 'dark' ? 'text-white' : 'text-slate-900'
  const textMuted = tone === 'dark' ? 'text-white/60' : 'text-slate-500'
  const textSubtle = tone === 'dark' ? 'text-white/40' : 'text-slate-400'
  const trackClass = tone === 'dark' ? 'bg-white/10' : 'bg-slate-200'

  return (
    <div className="w-full space-y-2 mt-4">
      <div className="flex justify-between items-center text-sm">
        <span className={`${textMuted} font-medium`}>Live Crowd</span>
        <span className={`${textPrimary} font-semibold`}>{percentage.toFixed(0)}% Capacity</span>
      </div>
      
      <div className={`h-2.5 w-full ${trackClass} rounded-full overflow-hidden`}>
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className={`flex justify-between text-xs ${textSubtle}`}>
        <span>Quiet</span>
        <span>Packed</span>
      </div>
    </div>
  )
}
