import React, { useState } from 'react';
import { Lang, NeighborhoodData } from '../types/index.ts';
import { calculateSensoryComfortScore } from '../utils/sensoryCalculations.ts';

interface ExploreViewProps {
  neighborhoods: NeighborhoodData[];
  selectedId: string;
  compareIds: string[];
  onSelectNeighborhood: (id: string) => void;
  onToggleCompare: (id: string) => void;
  lang?: Lang;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  neighborhoods,
  selectedId,
  compareIds,
  onSelectNeighborhood,
  onToggleCompare,
  lang = 'ko',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: lang === 'ko' ? '전체 동네' : 'All Areas' },
    { id: 'hill', label: lang === 'ko' ? '⛰️ 가파른언덕' : '⛰️ Steep Hills' },
    { id: 'green', label: lang === 'ko' ? '🌿 숲세권' : '🌿 Near Forest' },
    { id: 'sunset', label: lang === 'ko' ? '🌅 노을명소' : '🌅 Sunset Spots' },
    { id: 'quiet', label: lang === 'ko' ? '🤫 극저소음' : '🤫 Ultra Quiet' },
  ];

  const filtered = neighborhoods.filter((n) => {
    const matchesQuery =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'hill') return n.inclinePercent >= 70;
    if (activeCategory === 'green') return n.greenWalkMinutes <= 3;
    if (activeCategory === 'sunset') return n.cozinessPercent >= 90;
    if (activeCategory === 'quiet') return n.noiseDb <= 32;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-2">
        <span className="material-symbols-outlined text-[#8b95a1] text-[20px]">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            lang === 'ko'
              ? '동네 이름, 지하철역, 감각 키워드 검색...'
              : 'Search neighborhood, station, or sensory vibe...'
          }
          className="w-full text-[14px] text-[#191f28] placeholder-[#8b95a1] focus:outline-none bg-transparent"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-[#8b95a1] hover:text-[#191f28]"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'bg-white text-[#4e5968] border border-[#edf0f3] hover:bg-[#f2f4f6]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Neighborhood List */}
      <div className="flex flex-col gap-3">
        {filtered.map((item) => {
          const isSelected = item.id === selectedId;
          const isInCompare = compareIds.includes(item.id);
          const comfortScore = calculateSensoryComfortScore(
            item.inclinePercent,
            item.cozinessPercent,
            item.noiseDb,
            item.greenWalkMinutes
          );

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-4 border transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${
                isSelected ? 'border-[#3182f6] ring-1 ring-[#3182f6]/30' : 'border-[#edf0f3]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectNeighborhood(item.id)}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#e8f3ff] text-[#3182f6] text-[10px] font-bold">
                      {lang === 'ko' ? `감각지수 ${comfortScore}점` : `Sensory ${comfortScore}pts`}
                    </span>
                    <span className="text-[11px] text-[#8b95a1]">{item.stationDistance}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-[#191f28]">{item.name}</h3>
                  <p className="text-[12px] text-[#8b95a1] mt-0.5">{item.subName}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleCompare(item.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                    isInCompare
                      ? 'bg-[#3182f6] text-white'
                      : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">balance</span>
                  <span>
                    {isInCompare
                      ? lang === 'ko'
                        ? '비교중'
                        : 'Comparing'
                      : lang === 'ko'
                        ? '비교 담기'
                        : 'Compare'}
                  </span>
                </button>
              </div>

              {/* Mini Metrics Bar */}
              <div
                onClick={() => onSelectNeighborhood(item.id)}
                className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#f2f4f6] cursor-pointer"
              >
                <div>
                  <span className="text-[10px] text-[#8b95a1] block">
                    {lang === 'ko' ? '경사도' : 'Incline'}
                  </span>
                  <span className="text-[13px] font-extrabold text-[#e03e52]">
                    {item.inclinePercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8b95a1] block">
                    {lang === 'ko' ? '아늑함' : 'Coziness'}
                  </span>
                  <span className="text-[13px] font-extrabold text-[#f59f00]">
                    {item.cozinessPercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8b95a1] block">
                    {lang === 'ko' ? '소음' : 'Noise'}
                  </span>
                  <span className="text-[13px] font-extrabold text-[#3182f6]">
                    {item.noiseDb}dB
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8b95a1] block">
                    {lang === 'ko' ? '녹지' : 'Greenery'}
                  </span>
                  <span className="text-[13px] font-extrabold text-[#0ca678]">
                    {lang === 'ko' ? `${item.greenWalkMinutes}분` : `${item.greenWalkMinutes}m`}
                  </span>
                </div>
              </div>

              {/* Tags & Action */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium text-[#4e5968] bg-[#f7f9fb] px-2 py-0.5 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onSelectNeighborhood(item.id)}
                  className="text-[12px] font-bold text-[#3182f6] flex items-center gap-0.5 shrink-0 ml-2"
                >
                  <span>{lang === 'ko' ? '3D 디오라마 보기' : 'View 3D Diorama'}</span>
                  <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#edf0f3] text-[#8b95a1] text-sm">
            {lang === 'ko'
              ? '조건에 맞는 동네 임장 기록이 없습니다.'
              : 'No neighborhood records match your filter.'}
          </div>
        )}
      </div>
    </div>
  );
};
