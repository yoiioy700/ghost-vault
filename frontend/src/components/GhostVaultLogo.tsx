export function GhostVaultLogo({ className = "w-5 h-5", glow = false }: { className?: string, glow?: boolean }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      fill="none" 
      className={className}
    >
      {glow && (
        <g>
          <defs>
            <radialGradient id="ghostGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#ghostGlow)" />
        </g>
      )}
      
      {/* Ghost Outline */}
      <path 
        d="M 50 10 
           C 70 10, 80 20, 80 40 
           V 65 
           Q 80 75, 85 85 
           Q 67.5 72, 50 85 
           Q 32.5 72, 15 85 
           Q 20 75, 20 65 
           V 40 
           C 20 20, 30 10, 50 10 
           Z" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Eyes */}
      <circle cx="36" cy="30" r="4.5" fill="currentColor" />
      <circle cx="64" cy="30" r="4.5" fill="currentColor" />
      
      {/* Safe Dial Group */}
      <g>
        {/* Outer Ring */}
        <circle cx="50" cy="62" r="16" stroke="currentColor" strokeWidth="5" />
        
        {/* Inner Knob */}
        <circle cx="50" cy="62" r="6" stroke="currentColor" strokeWidth="3" />
        <circle cx="50" cy="62" r="2.5" fill="currentColor" />
        
        {/* Tick Marks */}
        <circle 
          cx="50" 
          cy="62" 
          r="10.5" 
          stroke="currentColor" 
          strokeWidth="3.5" 
          pathLength="160" 
          strokeDasharray="2.5 7.5"
          strokeDashoffset="1.25"
        />
        
        {/* Pointer (Pointing to the top of the outer ring) */}
        <path d="M50 42 L45 34 L55 34 Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth="1" />
      </g>
    </svg>
  );
}
