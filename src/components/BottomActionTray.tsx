import React from 'react';
import { Lang } from '../types/index.ts';

interface BottomActionTrayProps {
  isInCompare: boolean;
  compareCount: number;
  onToggleCompare: () => void;
  onOpenCalibration: () => void;
  lang?: Lang;
}

export const BottomActionTray: React.FC<BottomActionTrayProps> = ({
  isInCompare,
  compareCount,
  onToggleCompare,
  onOpenCalibration,
  lang = 'ko',
}) => {
  return (
    <aside className="fixed bottom-[4.25rem] w-full z-40 px-4 max-w-md left-1/2 -translate-x-1/2 pointer-events-none">
      <div className="bg-[#f7f9fb]/90 backdrop-blur-md p-2 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#edf0f3] flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={onToggleCompare}
          className={`flex-1 h-12 rounded-xl text-[14px] font-bold active:scale-98 transition-all flex items-center justify-center gap-1.5 focus:outline-none ${
            isInCompare
              ? 'bg-[#3182f6] text-white shadow-xs'
              : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">balance</span>
          <span>
            {isInCompare
              ? lang === 'ko'
                ? `비교함 (${compareCount})`
                : `In Compare (${compareCount})`
              : lang === 'ko'
                ? '비교함 담기'
                : 'Add to Compare'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenCalibration}
          className="flex-[1.5] h-12 rounded-xl bg-[#111315] text-white text-[14px] font-bold shadow-sm hover:bg-black active:scale-98 transition-all flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <span className="material-symbols-outlined text-[18px] text-[#3182f6]">
            edit_note
          </span>
          <span>{lang === 'ko' ? '기억 보정 & 3D 편집' : 'Calibrate & Edit 3D'}</span>
        </button>
      </div>
    </aside>
  );
};
