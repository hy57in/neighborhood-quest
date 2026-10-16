import React from 'react';
import { Lang, TabType } from '../types/index.ts';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  compareCount: number;
  bookmarkCount: number;
  lang?: Lang;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  compareCount,
  lang = 'ko',
}) => {
  const tabs: {
    id: TabType;
    label: string;
    icon: string;
    badge?: number;
  }[] = [
    { id: 'explore', label: lang === 'ko' ? '탐색' : 'Explore', icon: 'explore' },
    { id: 'diorama', label: lang === 'ko' ? '디오라마' : 'Diorama', icon: 'view_in_ar' },
    { id: 'compare', label: lang === 'ko' ? '동네비교' : 'Compare', icon: 'tune', badge: compareCount },
    { id: 'record', label: lang === 'ko' ? '보관함' : 'Record', icon: 'folder_open' },
  ];

  return (
    <nav
      className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl border-t border-[#edf0f3]"
      aria-label={lang === 'ko' ? '하단 네비게이션' : 'Bottom navigation'}
    >
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'record' && (activeTab === 'record' || activeTab === 'bookmarks'));

          return (
            <button
              key={tab.id}
              type="button"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-all relative focus:outline-none ${
                isActive ? 'text-[#0051ff] font-bold' : 'text-[#8B95A1] hover:text-[#191F28]'
              }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[22px] transition-colors ${
                    isActive ? 'text-[#0051ff]' : 'text-[#8B95A1]'
                  }`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 bg-[#0051ff] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] ${isActive ? 'font-bold text-[#0051ff]' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
