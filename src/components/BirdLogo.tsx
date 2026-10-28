import React from 'react';

interface BirdLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  animate?: boolean;
}

export const BirdLogo: React.FC<BirdLogoProps> = ({
  size = 'md',
  className = '',
  animate = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    hero: 'w-36 h-36 sm:w-44 sm:h-44',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${animate ? 'animate-bounce' : ''} ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-md select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow drop-shadow circle behind */}
        <ellipse cx="60" cy="112" rx="35" ry="6" fill="#000000" opacity="0.15" />

        {/* Bird Wings */}
        <ellipse cx="22" cy="68" rx="14" ry="20" fill="#4ade80" transform="rotate(-15 22 68)" />
        <ellipse cx="98" cy="68" rx="14" ry="20" fill="#4ade80" transform="rotate(15 98 68)" />
        <ellipse cx="26" cy="68" rx="9" ry="15" fill="#22c55e" transform="rotate(-15 26 68)" />
        <ellipse cx="94" cy="68" rx="9" ry="15" fill="#22c55e" transform="rotate(15 94 68)" />

        {/* Bird Main Body (Vibrant friendly green like Duo style) */}
        <rect x="25" y="24" width="70" height="76" rx="35" fill="#58cc02" />

        {/* Lighter Green Belly */}
        <ellipse cx="60" cy="74" rx="24" ry="22" fill="#8ee000" />

        {/* Head Feathers Crest */}
        <path d="M52 24 C52 14 60 12 60 12 C60 12 68 14 68 24 Z" fill="#58cc02" />
        <path d="M60 22 C60 10 68 8 68 8 C68 8 74 12 72 22 Z" fill="#46a302" />

        {/* Huge Friendly Eyes - Outer White Rings */}
        <circle cx="43" cy="48" r="16" fill="#FFFFFF" />
        <circle cx="77" cy="48" r="16" fill="#FFFFFF" />

        {/* Iris / Pupils */}
        <circle cx="45" cy="48" r="9.5" fill="#1e293b" />
        <circle cx="75" cy="48" r="9.5" fill="#1e293b" />

        {/* White Eye Highlights (Sparkle) */}
        <circle cx="48" cy="45" r="3.5" fill="#FFFFFF" />
        <circle cx="78" cy="45" r="3.5" fill="#FFFFFF" />
        <circle cx="42" cy="51" r="1.5" fill="#FFFFFF" />
        <circle cx="72" cy="51" r="1.5" fill="#FFFFFF" />

        {/* Cute Orange Beak */}
        <path
          d="M50 56 Q60 52 70 56 Q60 74 50 56 Z"
          fill="#ff9600"
          stroke="#e07500"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Tiny Cheek Blushes */}
        <ellipse cx="29" cy="60" rx="4.5" ry="3" fill="#f87171" opacity="0.6" />
        <ellipse cx="91" cy="60" rx="4.5" ry="3" fill="#f87171" opacity="0.6" />

        {/* Bird Feet */}
        <path d="M44 98 L40 108 M44 98 L44 108 M44 98 L48 108" stroke="#ff9600" strokeWidth="3" strokeLinecap="round" />
        <path d="M76 98 L72 108 M76 98 L76 108 M76 98 L80 108" stroke="#ff9600" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};
