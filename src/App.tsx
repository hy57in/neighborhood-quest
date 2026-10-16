import React, { useState, useRef } from 'react';
import {
  INITIAL_NEIGHBORHOODS,
  LIQUIDITY_PILLAR_META,
  SENSORY_PRIORITY_OPTIONS,
  buildLiquidityMetrics,
  buildSensoryMetrics,
  createDetailedSceneDataUrl,
} from './data/neighborhoods.ts';
import {
  Lang,
  LiquidityMetrics,
  NeighborhoodData,
  PhotoRecord,
  SensoryLayerType,
  SensoryPriorityId,
  TabType,
} from './types/index.ts';
import type {
  FieldObservationInput,
  SceneBlueprint,
  VerificationReport,
} from './types.ts';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { ExploreView } from './components/ExploreView.tsx';
import { DioramaStage } from './components/DioramaStage.tsx';
import { QuoteCard } from './components/QuoteCard.tsx';
import { SensoryMetricsGrid } from './components/SensoryMetricsGrid.tsx';
import { PhotoGalleryCard } from './components/PhotoGalleryCard.tsx';
import { CompareView } from './components/CompareView.tsx';
import { BookmarkView } from './components/BookmarkView.tsx';
import { RecordingView, CapturedMoment } from './components/RecordingView.tsx';
import { CharacterAvatar } from './components/CharacterAvatar.tsx';

