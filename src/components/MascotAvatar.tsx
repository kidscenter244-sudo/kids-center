import React from 'react';

interface MascotAvatarProps {
  avatarId?: string;
  avatarColor?: string;
  equippedHat?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'happy' | 'celebrating' | 'thinking' | 'wink';
  className?: string;
}

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  avatarId = 'bird_duo',
  avatarColor = '#22c55e',
  equippedHat,
  size = 'md',
  mood = 'happy',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const isBird = avatarId.includes('bird') || avatarId === 'bird_duo';
  const isOtter = avatarId.includes('otter') || avatarId === 'sparky_otter';
  const isOwl = avatarId.includes('dexter') || avatarId.includes('owl');
  const isRex = avatarId.includes('rex') || avatarId.includes('dino');
  const isPanda = avatarId.includes('nova') || avatarId.includes('panda');

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      {/* Base Avatar Container */}
      <div 
        className="w-full h-full rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden transition-transform duration-200"
        style={{
          background: `linear-gradient(135deg, ${avatarColor}22 0%, ${avatarColor}44 100%)`,
          border: `2.5px solid ${avatarColor}`,
        }}
      >
        {/* Bird Avatar (Duo style) */}
        {isBird && (
          <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] drop-shadow-sm">
            {/* Wings */}
            <ellipse cx="18" cy="58" rx="10" ry="16" fill="#4ade80" />
            <ellipse cx="82" cy="58" rx="10" ry="16" fill="#4ade80" />
            {/* Body */}
            <rect x="22" y="24" width="56" height="60" rx="28" fill="#58cc02" />
            <ellipse cx="50" cy="62" rx="20" ry="18" fill="#8ee000" />
            {/* Eyes */}
            <circle cx="37" cy="44" r="13" fill="#FFFFFF" />
            <circle cx="63" cy="44" r="13" fill="#FFFFFF" />
            <circle cx="39" cy="44" r="7.5" fill="#1e293b" />
            <circle cx="61" cy="44" r="7.5" fill="#1e293b" />
            <circle cx="41" cy="41" r="2.5" fill="#FFFFFF" />
            <circle cx="63" cy="41" r="2.5" fill="#FFFFFF" />
            {/* Beak */}
            <path d="M42 50 Q50 46 58 50 Q50 64 42 50 Z" fill="#ff9600" />
          </svg>
        )}

        {/* Otter */}
        {isOtter && !isBird && (
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
            <circle cx="28" cy="30" r="12" fill="#8D5B4C" />
            <circle cx="28" cy="30" r="6" fill="#F4A261" />
            <circle cx="72" cy="30" r="12" fill="#8D5B4C" />
            <circle cx="72" cy="30" r="6" fill="#F4A261" />
            <ellipse cx="50" cy="54" rx="34" ry="30" fill="#A47148" />
            <ellipse cx="50" cy="62" rx="22" ry="16" fill="#FCEADE" />
            <ellipse cx="50" cy="56" rx="6" ry="4" fill="#3D261A" />
            <path d="M44 63 Q50 68 56 63" stroke="#3D261A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="38" cy="46" r="4.5" fill="#261C14" />
            <circle cx="40" cy="44" r="1.5" fill="#FFFFFF" />
            <circle cx="62" cy="46" r="4.5" fill="#261C14" />
            <circle cx="64" cy="44" r="1.5" fill="#FFFFFF" />
          </svg>
        )}

        {/* Owl */}
        {isOwl && (
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
            <circle cx="50" cy="52" r="34" fill="#7C3AED" />
            <polygon points="26,22 36,36 20,38" fill="#6D28D9" />
            <polygon points="74,22 64,36 80,38" fill="#6D28D9" />
            <circle cx="37" cy="48" r="14" fill="#FFFFFF" />
            <circle cx="63" cy="48" r="14" fill="#FFFFFF" />
            <circle cx="37" cy="48" r="8" fill="#065F46" />
            <circle cx="63" cy="48" r="8" fill="#065F46" />
            <circle cx="39" cy="46" r="3" fill="#34D399" />
            <circle cx="65" cy="46" r="3" fill="#34D399" />
            <polygon points="50,54 44,64 56,64" fill="#F59E0B" />
          </svg>
        )}

        {/* Dino */}
        {isRex && (
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
            <rect x="22" y="28" width="56" height="48" rx="16" fill="#10B981" />
            <polygon points="50,14 44,28 56,28" fill="#047857" />
            <polygon points="68,18 62,30 74,30" fill="#047857" />
            <rect x="30" y="56" width="40" height="12" rx="4" fill="#064E3B" />
            <polygon points="34,56 38,62 42,56" fill="#FFFFFF" />
            <polygon points="46,56 50,62 54,56" fill="#FFFFFF" />
            <polygon points="58,56 62,62 66,56" fill="#FFFFFF" />
            <circle cx="40" cy="42" r="6" fill="#FFFFFF" />
            <circle cx="41" cy="42" r="3" fill="#064E3B" />
          </svg>
        )}

        {/* Panda */}
        {isPanda && (
          <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
            <circle cx="28" cy="28" r="13" fill="#1E293B" />
            <circle cx="72" cy="28" r="13" fill="#1E293B" />
            <circle cx="50" cy="54" r="32" fill="#F8FAFC" />
            <ellipse cx="36" cy="48" rx="9" ry="12" fill="#1E293B" transform="rotate(-15 36 48)" />
            <ellipse cx="64" cy="48" rx="9" ry="12" fill="#1E293B" transform="rotate(15 64 48)" />
            <circle cx="36" cy="48" r="3" fill="#FFFFFF" />
            <circle cx="64" cy="48" r="3" fill="#FFFFFF" />
            <ellipse cx="50" cy="60" rx="5" ry="3.5" fill="#1E293B" />
            <path d="M46 66 Q50 70 54 66" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Equipped Hat Overlay */}
      {equippedHat && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none drop-shadow-md transition-transform duration-200">
          {equippedHat === 'space_helmet' && (
            <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-3xl'}>
              🪖
            </span>
          )}
          {equippedHat === 'royal_crown' && (
            <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-3xl'}>
              👑
            </span>
          )}
          {equippedHat === 'wizard_hat' && (
            <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-3xl'}>
              🧙‍♂️
            </span>
          )}
          {equippedHat === 'ninja_headband' && (
            <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-3xl'}>
              🥷
            </span>
          )}
        </div>
      )}
    </div>
  );
};
