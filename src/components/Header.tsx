import React from 'react';
import { Lang, NeighborhoodData } from '../types/index.ts';

interface HeaderProps {
  neighborhood: NeighborhoodData;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onBack?: () => void;
  onShare: () => void;
  showBackButton?: boolean;
  lang?: Lang;
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  neighborhood,
  isBookmarked,
  onToggleBookmark,
  onBack,
  onShare,
  showBackButton = false,
  lang = 'ko',
  onToggleLang,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#f7f9fb]/90 backdrop-blur-xl border-b border-[#edf0f3]/80">
      <div className="max-w-md mx-auto h-14 px-4 flex items-center justify-between">
        <button
          type="button"
          aria-label={showBackButton ? (lang === 'ko' ? '뒤로가기' : 'Back') : (lang === 'ko' ? '이전 탐색' : 'Explore')}
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#191f28] hover:bg-[#f2f4f6] active:scale-95 transition-all focus:outline-none"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>

        <div className="flex flex-col items-center text-center px-2 flex-1 truncate">
          <h1 className="text-[17px] font-bold text-[#191f28] tracking-tight truncate w-full">
            {neighborhood.name}
          </h1>
          <span className="text-[11px] font-medium text-[#8b95a1] truncate">
            {neighborhood.stationDistance} · {neighborhood.timeContext}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              aria-label="Language toggle"
              className="h-7 px-2 rounded-full bg-[#f2f4f6] hover:bg-[#e5e8eb] text-[10px] font-extrabold text-[#4e5968] transition-colors"
            >
              {lang === 'ko' ? 'EN' : 'KO'}
            </button>
          )}
          <button
            type="button"
            aria-label={lang === 'ko' ? '공유' : 'Share'}
            onClick={onShare}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#191f28] hover:bg-[#f2f4f6] active:scale-95 transition-all focus:outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
          <button
            type="button"
            aria-label={isBookmarked ? (lang === 'ko' ? '보관됨' : 'Saved') : (lang === 'ko' ? '보관하기' : 'Save')}
            onClick={onToggleBookmark}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#191f28] hover:bg-[#f2f4f6] active:scale-95 transition-all focus:outline-none"
          >
            <span
              className={`material-symbols-outlined text-[20px] transition-colors ${
                isBookmarked ? 'text-[#3182f6] fill-1' : 'text-[#191f28]'
              }`}
            >
              {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
