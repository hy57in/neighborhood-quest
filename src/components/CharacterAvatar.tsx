import React from 'react';

interface CharacterAvatarProps {
  character: 'pingu' | 'gyodong';
  size?: number;
  className?: string;
}

/**
 * Custom vector avatars inspired by the user's reference images:
 * - 'pingu': Claymation penguin with black head/wings, yellow-trimmed white belly, red round beak, orange feet, waving right wing.
 * - 'gyodong': Mint-aqua fish character (Hangyodon / 교동) with sky-blue top/side fins, big twin round white eyes, wide pink lips, belly scales, and waving left hand.
 */
export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 36,
  className = '',
}) => {
  if (character === 'pingu') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="핑구 (Pingu)"
      >
        <circle cx="50" cy="50" r="48" fill="#E8F3FF" stroke="#D0E4FF" strokeWidth="2" />
        {/* Waving Left/Right Flipper (Viewer's Left) */}
        <path
          d="M28 56 C16 56, 14 42, 16 28 C17 20, 25 22, 26 32 C27 42, 26 48, 33 50 Z"
          fill="#1E242B"
        />
        {/* Resting Flipper (Viewer's Right) */}
        <path
          d="M68 50 C76 54, 82 68, 85 78 C86 82, 80 84, 76 78 C72 71, 68 62, 65 56 Z"
          fill="#1E242B"
        />
        {/* Torso Outer Black */}
        <ellipse cx="51" cy="66" rx="23" ry="25" fill="#1E242B" />
        {/* Yellow Trim around White Belly */}
        <ellipse cx="52" cy="67" rx="18" ry="21" fill="#F59F00" />
        {/* White Belly */}
        <ellipse cx="53" cy="67" rx="16.2" ry="19.5" fill="#FFFFFF" />
        {/* Orange Feet */}
        <ellipse cx="42" cy="90" rx="10" ry="4.5" fill="#FF7A1A" />
        <ellipse cx="63" cy="89" rx="11" ry="4.2" fill="#FF7A1A" />
        {/* Round Clay Head */}
        <ellipse cx="51" cy="36" rx="18" ry="14" fill="#1E242B" />
        {/* Eyes */}
        <circle cx="42" cy="34" r="3.4" fill="#FFFFFF" />
        <circle cx="42.5" cy="34" r="1.8" fill="#111315" />
        <circle cx="58" cy="34" r="3.6" fill="#FFFFFF" />
        <circle cx="57.5" cy="34" r="1.9" fill="#111315" />
        {/* Signature Red Round Beak */}
        <ellipse cx="49" cy="40" rx="7.5" ry="4.8" fill="#FF3B4E" />
        <ellipse cx="48" cy="38.8" rx="4" ry="1.5" fill="#FF7582" opacity="0.6" />
      </svg>
    );
  }

  // 'gyodong' (Hangyodon / 교동이 - mint-aqua character with blue fins, big round eyes, wide pink lips, belly scales)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="교동 (Gyodong)"
    >
      <circle cx="50" cy="50" r="48" fill="#E6FCF5" stroke="#B2F2BB" strokeWidth="2" />
      {/* Top 3-lobed Sky-Blue Crown Fin */}
      <path
        d="M42 22 C41 12, 52 10, 54 18 C57 12, 65 15, 62 24 Z"
        fill="#63B3ED"
        stroke="#111315"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Left Ear Fin */}
      <path
        d="M22 44 C12 42, 11 58, 22 57 Z"
        fill="#63B3ED"
        stroke="#111315"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line x1="15" y1="48" x2="21" y2="49" stroke="#111315" strokeWidth="2" />
      <line x1="15" y1="53" x2="21" y2="52" stroke="#111315" strokeWidth="2" />
      {/* Right Ear Fin */}
      <path
        d="M78 44 C88 42, 89 58, 78 57 Z"
        fill="#63B3ED"
        stroke="#111315"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line x1="79" y1="49" x2="85" y2="48" stroke="#111315" strokeWidth="2" />
      {/* Mint-Aqua Head & Body */}
      <path
        d="M24 52 C22 30, 34 21, 50 21 C66 21, 78 30, 76 52 L75 88 C60 93, 40 93, 25 88 Z"
        fill="#8CE0E8"
        stroke="#111315"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Waving Right Arm (Viewer's Right) */}
      <path
        d="M74 68 C83 62, 89 55, 85 49 C83 46, 78 48, 77 51 C75 48, 71 50, 72 55 L69 64"
        fill="#8CE0E8"
        stroke="#111315"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Big Twin Round White Eyes */}
      <circle cx="38" cy="46" r="12.5" fill="#FFFFFF" stroke="#111315" strokeWidth="2.8" />
      <circle cx="62" cy="46" r="12.5" fill="#FFFFFF" stroke="#111315" strokeWidth="2.8" />
      {/* Eye Pupils */}
      <circle cx="40" cy="47" r="3.2" fill="#111315" />
      <circle cx="60" cy="47" r="3.2" fill="#111315" />
      {/* Wide Chubby Pink Lips */}
      <path
        d="M23 64 C28 58, 72 58, 77 64 C79 68, 73 71, 50 70 C27 71, 21 68, 23 64 Z"
        fill="#F4A9C7"
        stroke="#111315"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Mouth Wavy Line */}
      <path
        d="M28 65 Q39 62 50 65 Q61 62 72 65"
        stroke="#111315"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cute Belly Scales */}
      <path d="M36 77 Q40 81 44 77" stroke="#111315" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M47 77 Q51 81 55 77" stroke="#111315" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M58 77 Q62 81 66 77" stroke="#111315" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M41 84 Q45 88 49 84" stroke="#111315" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M53 84 Q57 88 61 84" stroke="#111315" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
};
