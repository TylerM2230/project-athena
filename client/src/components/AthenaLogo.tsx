interface AthenaLogoProps {
  className?: string;
}

export function AthenaLogo({ className = "h-8 w-8" }: AthenaLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Central wisdom eye */}
      <circle
        cx="16"
        cy="16"
        r="10"
        fill="currentColor"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      
      {/* Inner eye representing insight */}
      <circle
        cx="16"
        cy="16"
        r="6"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1"
      />
      
      {/* Pupil - focused attention */}
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="white" fillOpacity="0.8" />
      
      {/* Strategic planning rays - 8 directions */}
      <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6">
        {/* Cardinal directions */}
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="16" y1="26" x2="16" y2="30" />
        <line x1="2" y1="16" x2="6" y2="16" />
        <line x1="26" y1="16" x2="30" y2="16" />
        
        {/* Diagonal directions */}
        <line x1="6.34" y1="6.34" x2="9.17" y2="9.17" />
        <line x1="22.83" y1="22.83" x2="25.66" y2="25.66" />
        <line x1="25.66" y1="6.34" x2="22.83" y2="9.17" />
        <line x1="9.17" y1="22.83" x2="6.34" y2="25.66" />
      </g>
      
      {/* Knowledge nodes at cardinal points */}
      <circle cx="16" cy="4" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="16" cy="28" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="4" cy="16" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="28" cy="16" r="1.5" fill="currentColor" fillOpacity="0.4" />
      
      {/* Planning connections - subtle network */}
      <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2">
        <path d="M16 4 Q20 8 16 12" />
        <path d="M28 16 Q24 12 20 16" />
        <path d="M16 28 Q12 24 16 20" />
        <path d="M4 16 Q8 20 12 16" />
      </g>
    </svg>
  );
}