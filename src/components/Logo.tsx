interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * MyDiary brand logo — an open journal with a creativity spark,
 * on a blue→violet gradient background.
 * Used in TopNav, favicon, and PWA manifest.
 */
const Logo = ({ size = 32, className = '' }: LogoProps) => {
  const id = 'logo-grad';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MyDiary logo"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        {/* Glow filter for the sparkle */}
        <filter id="logo-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rounded square background with gradient */}
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />

      {/* ── Open book body ── */}
      {/* Spine (center line) */}
      <line x1="16" y1="10" x2="16" y2="24" stroke="white" strokeWidth="1.2" strokeLinecap="round" />

      {/* Left page – slightly curved outward */}
      <path
        d="M15.2 10.5 C11 11 7.5 13 7.5 17 C7.5 21 11 22.5 15.2 23"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      {/* Left page lines (ruled lines) */}
      <line x1="9.5" y1="15" x2="14.5" y2="14.4" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
      <line x1="9.5" y1="17.5" x2="14.5" y2="17" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="20" x2="14.5" y2="19.6" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />

      {/* Right page – slightly curved outward */}
      <path
        d="M16.8 10.5 C21 11 24.5 13 24.5 17 C24.5 21 21 22.5 16.8 23"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Right page lines */}
      <line x1="17.5" y1="14.4" x2="22.5" y2="15" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
      <line x1="17.5" y1="17" x2="22.5" y2="17.5" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
      <line x1="17.5" y1="19.6" x2="22" y2="20" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />

      {/* ── 4-point sparkle / creativity spark on top ── */}
      <g filter="url(#logo-glow)">
        {/* Vertical arm */}
        <path d="M16 4 L16.55 6.6 L16 9.2 L15.45 6.6 Z" fill="white" />
        {/* Horizontal arm */}
        <path d="M13.4 6.6 L16 7.15 L18.6 6.6 L16 6.05 Z" fill="white" />
      </g>
    </svg>
  );
};

export default Logo;
