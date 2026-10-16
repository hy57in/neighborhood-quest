import React, { useEffect, useRef, useState } from 'react';
import type { NeighborhoodMemory } from '../types';
import { useI18n } from '../i18n';
import { Scale, Sparkles, X, Loader2, Mountain, Train, Trees, Volume2 } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedMemories: NeighborhoodMemory[];
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  savedMemories,
}) => {
  const { lang, t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [leftId, setLeftId] = useState<string>('');
  const [rightId, setRightId] = useState<string>('');
  const [aiVerdict, setAiVerdict] = useState<string>('');
  const [loadingVerdict, setLoadingVerdict] = useState<boolean>(false);

  useEffect(() => {
    if (savedMemories.length >= 2) {
      if (!leftId) setLeftId(savedMemories[0].id);
      if (!rightId) setRightId(savedMemories[1].id);
    } else if (savedMemories.length === 1) {
      setLeftId(savedMemories[0].id);
      setRightId(savedMemories[0].id);
    }
  }, [savedMemories, leftId, rightId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const memoryA = savedMemories.find((m) => m.id === leftId) || savedMemories[0];
  const memoryB = savedMemories.find((m) => m.id === rightId) || savedMemories[1] || savedMemories[0];

  const handleAskGeminiComparison = async () => {
    if (!memoryA || !memoryB) return;
    setLoadingVerdict(true);
    try {
      const res = await fetch('/api/compare-neighborhoods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryA, memoryB }),
      });
      const data = await res.json();
      if (data.comparisonVerdict) {
        setAiVerdict(data.comparisonVerdict);
      }
    } catch {
      setAiVerdict(
        lang === 'ko'
          ? `${memoryA.neighborhoodNameKo}은(는) ${
              memoryA.blueprint.terrain.slopeDegrees < memoryB.blueprint.terrain.slopeDegrees
                ? `평탄한 보행 환경(경사도 ${memoryA.blueprint.terrain.slopeDegrees}°)`
                : `조용한 주거 쾌적성(소음 ${memoryA.blueprint.traffic.noiseLevel} dB)`
            }에서 강점이 있으며, ${memoryB.neighborhoodNameKo}은(는) ${
              memoryB.blueprint.transit.stationName
            } 도보 ${memoryB.blueprint.transit.walkMinutes}분 역세권 접근성이 돋보입니다.`
          : `${memoryA.neighborhoodName} excels in ${
              memoryA.blueprint.terrain.slopeDegrees < memoryB.blueprint.terrain.slopeDegrees
                ? `flat walkability (${memoryA.blueprint.terrain.slopeDegrees}° slope)`
                : `quiet elevation (${memoryA.blueprint.traffic.noiseLevel} dB)`
            }, while ${memoryB.neighborhoodName} offers ${memoryB.blueprint.transit.walkMinutes}-minute subway access to ${
              memoryB.blueprint.transit.stationName
            }.`
      );
    } finally {
      setLoadingVerdict(false);
    }
  };

  useEffect(() => {
    if (isOpen && memoryA && memoryB) {
      handleAskGeminiComparison();
    }
  }, [isOpen, leftId, rightId]);

  if (!memoryA || !memoryB) return null;

  const renderMetricBar = (label: string, valA: number, valB: number, unit = '', lowerIsBetter = false) => {
    const aWins = lowerIsBetter ? valA <= valB : valA >= valB;
    const bWins = lowerIsBetter ? valB <= valA : valB >= valA;
    return (
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className={aWins ? 'text-emerald-700' : 'text-slate-500'}>
            {valA}
            {unit} {aWins ? '👑' : ''}
          </span>
          <span className="text-slate-700 uppercase tracking-wider text-[11px]">{label}</span>
          <span className={bWins ? 'text-orange-600' : 'text-slate-500'}>
            {bWins ? '👑 ' : ''}
            {valB}
            {unit}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 h-2">
          <div className="bg-emerald-100 rounded-full overflow-hidden flex justify-end">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${Math.min(100, Math.max(12, valA))}%` }}
            />
          </div>
          <div className="bg-orange-100 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full"
              style={{ width: `${Math.min(100, Math.max(12, valB))}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <dialog
      ref={dialogRef}
      // @ts-expect-error closedby is a modern HTML standard attribute per modern-web-guidance
      closedby="any"
      aria-labelledby="compare-dialog-title"
      onClose={onClose}
      onClick={handleDialogClick}
      className="m-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-xs"
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </span>
            <div>
              <h2 id="compare-dialog-title" className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
                {t('방문한 동네 1:1 비교 분석', 'Compare Visited Neighborhoods')}
              </h2>
              <p className="text-xs text-slate-500">
                {t(
                  'Gemini 4 Argon 기반 동네별 장단점 및 실거주 트레이드오프 비교',
                  'Side-by-side homebuyer trade-off analysis powered by Gemini 4 Argon'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Comparison Modal"
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-emerald-50/50 rounded-2xl p-3 border-2 border-emerald-500">
            <label className="text-[10px] font-extrabold uppercase text-emerald-800">
              {t('동네 A', 'Neighborhood A')}
            </label>
            <select
              value={memoryA.id}
              onChange={(e) => setLeftId(e.target.value)}
              className="mt-1 w-full font-display font-bold text-sm text-slate-900 bg-transparent focus:outline-none"
            >
              {savedMemories.map((m) => (
                <option key={m.id} value={m.id}>
                  {lang === 'ko' ? m.neighborhoodNameKo : m.neighborhoodName} — {m.apartmentName} (
                  {t('등급', 'Grade')} {m.blueprint.livabilityMetrics.overallGrade})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-orange-50/50 rounded-2xl p-3 border-2 border-orange-500">
            <label className="text-[10px] font-extrabold uppercase text-orange-800">
              {t('동네 B', 'Neighborhood B')}
            </label>
            <select
              value={memoryB.id}
              onChange={(e) => setRightId(e.target.value)}
              className="mt-1 w-full font-display font-bold text-sm text-slate-900 bg-transparent focus:outline-none"
            >
              {savedMemories.map((m) => (
                <option key={m.id} value={m.id}>
                  {lang === 'ko' ? m.neighborhoodNameKo : m.neighborhoodName} — {m.apartmentName} (
                  {t('등급', 'Grade')} {m.blueprint.livabilityMetrics.overallGrade})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Comparison */}
        <div className="space-y-2">
          {renderMetricBar(
            t('⛰️ 언덕 경사도 (낮을수록 평지)', '⛰️ Hill Slope Angle (Lower = Flatter)'),
            memoryA.blueprint.terrain.slopeDegrees,
            memoryB.blueprint.terrain.slopeDegrees,
            '°',
            true
          )}
          {renderMetricBar(
            t('🚇 지하철역 도보 시간 (낮을수록 역세권)', '🚇 Subway Station Walk (Lower = Faster)'),
            memoryA.blueprint.transit.walkMinutes,
            memoryB.blueprint.transit.walkMinutes,
            t('분', ' min'),
            true
          )}
          {renderMetricBar(
            t('🌳 공원 및 녹지 점수', '🌳 Park & Greenery Score'),
            memoryA.blueprint.livabilityMetrics.natureScore,
            memoryB.blueprint.livabilityMetrics.natureScore,
            '/100',
            false
          )}
          {renderMetricBar(
            t('🔊 도로 교통 소음 (낮을수록 조용함)', '🔊 Street Traffic Noise (Lower = Quieter)'),
            memoryA.blueprint.traffic.noiseLevel,
            memoryB.blueprint.traffic.noiseLevel,
            ' dB',
            true
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="font-display font-bold text-sm text-emerald-800 mb-1">
              {memoryA.apartmentName}
            </div>
            <p className="text-slate-600 text-[11px] mb-2">{memoryA.blueprint.homebuyerInsights.aiVerdict}</p>
            <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 flex items-center gap-1">
                <Mountain className="w-3 h-3" /> {memoryA.blueprint.terrain.slopeDegrees}°
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 flex items-center gap-1">
                <Train className="w-3 h-3" /> {memoryA.blueprint.transit.walkMinutes}m
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 flex items-center gap-1">
                <Trees className="w-3 h-3" /> {memoryA.blueprint.trees.length} {t('그루', 'trees')}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> {memoryA.blueprint.traffic.noiseLevel} dB
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="font-display font-bold text-sm text-orange-800 mb-1">
              {memoryB.apartmentName}
            </div>
            <p className="text-slate-600 text-[11px] mb-2">{memoryB.blueprint.homebuyerInsights.aiVerdict}</p>
            <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
              <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-900 flex items-center gap-1">
                <Mountain className="w-3 h-3" /> {memoryB.blueprint.terrain.slopeDegrees}°
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-900 flex items-center gap-1">
                <Train className="w-3 h-3" /> {memoryB.blueprint.transit.walkMinutes}m
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-900 flex items-center gap-1">
                <Trees className="w-3 h-3" /> {memoryB.blueprint.trees.length} {t('그루', 'trees')}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-900 flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> {memoryB.blueprint.traffic.noiseLevel} dB
              </span>
            </div>
          </div>
        </div>

        {/* Gemini 4 Argon Head-to-Head Recommendation */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
          <span className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            {loadingVerdict ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </span>
          <div>
            <div className="font-display font-bold text-xs text-slate-900">
              {t(
                'Gemini 4 Argon 동네 비교 종합 의견',
                'Gemini 4 Argon Head-to-Head Homebuyer Verdict'
              )}
            </div>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              {loadingVerdict
                ? t(
                    '두 동네의 실거주 장단점을 비교 분석하고 있습니다...',
                    'Analyzing trade-offs between the two neighborhoods...'
                  )
                : aiVerdict}
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
};
