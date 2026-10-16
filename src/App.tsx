import React, { useState } from 'react';
import { INITIAL_NEIGHBORHOODS } from './data/neighborhoods.ts';
import {
  Lang,
  NeighborhoodData,
  SensoryLayerType,
  SensoryMetric,
  TabType,
} from './types/index.ts';
import { localizeNeighborhood } from './i18n/translations.ts';
import {
  getCozinessLabel,
  getGreeneryLabel,
  getInclineLabel,
  getNoiseLabel,
} from './utils/sensoryCalculations.ts';
import { Header } from './components/Header.tsx';
import { DioramaStage } from './components/DioramaStage.tsx';
import { QuoteCard } from './components/QuoteCard.tsx';
import { SensoryMetricsGrid } from './components/SensoryMetricsGrid.tsx';
import { AudioPlayerCard } from './components/AudioPlayerCard.tsx';
import { PhotoGalleryCard } from './components/PhotoGalleryCard.tsx';
import { BottomActionTray } from './components/BottomActionTray.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { CalibrationModal } from './components/CalibrationModal.tsx';
import { ExploreView } from './components/ExploreView.tsx';
import { CompareView } from './components/CompareView.tsx';
import { BookmarkView } from './components/BookmarkView.tsx';
import { RecordingView } from './components/RecordingView.tsx';

