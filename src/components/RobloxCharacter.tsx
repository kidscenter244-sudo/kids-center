import React from 'react';

/**
 * Intelligent gender detection from Arabic and English student names.
 * If feminine indicators are found, returns 'girl'; otherwise defaults to 'boy'.
 */
export function detectGenderFromName(name: string): 'boy' | 'girl' {
  if (!name || typeof name !== 'string') return 'boy';

  const clean = name.trim().toLowerCase();

  const knownGirlNames = new Set([
    // Arabic names
    'مريم', 'سارة', 'ساره', 'فاطمة', 'فاطمه', 'نور', 'نورا', 'نوره', 'ياسمين', 'ليلى', 'ليلي',
    'ملك', 'فريدة', 'فريده', 'جنا', 'جنى', 'سلمى', 'سلمي', 'روان', 'حنين', 'ريم', 'شهد',
    'آية', 'ايه', 'حبيبة', 'حبيبه', 'رنا', 'هنا', 'منة', 'منه', 'دينا', 'إسراء', 'اسراء',
    'مي', 'هدى', 'هدي', 'زينب', 'خديجة', 'خديجه', 'روان', 'تاليا', 'كارما', 'تيا', 'لارا',
    'كنزي', 'ندى', 'ندي', 'بسملة', 'بسمله', 'رودينا', 'ريتاج', 'جودي',
    // English names
    'maya', 'emma', 'sarah', 'sara', 'maryam', 'fatima', 'fatma', 'lily', 'sophia', 'chloe',
    'nora', 'norah', 'layla', 'laila', 'salma', 'hana', 'yasmin', 'yasmine', 'jessica', 'olivia',
    'emily', 'ava', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn', 'abigail',
    'ella', 'elizabeth', 'camila', 'luna', 'sofia', 'avery', 'mila', 'aria', 'scarlett',
    'penelope', 'riley', 'zoey', 'grace', 'hannah', 'chloe', 'victoria', 'zoe', 'stella',
    'leah', 'hazel', 'ellie', 'violet', 'aurora', 'savannah', 'audrey', 'brooklyn', 'bella',
    'claire', 'skylar', 'lucy', 'paisley', 'everly', 'anna', 'caroline', 'nova', 'genesis',
    'aaliyah', 'kennedy', 'kinsley', 'allison', 'maya', 'alyssa', 'madelyn', 'alice', 'julie',
  ]);

  const firstName = clean.split(/[\s_]+/)[0];

  if (knownGirlNames.has(firstName) || knownGirlNames.has(clean)) {
    return 'girl';
  }

  if (
    clean.endsWith('ة') || 
    clean.endsWith('ه') || 
    clean.endsWith('اء') || 
    clean.endsWith('ينا') ||
    clean.endsWith('line') ||
    clean.endsWith('ette') ||
    clean.endsWith('anna') ||
    clean.endsWith('bella') ||
    clean.endsWith('ella')
  ) {
    return 'girl';
  }

  return 'boy';
}

interface RobloxCharacterProps {
  name?: string;
  gender?: 'boy' | 'girl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  equippedHat?: string;
  showTorso?: boolean;
}