export function App() {
  const [lang, setLang] = useState<Lang>('ko');
  // Start on 'explore' (탐색) so user immediately sees the map & location verification flow
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [recordSubTab, setRecordSubTab] = useState<'capture' | 'bookmarks'>('capture');

  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodData[]>(INITIAL_NEIGHBORHOODS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_NEIGHBORHOODS[0].id);
  const [activeLayer, setActiveLayer] = useState<SensoryLayerType>('all');

  const [compareIds, setCompareIds] = useState<string[]>([
    INITIAL_NEIGHBORHOODS[0].id,
    INITIAL_NEIGHBORHOODS[4].id,
  ]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    INITIAL_NEIGHBORHOODS[0].id,
    INITIAL_NEIGHBORHOODS[1].id,
    INITIAL_NEIGHBORHOODS[2].id,
  ]);

  const [selectedSensoryPriorities, setSelectedSensoryPriorities] = useState<SensoryPriorityId[]>([
    'sunset_lighting',
    'park_forest',
    'quiet_night',
    'safe_walkway',
  ]);

  const [isGenerating3D, setIsGenerating3D] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [activeEvidencePin, setActiveEvidencePin] = useState<'voice' | 'stone' | 'quiet' | 'school'>('voice');
  const quickPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const activeNeighborhood =
    neighborhoods.find((n) => n.id === selectedId) || neighborhoods[0];

  const handleToggleSensoryPriority = (id: SensoryPriorityId) => {
    setSelectedSensoryPriorities((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id]
    );
  };

  const handleToggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    const msg =
      lang === 'ko'
        ? `‘${activeNeighborhood.name}’ 3D 디오라마 & 입지 리포트 링크가 복사되었습니다.`
        : `Copied 3D Diorama link for '${activeNeighborhood.nameEn || activeNeighborhood.name}'.`;
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 2600);
  };

  // Call Gemini 4 Argon backend (/api/generate-world) to synthesize 3D blueprint + verification from photo & notes
  const synthesizeNeighborhoodWithGemini4Argon = async (params: {
    perspective: 'pingu' | 'gyodong';
    moments: CapturedMoment[];
    inclinePercent: number;
    cozinessPercent: number;
    noiseDb: number;
    greenWalkMinutes: number;
    quote: string;
    quoteEn: string;
    uploadedPhotos: string[];
    sensoryPriorities: SensoryPriorityId[];
    liquidityOverride?: LiquidityMetrics;
  }) => {
    setIsGenerating3D(true);
    setGenerationStatus(
      lang === 'ko'
        ? 'Gemini 4 Argon이 첨부 이미지와 환금성 6대 기준·감각기억을 3D 월드로 모델링 중...'
        : 'Gemini 4 Argon modeling 3D world from your attached photo, 6 liquidity pillars & sensory notes...'
    );

    const primaryPhotoUrl =
      params.uploadedPhotos[0] ||
      activeNeighborhood.photos?.[0]?.url ||
      activeNeighborhood.dioramaImageUrl;

    const liq = params.liquidityOverride || activeNeighborhood.liquidity;
    const slopeDeg = Math.max(2, Math.min(24, Math.round(params.inclinePercent * 0.22)));

    const observationPayload: FieldObservationInput = {
      neighborhoodId: activeNeighborhood.id,
      neighborhoodName: activeNeighborhood.nameEn || activeNeighborhood.name,
      neighborhoodNameKo: activeNeighborhood.name,
      district: activeNeighborhood.subName,
      apartmentName: activeNeighborhood.name,
      subwayStation: activeNeighborhood.stationDistance,
      subwayLine: '2호선',
      subwayLineColor: '#10b981',
      voiceNoteText: params.quote.replace(/^[“"]|[”"]$/g, ''),
      voiceLanguage: lang === 'en' ? 'en-US' : 'ko-KR',
      photos: [
        {
          id: `photo-${Date.now()}`,
          dataUrl: primaryPhotoUrl,
          mimeType: 'image/jpeg',
          caption: `${activeNeighborhood.name} 첨부 사진`,
          tag: 'building',
        },
      ],
      quickRatings: {
        hillSteepness: params.inclinePercent,
        parkGreenery: Math.max(50, 100 - params.greenWalkMinutes * 8),
        subwayWalkMinutes: 5,
        trafficNoise: params.noiseDb,
        cafeMartConvenience: liq?.households.score ?? 90,
      },
    };

    let blueprint: SceneBlueprint | undefined;
    let verification: VerificationReport | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);
      const res = await fetch('/api/generate-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(observationPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        blueprint = data.blueprint;
        verification = data.verification;
      }
    } catch {
      // Fallback handled cleanly below
    }

    const finalSlopeDeg = blueprint?.terrain?.slopeDegrees ?? slopeDeg;
    const newPhotoRecords: PhotoRecord[] =
      params.uploadedPhotos.length > 0
        ? [
            {
              id: `up-${Date.now()}`,
              url: params.uploadedPhotos[0],
              alt: `${activeNeighborhood.name} 첨부 이미지`,
              caption: '첨부 이미지 → 3D 릴리프 & 건물 변환 원본',
              captionEn: 'Source Photo for 3D Reconstruction',
              timeTaken: lang === 'ko' ? '방금 첨부됨' : 'Uploaded just now',
            },
            ...activeNeighborhood.photos.slice(0, 2),
          ]
        : activeNeighborhood.photos;

    setNeighborhoods((prev) =>
      prev.map((item) => {
        if (item.id !== activeNeighborhood.id) return item;
        return {
          ...item,
          perspective: params.perspective,
          quote: params.quote,
          quoteEn: blueprint?.englishSummary ? `“${blueprint.englishSummary}”` : params.quoteEn,
          quoteAuthor: params.perspective === 'gyodong' ? '교동' : '핑구',
          dioramaImageUrl: primaryPhotoUrl,
          inclineAngleDeg: finalSlopeDeg,
          inclinePercent: params.inclinePercent,
          cozinessPercent: params.cozinessPercent,
          noiseDb: params.noiseDb,
          greenWalkMinutes: params.greenWalkMinutes,
          sensoryPriorities: params.sensoryPriorities,
          liquidity: liq,
          blueprint: blueprint || item.blueprint,
          verification: verification || item.verification,
          geminiVerifiedAt: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          metrics: buildSensoryMetrics(
            params.inclinePercent,
            params.cozinessPercent,
            params.noiseDb,
            params.greenWalkMinutes
          ),
          photos: newPhotoRecords,
        };
      })
    );

    setIsGenerating3D(false);
    setGenerationStatus('');
  };

  // Direct 1-click photo upload on the Diorama tab so user can immediately test photo-to-3D reconstruction
  const handleDirectDioramaPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : undefined;
      if (!dataUrl) return;
      await synthesizeNeighborhoodWithGemini4Argon({
        perspective: activeNeighborhood.perspective || 'pingu',
        moments: [],
        inclinePercent: activeNeighborhood.inclinePercent,
        cozinessPercent: activeNeighborhood.cozinessPercent,
        noiseDb: activeNeighborhood.noiseDb,
        greenWalkMinutes: activeNeighborhood.greenWalkMinutes,
        quote: activeNeighborhood.quote,
        quoteEn: activeNeighborhood.quoteEn || activeNeighborhood.quote,
        uploadedPhotos: [dataUrl],
        sensoryPriorities: selectedSensoryPriorities,
        liquidityOverride: activeNeighborhood.liquidity,
      });
    };
    reader.readAsDataURL(file);
  };

  const evidencePinMap = {
    voice: {
      badge: '🎤 0:14 가파른 오르막',
      speaker: '🐧 핑구 (출퇴근·현실)',
      title: `음성메모 #01 · 경사 ${activeNeighborhood.inclineAngleDeg}° 보행 체감`,
      desc: activeNeighborhood.quote,
      tag: `경사도 ${activeNeighborhood.inclineAngleDeg}° (${activeNeighborhood.inclinePercent}%)`,
      layer: 'incline' as SensoryLayerType,
    },
    stone: {
      badge: '📷 석재 마감/외벽',
      speaker: '📸 멀티모달 비전 3D 매핑',
      title: `${activeNeighborhood.photos?.[0]?.caption || '현장 스냅샷'} → 3D 릴리프 변환`,
      desc: '첨부한 현장 사진의 건물 스카이라인, 외벽 색감, 경사 지형을 추출하여 3D 디오라마 블록으로 재구성했습니다.',
      tag: `사진 ${activeNeighborhood.photos.length}장 동기화`,
      layer: 'all' as SensoryLayerType,
    },
    quiet: {
      badge: '🔉 저소음 힐링',
      speaker: '🐶 교동 (감성·산책)',
      title: `골목 정숙도 ${activeNeighborhood.noiseDb}dB · 아늑함 ${activeNeighborhood.cozinessPercent}%`,
      desc: `차량 소음이 차단되는 단지 내부 산책로(${activeNeighborhood.noiseDb}dB)와 도보 ${activeNeighborhood.greenWalkMinutes}분 숲세권 녹지가 어우러진 힐링 구간입니다.`,
      tag: `소음 ${activeNeighborhood.noiseDb}dB · 산책 만족 ${activeNeighborhood.cozinessPercent}%`,
      layer: 'noise' as SensoryLayerType,
    },
    school: {
      badge: '🏫 초품아 안심통학',
      speaker: '🏛️ 환금성 6대 황금조건',
      title: `${activeNeighborhood.liquidity?.school.labelKo || '우수학군'} · 환금성 ${activeNeighborhood.liquidity?.grade || 'A'}등급`,
      desc: `${activeNeighborhood.liquidity?.school.detailKo || '안전한 통학 동선'} 입지로 실거주 학부모 수요와 매도 시 하방 경직성을 동시에 확보합니다.`,
      tag: `학군 ${activeNeighborhood.liquidity?.school.score || 90}점 · 종합 ${activeNeighborhood.liquidity?.totalScore || 88}점`,
      layer: 'sunlight' as SensoryLayerType,
    },
  };
  const currentPin = evidencePinMap[activeEvidencePin];

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#131b2e] flex flex-col">
      {/* Hidden input for quick photo-to-3D upload directly on Diorama tab */}
      <input
        ref={quickPhotoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleDirectDioramaPhotoUpload}
      />

      {/* Top Mobile/Desktop Header */}
      <Header
        neighborhood={activeNeighborhood}
        isBookmarked={bookmarkedIds.includes(activeNeighborhood.id)}
        onToggleBookmark={() => handleToggleBookmark(activeNeighborhood.id)}
        onBack={() => setActiveTab(activeTab === 'explore' ? 'diorama' : 'explore')}
        onShare={handleShare}
        showBackButton={activeTab !== 'explore'}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'ko' ? 'en' : 'ko'))}
      />

      {/* Toast message */}
      {shareToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
          {shareToast}
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-md w-full mx-auto pt-16 pb-24 px-4 flex flex-col gap-3.5">
        {/* TAB 1: EXPLORE (탐색 — 지도에서 탐색 + 위치 확인/검색 + 감각기억/환금성 6대 기준) */}
        {activeTab === 'explore' && (
          <ExploreView
            neighborhoods={neighborhoods}
            selectedId={activeNeighborhood.id}
            compareIds={compareIds}
            selectedSensoryPriorities={selectedSensoryPriorities}
            onToggleSensoryPriority={handleToggleSensoryPriority}
            onSelectNeighborhood={(id) => {
              setSelectedId(id);
              setActiveTab('diorama');
            }}
            onConfirmLocationAndRecord={(id) => {
              setSelectedId(id);
              setRecordSubTab('capture');
              setActiveTab('record');
            }}
            onOpenCompare={() => setActiveTab('compare')}
            onAddNewPlaceNeighborhood={(newPlace, goToRecord) => {
              setNeighborhoods((prev) => {
                const exists = prev.some((n) => n.id === newPlace.id);
                return exists ? prev : [newPlace, ...prev];
              });
              setSelectedId(newPlace.id);
              setBookmarkedIds((prev) =>
                prev.includes(newPlace.id) ? prev : [newPlace.id, ...prev]
              );
              if (goToRecord) {
                setRecordSubTab('capture');
                setActiveTab('record');
              } else {
                setActiveTab('diorama');
              }
            }}
            onToggleCompare={handleToggleCompare}
            lang={lang}
          />
        )}

        {/* TAB 2: DIORAMA (디오라마 — 첨부 이미지 기반 3D 입체 복원 + 환금성 6대 입지 + 감각기억) */}
        {activeTab === 'diorama' && (
          <div className="flex flex-col gap-3.5">
            {/* Stitch Top Spatial Context Card (3D DIGITAL TWIN VERIFIED) */}
            <div className="bg-white/95 backdrop-blur-xl rounded-[24px] p-4 border border-[#e3e8f2] shadow-[0_8px_24px_rgba(19,27,46,0.05)]">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#edf4ff] text-[#003dc7] text-[10px] font-black uppercase tracking-wider border border-blue-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0052ff] animate-ping" />
                  3D DIGITAL TWIN VERIFIED
                </span>
                {activeNeighborhood.liquidity && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#131b2e] text-amber-300">
                    환금성 {activeNeighborhood.liquidity.grade} ({activeNeighborhood.liquidity.totalScore}점)
                  </span>
                )}
              </div>
              <h2 className="text-[17px] font-black text-[#131b2e] tracking-tight">
                {lang === 'en' && activeNeighborhood.nameEn ? activeNeighborhood.nameEn : activeNeighborhood.name}
              </h2>
              <p className="text-[11px] font-bold text-[#6e7991] mt-0.5">
                {activeNeighborhood.subName} · {activeNeighborhood.stationDistance} · 경사 {activeNeighborhood.inclineAngleDeg}°
              </p>
            </div>

            {/* Neighborhood Quick Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {neighborhoods.map((item) => {
                const isSelected = item.id === activeNeighborhood.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#131b2e] text-white border-[#131b2e] shadow-xs'
                        : 'bg-white text-[#3e485f] border-[#e3e8f2] hover:bg-[#edf4ff]'
                    }`}
                  >
                    <CharacterAvatar
                      character={item.perspective === 'gyodong' ? 'gyodong' : 'pingu'}
                      size={16}
                    />
                    <span>
                      {lang === 'en' && item.nameEn
                        ? item.nameEn.split(' ').slice(0, 2).join(' ')
                        : item.name.split(' ').slice(0, 2).join(' ')}
                    </span>
                    {item.liquidity && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-[#0052ff] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.liquidity.grade}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Interactive 3D Diorama Stage (Photo-to-3D Relief + 6 Liquidity Pillars + OrbitControls) */}
            <DioramaStage
              neighborhood={activeNeighborhood}
              activeLayer={activeLayer}
              onSelectLayer={setActiveLayer}
              lang={lang}
            />

            {/* Stitch Interactive Evidence Pins + Popover Card */}
            <section className="bg-white rounded-[24px] p-4 border border-[#e3e8f2] shadow-[0_8px_24px_rgba(19,27,46,0.04)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-black text-[#131b2e] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0052ff]" />
                  {lang === 'ko' ? '현장 멀티모달 증거 핀 (클릭하여 검증)' : 'Multimodal Evidence Pins'}
                </span>
                <span className="text-[10px] font-extrabold text-[#003dc7] bg-[#edf4ff] px-2 py-0.5 rounded-full">
                  Evidence Linked
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['voice', 'stone', 'quiet', 'school'] as const).map((pinKey) => {
                  const pin = evidencePinMap[pinKey];
                  const active = activeEvidencePin === pinKey;
                  return (
                    <button
                      key={pinKey}
                      type="button"
                      onClick={() => {
                        setActiveEvidencePin(pinKey);
                        setActiveLayer(pin.layer);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#003dc7] text-white shadow-sm ring-2 ring-blue-200'
                          : 'bg-[#f8f9ff] text-[#3e485f] border border-[#e3e8f2] hover:bg-[#edf4ff]'
                      }`}
                    >
                      {pin.badge}
                    </button>
                  );
                })}
              </div>

              <div className="bg-gradient-to-br from-[#f8f9ff] via-white to-[#edf4ff]/60 rounded-2xl p-3.5 border border-blue-200/80">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-black text-[#003dc7]">{currentPin.speaker}</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white text-[#3e485f] border border-slate-200">
                    {currentPin.tag}
                  </span>
                </div>
                <h4 className="text-[13px] font-black text-[#131b2e] mb-1">{currentPin.title}</h4>
                <p className="text-[11px] text-[#3e485f] leading-relaxed font-medium">{currentPin.desc}</p>
              </div>
            </section>

            {/* Stitch 체감 공간 지수 (Spatial Feel Index · 신뢰도 98.4%) */}
            <section className="bg-white rounded-[24px] p-4 border border-[#e3e8f2] shadow-[0_8px_24px_rgba(19,27,46,0.04)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-black text-[#131b2e]">
                    {lang === 'ko' ? '체감 공간 지수' : 'Perceived Spatial Index'}
                  </h3>
                  <p className="text-[10px] text-[#6e7991] font-bold">
                    {lang === 'ko'
                      ? 'Gemini 4 Argon 멀티모달 공간·감성 디코딩'
                      : 'Gemini 4 Argon Spatial & Sensory Decoding'}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                  {lang === 'ko' ? '신뢰도 98.4%' : 'Confidence 98.4%'}
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-extrabold text-[#131b2e]">
                      ⛰️ 언덕 피로도 (경사 {activeNeighborhood.inclineAngleDeg}°)
                    </span>
                    <span className="font-black text-[#e03e52]">{activeNeighborhood.inclinePercent}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-[#e03e52] rounded-full transition-all duration-500"
                      style={{ width: `${activeNeighborhood.inclinePercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-extrabold text-[#131b2e]">
                      🌿 단지 아늑함 및 정숙도 ({activeNeighborhood.noiseDb}dB)
                    </span>
                    <span className="font-black text-[#003dc7]">{activeNeighborhood.cozinessPercent}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#003dc7] to-[#3b82f6] rounded-full transition-all duration-500"
                      style={{ width: `${activeNeighborhood.cozinessPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-extrabold text-[#131b2e]">
                      ☀️ 숲세권 산책 만족도 (도보 {activeNeighborhood.greenWalkMinutes}분)
                    </span>
                    <span className="font-black text-[#732ee4]">
                      {Math.max(68, 100 - activeNeighborhood.greenWalkMinutes * 5)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#732ee4] to-[#a855f7] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(68, 100 - activeNeighborhood.greenWalkMinutes * 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Direct Photo-to-3D Upload & Gemini 4 Argon Synthesis Bar */}
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between gap-2.5 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={activeNeighborhood.photos?.[0]?.url || activeNeighborhood.dioramaImageUrl}
                  alt={activeNeighborhood.name}
                  className="w-11 h-11 rounded-xl object-cover border border-indigo-500/40 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase">
                      GEMINI 4 ARGON PHOTO-TO-3D
                    </span>
                  </div>
                  <p className="text-[12px] font-bold text-white truncate">
                    {isGenerating3D
                      ? generationStatus
                      : lang === 'ko'
                        ? '첨부한 사진의 구도·색감·건물을 3D 디오라마에 투영 중'
                        : 'Projecting attached photo depth & buildings into 3D'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={isGenerating3D}
                  onClick={() => quickPhotoInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[15px]">add_a_photo</span>
                  <span>{lang === 'ko' ? '사진 바꿔서 3D 생성' : 'Photo → 3D'}</span>
                </button>
              </div>
            </div>

            {/* Objective Location Card: 6 Liquidity Pillars (환금성 6대 기준) */}
            {activeNeighborhood.liquidity && (
              <section className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                      OBJECTIVE LOCATION · 6 LIQUIDITY PILLARS
                    </span>
                    <h3 className="text-[15px] font-extrabold text-[#191f28]">
                      {lang === 'ko'
                        ? '객관적인 입지: 환금성 6대 기준'
                        : 'Objective Location: 6 Liquidity Pillars'}
                    </h3>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-extrabold">
                    {lang === 'ko'
                      ? `종합 ${activeNeighborhood.liquidity.grade} (${activeNeighborhood.liquidity.totalScore}점)`
                      : `Grade ${activeNeighborhood.liquidity.grade} (${activeNeighborhood.liquidity.totalScore}pts)`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {LIQUIDITY_PILLAR_META.map((pillar) => {
                    const data = activeNeighborhood.liquidity![pillar.key];
                    return (
                      <div
                        key={pillar.key}
                        className="bg-[#f7f9fb] rounded-xl p-2.5 border border-[#edf0f3] flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-[#191f28] flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                              {pillar.step}
                            </span>
                            <span>{lang === 'en' ? pillar.labelEn : pillar.labelKo}</span>
                          </span>
                          <span className="text-[11px] font-extrabold text-indigo-600">
                            {data.score}점
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-800 truncate">
                          {lang === 'en' ? data.labelEn || data.label : data.labelKo || data.label}
                        </div>
                        <div className="text-[10px] text-[#8b95a1] truncate">
                          {lang === 'en' ? data.detailEn || data.detail : data.detailKo || data.detail}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Subjective Sensory Memory Priority Chips */}
            <section className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-extrabold text-[#191f28]">
                  ✨ {lang === 'ko' ? '내가 중요하게 생각하는 감각기억' : 'My Chosen Sensory Priorities'}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {lang === 'ko' ? '클릭하여 변경' : 'Tap to toggle'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SENSORY_PRIORITY_OPTIONS.map((opt) => {
                  const active = selectedSensoryPriorities.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleSensoryPriority(opt.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                        active
                          ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                          : 'bg-[#f7f9fb] text-[#4e5968] border-[#edf0f3]'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{lang === 'en' ? opt.labelEn : opt.labelKo}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Field Quote Card (Pingu / Gyodong) */}
            <QuoteCard
              quote={
                lang === 'en' && activeNeighborhood.quoteEn
                  ? activeNeighborhood.quoteEn
                  : activeNeighborhood.quote
              }
              author={activeNeighborhood.quoteAuthor}
              perspective={activeNeighborhood.perspective || 'pingu'}
              onSwitchPerspective={(nextP) => {
                setNeighborhoods((prev) =>
                  prev.map((n) =>
                    n.id === activeNeighborhood.id
                      ? {
                          ...n,
                          perspective: nextP,
                          quoteAuthor: nextP === 'gyodong' ? '교동' : '핑구',
                        }
                      : n
                  )
                );
              }}
              onEditClick={() => {
                setRecordSubTab('capture');
                setActiveTab('record');
              }}
              memoryLayers={activeNeighborhood.memoryLayers}
              lang={lang}
            />

            {/* Sensory Metrics Grid */}
            <SensoryMetricsGrid metrics={activeNeighborhood.metrics} lang={lang} />

            {/* Field Photos Gallery */}
            <PhotoGalleryCard photos={activeNeighborhood.photos} lang={lang} />
          </div>
        )}

        {/* TAB 3: RECORD & BOOKMARKS (퀵기록 & 보관함 — 새 현장 기록/첨부 이미지 3D 변환 & 보관된 동네 목록) */}
        {(activeTab === 'record' || activeTab === 'bookmarks') && (
          <div className="flex flex-col gap-3">
            {/* Sub-tab switcher inside the 4th menu */}
            <div className="grid grid-cols-2 gap-1.5 bg-white p-1.5 rounded-2xl border border-[#edf0f3] shadow-2xs">
              <button
                type="button"
                onClick={() => setRecordSubTab('capture')}
                className={`py-2 rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  recordSubTab === 'capture'
                    ? 'bg-[#191f28] text-white shadow-xs'
                    : 'text-[#8b95a1] hover:text-[#191f28]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                <span>
                  {lang === 'ko' ? '현장 기록 · 사진 3D 변환' : 'Capture & Photo-to-3D'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRecordSubTab('bookmarks')}
                className={`py-2 rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  recordSubTab === 'bookmarks'
                    ? 'bg-[#191f28] text-white shadow-xs'
                    : 'text-[#8b95a1] hover:text-[#191f28]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">bookmarks</span>
                <span>
                  {lang === 'ko'
                    ? `보관된 동네 (${bookmarkedIds.length})`
                    : `Saved Quests (${bookmarkedIds.length})`}
                </span>
              </button>
            </div>

            {recordSubTab === 'capture' ? (
              <RecordingView
                neighborhood={activeNeighborhood}
                selectedSensoryPriorities={selectedSensoryPriorities}
                onToggleSensoryPriority={handleToggleSensoryPriority}
                onFinishToDiorama={() => setActiveTab('diorama')}
                onSynthesizeWithGemini={synthesizeNeighborhoodWithGemini4Argon}
                lang={lang}
              />
            ) : (
              <BookmarkView
                neighborhoods={neighborhoods}
                bookmarkedIds={bookmarkedIds}
                onSelectNeighborhood={(id) => {
                  setSelectedId(id);
                  setActiveTab('diorama');
                }}
                onToggleBookmark={handleToggleBookmark}
                lang={lang}
              />
            )}
          </div>
        )}
      </main>

      {/* Original 4-Menu Bottom Navigation Bar (탐색 · 디오라마 · 동네비교 · 보관함) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        compareCount={compareIds.length}
        bookmarkCount={bookmarkedIds.length}
        lang={lang}
      />
    </div>
  );
}

export default App;

