interface SevenSegmentDisplayProps {
  hours: number;
  minutes: number;
  seconds: number;
}

export function SevenSegmentDisplay({ hours, minutes, seconds }: SevenSegmentDisplayProps) {
  const formatNumber = (num: number): string => num.toString().padStart(2, '0');

  const SegmentDigit = ({ digit }: { digit: string }) => {
    const segments = {
      '0': [true, true, true, true, true, true, false],
      '1': [false, true, true, false, false, false, false],
      '2': [true, true, false, true, true, false, true],
      '3': [true, true, true, true, false, false, true],
      '4': [false, true, true, false, false, true, true],
      '5': [true, false, true, true, false, true, true],
      '6': [true, false, true, true, true, true, true],
      '7': [true, true, true, false, false, false, false],
      '8': [true, true, true, true, true, true, true],
      '9': [true, true, true, true, false, true, true]
    };

    const activeSegments = segments[digit as keyof typeof segments] || [false, false, false, false, false, false, false];

    return (
      <div className="relative w-12 h-16 mx-1">
        <svg viewBox="0 0 40 60" className="w-full h-full">
          {/* Top */}
          <path
            d="M8 2 L32 2 L28 6 L12 6 Z"
            className={`${activeSegments[0] ? 'fill-term-accent' : 'fill-term-border opacity-20'} transition-all duration-300`}
            style={{ filter: activeSegments[0] ? 'drop-shadow(0 0 2px currentColor)' : undefined }}
          />
          {/* Top Right */}
          <path
            d="M34 4 L34 26 L30 22 L30 8 Z"
            className={`${activeSegments[1] ? 'fill-term-accent' : 'fill-term-border opacity-20'} transition-all duration-300`}
            style={{ filter: activeSegments[1] ? 'drop-shadow(0 0 2px currentColor)' : undefined }}
          />
          {/* Bottom Right */}
          <path
            d="M34 32 L34 54 L30 50 L30 36 Z"
            className={`${activeSegments[2] ? 'fill-term-accent' : 'fill-term-border opacity-20'} transition-all duration-300`}
            style={{ filter: activeSegments[2] ? 'drop-shadow(0 0 2px currentColor)' : undefined }}
          />
          {/* Bottom */}
          <path
            d="M32 56 L8 56 L12 52 L28 52 Z"
            className={`${activeSegments[3] ? 'fill-term-accent' : 'fill-term-border opacity-20'} transition-all duration-300`}
            style={{ filter: activeSegments[3] ? 'drop-shadow(0 0 2px currentColor)' : undefined }}
          />
          {/* Bottom Left */}
          <path
            d="M6 54 L6 32 L10 36 L10 50 Z"
            className={`${activeSegments[4] ? 'fill-term-accent' : 'fill-term-border opacity-20'} transition-all duration-300`}
            style={{ filter: activeSegments[4] ? 'drop-shadow(0 0 2px currentColor)' : undefined }}
          />
          {/* Top Left */}
          <path
            d="M6 26 L6 4 L10 8 L10 22 Z"
            className={`${activeSegments[5] ? 'fill-term-accent' : 'fill-term-border opacity-20'} transition-all duration-300`}
            style={{ filter: activeSegments[5] ? 'drop-shadow(0 0 2px currentColor)' : undefined }}
          />
          {/* Middle */}
          <path
            d="M8 30 L12 26 L28 26 L32 30 L28 34 L12 34 Z"
            className={`${activeSegments[6] ? 'fill-term-accent' : 'fill-term-border opacity-20'} transition-all duration-300`}
            style={{ filter: activeSegments[6] ? 'drop-shadow(0 0 2px currentColor)' : undefined }}
          />
        </svg>
      </div>
    );
  };

  const Colon = () => (
    <div className="flex flex-col justify-center items-center h-16 mx-2">
      <div className="w-1.5 h-1.5 bg-term-accent rounded-full mb-2 animate-pulse"></div>
      <div className="w-1.5 h-1.5 bg-term-accent rounded-full animate-pulse"></div>
    </div>
  );

  const timeString = `${formatNumber(hours)}${formatNumber(minutes)}${formatNumber(seconds)}`;

  return (
    <div className="flex items-center justify-center bg-term-bg-secondary rounded-lg p-4 border border-term-border">
      <div className="flex items-center">
        <SegmentDigit digit={timeString[0]} />
        <SegmentDigit digit={timeString[1]} />
        <Colon />
        <SegmentDigit digit={timeString[2]} />
        <SegmentDigit digit={timeString[3]} />
        <Colon />
        <SegmentDigit digit={timeString[4]} />
        <SegmentDigit digit={timeString[5]} />
      </div>
    </div>
  );
}