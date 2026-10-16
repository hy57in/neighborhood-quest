import React from 'react';
import { Lang, MemoryLayers } from '../types/index.ts';
import { CharacterAvatar } from './CharacterAvatar.tsx';

interface QuoteCardProps {
  quote: string;
  author: string;
  timeContext?: string;
  onEditClick?: () => void;
  perspective?: 'pingu' | 'gyodong';
  onSwitchPerspective?: (perspective: 'pingu' | 'gyodong') => void;
  memoryLayers?: MemoryLayers;
  lang?: Lang;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  author,
  onEditClick,
  perspective = 'pingu',
  onSwitchPerspective,
  memoryLayers,
  lang = 'ko',
}) => {
  const activeCharacter = perspective === 'gyodong' ? 'gyodong' : 'pingu';

  return (
    <section className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="w-7 h-7 rounded-full bg-[#f7f9fb] border border-[#edf0f3] flex items-center justify-center shrink-0">
            <CharacterAvatar character={activeCharacter} size={24} />
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#e8f3ff] text-[#0051ff] text-[11px] font-extrabold tracking-tight">
            {lang === 'ko' ? '현장 임장 메모' : 'Field Memory Note'}
          </span>
          <span className="text-[12px] font-bold text-[#4e5968]">
            ·{' '}
            {perspective === 'pingu'
              ? lang === 'ko'
                ? '핑구 (출퇴근·현실·환금성 중심)'
                : 'Pingu (Commute · Practical · Liquidity)'
              : lang === 'ko'
                ? '교동 (감성·산책·분위기 중심)'
                : 'Gyodong (Emotional · Walk · Vibe)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {onSwitchPerspective && (
            <div className="bg-[#f2f4f6] p-0.5 rounded-xl flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onSwitchPerspective('pingu')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  perspective === 'pingu'
                    ? 'bg-white text-[#0051ff] shadow-xs'
                    : 'text-[#4e5968] hover:text-[#191f28]'
                }`}
              >
                <CharacterAvatar character="pingu" size={15} />
                <span>{lang === 'ko' ? '핑구(출퇴근·현실)' : 'Pingu (Practical)'}</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchPerspective('gyodong')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  perspective === 'gyodong'
                    ? 'bg-white text-[#0051ff] shadow-xs'
                    : 'text-[#4e5968] hover:text-[#191f28]'
                }`}
              >
                <CharacterAvatar character="gyodong" size={15} />
                <span>{lang === 'ko' ? '교동(감성·산책)' : 'Gyodong (Vibe)'}</span>
              </button>
            </div>
          )}
          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="text-[11px] text-[#8b95a1] hover:text-[#0051ff] flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              <span>{lang === 'ko' ? '수정' : 'Edit'}</span>
            </button>
          )}
        </div>
      </div>

      <p className="text-[15px] font-medium leading-relaxed text-[#191f28]">{quote}</p>

      {memoryLayers && (
        <div className="pt-2 border-t border-[#f2f4f6] flex flex-wrap gap-1.5">
          {memoryLayers.physical[0] && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
              📐 {lang === 'ko' ? '물리 특징:' : 'Physical:'} {memoryLayers.physical[0]}
            </span>
          )}
          {memoryLayers.sensory[0] && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold">
              ✨ {lang === 'ko' ? '감각:' : 'Sensory:'} {memoryLayers.sensory[0]}
            </span>
          )}
          {memoryLayers.emotional[0] && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0051ff] text-[10px] font-semibold">
              💭 {lang === 'ko' ? '주관적 감정:' : 'Subjective:'} {memoryLayers.emotional[0]}
            </span>
          )}
        </div>
      )}
    </section>
  );
};
