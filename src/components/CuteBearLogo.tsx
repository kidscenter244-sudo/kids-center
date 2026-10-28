import React from 'react';

interface CuteBearLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animate?: boolean;
  mood?: 'happy' | 'excited' | 'thinking' | 'sad';
}

export const CuteBearLogo: React.FC<CuteBearLogoProps> = ({
  size = 'md',
  className = '',
  animate = true,
  mood = 'happy',
}) => {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    '2xl': 'w-36 h-36',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}
      aria-label="Kids Center Pro Math Emblem Logo"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-lg transition-transform duration-300 ${
          animate ? 'hover:scale-105 active:scale-95' : ''
        }`}
      >
        <defs>
          {/* Outer Shield Gradient */}
          <linearGradient id="shieldGrad" x1="15" y1="10" x2="105" y2="115" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="0.5" stopColor="#059669" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>

          {/* Golden Rim Gradient */}
          <linearGradient id="goldRim" x1="20" y1="10" x2="100" y2="110" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.4" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>

          {/* Mask / Ninja Face Gradient */}
          <linearGradient id="heroFace" x1="60" y1="36" x2="60" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.8" stopColor="#F1F5F9" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Ninja Headband Gradient */}
          <linearGradient id="headbandGrad" x1="30" y1="35" x2="90" y2="45" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EF4444" />
            <stop offset="1" stopColor="#B91C1C" />
          </linearGradient>

          {/* Gloss overlay */}
          <linearGradient id="gloss" x1="60" y1="12" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* --- Outer Hexagonal Shield --- */}
        <polygon
          points="60,6 108,22 108,78 60,114 12,78 12,22"
          fill="url(#goldRim)"
          stroke="#78350F"
          strokeWidth="2.5"
        />

        {/* Inner Emerald Badge */}
        <polygon
          points="60,13 101,27 101,74 60,106 19,74 19,27"
          fill="url(#shieldGrad)"
          stroke="#064E3B"
          strokeWidth="2"
        />

        {/* Upper Gloss Highlight */}
        <path
          d="M60 14 L98 27 L98 48 C85 36 65 30 60 30 C55 30 35 36 22 48 L22 27 Z"
          fill="url(#gloss)"
        />

        {/* --- Soroban Calculation Frame Graphic (Subtle Abacus Grid Behind Hero) --- */}
        <line x1="28" y1="46" x2="92" y2="46" stroke="#FEF08A" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
        <line x1="28" y1="74" x2="92" y2="74" stroke="#FEF08A" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="34" cy="46" r="4.5" fill="#FACC15" stroke="#78350F" strokeWidth="1.5" />
        <circle cx="86" cy="46" r="4.5" fill="#FACC15" stroke="#78350F" strokeWidth="1.5" />
        <circle cx="34" cy="74" r="4.5" fill="#FACC15" stroke="#78350F" strokeWidth="1.5" />
        <circle cx="86" cy="74" r="4.5" fill="#FACC15" stroke="#78350F" strokeWidth="1.5" />

        {/* --- Math Hero Ears (Cute Panda / Bear Ninja Ears) --- */}
        <circle cx="38" cy="38" r="12" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="38" cy="38" r="6" fill="#334155" />
        <circle cx="82" cy="38" r="12" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="82" cy="38" r="6" fill="#334155" />

        {/* --- Hero Head --- */}
        <rect
          x="30"
          y="36"
          width="60"
          height="54"
          rx="27"
          fill="url(#heroFace)"
          stroke="#0F172A"
          strokeWidth="3.2"
        />

        {/* --- Red Focus Headband --- */}
        <rect
          x="28"
          y="42"
          width="64"
          height="13"
          rx="3"
          fill="url(#headbandGrad)"
          stroke="#7F1D1D"
          strokeWidth="1.8"
        />
        {/* Golden Math Star Emblem on Headband */}
        <circle cx="60" cy="48.5" r="5" fill="#FACC15" stroke="#78350F" strokeWidth="1" />
        <polygon
          points="60,45 61,47.5 64,47.5 61.5,49 62.5,52 60,50 57.5,52 58.5,49 56,47.5 59,47.5"
          fill="#B45309"
        />

        {/* Headband Tails Blowing on the Left */}
        <path d="M28 46 Q16 42 12 48 Q18 52 28 50 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.2" />

        {/* --- Big Expressive Anime Calculation Eyes --- */}
        {mood === 'sad' ? (
          <>
            <circle cx="46" cy="64" r="5.5" fill="#0F172A" />
            <circle cx="74" cy="64" r="5.5" fill="#0F172A" />
            <circle cx="44" cy="62" r="2" fill="#FFFFFF" />
            <circle cx="72" cy="62" r="2" fill="#FFFFFF" />
            <circle cx="42" cy="71" r="2.5" fill="#38BDF8" />
          </>
        ) : mood === 'excited' ? (
          <>
            <circle cx="46" cy="64" r="6.5" fill="#0F172A" />
            <circle cx="74" cy="64" r="6.5" fill="#0F172A" />
            {/* Star Sparkles in Eyes */}
            <polygon points="46,59 47.5,62.5 51,62.5 48,64.5 49.5,68 46,66 42.5,68 44,64.5 41,62.5 44.5,62.5" fill="#FDE047" />
            <polygon points="74,59 75.5,62.5 79,62.5 76,64.5 77.5,68 74,66 70.5,68 72,64.5 69,62.5 72.5,62.5" fill="#FDE047" />
            <circle cx="48" cy="62" r="2.2" fill="#FFFFFF" />
            <circle cx="76" cy="62" r="2.2" fill="#FFFFFF" />
          </>
        ) : (
          <>
            {/* Sharp Confident Focus Eyes */}
            <ellipse cx="46" cy="64" rx="5.5" ry="6.5" fill="#0F172A" />
            <ellipse cx="74" cy="64" rx="5.5" ry="6.5" fill="#0F172A" />
            <circle cx="44" cy="61" r="2.5" fill="#FFFFFF" />
            <circle cx="72" cy="61" r="2.5" fill="#FFFFFF" />
            <circle cx="48" cy="67" r="1.5" fill="#FFFFFF" />
            <circle cx="76" cy="67" r="1.5" fill="#FFFFFF" />
          </>
        )}

        {/* Rosy Cheeks */}
        <ellipse cx="36" cy="72" rx="4.5" ry="3" fill="#FB7185" opacity="0.8" />
        <ellipse cx="84" cy="72" rx="4.5" ry="3" fill="#FB7185" opacity="0.8" />

        {/* Cute Nose */}
        <ellipse cx="60" cy="68" rx="3.5" ry="2.5" fill="#0F172A" />

        {/* Confident Smile */}
        {mood === 'sad' ? (
          <path d="M54 78 Q60 74 66 78" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        ) : mood === 'excited' ? (
          <path d="M53 73 Q60 83 67 73 Z" fill="#EF4444" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
        ) : (
          <path d="M54 73 Q60 79 66 73" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" />
        )}

        {/* Golden Champion Star at Bottom Apex */}
        <g transform="translate(60, 102)">
          <polygon
            points="0,-8 2.5,-2.5 8,-2.5 3.5,1 5,7 0,3.5 -5,7 -3.5,1 -8,-2.5 -2.5,-2.5"
            fill="#FDE047"
            stroke="#B45309"
            strokeWidth="1.2"
          />
        </g>
      </svg>
    </div>
  );
};

// Re-export as PandaLogo alias
export const PandaLogo = CuteBearLogo;
