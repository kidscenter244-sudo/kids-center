import React from 'react';

export interface HumanAvatarInfo {
  id: string;
  name: string;
  role: string;
  bgGradient: string;
  badgeEmoji: string;
}

export const HUMAN_AVATARS: HumanAvatarInfo[] = [
  {
    id: 'avatar_alex',
    name: 'Alex',
    role: 'Math Ninja',
    bgGradient: 'from-emerald-400 to-teal-600',
    badgeEmoji: '🥋',
  },
  {
    id: 'avatar_leo',
    name: 'Leo',
    role: 'Soroban Champ',
    bgGradient: 'from-blue-500 to-indigo-600',
    badgeEmoji: '⚡',
  },
  {
    id: 'avatar_maya',
    name: 'Maya',
    role: 'Speed Calculator',
    bgGradient: 'from-amber-400 to-orange-500',
    badgeEmoji: '⭐',
  },
  {
    id: 'avatar_emma',
    name: 'Emma',
    role: 'Logic Prodigy',
    bgGradient: 'from-purple-500 to-pink-500',
    badgeEmoji: '🎯',
  },
  {
    id: 'avatar_sam',
    name: 'Sam',
    role: 'Cosmic Genius',
    bgGradient: 'from-cyan-500 to-blue-600',
    badgeEmoji: '🚀',
  },
  {
    id: 'avatar_jin',
    name: 'Jin',
    role: 'Panda Sensei',
    bgGradient: 'from-green-500 to-emerald-700',
    badgeEmoji: '🐼',
  },
];

