// Shared decorative ornaments in the Islamic/gold aesthetic.

export function GoldDivider({ className = '' }) {
  return (
    <div className={'flex items-center justify-center py-6 sm:py-10 ' + className} aria-hidden="true">
      <svg width="280" height="26" viewBox="0 0 280 26" fill="none" className="max-w-full">
        {/* Left dotted line */}
        <line x1="10"  y1="13" x2="100" y2="13" stroke="var(--color-gold)" strokeWidth="0.8" strokeDasharray="1 4" opacity="0.7" />
        {/* Left curled flourish */}
        <path d="M100 13 Q108 8, 118 13 T134 13" stroke="var(--color-gold)" strokeWidth="1" fill="none" />
        {/* Center 8-point star */}
        <g transform="translate(140,13)">
          <path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z"
                fill="var(--color-gold)" opacity="0.9" />
          <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z"
                fill="var(--color-cream)" opacity="0.85" />
        </g>
        {/* Right curled flourish */}
        <path d="M146 13 Q154 8, 164 13 T180 13" stroke="var(--color-gold)" strokeWidth="1" fill="none" />
        {/* Right dotted line */}
        <line x1="180" y1="13" x2="270" y2="13" stroke="var(--color-gold)" strokeWidth="0.8" strokeDasharray="1 4" opacity="0.7" />
      </svg>
    </div>
  )
}

export function CornerStar({ className = '' }) {
  return (
    <svg className={'w-12 h-12 pointer-events-none ' + className}
         viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M50 5 L61 39 L96 39 L67 60 L78 95 L50 74 L22 95 L33 60 L4 39 L39 39 Z"
            stroke="var(--color-gold)" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <path d="M50 15 L57 42 L84 42 L62 58 L70 85 L50 70 L30 85 L38 58 L16 42 L43 42 Z"
            stroke="var(--color-gold)" strokeWidth="0.8" fill="none" strokeLinejoin="round" opacity="0.6" />
    </svg>
  )
}