export const RobloxCharacter: React.FC<RobloxCharacterProps> = ({
  name = 'Player',
  gender,
  size = 'md',
  className = '',
  equippedHat,
  showTorso = true,
}) => {
  const resolvedGender: 'boy' | 'girl' = gender || detectGenderFromName(name);
  const isGirl = resolvedGender === 'girl';

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    '2xl': 'w-36 h-36',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeMap[size]} ${className}`}
      aria-label={`${isGirl ? 'Girl' : 'Boy'} Math Champion Avatar`}
    >
      <svg
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-200 hover:scale-105"
      >
        <defs>
          {/* Warm skin tone */}
          <linearGradient id="avatarSkin" x1="60" y1="20" x2="60" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FED7AA" />
            <stop offset="1" stopColor="#FDBA74" />
          </linearGradient>

          {/* Boy Cyberpunk / Ninja Hoodie */}
          <linearGradient id="boyHoodie" x1="20" y1="65" x2="100" y2="135" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="0.5" stopColor="#1E293B" />
            <stop offset="1" stopColor="#0F766E" />
          </linearGradient>

          {/* Girl Star Prodigy Hoodie */}
          <linearGradient id="girlHoodie" x1="20" y1="65" x2="100" y2="135" gradientUnits="userSpaceOnUse">
            <stop stopColor="#581C87" />
            <stop offset="0.5" stopColor="#7E22CE" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>

          {/* Boy Hair */}
          <linearGradient id="boyHairGrad" x1="30" y1="14" x2="90" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Girl Hair */}
          <linearGradient id="girlHairGrad" x1="25" y1="14" x2="95" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FB7185" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>

          {/* RGB Headset Glow */}
          <linearGradient id="rgbHeadset" x1="20" y1="30" x2="100" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#A855F7" />
            <stop offset="1" stopColor="#F43F5E" />
          </linearGradient>
        </defs>

        {/* ================= TORSO & JACKET ================= */}
        {showTorso && (
          <g id="avatarTorso">
            {/* Left Arm */}
            <rect
              x="14"
              y="74"
              width="17"
              height="44"
              rx="6"
              fill={isGirl ? 'url(#girlHoodie)' : 'url(#boyHoodie)'}
              stroke="#090D16"
              strokeWidth="2.5"
            />
            {/* Left Hand Glove */}
            <rect x="15" y="114" width="15" height="11" rx="4" fill="#0F172A" stroke="#090D16" strokeWidth="1.8" />

            {/* Right Arm */}
            <rect
              x="89"
              y="74"
              width="17"
              height="44"
              rx="6"
              fill={isGirl ? 'url(#girlHoodie)' : 'url(#boyHoodie)'}
              stroke="#090D16"
              strokeWidth="2.5"
            />
            {/* Right Hand Glove */}
            <rect x="90" y="114" width="15" height="11" rx="4" fill="#0F172A" stroke="#090D16" strokeWidth="1.8" />

            {/* Main Torso */}
            <rect
              x="31"
              y="70"
              width="58"
              height="58"
              rx="8"
              fill={isGirl ? 'url(#girlHoodie)' : 'url(#boyHoodie)'}
              stroke="#090D16"
              strokeWidth="3"
            />

            {/* Chest Graphics & Emblems */}
            {isGirl ? (
              <g>
                {/* Glowing Star Math Crest */}
                <circle cx="60" cy="94" r="13" fill="#F472B6" fillOpacity="0.3" />
                <polygon
                  points="60,86 63,92 70,92 65,96 67,103 60,99 53,103 55,96 50,92 57,92"
                  fill="#FDF2F8"
                  stroke="#F43F5E"
                  strokeWidth="1.2"
                />
                {/* Neon zip line */}
                <line x1="60" y1="70" x2="60" y2="85" stroke="#F472B6" strokeWidth="2.5" />
              </g>
            ) : (
              <g>
                {/* Cyber Matrix Ninja Stripe */}
                <rect x="42" y="86" width="36" height="16" rx="4" fill="#022C22" stroke="#10B981" strokeWidth="1.5" />
                <path d="M48 94 L72 94" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="54" cy="94" r="2.5" fill="#FACC15" />
                <circle cx="66" cy="94" r="2.5" fill="#38BDF8" />
                {/* Neon zip line */}
                <line x1="60" y1="70" x2="60" y2="84" stroke="#34D399" strokeWidth="2.5" />
              </g>
            )}
          </g>
        )}

        {/* ================= HEAD & FACE ================= */}
        <g id="avatarHead">
          {/* Head Base */}
          <rect
            x="33"
            y="23"
            width="54"
            height="48"
            rx="12"
            fill="url(#avatarSkin)"
            stroke="#090D16"
            strokeWidth="3.2"
          />

          {/* ================= HAIR ================= */}
          {isGirl ? (
            /* Girl Hair: Sleek Magenta / Berry Layered Hair with Twin Tails */
            <g id="girlHair">
              {/* Left & Right Flowing Ponytails */}
              <path
                d="M32 30 C16 34 18 64 26 78 C28 62 30 46 34 36 Z"
                fill="url(#girlHairGrad)"
                stroke="#090D16"
                strokeWidth="2"
              />
              <path
                d="M88 30 C104 34 102 64 94 78 C92 62 90 46 86 36 Z"
                fill="url(#girlHairGrad)"
                stroke="#090D16"
                strokeWidth="2"
              />
              {/* Top Hair Volume */}
              <rect x="31" y="19" width="58" height="18" rx="8" fill="url(#girlHairGrad)" stroke="#090D16" strokeWidth="2.5" />
              <path
                d="M32 26 Q46 36 60 27 Q74 36 88 26 L88 20 L32 20 Z"
                fill="url(#girlHairGrad)"
              />
            </g>
          ) : (
            /* Boy Hair: Cool Spiky Indigo / Cobalt Anime Gamer Hair */
            <g id="boyHair">
              <rect x="31" y="18" width="58" height="16" rx="6" fill="url(#boyHairGrad)" stroke="#090D16" strokeWidth="2.5" />
              {/* Spikes */}
              <polygon points="34,20 44,11 50,20" fill="url(#boyHairGrad)" stroke="#090D16" strokeWidth="2" />
              <polygon points="48,20 60,9 68,20" fill="url(#boyHairGrad)" stroke="#090D16" strokeWidth="2" />
              <polygon points="66,20 78,12 86,20" fill="url(#boyHairGrad)" stroke="#090D16" strokeWidth="2" />
              {/* Sideburns */}
              <rect x="31" y="24" width="6" height="18" rx="2" fill="url(#boyHairGrad)" />
              <rect x="83" y="24" width="6" height="18" rx="2" fill="url(#boyHairGrad)" />
            </g>
          )}

          {/* ================= GAMING HEADSET ================= */}
          <g id="gamingHeadset">
            {/* Headset Arc Band */}
            <path
              d="M26 48 C26 22 94 22 94 48"
              stroke="url(#rgbHeadset)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Left Earcup */}
            <rect x="23" y="40" width="8" height="18" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
            <circle cx="27" cy="49" r="2.5" fill="#38BDF8" />
            {/* Right Earcup */}
            <rect x="89" y="40" width="8" height="18" rx="4" fill="#0F172A" stroke="#F43F5E" strokeWidth="2" />
            <circle cx="93" cy="49" r="2.5" fill="#F43F5E" />
          </g>

          {/* ================= FACIAL FEATURES ================= */}
          {isGirl ? (
            <g id="girlFace">
              {/* Anime Sparkle Eyes */}
              <ellipse cx="48" cy="47" rx="4.5" ry="6" fill="#0F172A" />
              <circle cx="46.5" cy="45" r="2" fill="#FFFFFF" />
              <circle cx="50" cy="49" r="1.2" fill="#F472B6" />

              <ellipse cx="72" cy="47" rx="4.5" ry="6" fill="#0F172A" />
              <circle cx="70.5" cy="45" r="2" fill="#FFFFFF" />
              <circle cx="74" cy="49" r="1.2" fill="#F472B6" />

              {/* Lashes */}
              <path d="M43 43 L41 40" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
              <path d="M77 43 L79 40" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

              {/* Rosy Blush */}
              <circle cx="43" cy="54" r="3.5" fill="#FB7185" fillOpacity="0.75" />
              <circle cx="77" cy="54" r="3.5" fill="#FB7185" fillOpacity="0.75" />

              {/* Sweet Anime Smile */}
              <path
                d="M53 54 Q60 63 67 54 Z"
                fill="#EF4444"
                stroke="#0F172A"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </g>
          ) : (
            <g id="boyFace">
              {/* Determined Gamer Eyes */}
              <ellipse cx="48" cy="47" rx="4" ry="5.5" fill="#0F172A" />
              <circle cx="46.5" cy="45" r="1.8" fill="#FFFFFF" />
              <circle cx="50" cy="49" r="1" fill="#38BDF8" />

              <ellipse cx="72" cy="47" rx="4" ry="5.5" fill="#0F172A" />
              <circle cx="70.5" cy="45" r="1.8" fill="#FFFFFF" />
              <circle cx="74" cy="49" r="1" fill="#38BDF8" />

              {/* Confident Brows */}
              <path d="M42 39 Q47 38 52 41" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M68 41 Q73 38 78 39" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

              {/* Smile */}
              <path
                d="M51 55 Q60 64 69 55"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* ================= OPTIONAL EQUIPPED ACCESSORIES ================= */}
          {equippedHat === 'golden_crown' && (
            <g transform="translate(60, 14)">
              <polygon points="-16,0 -20,-14 -10,-8 0,-16 10,-8 20,-14 16,0" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
              <circle cx="0" cy="-6" r="2.5" fill="#EF4444" />
            </g>
          )}
          {equippedHat === 'grad_cap' && (
            <g transform="translate(60, 14)">
              <polygon points="0,-12 24,-4 0,4 -24,-4" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
              <rect x="-8" y="-4" width="16" height="8" fill="#1E293B" />
              <line x1="0" y1="-4" x2="18" y2="6" stroke="#FACC15" strokeWidth="2" />
            </g>
          )}
          {equippedHat === 'ninja_headband' && (
            <g>
              <rect x="31" y="32" width="58" height="7" rx="2" fill="#DC2626" stroke="#090D16" strokeWidth="1.5" />
              <circle cx="60" cy="35.5" r="2.5" fill="#FFFFFF" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
