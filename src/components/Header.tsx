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
    <header className="fixed top-0 w-full z-50 pt-safe bg-white/80 backdrop-blur-xl border-b border-[#c2c6d8]/25 shadow-[0_8px_24px_rgba(19,28,38,0.04)]">
      <div className="max-w-md mx-auto h-14 px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            aria-label={
              showBackButton
                ? lang === 'ko'
                  ? '뒤로가기'
                  : 'Back'
                : lang === 'ko'
                  ? '이전 탐색'
                  : 'Explore'
            }
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#edf4ff] hover:bg-[#dfe9f6] flex items-center justify-center text-[#131c26] active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showBackButton ? 'arrow_back_ios_new' : 'explore'}
            </span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0051ff] animate-pulse shrink-0" />
              <h1 className="text-[15px] font-extrabold text-[#131c26] tracking-tight truncate">
                {lang === 'en' && neighborhood.nameEn ? neighborhood.nameEn : neighborhood.name}
              </h1>
            </div>
            <span className="text-[10px] font-bold text-[#424656] truncate">
              {lang === 'en' && neighborhood.stationDistanceEn
                ? neighborhood.stationDistanceEn
                : neighborhood.stationDistance}{' '}
              · {lang === 'en' && neighborhood.timeContextEn ? neighborhood.timeContextEn : neighborhood.timeContext}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              aria-label="Language toggle"
              className="h-8 px-2.5 rounded-full bg-[#edf4ff] hover:bg-[#dde1ff] text-[10px] font-extrabold text-[#003dc7] transition-colors cursor-pointer"
            >
              {lang === 'ko' ? 'EN' : 'KO'}
            </button>
          )}
          <button
            type="button"
            aria-label={lang === 'ko' ? '공유' : 'Share'}
            onClick={onShare}
            className="w-9 h-9 rounded-full bg-[#edf4ff] hover:bg-[#dfe9f6] flex items-center justify-center text-[#131c26] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
          </button>
          <button
            type="button"
            aria-label={
              isBookmarked
                ? lang === 'ko'
                  ? '보관됨'
                  : 'Saved'
                : lang === 'ko'
                  ? '보관하기'
                  : 'Save'
            }
            onClick={onToggleBookmark}
            className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-[#dde1ff] text-[#003dc7]'
                : 'bg-[#edf4ff] text-[#131c26] hover:bg-[#dfe9f6]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[19px]"
              style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