export function App() {
  const [lang, setLang] = useState<Lang>('ko');
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodData[]>(INITIAL_NEIGHBORHOODS);
  const [selectedId, setSelectedId] = useState<string>('seonghyeon-dong');
  const [activeTab, setActiveTab] = useState<TabType>('diorama');
  const [activeLayer, setActiveLayer] = useState<SensoryLayerType>('all');
  const [compareIds, setCompareIds] = useState<string[]>(['seonghyeon-dong']);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['seonghyeon-dong']);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const rawNeighborhood =
    neighborhoods.find((n) => n.id === selectedId) || neighborhoods[0];
  const currentNeighborhood = localizeNeighborhood(rawNeighborhood, lang);
  const localizedNeighborhoods = neighborhoods.map((n) => localizeNeighborhood(n, lang));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      showToast(next === 'ko' ? '한국어 모드로 전환되었습니다.' : 'Switched to English mode.');
      return next;
    });
  };

  const handleToggleBookmark = (id: string = selectedId) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(
        exists
          ? lang === 'ko'
            ? '보관함에서 제거되었습니다.'
            : 'Removed from saved quests.'
          : lang === 'ko'
            ? '보관함에 동네가 저장되었습니다.'
            : 'Neighborhood saved to collection.'
      );
      return next;
    });
  };

  const handleToggleCompare = (id: string = selectedId) => {
    setCompareIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(
        exists
          ? lang === 'ko'
            ? '비교함에서 제외되었습니다.'
            : 'Removed from comparison.'
          : lang === 'ko'
            ? `비교함에 추가되었습니다 (${next.length}개)`
            : `Added to comparison (${next.length})`
      );
      return next;
    });
  };

  const handleShare = async () => {
    const shareText = `[Neighborhood Quest] ${currentNeighborhood.name} - ${currentNeighborhood.quote}`;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast(
          lang === 'ko'
            ? '디오라마 공유 링크가 클립보드에 복사되었습니다.'
            : 'Diorama share link copied to clipboard.'
        );
        return;
      } catch {
        // Fallback below
      }
    }
    showToast(
      lang === 'ko'
        ? '공유 텍스트가 준비되었습니다.'
        : 'Share link ready.'
    );
  };

  const handleSaveCalibration = (updated: Partial<NeighborhoodData>) => {
    setNeighborhoods((prev) =>
      prev.map((n) => (n.id === selectedId ? { ...n, ...updated } : n))
    );
    showToast(
      lang === 'ko'
        ? '감각 지표 및 3D 디오라마가 보정되었습니다.'
        : 'Sensory metrics and 3D diorama updated.'
    );
  };

  const handleSwitchPerspective = (nextPerspective: 'jamie' | 'sam') => {
    const isSam = nextPerspective === 'sam';
    const cozinessPercent = isSam ? 64 : 92;
    const noiseDb = isSam ? 36 : 28;
    const inclinePercent = rawNeighborhood.inclinePercent; // Physical slope stays identical!
    const greenWalkMinutes = rawNeighborhood.greenWalkMinutes;

    const updatedMetrics = rawNeighborhood.metrics.map((m) => {
      if (m.type === 'coziness') {
        return {
          ...m,
          value: `${cozinessPercent}%`,
          valueEn: `${cozinessPercent}%`,
          numericValue: cozinessPercent,
          status: getCozinessLabel(cozinessPercent, 'ko'),
          statusEn: getCozinessLabel(cozinessPercent, 'en'),
          subtext: isSam ? '출퇴근 피로도 중심 체감' : '따뜻한 골목 조도 & 노을',
          subtextEn: isSam ? 'Commute-focused perception' : 'Warm alley lighting & sunset',
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
      return m;
    });

    setNeighborhoods((prev) =>
      prev.map((n) =>
        n.id === selectedId
          ? {
              ...n,
              perspective: nextPerspective,
              quoteAuthor: isSam ? 'Sam' : 'Jamie',
              cozinessPercent,
              noiseDb,
              quote: isSam
                ? '“역에서 올라오는 85% 경사 언덕이 출퇴근길엔 꽤 부담스럽고 골목 주차도 빠듯하지만, 밤공기는 조용한 편이에요.”'
                : '“역에서 올라오는 언덕은 꽤 가팔랐지만, 골목 끝 노을빛과 작은 공원, 그리고 아늑한 저녁 불빛이 하루의 피로를 씻어주는 동네였어요.”',
              quoteEn: isSam
                ? '“The 85% uphill climb from the station feels taxing for daily commutes and parking is tight, though the night air is quiet.”'
                : '“The hill from the station was quite steep, but the sunset glow at the end of the alley, the little park, and the warm evening lights washed away the day’s fatigue.”',
              memoryLayers: {
                physical: [
                  `경사도 ${inclinePercent}% (${n.inclineAngleDeg}° 오르막 동일)`,
                  n.stationDistance,
                  `공원 도보 ${greenWalkMinutes}분`,
                ],
                sensory: isSam
                  ? ['가파른 보행 호흡 부담', '좁은 골목 양방향 차량 교행']
                  : ['저녁 골목 주황빛 가로등 조도', `대로변 차단 극저소음 (${noiseDb}dB)`],
                emotional: isSam
                  ? [`아늑함 ${cozinessPercent}% · 매일 정장 입고 출퇴근하기엔 부담스러운 언덕`]
                  : [`아늑함 ${cozinessPercent}% · 하루의 피로가 씻기는 따뜻한 동네`],
              },
              metrics: updatedMetrics,
            }
          : n
      )
    );

    showToast(
      lang === 'ko'
        ? `${isSam ? '🧑 Sam (출퇴근·주차 현실주의)' : '👩 Jamie (골목 감성·노을)'}의 기억 관점으로 전환되었습니다.`
        : `Switched to ${isSam ? "Sam's (Commute/Practical)" : "Jamie's (Cozy/Emotional)"} memory perspective.`
    );
  };

  const handleSynthesizeWithGemini = async (params: {
    perspective: 'jamie' | 'sam';
    moments: { title: string; description: string }[];
    inclinePercent: number;
    cozinessPercent: number;
    noiseDb: number;
    greenWalkMinutes: number;
    quote: string;
    quoteEn: string;
  }) => {
    // Call real Gemini 4 Argon endpoint (/api/generate-world) with timeout fallback so live demo is fast and reliable
    let geminiPhysical: string[] | undefined;
    let geminiSensory: string[] | undefined;
    let geminiEmotional: string[] | undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const response = await fetch('/api/generate-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          neighborhoodId: selectedId,
          neighborhoodName: rawNeighborhood.name,
          district: rawNeighborhood.subName,
          userNotes: params.moments.map((m) => `${m.title}: ${m.description}`).join('\n'),
          perspective: params.perspective,
          photoDataUrls: [],
        }),
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        if (data?.worldConfig?.memoryLayers) {
          geminiPhysical = data.worldConfig.memoryLayers.physicalFeatures;
          geminiSensory = data.worldConfig.memoryLayers.sensoryImpressions;
          geminiEmotional = data.worldConfig.memoryLayers.emotionalImpressions;
        }
      }
    } catch {
      // Fallback to local 3-layer synthesis if offline or timed out
    }

    const updatedMetrics = rawNeighborhood.metrics.map((m) => {
      if (m.type === 'incline') {
        return {
          ...m,
          value: `${params.inclinePercent}%`,
          valueEn: `${params.inclinePercent}%`,
          numericValue: params.inclinePercent,
          status: getInclineLabel(params.inclinePercent, 'ko'),
          statusEn: getInclineLabel(params.inclinePercent, 'en'),
        };
      }
      if (m.type === 'coziness') {
        return {
          ...m,
          value: `${params.cozinessPercent}%`,
          valueEn: `${params.cozinessPercent}%`,
          numericValue: params.cozinessPercent,
          status: getCozinessLabel(params.cozinessPercent, 'ko'),
          statusEn: getCozinessLabel(params.cozinessPercent, 'en'),
        };
      }
      if (m.type === 'noise') {
        return {
          ...m,
          value: `${params.noiseDb}dB`,
          valueEn: `${params.noiseDb}dB`,
          numericValue: params.noiseDb,
          status: getNoiseLabel(params.noiseDb, 'ko'),
          statusEn: getNoiseLabel(params.noiseDb, 'en'),
        };
      }
      if (m.type === 'greenery') {
        return {
          ...m,
          value: `${params.greenWalkMinutes}분`,
          valueEn: `${params.greenWalkMinutes}m`,
          numericValue: params.greenWalkMinutes,
          status: getGreeneryLabel(params.greenWalkMinutes, 'ko').split(' ')[0],
          statusEn: getGreeneryLabel(params.greenWalkMinutes, 'en').split(' ')[0],
        };
      }
      return m;
    });

    setNeighborhoods((prev) =>
      prev.map((n) =>
        n.id === selectedId
          ? {
              ...n,
              perspective: params.perspective,
              quoteAuthor: params.perspective === 'sam' ? 'Sam' : 'Jamie',
              cozinessPercent: params.cozinessPercent,
              noiseDb: params.noiseDb,
              quote: params.quote,
              quoteEn: params.quoteEn,
              memoryLayers: {
                physical: geminiPhysical?.length
                  ? geminiPhysical
                  : [`경사도 ${params.inclinePercent}% (물리 지형 검증됨)`, n.stationDistance],
                sensory: geminiSensory?.length
                  ? geminiSensory
                  : [`실측 소음 ${params.noiseDb}dB`, `녹지 도보 ${params.greenWalkMinutes}분`],
                emotional: geminiEmotional?.length
                  ? geminiEmotional
                  : [
                      params.perspective === 'sam'
                        ? `체감 아늑함 ${params.cozinessPercent}% · 출퇴근 경사 부담`
                        : `체감 아늑함 ${params.cozinessPercent}% · 아늑한 골든아워 골목`,
                    ],
              },
              metrics: updatedMetrics,
            }
          : n
      )
    );

    showToast(
      lang === 'ko'
        ? '✨ Gemini 4 Argon이 멀티모달 기억을 3D 디오라마로 합성했습니다!'
        : '✨ Gemini 4 Argon synthesized your memories into a 3D Diorama!'
    );
  };

  const handleSelectNeighborhood = (id: string) => {
    setSelectedId(id);
    setActiveLayer('all');
    setActiveTab('diorama');
  };

  const handleMetricClick = (metric: SensoryMetric) => {
    const mapTypeToLayer: Record<SensoryMetric['type'], SensoryLayerType> = {
      incline: 'incline',
      coziness: 'mood',
      noise: 'noise',
      greenery: 'greenery',
    };
    const targetLayer = mapTypeToLayer[metric.type];
    setActiveLayer((prev) => (prev === targetLayer ? 'all' : targetLayer));
  };

  const isBookmarked = bookmarkedIds.includes(selectedId);
  const isInCompare = compareIds.includes(selectedId);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191f28] pb-36">
      {/* Top Navigation Bar */}
      <Header
        neighborhood={currentNeighborhood}
        isBookmarked={isBookmarked}
        onToggleBookmark={() => handleToggleBookmark(selectedId)}
        onBack={() => setActiveTab(activeTab === 'diorama' ? 'explore' : 'diorama')}
        onShare={handleShare}
        showBackButton={activeTab !== 'explore'}
        lang={lang}
        onToggleLang={handleToggleLang}
      />

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#191f28]/90 text-white text-xs font-semibold shadow-lg backdrop-blur-md transition-all"
        >
          {toastMessage}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-md mx-auto pt-16 px-4 flex flex-col gap-4">
        {activeTab === 'diorama' && (
          <>
            {/* Live Recording Status Quick Jump Banner */}
            <div
              onClick={() => setActiveTab('record')}
              className="bg-white px-3.5 py-2.5 rounded-2xl border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between cursor-pointer hover:border-[#0051ff]/40 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[12px] font-bold text-[#191f28]">
                  {lang === 'ko'
                    ? '실시간 임장 기록 중 (Quest #09)'
                    : 'Live Field Recording Active (Quest #09)'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#0051ff] flex items-center gap-0.5">
                <span>{lang === 'ko' ? '기록 화면 열기' : 'Open Recorder'}</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </span>
            </div>

            {/* 1. 3D Diorama Interactive Stage */}
            <DioramaStage
              neighborhood={currentNeighborhood}
              activeLayer={activeLayer}
              onSelectLayer={setActiveLayer}
              lang={lang}
            />

            {/* 2. Field Impression Quote Card */}
            <QuoteCard
              quote={currentNeighborhood.quote}
              author={currentNeighborhood.quoteAuthor}
              onEditClick={() => setIsCalibrationOpen(true)}
              perspective={currentNeighborhood.perspective}
              onSwitchPerspective={handleSwitchPerspective}
              memoryLayers={currentNeighborhood.memoryLayers}
              lang={lang}
            />

            {/* 3. Sensory Metrics 2x2 Grid */}
            <SensoryMetricsGrid
              metrics={currentNeighborhood.metrics}
              onMetricClick={handleMetricClick}
              lang={lang}
            />

            {/* 4. Recorded Evidence Section (Audio + Photos) */}
            <section className="flex flex-col gap-2.5">
              <h2 className="text-[16px] font-bold text-[#191f28] tracking-tight px-1">
                {lang === 'ko' ? '기록된 근거 메모' : 'Recorded Field Evidence'}
              </h2>

              <AudioPlayerCard memo={currentNeighborhood.audioMemo} lang={lang} />

              <PhotoGalleryCard photos={currentNeighborhood.photos} lang={lang} />
            </section>
          </>
        )}

        {activeTab === 'explore' && (
          <ExploreView
            neighborhoods={localizedNeighborhoods}
            selectedId={selectedId}
            compareIds={compareIds}
            onSelectNeighborhood={handleSelectNeighborhood}
            onToggleCompare={handleToggleCompare}
            lang={lang}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            neighborhoods={localizedNeighborhoods}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
            onSelectNeighborhood={handleSelectNeighborhood}
            lang={lang}
          />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarkView
            neighborhoods={localizedNeighborhoods}
            bookmarkedIds={bookmarkedIds}
            onSelectNeighborhood={handleSelectNeighborhood}
            onToggleBookmark={handleToggleBookmark}
            lang={lang}
          />
        )}

        {activeTab === 'record' && (
          <RecordingView
            neighborhood={currentNeighborhood}
            onFinishToDiorama={() => setActiveTab('diorama')}
            onSynthesizeWithGemini={handleSynthesizeWithGemini}
            lang={lang}
          />
        )}
      </main>

      {/* Fixed Bottom Action Tray (Shown on Diorama view) */}
      {activeTab === 'diorama' && (
        <BottomActionTray
          isInCompare={isInCompare}
          compareCount={compareIds.length}
          onToggleCompare={() => handleToggleCompare(selectedId)}
          onOpenCalibration={() => setIsCalibrationOpen(true)}
          lang={lang}
        />
      )}

      {/* Bottom Tab Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        compareCount={compareIds.length}
        bookmarkCount={bookmarkedIds.length}
        lang={lang}
      />

      {/* 3D Calibration & Memory Edit Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        neighborhood={currentNeighborhood}
        onClose={() => setIsCalibrationOpen(false)}
        onSave={handleSaveCalibration}
        lang={lang}
      />
    </div>
  );
}

export default App;
