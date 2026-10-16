import React from 'react';
import { Lang, TabType } from '../types/index.ts';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  compareCount?: number;
  bookmarkCount?: number;
  lang?: Lang;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  bookmarkCount,
  lang = 'ko',
}) => {
  const tabs: {
    id: TabType;
    label: string;
    icon: string;
    badge?: number;
  }[] = [
    { id: 'explore', label: lang === 'ko' ? '탐색' : 'Explore', icon: 'map' },
    {
      id: 'record',
      label: lang === 'ko' ? '퀵기록' : 'Quick Capture',
      icon: 'add_circle',
      badge: bookmarkCount,
    },
    { id: 'diorama', label: lang === 'ko' ? '3D 디오라마' : '3D Diorama', icon: 'view_in_ar' },
  ];

  return (
    <nav
      className="fixed bottom-0 w-full z-50 pb-safe rounded-t-3xl bg-white/85 backdrop-blur-xl border-t border-[#c2c6d8]/25 shadow-[0_-12px_32px_rgba(19,28,38,0.06)]"
      aria-label={lang === 'ko' ? '하단 네비게이션' : 'Bottom navigation'}
    >
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-4">
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
              className={`flex flex-col items-center justify-center transition-all relative cursor-pointer focus:outline-none ${
                isActive
                  ? 'bg-[#dde1ff] text-[#003dc7] rounded-full px-5 py-1.5 scale-105'
                  : 'text-[#424656] opacity-75 hover:opacity-100 px-4 py-1.5'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[21px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[15px] h-[15px] px-1 bg-[#0051ff] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
