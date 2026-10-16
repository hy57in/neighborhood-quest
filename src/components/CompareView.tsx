import React, { useState } from 'react';
import { Lang, NeighborhoodData, SensoryPriorityId } from '../types/index.ts';
import { LIQUIDITY_PILLAR_META, SENSORY_PRIORITY_OPTIONS } from '../data/neighborhoods.ts';
import { calculateSensoryComfortScore } from '../utils/sensoryCalculations.ts';
import { CharacterAvatar } from './CharacterAvatar.tsx';

interface CompareViewProps {
  neighborhoods: NeighborhoodData[];
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onSelectNeighborhood: (id: string) => void;
  selectedSensoryPriorities?: SensoryPriorityId[];
  onToggleSensoryPriority?: (id: SensoryPriorityId) => void;
  lang?: Lang;
}

export const CompareView: React.FC<CompareViewProps> = ({
  neighborhoods,
  compareIds,
  onToggleCompare,
  onSelectNeighborhood,
  selectedSensoryPriorities = ['quiet_night', 'safe_walkway', 'park_forest', 'sunset_lighting'],
  onToggleSensoryPriority,
  lang = 'ko',
}) => {
  const [compareMode, setCompareMode] = useState<'all' | 'liquidity' | 'sensory'>('all');
  const compareItems = neighborhoods.filter((n) => compareIds.includes(n.id));

  return (
    <div className="flex flex-col gap-3.5 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#191f28]">
              {lang === 'ko'
                ? '동네 1:1 비교 (환금성 6대 기준 × 감각기억)'
                : 'Neighborhood Comparison (6 Liquidity Pillars × Sensory Memory)'}
            </h2>
            <p className="text-[11px] text-[#4e5968] mt-0.5">
              {lang === 'ko'
                ? '객관적 입지(환금성 6대 기준)와 내가 고른 감각기억을 한눈에 대조합니다.'
                : 'Side-by-side comparison of objective 6-pillar liquidity and your sensory priorities.'}
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#3182f6] bg-[#e8f3ff] px-2.5 py-1 rounded-full shrink-0">
            {lang === 'ko' ? `${compareItems.length}개 선택됨` : `${compareItems.length} Selected`}
          </span>
        </div>

        {/* Filter Mode Switcher */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 bg-[#f2f4f6] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setCompareMode('all')}
            className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              compareMode === 'all'
                ? 'bg-white text-[#191f28] shadow-2xs'
                : 'text-[#8b95a1] hover:text-[#191f28]'
            }`}
          >
            {lang === 'ko' ? '전체 통합 비교' : 'All Combined'}
          </button>
          <button
            type="button"
            onClick={() => setCompareMode('liquidity')}
            className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              compareMode === 'liquidity'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-[#8b95a1] hover:text-[#191f28]'
            }`}
          >
            {lang === 'ko' ? '🏛️ 객관 입지 (환금성 6대)' : '🏛️ 6 Liquidity Pillars'}
          </button>
          <button
            type="button"
            onClick={() => setCompareMode('sensory')}
            className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              compareMode === 'sensory'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-[#8b95a1] hover:text-[#191f28]'
            }`}
          >
            {lang === 'ko' ? '✨ 주관 감각기억' : '✨ Sensory Memory'}
          </button>
        </div>
      </div>

      {/* Add/Remove Neighborhood Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {neighborhoods.map((n) => {
          const active = compareIds.includes(n.id);
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onToggleCompare(n.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? 'bg-[#191f28] text-white shadow-xs'
                  : 'bg-white text-[#4e5968] border border-[#edf0f3] hover:bg-slate-50'
              }`}
            >
              <CharacterAvatar
                character={n.perspective === 'gyodong' ? 'gyodong' : 'pingu'}
                size={16}
              />
              <span>{lang === 'en' && n.nameEn ? n.nameEn.split(' ')[0] : n.name.split(' ')[0]}</span>
              {n.liquidity && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {n.liquidity.grade}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {compareItems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#edf0f3] text-[#8b95a1] text-sm">
          {lang === 'ko'
            ? '위 동네 버튼을 눌러 비교할 동네를 1개 이상 선택해주세요.'
            : 'Tap neighborhood pills above to select areas for comparison.'}
        </div>
      ) : (
        <>
          {/* SECTION 1: Objective Location — 6 Liquidity Pillars Comparison */}
          {(compareMode === 'all' || compareMode === 'liquidity') && (
            <section className="bg-white rounded-3xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                    OBJECTIVE LOCATION · LIQUIDITY
                  </span>
                  <h3 className="text-[15px] font-extrabold text-[#191f28]">
                    {lang === 'ko'
                      ? '객관적인 입지 비교: 환금성 6대 기준'
                      : 'Objective Location: 6 Liquidity Pillars'}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                  {lang === 'ko' ? '1.브랜드 · 2.신축 · 3.역세권 · 4.학군 · 5.평지 · 6.세대수' : '6 Core Pillars'}
                </span>
              </div>

              {/* Overall Liquidity Grade Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {compareItems.map((item) => (
                  <div
                    key={`liq-head-${item.id}`}
                    onClick={() => onSelectNeighborhood(item.id)}
                    className="bg-slate-900 text-white rounded-2xl p-3 cursor-pointer hover:bg-slate-800 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-indigo-300 truncate">
                        {lang === 'en' && item.stationDistanceEn
                          ? item.stationDistanceEn
                          : item.stationDistance}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/40 text-amber-300 text-[10px] font-extrabold">
                        {item.liquidity?.grade || 'A'} ({item.liquidity?.totalScore || 85}점)
                      </span>
                    </div>
                    <h4 className="text-[13px] font-extrabold mt-1 truncate">
                      {lang === 'en' && item.nameEn ? item.nameEn : item.name}
                    </h4>
                  </div>
                ))}
              </div>

              {/* 6 Liquidity Pillars Bars */}
              <div className="flex flex-col gap-3.5">
                {LIQUIDITY_PILLAR_META.map((pillar) => (
                  <div key={pillar.key} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/70">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                          {pillar.step}
                        </span>
                        <span>
                          {pillar.icon} {lang === 'en' ? pillar.labelEn : pillar.labelKo}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {lang === 'en' ? pillar.descEn : pillar.descKo}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {compareItems.map((item) => {
                        const pData = item.liquidity?.[pillar.key];
                        const score = pData?.score ?? 80;
                        const detail =
                          lang === 'en'
                            ? pData?.detailEn || pData?.labelEn || pData?.detail || pData?.label || ''
                            : pData?.detailKo || pData?.detail || pData?.labelKo || pData?.label || '';

                        return (
                          <div key={`${item.id}-${pillar.key}`} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700 truncate max-w-[140px]">
                                {lang === 'en' && item.nameEn
                                  ? item.nameEn.split(' ').slice(0, 2).join(' ')
                                  : item.name.split(' ').slice(0, 2).join(' ')}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 truncate max-w-[160px]">
                                  {detail}
                                </span>
                                <span className="font-extrabold text-indigo-700 w-9 text-right">
                                  {score}점
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: Subjective Sensory Memory — User's Chosen Priorities */}
          {(compareMode === 'all' || compareMode === 'sensory') && (
            <section className="bg-white rounded-3xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">
                    SUBJECTIVE SENSORY MEMORY
                  </span>
                  <h3 className="text-[15px] font-extrabold text-[#191f28]">
                    {lang === 'ko'
                      ? '주관적 감각기억 비교: 내가 중요하게 생각하는 요소'
                      : 'Subjective Sensory Memory: Your Chosen Priorities'}
                  </h3>
                </div>
              </div>

              {/* Priority Selector Chips */}
              {onToggleSensoryPriority && (
                <div className="flex flex-wrap gap-1.5">
                  {SENSORY_PRIORITY_OPTIONS.map((opt) => {
                    const active = selectedSensoryPriorities.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onToggleSensoryPriority(opt.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          active
                            ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{opt.icon}</span>
                        <span>{lang === 'en' ? opt.labelEn : opt.labelKo}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Metric 1: Perceived Incline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-[#191f28] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#e03e52]">
                      Moving
                    </span>
                    {lang === 'ko'
                      ? '보행 경사 체감 (낮을수록 평지 산책)'
                      : 'Perceived Walking Slope (Lower = Flatter)'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {compareItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="w-28 text-[12px] font-medium text-[#4e5968] truncate">
                        {lang === 'en' && item.nameEn
                          ? item.nameEn.split(' ').slice(0, 2).join(' ')
                          : item.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                      <div className="flex-1 h-2.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#e03e52] rounded-full transition-all duration-300"
                          style={{ width: `${item.inclinePercent}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-[12px] font-bold text-[#191f28]">
                        {item.inclineAngleDeg}° ({item.inclinePercent}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metric 2: Noise */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-[#191f28] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#3182f6]">
                      volume_down
                    </span>
                    {lang === 'ko'
                      ? '골목 생활 소음 (낮을수록 정온·고요)'
                      : 'Ambient Street Noise (Lower = Quieter)'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {compareItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="w-28 text-[12px] font-medium text-[#4e5968] truncate">
                        {lang === 'en' && item.nameEn
                          ? item.nameEn.split(' ').slice(0, 2).join(' ')
                          : item.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                      <div className="flex-1 h-2.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3182f6] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, item.noiseDb * 1.4)}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-[12px] font-bold text-[#191f28]">
                        {item.noiseDb}dB
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metric 3: Coziness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-[#191f28] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#f59f00]">
                      wb_twilight
                    </span>
                    {lang === 'ko'
                      ? '노을 조도 & 골목 아늑함'
                      : 'Sunset Glow & Alley Coziness'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {compareItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="w-28 text-[12px] font-medium text-[#4e5968] truncate">
                        {lang === 'en' && item.nameEn
                          ? item.nameEn.split(' ').slice(0, 2).join(' ')
                          : item.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                      <div className="flex-1 h-2.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#f59f00] rounded-full transition-all duration-300"
                          style={{ width: `${item.cozinessPercent}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-[12px] font-bold text-[#191f28]">
                        {item.cozinessPercent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metric 4: Greenery & Overall Sensory Score */}
              <div className="pt-3 border-t border-[#f2f4f6] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {compareItems.map((item) => {
                  const score = calculateSensoryComfortScore(
                    item.inclinePercent,
                    item.cozinessPercent,
                    item.noiseDb,
                    item.greenWalkMinutes
                  );
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectNeighborhood(item.id)}
                      className="bg-[#f7f9fb] rounded-2xl p-3.5 border border-[#edf0f3] cursor-pointer hover:border-[#3182f6] transition-all flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#3182f6]">
                            {lang === 'ko'
                              ? `✨ 감각 만족도 ${score}점`
                              : `✨ Sensory Score ${score}pts`}
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {lang === 'ko'
                              ? `환금성 ${item.liquidity?.grade || 'A'}`
                              : `Liquidity ${item.liquidity?.grade || 'A'}`}
                          </span>
                        </div>
                        <h4 className="text-[14px] font-extrabold text-[#191f28] mt-1 truncate">
                          {lang === 'en' && item.nameEn ? item.nameEn : item.name}
                        </h4>
                        <p className="text-[11px] text-[#4e5968] mt-1 line-clamp-2">
                          {lang === 'en' && item.quoteEn ? item.quoteEn : item.quote}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px] text-[#8b95a1]">
                        <span>
                          🌿{' '}
                          {lang === 'ko'
                            ? `공원 도보 ${item.greenWalkMinutes}분`
                            : `${item.greenWalkMinutes}m to Park`}
                        </span>
                        <span className="font-bold text-[#0051ff]">
                          {lang === 'ko' ? '3D 디오라마 보기 →' : 'Open 3D →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
