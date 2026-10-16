import React, { useEffect, useRef, useState } from 'react';
import type { NeighborhoodMemory } from '../types';
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
        `${memoryA.neighborhoodName} excels in ${
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
      <div className="bg-white rounded-2xl p-3 border border-[#E6D5B8] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className={aWins ? 'text-[#2D6A4F]' : 'text-[#6B705C]'}>
            {valA}
            {unit} {aWins ? '👑' : ''}
          </span>
          <span className="text-[#2F3E46] uppercase tracking-wider text-[11px]">{label}</span>
          <span className={bWins ? 'text-[#E07A5F]' : 'text-[#6B705C]'}>
            {bWins ? '👑 ' : ''}
            {valB}
            {unit}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 h-2">
          <div className="bg-[#EDF6E5] rounded-full overflow-hidden flex justify-end">
            <div
              className="bg-[#52B788] h-full rounded-full"
              style={{ width: `${Math.min(100, Math.max(12, valA))}%` }}
            />
          </div>
          <div className="bg-[#FFE5D9]/60 rounded-full overflow-hidden">
            <div
              className="bg-[#E07A5F] h-full rounded-full"
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
      className="m-auto w-full max-w-3xl rounded-3xl border-4 border-[#E6D5B8] bg-[#FFF8F0] p-0 text-[#2F3E46] shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-xs"
    >
      <div className="p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E6D5B8] pb-3.5">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </span>
            <div>
              <h2 id="compare-dialog-title" className="font-display font-extrabold text-xl text-[#2F3E46]">
                Compare Visited Neighborhoods
              </h2>
              <p className="text-xs text-[#6B705C]">
                Side-by-side homebuyer trade-off analysis powered by Gemini 4 Argon
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Comparison Modal"
            className="p-2 rounded-2xl bg-white border border-[#E6D5B8] hover:bg-[#F4EAE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3 border-2 border-[#52B788]">
            <label className="text-[10px] font-extrabold uppercase text-[#2D6A4F]">
              Neighborhood A
            </label>
            <select
              value={memoryA.id}
              onChange={(e) => setLeftId(e.target.value)}
              className="mt-1 w-full font-display font-bold text-sm text-[#2F3E46] bg-transparent focus:outline-none"
            >
              {savedMemories.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.neighborhoodName} — {m.apartmentName} (Grade {m.blueprint.livabilityMetrics.overallGrade})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl p-3 border-2 border-[#E07A5F]">
            <label className="text-[10px] font-extrabold uppercase text-[#E07A5F]">
              Neighborhood B
            </label>
            <select
              value={memoryB.id}
              onChange={(e) => setRightId(e.target.value)}
              className="mt-1 w-full font-display font-bold text-sm text-[#2F3E46] bg-transparent focus:outline-none"
            >
              {savedMemories.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.neighborhoodName} — {m.apartmentName} (Grade {m.blueprint.livabilityMetrics.overallGrade})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Comparison */}
        <div className="space-y-2">
          {renderMetricBar(
            '⛰️ Hill Slope Angle (Lower = Flatter)',
            memoryA.blueprint.terrain.slopeDegrees,
            memoryB.blueprint.terrain.slopeDegrees,
            '°',
            true
          )}
          {renderMetricBar(
            '🚇 Subway Station Walk (Lower = Faster)',
            memoryA.blueprint.transit.walkMinutes,
            memoryB.blueprint.transit.walkMinutes,
            ' min',
            true
          )}
          {renderMetricBar(
            '🌳 Park & Greenery Score',
            memoryA.blueprint.livabilityMetrics.natureScore,
            memoryB.blueprint.livabilityMetrics.natureScore,
            '/100',
            false
          )}
          {renderMetricBar(
            '🔊 Street Traffic Noise (Lower = Quieter)',
            memoryA.blueprint.traffic.noiseLevel,
            memoryB.blueprint.traffic.noiseLevel,
            ' dB',
            true
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white rounded-2xl p-3 border border-[#E6D5B8]">
            <div className="font-display font-bold text-sm text-[#2D6A4F] mb-1">
              {memoryA.apartmentName}
            </div>
            <p className="text-[#52606D] text-[11px] mb-2">{memoryA.blueprint.homebuyerInsights.aiVerdict}</p>
            <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
              <span className="px-2 py-0.5 rounded-lg bg-[#EDF6E5] text-[#1B4332] flex items-center gap-1">
                <Mountain className="w-3 h-3" /> {memoryA.blueprint.terrain.slopeDegrees}°
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#EDF6E5] text-[#1B4332] flex items-center gap-1">
                <Train className="w-3 h-3" /> {memoryA.blueprint.transit.walkMinutes}m
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#EDF6E5] text-[#1B4332] flex items-center gap-1">
                <Trees className="w-3 h-3" /> {memoryA.blueprint.trees.length} trees
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#EDF6E5] text-[#1B4332] flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> {memoryA.blueprint.traffic.noiseLevel} dB
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-[#E6D5B8]">
            <div className="font-display font-bold text-sm text-[#E07A5F] mb-1">
              {memoryB.apartmentName}
            </div>
            <p className="text-[#52606D] text-[11px] mb-2">{memoryB.blueprint.homebuyerInsights.aiVerdict}</p>
            <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
              <span className="px-2 py-0.5 rounded-lg bg-[#FFE5D9] text-[#9D0208] flex items-center gap-1">
                <Mountain className="w-3 h-3" /> {memoryB.blueprint.terrain.slopeDegrees}°
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#FFE5D9] text-[#9D0208] flex items-center gap-1">
                <Train className="w-3 h-3" /> {memoryB.blueprint.transit.walkMinutes}m
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#FFE5D9] text-[#9D0208] flex items-center gap-1">
                <Trees className="w-3 h-3" /> {memoryB.blueprint.trees.length} trees
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#FFE5D9] text-[#9D0208] flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> {memoryB.blueprint.traffic.noiseLevel} dB
              </span>
            </div>
          </div>
        </div>

        {/* Gemini 4 Argon Head-to-Head Recommendation */}
        <div className="bg-gradient-to-r from-[#FFF3B0]/70 to-[#D8F3DC]/70 border-2 border-[#E6D5B8] rounded-2xl p-3.5 flex items-start gap-3">
          <span className="w-8 h-8 rounded-xl bg-[#2F3E46] text-[#FFD166] flex items-center justify-center shrink-0 mt-0.5">
            {loadingVerdict ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </span>
          <div>
            <div className="font-display font-bold text-xs text-[#2F3E46]">
              Gemini 4 Argon Head-to-Head Homebuyer Verdict
            </div>
            <p className="text-xs text-[#2F3E46] mt-0.5 leading-relaxed">
              {loadingVerdict ? 'Analyzing trade-offs between the two neighborhoods...' : aiVerdict}
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
};
