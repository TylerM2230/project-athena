interface AnalogClockProps {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function AnalogClock({ hours, minutes, seconds }: AnalogClockProps) {
  // Calculate angles for smooth hand movement
  // Since we're counting down to end of day, we need to show remaining time
  const secondAngle = (seconds / 60) * 360;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
  const hourAngle = ((hours + (minutes + seconds / 60) / 60) / 24) * 360;

  // Generate hour markers
  const hourMarkers = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15) - 90; // 24 hours = 15 degrees each, offset by -90 to start at top
    const isMainHour = i % 6 === 0; // Mark every 6 hours (0, 6, 12, 18)
    const outerRadius = isMainHour ? 85 : 90;
    const innerRadius = isMainHour ? 75 : 82;
    
    const x1 = 100 + outerRadius * Math.cos(angle * Math.PI / 180);
    const y1 = 100 + outerRadius * Math.sin(angle * Math.PI / 180);
    const x2 = 100 + innerRadius * Math.cos(angle * Math.PI / 180);
    const y2 = 100 + innerRadius * Math.sin(angle * Math.PI / 180);

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth={isMainHour ? "2" : "1"}
        className={isMainHour ? "text-term-text" : "text-term-text-dim"}
      />
    );
  });

  return (
    <div className="flex items-center justify-center bg-term-bg-secondary rounded-lg p-4 border border-term-border">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-sm">
          {/* Clock face */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="2"
            className="text-term-border"
          />
          
          {/* Hour markers */}
          <g className="opacity-80">
            {hourMarkers}
          </g>
          
          {/* Hour numbers */}
          <g className="text-xs font-mono fill-current text-term-text">
            <text x="100" y="20" textAnchor="middle" dominantBaseline="middle">0</text>
            <text x="170" y="35" textAnchor="middle" dominantBaseline="middle">6</text>
            <text x="100" y="185" textAnchor="middle" dominantBaseline="middle">12</text>
            <text x="30" y="35" textAnchor="middle" dominantBaseline="middle">18</text>
          </g>

          {/* Hour hand */}
          <line
            x1="100"
            y1="100"
            x2={100 + 45 * Math.cos((hourAngle - 90) * Math.PI / 180)}
            y2={100 + 45 * Math.sin((hourAngle - 90) * Math.PI / 180)}
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-term-accent transition-transform duration-1000 ease-in-out"
            style={{ 
              transformOrigin: '100px 100px',
              filter: 'drop-shadow(0 0 3px currentColor)'
            }}
          />

          {/* Minute hand */}
          <line
            x1="100"
            y1="100"
            x2={100 + 65 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
            y2={100 + 65 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-term-info transition-transform duration-1000 ease-in-out"
            style={{ 
              transformOrigin: '100px 100px',
              filter: 'drop-shadow(0 0 2px currentColor)'
            }}
          />

          {/* Second hand */}
          <line
            x1="100"
            y1="100"
            x2={100 + 75 * Math.cos((secondAngle - 90) * Math.PI / 180)}
            y2={100 + 75 * Math.sin((secondAngle - 90) * Math.PI / 180)}
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            className="text-term-text transition-transform duration-75 ease-out"
            style={{ 
              transformOrigin: '100px 100px',
              filter: 'drop-shadow(0 0 1px currentColor)'
            }}
          />

          {/* Center dot */}
          <circle
            cx="100"
            cy="100"
            r="4"
            fill="currentColor"
            className="text-term-accent"
            style={{ filter: 'drop-shadow(0 0 2px currentColor)' }}
          />
        </svg>
        
        {/* Time display overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-term-bg bg-opacity-80 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono text-term-text border border-term-border mt-8">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
}