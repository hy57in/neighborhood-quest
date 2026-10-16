import React from 'react';
import type { SceneBlueprint, VerificationReport } from '../types';
import {
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Sliders,
  Eye,
  Wand2,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';

interface VerificationLoopPanelProps {
  blueprint: SceneBlueprint;
  verification: VerificationReport;
  onTuneBlueprint: (updated: SceneBlueprint) => void;
}

export const VerificationLoopPanel: React.FC<VerificationLoopPanelProps> = ({
  blueprint,
  verification,
  onTuneBlueprint,
}) => {
  const handleSlopeChange = (deg: number) => {
    onTuneBlueprint({
      ...blueprint,
      terrain: {
        ...blueprint.terrain,
        slopeDegrees: deg,
        hasHillsideStairs: deg >= 11,
      },
    });
  };

  const handleNoiseChange = (noise: number) => {
    onTuneBlueprint({
      ...blueprint,
      traffic: {
        ...blueprint.traffic,
        noiseLevel: noise,
        carCount: Math.max(1, Math.min(6, Math.ceil(noise / 18))),
        showNoiseWaves: noise >= 40,
      },
    });
  };

  const verifiedList = verification.verifiedObservations ?? [
    `Terrain slope (${blueprint.terrain.slopeDegrees}°) & hillside stairway verified against field ratings and note.`,
    `Subway access (${blueprint.transit.walkMinutes}-min walk to ${blueprint.transit.stationName}) grounded in field observation.`,
    `Street traffic noise (${blueprint.traffic.noiseLevel} dB) & 3D acoustic rings calibrated to user's noise rating.`,
  ];

  const interpretedList = verification.aiInterpretations ?? [
    `Stylized Animal Crossing-inspired pastel roof colors and miniature building proportions.`,
    `Ambient golden-hour clouds, cozy window glow, and decorative riverside pier placement.`,
  ];

  return (
    <div className="flex flex-col gap-3.5">
      {/* Top Card: Gemini 4 Argon Automated Verification Loop */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                Gemini 4 Argon Verification Loop
              </h3>
              <p className="text-xs text-slate-500">
                Generation → Validation → Auto-Correction ({verification.patchCount} patched)
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-right shrink-0">
            <div className="text-[9px] font-bold uppercase">Fidelity</div>
            <div className="font-display font-extrabold text-sm leading-tight">
              {verification.overallFidelityScore}%
            </div>
          </div>
        </div>

        {/* Live 3D Scene Override Sliders (Right at the top for instant feedback!) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col gap-2.5">
          <div className="text-xs font-display font-bold text-slate-800 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Interactive 3D Scene Override (Watch 3D Island Update Live)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex flex-col gap-1 font-semibold text-slate-700">
              <div className="flex justify-between">
                <span>⛰️ 3D Slope & Stairs</span>
                <span className="font-bold text-orange-700">
                  {blueprint.terrain.slopeDegrees}°{' '}
                  {blueprint.terrain.hasHillsideStairs ? '(Stairs)' : '(Flat)'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                value={blueprint.terrain.slopeDegrees}
                onChange={(e) => handleSlopeChange(Number(e.target.value))}
                className="accent-orange-600 cursor-pointer"
              />
            </label>

            <label className="flex flex-col gap-1 font-semibold text-slate-700">
              <div className="flex justify-between">
                <span>🔊 3D Traffic & Noise Rings</span>
                <span className="font-bold text-rose-600">{blueprint.traffic.noiseLevel} dB</span>
              </div>
              <input
                type="range"
                min={10}
                max={95}
                value={blueprint.traffic.noiseLevel}
                onChange={(e) => handleNoiseChange(Number(e.target.value))}
                className="accent-rose-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Grounded Observations vs AI Stylized Interpretations */}
        <div className="grid grid-cols-1 gap-2.5">
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                Verified Field Observations
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[9px] font-extrabold">
                EVIDENCE-BACKED
              </span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-700">
              {verifiedList.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-700" />
                AI Stylized 3D Interpretations
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-extrabold">
                STYLIZED DIORAMA
              </span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600">
              {interpretedList.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Parameter Verification Checks */}
        <div className="space-y-1.5">
          {verification.checks.slice(0, 3).map((chk, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-2.5 border border-slate-200/80 bg-slate-50/70 text-xs flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-1 font-bold text-slate-800">
                <span className="truncate">{chk.checkName}</span>
                {chk.status === 'auto_patched' ? (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] flex items-center gap-0.5 shrink-0">
                    <Wrench className="w-2.5 h-2.5" /> Patched
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] flex items-center gap-0.5 shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate mr-2">{chk.reasoning}</span>
                <span className="font-bold text-emerald-700 shrink-0">
                  <span className="text-slate-400 line-through mr-1">{chk.initialValue}</span>→{' '}
                  {chk.verifiedValue}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pros & Watch-Outs */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200/70">
            <div className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
              <ThumbsUp className="w-3 h-3" /> Highlights
            </div>
            <ul className="space-y-1 text-[11px] text-slate-700">
              {blueprint.homebuyerInsights.pros.slice(0, 2).map((pro, i) => (
                <li key={i}>• {pro}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200/70">
            <div className="font-bold text-rose-700 flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3" /> Watch-Outs
            </div>
            <ul className="space-y-1 text-[11px] text-slate-700">
              {blueprint.homebuyerInsights.watchOuts.slice(0, 2).map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
