import React from 'react';
import type { SceneBlueprint, VerificationReport } from '../types';
import { useI18n } from '../i18n';
import {
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Sliders,
  Eye,
  Wand2,
  ThumbsUp,
  AlertTriangle,
  Heart,
  Sun,
  Sunset,
  Moon,
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
  const { lang, t } = useI18n();

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

  const handleTimeOfDayChange = (timeOfDay: SceneBlueprint['timeOfDay']) => {
    onTuneBlueprint({
      ...blueprint,
      timeOfDay,
    });
  };

  const verifiedList =
    lang === 'ko'
      ? [
          `[물리적 특징 · 지형] 경사도(${blueprint.terrain.slopeDegrees}°) 및 언덕 계단이 현장 사진·음성 기록과 일치함을 검증.`,
          `[물리적 특징 · 교통] ${blueprint.transit.stationName} 도보 ${blueprint.transit.walkMinutes}분 거리 및 공원 나무(${blueprint.trees.length}그루) 배치 완료.`,
          `[감각적 디테일 · 소음] 도로 소음(${blueprint.traffic.noiseLevel} dB) 및 3D 음파 링이 현장 오디오/음성 메모와 동기화됨.`,
        ]
      : verification.verifiedObservations ?? [
          `[Physical · Terrain] Slope (${blueprint.terrain.slopeDegrees}°) & hillside stairway verified against field photos and voice note.`,
          `[Physical · Transit & Nature] ${blueprint.transit.walkMinutes}-min walk to ${blueprint.transit.stationName} & ${blueprint.trees.length} park trees grounded in observation.`,
          `[Sensory · Acoustics] Street traffic noise (${blueprint.traffic.noiseLevel} dB) & 3D acoustic rings calibrated to audio impression.`,
        ];

  const emotionalList =
    lang === 'ko'
      ? [
          blueprint.timeOfDay === 'twilight'
            ? `[주관적 감정 기록] 오르막과 퇴근길 소음으로 인해 '지치고 부담스럽게 느껴진 감정'을 저녁 황혼 조명(Twilight)과 감정 핀(💭)으로 시각화 — 객관적 동네 결함이나 위험도로 왜곡하지 않음.`
            : `[주관적 감정 기록] 언덕 위 공원과 골목길에서 느낀 '따뜻하고 평화로운 설렘'을 노을빛 조명(Golden Hour)과 감정 핀(💛)으로 보존 — 주관적 인상임을 명확히 구분.`,
        ]
      : [
          blueprint.timeOfDay === 'twilight'
            ? `[Subjective Emotional Impression] Visitor's feeling of being tired/overwhelmed by the climb is expressed via twilight mood & emotion pin (💭) — explicitly preserved as a personal feeling, NOT an objective safety fact.`
            : `[Subjective Emotional Impression] Visitor's cozy, peaceful feeling in the park & alleys is expressed via warm golden-hour lighting & emotion pin (💛) — clearly distinguished from objective metrics.`,
        ];

  const interpretedList =
    lang === 'ko'
      ? [
          `객관적 CAD 디지털 트윈이 아닌, 다시 방문하고 싶은 동물의숲 감성 파스텔 3D 기억 섬으로 스타일화.`,
          `포근한 구름, 은은한 창문 불빛, 산책로 분위기 등 기억 회상(Relive)을 돕는 공간 스토리텔링 연출.`,
        ]
      : verification.aiInterpretations ?? [
          `Stylized Animal Crossing-inspired miniature proportions (personal 3D memory, not a photorealistic CAD twin).`,
          `Ambient clouds, cozy window glow, and spatial storytelling elements crafted for vivid recall.`,
        ];

  return (
    <div className="flex flex-col gap-3.5">
      {/* Top Card: Relive & Evidence Validation */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                {t(
                  '기억 회상 (Relive) & 멀티모달 근거 검증',
                  'Relive Memory & Evidence Validation'
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  `물리·감각 팩트와 주관적 감정을 구분해 검증 (${verification.patchCount}건 자동 보정)`,
                  `Separates physical/sensory facts from subjective emotions (${verification.patchCount} patched)`
                )}
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-right shrink-0">
            <div className="text-[9px] font-bold uppercase">{t('기억 정합성', 'Fidelity')}</div>
            <div className="font-display font-extrabold text-sm leading-tight">
              {verification.overallFidelityScore}%
            </div>
          </div>
        </div>

        {/* Live 3D Scene & Emotional Mood Relive Controls */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs font-display font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {t(
                  '내 기억 다시 다듬기 (3D 지형·소음·감정 조명 실시간 조율)',
                  'Refine & Relive Your 3D Memory Live'
                )}
              </span>
            </div>

            {/* Emotional Mood / Time of Day Switcher */}
            <div className="inline-flex rounded-xl bg-white border border-slate-200 p-0.5 text-[10px] font-display font-bold">
              <button
                type="button"
                onClick={() => handleTimeOfDayChange('morning')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  blueprint.timeOfDay === 'morning'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>{t('상쾌한 아침', 'Morning')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTimeOfDayChange('golden_hour')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  blueprint.timeOfDay === 'golden_hour'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sunset className="w-3 h-3" />
                <span>{t('따뜻한 노을', 'Cozy Sunset')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTimeOfDayChange('twilight')}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  blueprint.timeOfDay === 'twilight'
                    ? 'bg-indigo-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>{t('차분한 저녁', 'Twilight')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex flex-col gap-1 font-semibold text-slate-700">
              <div className="flex justify-between">
                <span>⛰️ {t('3D 언덕 경사 & 계단', '3D Slope & Stairs')}</span>
                <span className="font-bold text-orange-700">
                  {blueprint.terrain.slopeDegrees}°{' '}
                  {blueprint.terrain.hasHillsideStairs
                    ? t('(계단 생성)', '(Stairs)')
                    : t('(평지)', '(Flat)')}
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
                <span>🔊 {t('3D 교통량 & 소음 링', '3D Traffic & Noise Rings')}</span>
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

        {/* 3-Layer Evidence Breakdown: Physical/Sensory vs. Subjective Emotion vs. Stylized 3D */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* Layer 1 & 2: Physical & Sensory Observations */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                {t(
                  '① 물리적 특징 & 감각 디테일 (사진·영상·음성 근거)',
                  '① Physical & Sensory Observations (Evidence-Backed)'
                )}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[9px] font-extrabold">
                📸 🎥 🎙️ VERIFIED
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

          {/* Layer 3: Subjective Emotional Impressions (Explicitly separated from objective facts!) */}
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-bold text-xs text-rose-950 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                {t(
                  '② 주관적 감정과 분위기 (객관적 사실과 분리 보존)',
                  '② Subjective Emotional Impressions (Preserved as Feeling)'
                )}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[9px] font-extrabold">
                {t('주관적 감정 기록', 'SUBJECTIVE FEELING')}
              </span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-700">
              {emotionalList.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">💛</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stylized 3D Representation */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-700" />
                {t('③ 공간 스토리텔링 & 3D 스타일 해석', '③ Spatial Storytelling & Stylized 3D')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-extrabold">
                {t('개인화된 3D 기억', 'PERSONAL 3D WORLD')}
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
                    <Wrench className="w-2.5 h-2.5" /> {t('자동 보정', 'Patched')}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] flex items-center gap-0.5 shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {t('근거 확인', 'Verified')}
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
              <ThumbsUp className="w-3 h-3" /> {t('기억에 남은 좋았던 점', 'Loved Here')}
            </div>
            <ul className="space-y-1 text-[11px] text-slate-700">
              {blueprint.homebuyerInsights.pros.slice(0, 2).map((pro, i) => (
                <li key={i}>• {pro}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200/70">
            <div className="font-bold text-rose-700 flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3" /> {t('아쉬웠던 점 / 유의점', 'Felt Tricky')}
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
