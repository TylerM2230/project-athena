interface AthenaLogoProps {
  className?: string;
}

export function AthenaLogo({ className = "h-8 w-8" }: AthenaLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300 ease-out group cursor-pointer`}
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
        className="transition-all duration-500 ease-out group-hover:fillOpacity-10 group-hover:stroke-[2]"
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
        className="transition-all duration-400 ease-out group-hover:fillOpacity-20 group-hover:stroke-[1.5]"
      />

      {/* Pupil - focused attention */}
      <circle
        cx="16"
        cy="16"
        r="2.5"
        fill="currentColor"
        className="transition-all duration-300 ease-out group-hover:r-[3]"
      />
      <circle
        cx="16"
        cy="16"
        r="1"
        fill="white"
        fillOpacity="0.8"
        className="transition-all duration-300 ease-out group-hover:r-[1.2] group-hover:fillOpacity-100"
      />
      
      {/* Strategic planning rays - 8 directions */}
      <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" className="transition-all duration-400 ease-out group-hover:strokeOpacity-90 group-hover:stroke-[2]">
        {/* Cardinal directions */}
        <line x1="16" y1="2" x2="16" y2="6" className="transition-all duration-500 ease-out group-hover:y1-[1] group-hover:y2-[7]" />
        <line x1="16" y1="26" x2="16" y2="30" className="transition-all duration-500 ease-out group-hover:y1-[25] group-hover:y2-[31]" />
        <line x1="2" y1="16" x2="6" y2="16" className="transition-all duration-500 ease-out group-hover:x1-[1] group-hover:x2-[7]" />
        <line x1="26" y1="16" x2="30" y2="16" className="transition-all duration-500 ease-out group-hover:x1-[25] group-hover:x2-[31]" />

        {/* Diagonal directions */}
        <line x1="6.34" y1="6.34" x2="9.17" y2="9.17" className="transition-all duration-600 ease-out group-hover:x1-[5.5] group-hover:y1-[5.5] group-hover:x2-[10] group-hover:y2-[10]" />
        <line x1="22.83" y1="22.83" x2="25.66" y2="25.66" className="transition-all duration-600 ease-out group-hover:x1-[22] group-hover:y1-[22] group-hover:x2-[26.5] group-hover:y2-[26.5]" />
        <line x1="25.66" y1="6.34" x2="22.83" y2="9.17" className="transition-all duration-600 ease-out group-hover:x1-[26.5] group-hover:y1-[5.5] group-hover:x2-[22] group-hover:y2-[10]" />
        <line x1="9.17" y1="22.83" x2="6.34" y2="25.66" className="transition-all duration-600 ease-out group-hover:x1-[10] group-hover:y1-[22] group-hover:x2-[5.5] group-hover:y2-[26.5]" />
      </g>
      
      {/* Knowledge nodes at cardinal points */}
      <circle cx="16" cy="4" r="1.5" fill="currentColor" fillOpacity="0.4" className="transition-all duration-400 ease-out group-hover:r-[2] group-hover:fillOpacity-70" />
      <circle cx="16" cy="28" r="1.5" fill="currentColor" fillOpacity="0.4" className="transition-all duration-500 ease-out group-hover:r-[2] group-hover:fillOpacity-70" />
      <circle cx="4" cy="16" r="1.5" fill="currentColor" fillOpacity="0.4" className="transition-all duration-450 ease-out group-hover:r-[2] group-hover:fillOpacity-70" />
      <circle cx="28" cy="16" r="1.5" fill="currentColor" fillOpacity="0.4" className="transition-all duration-550 ease-out group-hover:r-[2] group-hover:fillOpacity-70" />
      
      {/* Planning connections - subtle network */}
      <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" className="transition-all duration-700 ease-out group-hover:strokeOpacity-50 group-hover:stroke-[0.8]">
        <path d="M16 4 Q20 8 16 12" className="transition-all duration-800 ease-out group-hover:d-[M16_4_Q22_6_16_12]" />
        <path d="M28 16 Q24 12 20 16" className="transition-all duration-850 ease-out group-hover:d-[M28_16_Q26_10_20_16]" />
        <path d="M16 28 Q12 24 16 20" className="transition-all duration-900 ease-out group-hover:d-[M16_28_Q10_26_16_20]" />
        <path d="M4 16 Q8 20 12 16" className="transition-all duration-750 ease-out group-hover:d-[M4_16_Q6_22_12_16]" />
      </g>
    </svg>
  );
}