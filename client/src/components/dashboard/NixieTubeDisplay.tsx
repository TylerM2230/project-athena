interface NixieTubeDisplayProps {
  hours: number;
  minutes: number;
  seconds: number;
}

export function NixieTubeDisplay({ hours, minutes, seconds }: NixieTubeDisplayProps) {
  const formatNumber = (num: number): string => num.toString().padStart(2, '0');

  const NixieTube = ({ digit, isActive = true }: { digit: string; isActive?: boolean }) => {
    const allDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    return (
      <div className="relative w-16 h-20 mx-1">
        {/* Outer tube glass with warm tint */}
        <div className="absolute inset-0 rounded-lg border-2 border-amber-900/40 bg-gradient-to-b from-amber-950/20 to-orange-950/10 shadow-xl backdrop-blur-sm">
          {/* Inner glass reflection */}
          <div className="absolute top-2 left-2 right-4 h-8 bg-gradient-to-r from-amber-200/20 to-transparent rounded-full blur-sm"></div>
          {/* Warm ambient glow inside tube */}
          <div className="absolute inset-1 rounded-lg bg-gradient-to-b from-orange-500/8 to-amber-600/5"></div>
          {/* Side reflection */}
          <div className="absolute top-4 left-1 bottom-4 w-1 bg-gradient-to-b from-amber-200/25 to-transparent rounded-full blur-[1px]"></div>
        </div>
        
        {/* Tube base with warm metallic finish */}
        <div className="absolute bottom-0 left-2 right-2 h-3 bg-gradient-to-t from-amber-900 to-amber-700 rounded-b-lg border-t border-amber-600/50 shadow-inner"></div>
        
        {/* Cathode grid (background wire mesh effect) */}
        <div className="absolute inset-2 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 48%, rgba(255, 140, 0, 0.3) 49%, rgba(255, 140, 0, 0.3) 51%, transparent 52%),
              linear-gradient(90deg, transparent 48%, rgba(255, 140, 0, 0.3) 49%, rgba(255, 140, 0, 0.3) 51%, transparent 52%)
            `,
            backgroundSize: '3px 3px'
          }}></div>
        </div>
        
        {/* Background mask for inactive digits */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 rounded-lg"></div>
        </div>

        {/* All digit elements stacked */}
        <div className="absolute inset-0 flex items-center justify-center">
          {allDigits.map((d) => {
            const isLit = d === digit && isActive;
            return (
              <div
                key={d}
                className={`absolute font-mono text-4xl font-bold transition-all duration-500 select-none ${
                  isLit 
                    ? 'text-orange-400 opacity-100 scale-110 z-20' 
                    : 'text-gray-500 opacity-35 scale-85 z-10'
                }`}
                style={{
                  textShadow: isLit 
                    ? '0 0 4px #ff8c00, 0 0 8px #ff8c00, 0 0 12px #ff8c00, 0 0 16px #ff8c00, 0 0 24px #ff6600, 0 0 32px #ff6600' 
                    : '0 0 2px rgba(0, 0, 0, 0.8)',
                  filter: isLit 
                    ? 'brightness(1.8) saturate(1.8) contrast(1.3) hue-rotate(-10deg)' 
                    : 'brightness(0.15) saturate(0.2) blur(0.5px)',
                  fontWeight: isLit ? '900' : '200',
                  color: isLit ? '#ff8c00' : '#3a4a5a',
                  letterSpacing: isLit ? '0.5px' : '0px',
                  textStroke: isLit ? 'none' : '0.5px rgba(0, 0, 0, 0.3)'
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
        
        {/* Enhanced anode glow effect for active digit */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Outer warm glow */}
            <div 
              className="absolute inset-1 rounded-lg opacity-35"
              style={{
                background: 'radial-gradient(ellipse at center, #ff8c00 0%, rgba(255, 140, 0, 0.4) 30%, rgba(255, 102, 0, 0.2) 60%, transparent 85%)',
                filter: 'blur(8px)'
              }}
            ></div>
            {/* Inner bright core */}
            <div 
              className="absolute inset-3 rounded-lg opacity-50"
              style={{
                background: 'radial-gradient(circle at center, #ffaa00 0%, rgba(255, 170, 0, 0.6) 40%, transparent 70%)',
                filter: 'blur(3px)'
              }}
            ></div>
            {/* Central bright spot */}
            <div 
              className="absolute inset-6 rounded-lg opacity-40"
              style={{
                background: 'radial-gradient(circle at center, #ffcc44 0%, rgba(255, 204, 68, 0.8) 30%, transparent 60%)',
                filter: 'blur(1px)'
              }}
            ></div>
          </div>
        )}
        
        {/* Tube pins at bottom */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-0.5 h-2 bg-amber-600 rounded-full shadow-sm"></div>
          ))}
        </div>
      </div>
    );
  };

  const NixieSeparator = ({ symbol }: { symbol: string }) => (
    <div className="relative w-8 h-20 mx-2 flex items-center justify-center">
      {/* Glass envelope for separator */}
      <div className="absolute inset-0 w-6 rounded-lg border border-term-border bg-gradient-to-b from-term-bg-alt/10 to-term-bg/5 shadow-md mx-auto">
        {/* Tube base */}
        <div className="absolute bottom-0 left-1 right-1 h-2 bg-gradient-to-t from-gray-800 to-gray-600 rounded-b-lg border-t border-gray-500"></div>
      </div>
      
      {/* Glowing separator symbol */}
      <div 
        className="relative z-10 font-mono text-2xl font-bold text-orange-400"
        style={{
          textShadow: '0 0 4px #ff8c00, 0 0 8px #ff8c00, 0 0 12px #ff6600',
          filter: 'brightness(1.5) saturate(1.4)',
          color: '#ff8c00'
        }}
      >
        {symbol}
      </div>
      
      {/* Small pins */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="w-0.5 h-1.5 bg-gray-400 rounded-full"></div>
        ))}
      </div>
    </div>
  );

  const timeString = `${formatNumber(hours)}${formatNumber(minutes)}${formatNumber(seconds)}`;

  return (
    <div className="bg-gradient-to-b from-amber-950/20 to-orange-950/10 rounded-lg p-6 border border-amber-900/30 shadow-2xl">
      {/* Control panel header */}
      <div className="mb-4 flex justify-center">
        <div className="bg-gradient-to-b from-amber-900/20 to-orange-900/15 px-4 py-1 rounded border border-amber-800/40">
          <span className="text-xs font-mono text-amber-400 tracking-wider">NIXIE CHRONOMETER</span>
        </div>
      </div>
      
      {/* Main tube assembly */}
      <div className="flex items-center justify-center mb-4">
        <div className="bg-gradient-to-b from-amber-950/15 to-orange-950/10 p-4 rounded-lg border border-amber-900/40 shadow-inner">
          <div className="flex items-center">
            {/* Hours */}
            <NixieTube digit={timeString[0]} />
            <NixieTube digit={timeString[1]} />
            
            {/* Hours:Minutes separator */}
            <NixieSeparator symbol=":" />
            
            {/* Minutes */}
            <NixieTube digit={timeString[2]} />
            <NixieTube digit={timeString[3]} />
            
            {/* Minutes:Seconds separator */}
            <NixieSeparator symbol=":" />
            
            {/* Seconds */}
            <NixieTube digit={timeString[4]} />
            <NixieTube digit={timeString[5]} />
          </div>
        </div>
      </div>
      

    </div>
  );
}