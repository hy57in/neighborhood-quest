import React from 'react';

interface CharacterAvatarProps {
  character: 'pingu' | 'gyodong' | 'player';
  size?: 'sm' | 'md' | 'lg';
  mood?: 'happy' | 'sad' | 'neutral';
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 'md',
  mood = 'neutral',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size];

  if (character === 'pingu') {
    // Claymation-inspired Pingu (핑구) Penguin Character
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#E0F2FE] to-[#BAE6FD] border-2 border-[#7DD3FC] shadow-xs overflow-hidden shrink-0 ${sizeClasses} ${className}`}
        title="Pingu (핑구)"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full block">
          {/* Soft clay highlight background */}
          <circle cx="50" cy="52" r="42" fill="#E0F2FE" opacity="0.5" />

          {/* Penguin Plump Charcoal Body */}
          <ellipse cx="50" cy="78" rx="30" ry="26" fill="#1E293B" />

          {/* Crisp White Belly Patch */}
          <ellipse cx="50" cy="82" rx="20" ry="21" fill="#FFFFFF" />

          {/* Cute Flippers */}
          <ellipse
            cx="21"
            cy="74"
            rx="6"
            ry="14"
            transform="rotate(18 21 74)"
            fill="#0F172A"
          />
          <ellipse
            cx="79"
            cy="74"
            rx="6"
            ry="14"
            transform="rotate(-18 79 74)"
            fill="#0F172A"
          />

          {/* Cozy Red Newlywed Scarf */}
          <path
            d="M 28 57 Q 50 65 72 57 L 70 64 Q 50 72 30 64 Z"
            fill="#EF4444"
          />
          <rect x="56" y="60" width="8" height="15" rx="3" fill="#DC2626" />

          {/* Round Claymation Penguin Head */}
          <ellipse cx="50" cy="39" rx="25" ry="22" fill="#1E293B" />
          {/* Subtle Clay Specular Highlight on Head */}
          <ellipse cx="42" cy="25" rx="9" ry="4" fill="#475569" opacity="0.55" />

          {/* Left & Right White Eyes */}
          <circle cx="40" cy="36" r="6.2" fill="#FFFFFF" />
          <circle cx="60" cy="36" r="6.2" fill="#FFFFFF" />

          {/* Pupils */}
          <circle cx="41.5" cy="36" r="3.1" fill="#0F172A" />
          <circle cx="58.5" cy="36" r="3.1" fill="#0F172A" />
          <circle cx="42.5" cy="34.8" r="1.1" fill="#FFFFFF" />
          <circle cx="59.5" cy="34.8" r="1.1" fill="#FFFFFF" />

          {/* Rosy Cheeks */}
          <ellipse cx="31" cy="43" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.75" />
          <ellipse cx="69" cy="43" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.75" />

          {/* Iconic Red-Orange Trumpet "Noot Noot!" Beak */}
          {mood === 'happy' ? (
            <g>
              <ellipse cx="50" cy="45" rx="10" ry="6.5" fill="#F97316" />
              <ellipse cx="50" cy="45" rx="6.5" ry="4" fill="#DC2626" />
              <ellipse cx="48" cy="43" rx="3" ry="1.3" fill="#FDBA74" />
            </g>
          ) : (
            <g>
              <path
                d="M 40 43 Q 50 38 60 43 Q 63 49 50 51 Q 37 49 40 43 Z"
                fill="#EF4444"
              />
              <ellipse cx="48" cy="43.5" rx="4.5" ry="1.6" fill="#FCA5A5" opacity="0.7" />
            </g>
          )}
        </svg>
      </div>
    );
  }

  if (character === 'gyodong') {
    // Adorable Plump Golden-Cream Puppy Character (교동이)
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] border-2 border-[#F59E0B] shadow-xs overflow-hidden shrink-0 ${sizeClasses} ${className}`}
        title="Gyodong (교동)"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full block">
          {/* Developer Sky-Blue Hoodie Body */}
          <path
            d="M 22 98 C 22 70 78 70 78 98 Z"
            fill="#3B82F6"
          />
          {/* Hoodie drawstring & collar */}
          <path d="M 36 72 Q 50 80 64 72" stroke="#1D4ED8" strokeWidth="3" fill="none" />
          <line x1="45" y1="76" x2="45" y2="88" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="55" y1="76" x2="55" y2="88" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />

          {/* Cute Floppy-Perky Golden Puppy Ears */}
          <path
            d="M 26 36 C 16 20 22 12 36 22 Z"
            fill="#D97706"
          />
          <path
            d="M 28 33 C 21 22 25 16 34 23 Z"
            fill="#FDE68A"
          />
          <path
            d="M 74 36 C 84 20 78 12 64 22 Z"
            fill="#D97706"
          />
          <path
            d="M 72 33 C 79 22 75 16 66 23 Z"
            fill="#FDE68A"
          />

          {/* Plump Golden-Apricot Head */}
          <ellipse cx="50" cy="46" rx="27" ry="23" fill="#F59E0B" />

          {/* Chubby Cream Cheeks & Muzzle Patch */}
          <ellipse cx="38" cy="52" rx="13" ry="11" fill="#FFFBEB" />
          <ellipse cx="62" cy="52" rx="13" ry="11" fill="#FFFBEB" />
          <ellipse cx="50" cy="53" rx="14" ry="11" fill="#FFFBEB" />

          {/* White Shiba/Jindo Eyebrow Dots */}
          <ellipse cx="39" cy="31" rx="3.2" ry="2.2" fill="#FFFBEB" />
          <ellipse cx="61" cy="31" rx="3.2" ry="2.2" fill="#FFFBEB" />

          {/* Shiny Dark Puppy Eyes */}
          <circle cx="38" cy="41" r="4.2" fill="#1E293B" />
          <circle cx="62" cy="41" r="4.2" fill="#1E293B" />
          <circle cx="39.3" cy="39.7" r="1.4" fill="#FFFFFF" />
          <circle cx="63.3" cy="39.7" r="1.4" fill="#FFFFFF" />

          {/* Cute Blush */}
          <ellipse cx="29" cy="49" rx="4.5" ry="2.6" fill="#FB7185" opacity="0.65" />
          <ellipse cx="71" cy="49" rx="4.5" ry="2.6" fill="#FB7185" opacity="0.65" />

          {/* Cute Rounded Triangle Dog Nose */}
          <ellipse cx="50" cy="48" rx="4.6" ry="3.4" fill="#1E293B" />
          <ellipse cx="48.8" cy="47" rx="1.5" ry="0.9" fill="#64748B" />

          {/* Cute Puppy Smile & Pink Tongue Blep */}
          <path
            d="M 43 54 Q 46.5 58 50 53.5 Q 53.5 58 57 54"
            stroke="#1E293B"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          {mood !== 'sad' && (
            <path
              d="M 47.5 55.5 Q 50 62 52.5 55.5 Z"
              fill="#FB7185"
            />
          )}
        </svg>
      </div>
    );
  }

  // Player Avatar
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-[#D8F3DC] border-2 border-[#52B788] shadow-xs overflow-hidden shrink-0 ${sizeClasses} ${className}`}
    >
      <span className="text-lg">🧭</span>
    </div>
  );
};
