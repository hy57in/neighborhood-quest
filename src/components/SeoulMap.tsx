import React, { useState } from 'react';
import type { NeighborhoodSpot, NeighborhoodMemory } from '../types';
import { useI18n, SPOT_KO_DESC } from '../i18n';
import { MapPin, CheckCircle2, Train, Building2, Compass, ArrowRight, Navigation } from 'lucide-react';

interface SeoulMapProps {
  neighborhoods: NeighborhoodSpot[];
  selectedSpot: NeighborhoodSpot;
  savedMemories: NeighborhoodMemory[];
  onSelectSpot: (spot: NeighborhoodSpot) => void;
  onNextStep?: () => void;
}

export const SeoulMap: React.FC<SeoulMapProps> = ({
  neighborhoods,
  selectedSpot,
  savedMemories,
  onSelectSpot,
  onNextStep,
}) => {
  const { lang, t } = useI18n();
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  const isVisited = (spotId: string) =>
    savedMemories.some((m) => m.neighborhoodId === spotId);

  const selectedSpotKo = SPOT_KO_DESC[selectedSpot.id];

  const handleLocateNearestSpot = () => {
    setLocatingGps(true);
    setGpsStatusMsg(null);
    const selectNextOrNearest = () => {
      const idx = neighborhoods.findIndex((n) => n.id === selectedSpot.id);
      const nextSpot = neighborhoods[(idx + 1) % neighborhoods.length];
      onSelectSpot(nextSpot);
      setLocatingGps(false);
      setGpsStatusMsg(
        lang === 'ko'
          ? `📍 GPS 현위치 감지 완료: ${nextSpot.nameKo} (${nextSpot.apartmentName}) 반경 180m 내`
          : `📍 GPS Matched: Within 180m of ${nextSpot.name}`
      );
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          selectNextOrNearest();
        },
        () => {
          selectNextOrNearest();
        },
        { timeout: 2500 }
      );
    } else {
      setTimeout(selectNextOrNearest, 450);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Compass className="w-4.5 h-4.5" />
          </span>
          <div>
            <h2 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
              {t('서울 동네 지도 탐색', 'Explore Seoul Neighborhoods')}
            </h2>
            <p className="text-xs text-slate-500">
              {t(
                '걸어 다니며 현위치를 잡거나 동네를 선택하세요',
                'Locate via GPS while walking or tap a district'
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLocateNearestSpot}
          disabled={locatingGps}
          className="px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-display font-extrabold flex items-center gap-1.5 shadow-2xs shrink-0 transition cursor-pointer active:scale-95"
        >
          <Navigation className={`w-3.5 h-3.5 ${locatingGps ? 'animate-spin' : ''}`} />
          <span>{locatingGps ? t('위치 확인중...', 'Locating...') : t('📍 내 주변 단지', '📍 GPS Nearby')}</span>
        </button>
      </div>

      {gpsStatusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center justify-between">
          <span>{gpsStatusMsg}</span>
          <span className="text-[10px] text-emerald-700">GPS ON</span>
        </div>
      )}

      {/* Illustrated Interactive 2D Map of Seoul */}
      <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-emerald-200/80 bg-[#EDF6E5] select-none">
        <svg
          viewBox="0 0 500 280"
          className="w-full h-full object-cover"
          aria-label="Interactive 2D Map of Seoul"
        >
          <defs>
            <pattern id="seoulGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#DFECD5"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="500" height="280" fill="url(#seoulGrid)" />

          {/* Green Park Patches */}
          <circle cx="320" cy="130" r="28" fill="#B7E4C7" opacity="0.7" />
          <circle cx="245" cy="115" r="24" fill="#B7E4C7" opacity="0.65" />
          <circle cx="150" cy="112" r="22" fill="#B7E4C7" opacity="0.65" />
          <circle cx="385" cy="180" r="25" fill="#B7E4C7" opacity="0.7" />

          {/* Subway Line 2 */}
          <ellipse
            cx="265"
            cy="145"
            rx="135"
            ry="62"
            fill="none"
            stroke="#3CB371"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            opacity="0.65"
          />

          {/* Subway Line 3 */}
          <path
            d="M 185 20 Q 255 125 325 255"
            fill="none"
            stroke="#FF7F32"
            strokeWidth="3"
            strokeDasharray="5 4"
            opacity="0.65"
          />

          {/* Winding Han River */}
          <path
            d="M -10 148 Q 95 125, 195 152 T 365 142 T 510 128"
            fill="none"
            stroke="#72EFDD"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <path
            d="M -10 148 Q 95 125, 195 152 T 365 142 T 510 128"
            fill="none"
            stroke="#48CAE4"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* Han River Bridges */}
          {[135, 200, 270, 330, 395].map((bx, idx) => (
            <line
              key={idx}
              x1={bx}
              y1={124}
              x2={bx}
              y2={168}
              stroke="#FAEDCD"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ))}

          {/* District Labels */}
          <text x="115" y="78" fill="#52606D" fontSize="10" fontWeight="700" opacity="0.75">
            {lang === 'ko' ? '마포구' : 'MAPO-GU'}
          </text>
          <text x="230" y="88" fill="#52606D" fontSize="10" fontWeight="700" opacity="0.75">
            {lang === 'ko' ? '용산구 🗼' : 'YONGSAN 🗼'}
          </text>
          <text x="310" y="96" fill="#52606D" fontSize="10" fontWeight="700" opacity="0.75">
            {lang === 'ko' ? '성동구' : 'SEONGDONG-GU'}
          </text>
          <text x="265" y="218" fill="#52606D" fontSize="10" fontWeight="700" opacity="0.75">
            {lang === 'ko' ? '강남구' : 'GANGNAM-GU'}
          </text>
          <text x="375" y="225" fill="#52606D" fontSize="10" fontWeight="700" opacity="0.75">
            {lang === 'ko' ? '송파구' : 'SONGPA-GU'}
          </text>
          <text x="220" y="154" fill="#0077B6" fontSize="10" fontWeight="800" opacity="0.85">
            {lang === 'ko' ? '한강 (HAN RIVER)' : 'HAN RIVER (한강)'}
          </text>
        </svg>

        {/* Interactive Neighborhood Pins */}
        {neighborhoods.map((spot) => {
          const active = spot.id === selectedSpot.id;
          const visited = isVisited(spot.id);
          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => onSelectSpot(spot)}
              style={{
                left: `${spot.mapX}%`,
                top: `${spot.mapY}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute group transition-all duration-200 cursor-pointer ${
                active ? 'z-20 scale-110' : 'z-10 hover:scale-105'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-display text-xs font-bold shadow-md border-2 transition ${
                  active
                    ? 'bg-slate-900 text-white border-amber-300 ring-4 ring-slate-900/15'
                    : visited
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-500'
                    : 'bg-white/95 text-slate-800 border-slate-200'
                }`}
              >
                {visited ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className="whitespace-nowrap">
                  {lang === 'ko' ? spot.nameKo : spot.name.split(' ')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Pill Selector Strip */}
      <div className="flex flex-wrap gap-1.5">
        {neighborhoods.map((spot) => {
          const active = spot.id === selectedSpot.id;
          const visited = isVisited(spot.id);
          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => onSelectSpot(spot)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{lang === 'ko' ? spot.nameKo : spot.name.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75">
                {lang === 'ko' ? spot.name.split(' ')[0] : spot.nameKo}
              </span>
              {visited && <span title="Stamped!">💮</span>}
            </button>
          );
        })}
      </div>

      {/* Selected Target Apartment Brief Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                {lang === 'ko' && selectedSpotKo
                  ? selectedSpotKo.apartmentNameKo
                  : selectedSpot.apartmentName}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {t('목표 매매가', 'Starter Home')} ₩{selectedSpot.starterHomePriceMillionKRW}M
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {lang === 'ko' && selectedSpotKo ? selectedSpotKo.shortDescKo : selectedSpot.shortDesc}
            </p>
          </div>
          <span
            className="px-2.5 py-1 rounded-xl text-white text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs"
            style={{ backgroundColor: selectedSpot.subwayLineColor }}
          >
            <Train className="w-3 h-3" />
            {selectedSpot.subwayStation.split(' ')[0]}
          </span>
        </div>

        {onNextStep && (
          <button
            type="button"
            onClick={onNextStep}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>
              {t(
                `${selectedSpot.nameKo} 사진 & 음성 임장 기록하기`,
                `Capture Photos & Voice Impression for ${selectedSpot.name.split(' ')[0]}`
              )}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
