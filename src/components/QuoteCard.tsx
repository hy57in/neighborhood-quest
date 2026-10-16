import React from 'react';
import { Lang, MemoryLayers } from '../types/index.ts';
import { CharacterAvatar } from './CharacterAvatar.tsx';

interface QuoteCardProps {
  quote: string;
  author: string;
  timeContext?: string;
  onEditClick?: () => void;
  perspective?: 'jamie' | 'sam';
  onSwitchPerspective?: (perspective: 'jamie' | 'sam') => void;
  memoryLayers?: MemoryLayers;
  lang?: Lang;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  author,
  onEditClick,
  perspective = 'jamie',
  onSwitchPerspective,
  memoryLayers,
  lang = 'ko',
}) => {
  const activeCharacter = perspective === 'sam' ? 'gyodong' : 'pingu';

  return (
    <section className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="w-6 h-6 rounded-full bg-[#f7f9fb] border border-[#edf0f3] flex items-center justify-center shrink-0">
            <CharacterAvatar character={activeCharacter} size={22} />
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#e8f3ff] text-[#3182f6] text-[11px] font-bold tracking-tight">
            {lang === 'ko' ? '현장 임장 메모' : 'Field Memory Note'}
          </span>
          <span className="text-[12px] text-[#8b95a1]">
            · {author} ({perspective === 'sam' ? (lang === 'ko' ? '교동' : 'Gyodong') : (lang === 'ko' ? '핑구' : 'Pingu')})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {onSwitchPerspective && (
            <button
              type="button"
              onClick={() => onSwitchPerspective(perspective === 'jamie' ? 'sam' : 'jamie')}
              className="px-2 py-0.5 rounded-full bg-[#f2f4f6] hover:bg-[#e5e8eb] text-[10px] font-bold text-[#4e5968] transition-colors flex items-center gap-1 cursor-pointer"
              title={
                lang === 'ko'
                  ? '같은 물리적 언덕을 본 핑구(Jamie) vs 교동(Sam)의 관점 비교'
                  : 'Compare Pingu (Jamie) vs Gyodong (Sam) perspective on the same physical slope'
              }
            >
              <CharacterAvatar character={activeCharacter} size={16} />
              <span>
                {perspective === 'jamie'
                  ? lang === 'ko'
                    ? '핑구·Jamie'
                    : 'Pingu·Jamie'
                  : lang === 'ko'
                    ? '교동·Sam'
                    : 'Gyodong·Sam'}
              </span>
              <span className="text-[#3182f6]">⇄</span>
            </button>
          )}
          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="text-[11px] text-[#8b95a1] hover:text-[#3182f6] flex items-center gap-0.5"
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
            📐 {lang === 'ko' ? '물리 특징:' : 'Physical:'} {memoryLayers.physical[0]}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold">
            ✨ {lang === 'ko' ? '감각:' : 'Sensory:'} {memoryLayers.sensory[0]}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0051ff] text-[10px] font-semibold">
            💭 {lang === 'ko' ? '주관적 감정:' : 'Subjective:'} {memoryLayers.emotional[0]}
          </span>
        </div>
      )}
    </section>
  );
};
