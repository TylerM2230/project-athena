import { useState } from 'react';
import { Clock, Timer, Zap } from 'lucide-react';
import { useEndOfDayCountdown } from '../../hooks/useEndOfDayCountdown';
import { SevenSegmentDisplay } from './SevenSegmentDisplay';
import { AnalogClock } from './AnalogClock';
import { NixieTubeDisplay } from './NixieTubeDisplay';

export function TimeCountdownCard() {
  const { hours, minutes, seconds, totalSeconds } = useEndOfDayCountdown();
  const [displayMode, setDisplayMode] = useState<'digital' | 'analog' | 'nixie'>('digital');

  const formatTime = (value: number, unit: string): string => {
    return `${value} ${unit}${value !== 1 ? 's' : ''}`;
  };

  const getTimePhrase = (): string => {
    if (totalSeconds === 0) return "The day has ended";
    
    const parts = [];
    if (hours > 0) parts.push(formatTime(hours, 'hour'));
    if (minutes > 0) parts.push(formatTime(minutes, 'min'));
    if (seconds > 0) parts.push(formatTime(seconds, 'sec'));
    
    return parts.join(', ');
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono text-term-text">
          finite time
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDisplayMode('digital')}
            className={`p-2 rounded-md transition-colors border ${
              displayMode === 'digital' 
                ? 'border-term-accent text-term-accent bg-transparent' 
                : 'border-transparent text-term-text-dim hover:text-term-text hover:border-term-text-dim'
            }`}
            title="Seven-segment display"
          >
            <Timer size={16} />
          </button>
          <button
            onClick={() => setDisplayMode('analog')}
            className={`p-2 rounded-md transition-colors border ${
              displayMode === 'analog' 
                ? 'border-term-accent text-term-accent bg-transparent' 
                : 'border-transparent text-term-text-dim hover:text-term-text hover:border-term-text-dim'
            }`}
            title="Analog clock"
          >
            <Clock size={16} />
          </button>
          <button
            onClick={() => setDisplayMode('nixie')}
            className={`p-2 rounded-md transition-colors border ${
              displayMode === 'nixie' 
                ? 'border-term-accent text-term-accent bg-transparent' 
                : 'border-transparent text-term-text-dim hover:text-term-text hover:border-term-text-dim'
            }`}
            title="Nixie tube display"
          >
            <Zap size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Philosophical message */}
        <div className="text-center">
          <p className="font-mono text-sm text-term-text-dim mb-2">
            you have
          </p>
          <p className="font-mono text-lg text-term-text">
            {getTimePhrase()}
          </p>
          <p className="font-mono text-sm text-term-text-dim mt-2">
            left in this day
          </p>
        </div>

        {/* Time display */}
        <div className="flex justify-center">
          {displayMode === 'digital' ? (
            <SevenSegmentDisplay 
              hours={hours} 
              minutes={minutes} 
              seconds={seconds} 
            />
          ) : displayMode === 'analog' ? (
            <AnalogClock 
              hours={hours} 
              minutes={minutes} 
              seconds={seconds}
              totalSeconds={totalSeconds}
            />
          ) : (
            <NixieTubeDisplay 
              hours={hours} 
              minutes={minutes} 
              seconds={seconds} 
            />
          )}
        </div>

        {/* Meditation text */}
        <div className="text-center pt-4 border-t border-term-border">
          <p className="font-mono text-xs text-term-text-dim italic">
            a reminder of our beautiful finitude
          </p>
        </div>
      </div>
    </div>
  );
}