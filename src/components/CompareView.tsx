import React from 'react';
import { Lang, NeighborhoodData } from '../types/index.ts';
import { calculateSensoryComfortScore } from '../utils/sensoryCalculations.ts';

interface CompareViewProps {
  neighborhoods: NeighborhoodData[];
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onSelectNeighborhood: (id: string) => void;
  lang?: Lang;
}

export const CompareView: React.FC<CompareViewProps> = ({
  neighborhoods,
  compareIds,
  onToggleCompare,
  onSelectNeighborhood,
  lang = 'ko',
}) => {
  const compareItems = neighborhoods.filter((n) => compareIds.includes(n.id));

  return (
    <div className="flex flex-col gap-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[17px] font-bold text-[#191f28]">
            {lang === 'ko' ? '동네 감각 1:1 비교' : '1:1 Sensory Neighborhood Comparison'}
          </h2>
          <span className="text-[11px] font-bold text-[#3182f6] bg-[#e8f3ff] px-2 py-0.5 rounded-full">
            {lang === 'ko' ? `${compareItems.length}개 선택됨` : `${compareItems.length} Selected`}
          </span>
        </div>
        <p className="text-[12px] text-[#4e5968]">
          {lang === 'ko'
            ? '직접 발로 밟고 기록한 경사도, 골목 조도, 생활 소음과 숲 접근성을 나란히 비교합니다.'
            : 'Side-by-side comparison of slope incline, alley lighting, ambient noise, and park access.'}
        </p>
      </div>

      {/* Add/Remove Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {neighborhoods.map((n) => {
          const active = compareIds.includes(n.id);
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onToggleCompare(n.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1 whitespace-nowrap transition-all ${
                active
                  ? 'bg-[#3182f6] text-white shadow-xs'
                  : 'bg-white text-[#4e5968] border border-[#edf0f3]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {active ? 'check_circle' : 'add_circle'}
              </span>
              <span>{n.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {compareItems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#edf0f3] text-[#8b95a1] text-sm">
          {lang === 'ko'
            ? '위 버튼을 눌러 비교할 동네를 1개 이상 선택해주세요.'
            : 'Tap a neighborhood pill above to select areas for comparison.'}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-5">
          {/* Metric 1: Incline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-bold text-[#191f28] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#e03e52]">Moving</span>
                {lang === 'ko' ? '경사도 체감 (낮을수록 평지)' : 'Perceived Slope (Lower = Flatter)'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {compareItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="w-24 text-[12px] font-medium text-[#4e5968] truncate">
                    {item.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <div className="flex-1 h-2.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e03e52] rounded-full transition-all duration-300"
                      style={{ width: `${item.inclinePercent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[12px] font-bold text-[#191f28]">
                    {item.inclinePercent}%
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
                {lang === 'ko' ? '생활 소음 (낮을수록 고요함)' : 'Ambient Noise (Lower = Quieter)'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {compareItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="w-24 text-[12px] font-medium text-[#4e5968] truncate">
                    {item.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <div className="flex-1 h-2.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3182f6] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, item.noiseDb * 1.4)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[12px] font-bold text-[#191f28]">
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
                {lang === 'ko' ? '골목 아늑함 & 조도' : 'Alley Coziness & Warm Lighting'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {compareItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="w-24 text-[12px] font-medium text-[#4e5968] truncate">
                    {item.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <div className="flex-1 h-2.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f59f00] rounded-full transition-all duration-300"
                      style={{ width: `${item.cozinessPercent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[12px] font-bold text-[#191f28]">
                    {item.cozinessPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metric 4: Greenery & Overall Score */}
          <div className="pt-3 border-t border-[#f2f4f6] grid grid-cols-2 gap-2.5">
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
                  className="bg-[#f7f9fb] rounded-2xl p-3 border border-[#edf0f3] cursor-pointer hover:border-[#3182f6] transition-all"
                >
                  <span className="text-[11px] font-bold text-[#3182f6] block">
                    {lang === 'ko' ? `종합 감각점수 ${score}점` : `Sensory Score ${score}pts`}
                  </span>
                  <h4 className="text-[14px] font-bold text-[#191f28] mt-0.5 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#8b95a1] mt-1">
                    {lang === 'ko'
                      ? `🌿 숲세권 도보 ${item.greenWalkMinutes}분 · ${item.stationDistance}`
                      : `🌿 ${item.greenWalkMinutes}m to Park · ${item.stationDistance}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
