import React from 'react';
import { useCrowd } from '../../hooks/useCrowd';
import { getCrowdLevel, getCrowdLevelColor } from '../../services/crowdService';

interface CrowdOMeterProps {
  eventId: string;
}

/**
 * CROWD-O-METER COMPONENT
 * 
 * Real-time crowd visualization
 * ✅ Accurate: Only counts checked-in attendees
 * ✅ Live: WebSocket updates every 2 seconds
 * ✅ Visual: Color-coded levels
 */
const CrowdOMeter: React.FC<CrowdOMeterProps> = ({ eventId }) => {
  const { crowd, loading, error } = useCrowd(eventId);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-center text-gray-500">Loading crowd data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-center text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!crowd) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-center text-gray-500">No crowd data available</p>
      </div>
    );
  }

  const crowdLevel = getCrowdLevel(crowd.percentage);
  const crowdColor = getCrowdLevelColor(crowd.percentage);
  const isFull = crowd.percentage >= 100;

  // Status messages
  const statusMessages: Record<string, string> = {
    empty: '📍 Plenty of space available',
    low: '👥 Light crowd',
    medium: '👥👥 Getting busy',
    high: '👥👥👥 Very crowded',
    full: '🚫 Event is at capacity',
  };

  return (
    <div
      className="p-6 rounded-lg border shadow-sm transition-all"
      style={{
        backgroundColor: `${crowdColor}10`, // 10% opacity
        borderColor: crowdColor,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Crowd Level</h3>
        {isFull && <span className="text-sm px-2 py-1 bg-red-600 text-white rounded font-bold">FULL</span>}
      </div>

      {/* Main Meter */}
      <div className="mb-6">
        {/* Percentage Circle */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-4xl font-bold" style={{ color: crowdColor }}>
              {crowd.percentage}%
            </div>
            <p className="text-sm text-gray-600 mt-1">{statusMessages[crowdLevel]}</p>
          </div>

          {/* Mini Stats */}
          <div className="text-right text-sm">
            <p className="font-semibold text-gray-900">{crowd.current_count}</p>
            <p className="text-gray-600">attending</p>
            <p className="text-gray-500 text-xs mt-1">Cap: {crowd.capacity}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.min(crowd.percentage, 100)}%`,
              backgroundColor: crowdColor,
            }}
          />
        </div>
      </div>

      {/* Level Indicator */}
      <div className="flex gap-2 justify-between text-xs">
        {(['empty', 'low', 'medium', 'high', 'full'] as const).map((level) => (
          <div
            key={level}
            className={`flex-1 text-center py-2 rounded font-medium transition-opacity ${
              crowdLevel === level ? 'opacity-100 font-bold' : 'opacity-50'
            }`}
            style={{
              backgroundColor: `${getCrowdLevelColor(
                level === 'empty'
                  ? 0
                  : level === 'low'
                    ? 12
                    : level === 'medium'
                      ? 37
                      : level === 'high'
                        ? 70
                        : 100
              )}20`,
              color: getCrowdLevelColor(
                level === 'empty'
                  ? 0
                  : level === 'low'
                    ? 12
                    : level === 'medium'
                      ? 37
                      : level === 'high'
                        ? 70
                        : 100
              ),
            }}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </div>
        ))}
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated:{' '}
          {new Date(crowd.updated_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export default CrowdOMeter;
