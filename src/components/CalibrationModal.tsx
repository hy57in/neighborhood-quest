import React, { useState, useEffect } from 'react';
import { Lang, NeighborhoodData } from '../types/index.ts';
import {
  getInclineLabel,
  getNoiseLabel,
  getCozinessLabel,
  getGreeneryLabel,
} from '../utils/sensoryCalculations.ts';

interface CalibrationModalProps {
  isOpen: boolean;
  neighborhood: NeighborhoodData;
  onClose: () => void;
  onSave: (updated: Partial<NeighborhoodData>) => void;
  lang?: Lang;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  neighborhood,
  onClose,
  onSave,
  lang = 'ko',
}) => {
  const [inclinePercent, setInclinePercent] = useState(neighborhood.inclinePercent);
  const [cozinessPercent, setCozinessPercent] = useState(neighborhood.cozinessPercent);
  const [noiseDb, setNoiseDb] = useState(neighborhood.noiseDb);
  const [greenWalkMinutes, setGreenWalkMinutes] = useState(neighborhood.greenWalkMinutes);
  const [quote, setQuote] = useState(neighborhood.quote);

  useEffect(() => {
    setInclinePercent(neighborhood.inclinePercent);
    setCozinessPercent(neighborhood.cozinessPercent);
    setNoiseDb(neighborhood.noiseDb);
    setGreenWalkMinutes(neighborhood.greenWalkMinutes);
    setQuote(neighborhood.quote);
  }, [neighborhood, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAngle = Math.max(2, Math.round((inclinePercent / 100) * 22));

    const updatedMetrics = neighborhood.metrics.map((m) => {
      if (m.type === 'incline') {
        return {
          ...m,
          value: `${inclinePercent}%`,
          valueEn: `${inclinePercent}%`,
          numericValue: inclinePercent,
          status: getInclineLabel(inclinePercent, 'ko'),
          statusEn: getInclineLabel(inclinePercent, 'en'),
        };
      }
      if (m.type === 'coziness') {
        return {
          ...m,
          value: `${cozinessPercent}%`,
          valueEn: `${cozinessPercent}%`,
          numericValue: cozinessPercent,
          status: getCozinessLabel(cozinessPercent, 'ko'),
          statusEn: getCozinessLabel(cozinessPercent, 'en'),
        };
      }
      if (m.type === 'noise') {
        return {
          ...m,
          value: `${noiseDb}dB`,
          valueEn: `${noiseDb}dB`,
          numericValue: noiseDb,
          status: getNoiseLabel(noiseDb, 'ko'),
          statusEn: getNoiseLabel(noiseDb, 'en'),
        };
      }
      if (m.type === 'greenery') {
        return {
          ...m,
          value: `${greenWalkMinutes}분`,
          valueEn: `${greenWalkMinutes}m`,
          numericValue: greenWalkMinutes,
          status: getGreeneryLabel(greenWalkMinutes, 'ko').split(' ')[0],
          statusEn: getGreeneryLabel(greenWalkMinutes, 'en').split(' ')[0],
        };
      }
      return m;
    });

    onSave({
      inclinePercent,
      inclineAngleDeg: updatedAngle,
      cozinessPercent,
      noiseDb,
      greenWalkMinutes,
      quote,
      metrics: updatedMetrics,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calibration-modal-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 border border-[#edf0f3] shadow-2xl max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold text-[#3182f6] uppercase tracking-wider">
              3D Sensory Calibration
            </span>
            <h2 id="calibration-modal-title" className="text-[18px] font-bold text-[#191f28]">
              {lang === 'ko' ? '기억 보정 & 3D 디오라마 편집' : 'Calibrate Memory & Edit 3D Diorama'}
            </h2>
          </div>
          <button
            type="button"
            aria-label={lang === 'ko' ? '모달 닫기' : 'Close modal'}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f2f4f6] hover:bg-[#e5e8eb] flex items-center justify-center text-[#4e5968]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Incline Slider */}
          <div className="bg-[#f7f9fb] p-3.5 rounded-2xl border border-[#edf0f3]">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="incline-slider" className="text-[13px] font-bold text-[#191f28]">
                {lang === 'ko' ? '⛰️ 경사도 체감 (%)' : '⛰️ Perceived Slope (%)'}
              </label>
              <span className="text-[13px] font-extrabold text-[#e03e52]">
                {inclinePercent}% · {getInclineLabel(inclinePercent, lang)}
              </span>
            </div>
            <input
              id="incline-slider"
              type="range"
              min={0}
              max={100}
              value={inclinePercent}
              onChange={(e) => setInclinePercent(Number(e.target.value))}
              className="w-full accent-[#e03e52] cursor-pointer"
            />
          </div>

          {/* Coziness Slider */}
          <div className="bg-[#f7f9fb] p-3.5 rounded-2xl border border-[#edf0f3]">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="coziness-slider" className="text-[13px] font-bold text-[#191f28]">
                {lang === 'ko' ? '💡 골목 아늑함 (%)' : '💡 Alley Coziness (%)'}
              </label>
              <span className="text-[13px] font-extrabold text-[#f59f00]">
                {cozinessPercent}% · {getCozinessLabel(cozinessPercent, lang)}
              </span>
            </div>
            <input
              id="coziness-slider"
              type="range"
              min={20}
              max={100}
              value={cozinessPercent}
              onChange={(e) => setCozinessPercent(Number(e.target.value))}
              className="w-full accent-[#f59f00] cursor-pointer"
            />
          </div>

          {/* Noise Slider */}
          <div className="bg-[#f7f9fb] p-3.5 rounded-2xl border border-[#edf0f3]">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="noise-slider" className="text-[13px] font-bold text-[#191f28]">
                {lang === 'ko' ? '🔊 생활 소음 (dB)' : '🔊 Ambient Noise (dB)'}
              </label>
              <span className="text-[13px] font-extrabold text-[#3182f6]">
                {noiseDb}dB · {getNoiseLabel(noiseDb, lang)}
              </span>
            </div>
            <input
              id="noise-slider"
              type="range"
              min={15}
              max={75}
              value={noiseDb}
              onChange={(e) => setNoiseDb(Number(e.target.value))}
              className="w-full accent-[#3182f6] cursor-pointer"
            />
          </div>

          {/* Greenery Slider */}
          <div className="bg-[#f7f9fb] p-3.5 rounded-2xl border border-[#edf0f3]">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="green-slider" className="text-[13px] font-bold text-[#191f28]">
                {lang === 'ko' ? '🌿 녹지 도보 거리 (분)' : '🌿 Walk to Park (min)'}
              </label>
              <span className="text-[13px] font-extrabold text-[#0ca678]">
                {lang === 'ko' ? `${greenWalkMinutes}분` : `${greenWalkMinutes}m`} ·{' '}
                {getGreeneryLabel(greenWalkMinutes, lang)}
              </span>
            </div>
            <input
              id="green-slider"
              type="range"
              min={1}
              max={20}
              value={greenWalkMinutes}
              onChange={(e) => setGreenWalkMinutes(Number(e.target.value))}
              className="w-full accent-[#0ca678] cursor-pointer"
            />
          </div>

          {/* Quote Textarea */}
          <div className="bg-[#f7f9fb] p-3.5 rounded-2xl border border-[#edf0f3]">
            <label
              htmlFor="memo-textarea"
              className="text-[13px] font-bold text-[#191f28] block mb-1.5"
            >
              {lang === 'ko' ? '📝 현장 임장 메모' : '📝 Field Memory Note'}
            </label>
            <textarea
              id="memo-textarea"
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full bg-white rounded-xl p-2.5 text-[13px] text-[#191f28] border border-[#edf0f3] focus:outline-none focus:border-[#3182f6]"
            />
          </div>

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-[#f2f4f6] text-[#4e5968] text-[14px] font-bold hover:bg-[#e5e8eb] transition-colors"
            >
              {lang === 'ko' ? '취소' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-[1.5] h-12 rounded-xl bg-[#3182f6] text-white text-[14px] font-bold hover:bg-[#1b64da] transition-colors shadow-sm"
            >
              {lang === 'ko' ? '3D 디오라마에 반영하기' : 'Apply to 3D Diorama'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