interface StudentAvatarProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  equippedHat?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  avatarId = 'avatar_alex',
  size = 'md',
  className = '',
  equippedHat,
}) => {
  const sizeMap = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 text-2xl',
  };

  const current = HUMAN_AVATARS.find((a) => a.id === avatarId) || HUMAN_AVATARS[0];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-sm border-2 border-white/60 overflow-hidden shrink-0 select-none bg-gradient-to-tr ${current.bgGradient} ${sizeMap[size]} ${className}`}
    >
      {/* SVG Human Portrait */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Subtle background glow */}
        <circle cx="50" cy="50" r="46" fill="white" fillOpacity="0.12" />

        {/* Neck */}
        <rect x="42" y="60" width="16" height="18" rx="4" fill="#FDBA74" />

        {/* Shirt Collar / Hoodie */}
        {current.id === 'avatar_alex' && (
          // Ninja collar
          <path d="M24 88 Q50 68 76 88 L80 100 L20 100 Z" fill="#0F172A" />
        )}
        {current.id === 'avatar_leo' && (
          // Blue hoodie
          <path d="M22 86 Q50 66 78 86 L82 100 L18 100 Z" fill="#1E3A8A" />
        )}
        {current.id === 'avatar_maya' && (
          // Orange jacket
          <path d="M22 86 Q50 66 78 86 L82 100 L18 100 Z" fill="#EA580C" />
        )}
        {current.id === 'avatar_emma' && (
          // Purple sweatshirt
          <path d="M22 86 Q50 66 78 86 L82 100 L18 100 Z" fill="#7E22CE" />
        )}
        {current.id === 'avatar_sam' && (
          // Cosmic flight suit
          <path d="M22 86 Q50 66 78 86 L82 100 L18 100 Z" fill="#0284C7" />
        )}
        {current.id === 'avatar_jin' && (
          // Green master tunic
          <path d="M22 86 Q50 66 78 86 L82 100 L18 100 Z" fill="#15803D" />
        )}

        {/* Head */}
        <circle cx="50" cy="46" r="24" fill="#FED7AA" />

        {/* Hair Styles */}
        {current.id === 'avatar_alex' && (
          // Dark spiky ninja hair
          <path
            d="M26 44 C26 26, 42 16, 50 16 C60 16, 74 26, 74 44 C72 34, 62 26, 50 26 C38 26, 28 34, 26 44 Z"
            fill="#1E293B"
          />
        )}
        {current.id === 'avatar_leo' && (
          // Sleek brown side-swept hair
          <path
            d="M25 42 C24 24, 40 16, 55 16 C74 16, 75 30, 75 42 C68 30, 58 24, 44 24 C32 24, 27 34, 25 42 Z"
            fill="#78350F"
          />
        )}
        {current.id === 'avatar_maya' && (
          // Cute twin-tails / high bun
          <g>
            <circle cx="28" cy="24" r="9" fill="#9A3412" />
            <circle cx="72" cy="24" r="9" fill="#9A3412" />
            <path
              d="M25 44 C25 24, 40 18, 50 18 C60 18, 75 24, 75 44 C70 32, 60 26, 50 26 C40 26, 30 32, 25 44 Z"
              fill="#C2410C"
            />
          </g>
        )}
        {current.id === 'avatar_emma' && (
          // Purple long wavy hair + bangs
          <path
            d="M24 48 C22 28, 38 16, 50 16 C62 16, 78 28, 76 48 C72 32, 64 26, 50 26 C36 26, 28 32, 24 48 Z"
            fill="#4C1D95"
          />
        )}
        {current.id === 'avatar_sam' && (
          // Blonde buzz/textured hair
          <path
            d="M26 42 C26 24, 40 18, 50 18 C60 18, 74 24, 74 42 C70 30, 60 25, 50 25 C40 25, 30 30, 26 42 Z"
            fill="#F59E0B"
          />
        )}
        {current.id === 'avatar_jin' && (
          // Black topknot hair
          <g>
            <circle cx="50" cy="16" r="7" fill="#0F172A" />
            <path
              d="M26 42 C26 24, 40 20, 50 20 C60 20, 74 24, 74 42 C70 30, 60 26, 50 26 C40 26, 30 30, 26 42 Z"
              fill="#0F172A"
            />
          </g>
        )}

        {/* Eyes */}
        <circle cx="42" cy="46" r="3.2" fill="#0F172A" />
        <circle cx="43" cy="45" r="1" fill="#FFFFFF" />
        <circle cx="58" cy="46" r="3.2" fill="#0F172A" />
        <circle cx="59" cy="45" r="1" fill="#FFFFFF" />

        {/* Eyebrows */}
        <path d="M38 40 Q42 38 46 41" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M54 41 Q58 38 62 40" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />

        {/* Glasses for Leo */}
        {current.id === 'avatar_leo' && (
          <g stroke="#2563EB" strokeWidth="2" fill="none">
            <rect x="36" y="40" width="12" height="11" rx="3" />
            <rect x="52" y="40" width="12" height="11" rx="3" />
            <path d="M48 45 L52 45" />
          </g>
        )}

        {/* Rosy Cheeks */}
        <circle cx="36" cy="52" r="3" fill="#FB7185" fillOpacity="0.5" />
        <circle cx="64" cy="52" r="3" fill="#FB7185" fillOpacity="0.5" />

        {/* Smile */}
        <path d="M44 55 Q50 61 56 55" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />

        {/* Ninja Headband for Alex */}
        {current.id === 'avatar_alex' && (
          <g>
            <rect x="25" y="32" width="50" height="7" rx="2" fill="#DC2626" />
            <circle cx="50" cy="35.5" r="2.5" fill="#F8FAFC" />
          </g>
        )}

        {/* Headphones for Emma */}
        {current.id === 'avatar_emma' && (
          <g>
            <path d="M22 46 C22 28, 78 28, 78 46" stroke="#EC4899" strokeWidth="3" fill="none" />
            <rect x="20" y="42" width="6" height="14" rx="3" fill="#DB2777" />
            <rect x="74" y="42" width="6" height="14" rx="3" fill="#DB2777" />
          </g>
        )}
      </svg>

      {/* Equipped Accessories / Hats overlay */}
      {equippedHat === 'golden_crown' && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-sm sm:text-base pointer-events-none drop-shadow-md">
          👑
        </span>
      )}
      {equippedHat === 'grad_cap' && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-sm sm:text-base pointer-events-none drop-shadow-md">
          🎓
        </span>
      )}
      {equippedHat === 'ninja_headband' && current.id !== 'avatar_alex' && (
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs sm:text-sm pointer-events-none drop-shadow-md">
          🥋
        </span>
      )}

      {/* Mini Badge on Corner */}
      <span className="absolute bottom-0 right-0 p-0.5 text-[10px] leading-none bg-white/90 rounded-tl-lg shadow-xs">
        {current.badgeEmoji}
      </span>
    </div>
  );
};
