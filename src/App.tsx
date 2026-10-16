import React, { useEffect, useState } from 'react';
import {
  SEOUL_NEIGHBORHOODS,
  INITIAL_SAVED_MEMORIES,
  VILLAGE_NPCS,
  POLICY_PRESETS,
  INITIAL_POLICY_STATE,
  generatePresetFieldPhotos,
} from './data/seoulNeighborhoods';
import type {
  NeighborhoodSpot,
  NeighborhoodMemory,
  PhotoInput,
  FieldObservationInput,
  SceneBlueprint,
  VerificationReport,
  ObservationPinSpec,
  PolicyAnalysisResult,
} from './types';
import { useI18n } from './i18n';
import { SeoulMap } from './components/SeoulMap';
import { CapturePanel } from './components/CapturePanel';
import { World3DDiorama } from './components/World3DDiorama';
import { VerificationLoopPanel } from './components/VerificationLoopPanel';
import { PolicyQuestPanel } from './components/PolicyQuestPanel';
import { StampPassportModal } from './components/StampPassportModal';
import { CompareModal } from './components/CompareModal';
import { CharacterAvatar } from './components/CharacterAvatar';
import {
  Award,
  Scale,
  Sparkles,
  CheckCircle2,
  Compass,
  Camera,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

type ActiveTab = 'explore' | 'capture' | 'policy' | 'verify';

export const App: React.FC = () => {
  const { lang, setLang, t } = useI18n();
  const [activeTab, setActiveTab] = useState<ActiveTab>('policy');
  const [selectedSpot, setSelectedSpot] = useState<NeighborhoodSpot>(SEOUL_NEIGHBORHOODS[0]);
  const [photos, setPhotos] = useState<PhotoInput[]>([]);
  const [voiceNoteText, setVoiceNoteText] = useState<string>(
    SEOUL_NEIGHBORHOODS[0].sampleVoiceNoteKo
  );
  const [voiceLanguage, setVoiceLanguage] = useState<'ko-KR' | 'en-US'>('ko-KR');
  const [quickRatings, setQuickRatings] = useState<FieldObservationInput['quickRatings']>(
    SEOUL_NEIGHBORHOODS[0].defaultRatings
  );

  const [savedMemories, setSavedMemories] = useState<NeighborhoodMemory[]>(INITIAL_SAVED_MEMORIES);
  const [activeBlueprint, setActiveBlueprint] = useState<SceneBlueprint>(
    INITIAL_SAVED_MEMORIES[0].blueprint
  );
  const [activeVerification, setActiveVerification] = useState<VerificationReport>(
    INITIAL_SAVED_MEMORIES[0].verification
  );
  const [activePinId, setActivePinId] = useState<string | null>(null);

  // PolicyQuest state (Pingu & Gyodong + LTV/DSR Policy Simulator)
  const [approvedPolicy, setApprovedPolicy] = useState<PolicyAnalysisResult>(INITIAL_POLICY_STATE);
  const [pendingPolicy, setPendingPolicy] = useState<PolicyAnalysisResult | null>(null);
  const [isAnalyzingPolicy, setIsAnalyzingPolicy] = useState<boolean>(false);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [stampBanner, setStampBanner] = useState<string | null>(null);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  useEffect(() => {
    setPhotos(generatePresetFieldPhotos(SEOUL_NEIGHBORHOODS[0]));
  }, []);

  const handleSelectSpot = (spot: NeighborhoodSpot) => {
    setSelectedSpot(spot);
    setPhotos(generatePresetFieldPhotos(spot));
    setVoiceNoteText(voiceLanguage === 'ko-KR' ? spot.sampleVoiceNoteKo : spot.sampleVoiceNoteEn);
    setQuickRatings(spot.defaultRatings);
    setActivePinId(null);

    const existing = savedMemories.find((m) => m.neighborhoodId === spot.id);
    if (existing) {
      setActiveBlueprint(existing.blueprint);
      setActiveVerification(existing.verification);
    }
  };

  const handleGenerateWorld = async () => {
    setIsGenerating(true);
    setActivePinId(null);

    const payload: FieldObservationInput = {
      neighborhoodId: selectedSpot.id,
      neighborhoodName: selectedSpot.name,
      neighborhoodNameKo: selectedSpot.nameKo,
      district: selectedSpot.district,
      apartmentName: selectedSpot.apartmentName,
      subwayStation: selectedSpot.subwayStation,
      subwayLine: selectedSpot.subwayLine,
      subwayLineColor: selectedSpot.subwayLineColor,
      voiceNoteText,
      voiceLanguage,
      photos,
      quickRatings,
    };

    try {
      const response = await fetch('/api/generate-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data: { blueprint: SceneBlueprint; verification: VerificationReport } =
        await response.json();

      setActiveBlueprint(data.blueprint);
      setActiveVerification(data.verification);

      const newMemory: NeighborhoodMemory = {
        id: `mem-${selectedSpot.id}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        neighborhoodId: selectedSpot.id,
        neighborhoodName: selectedSpot.name,
        neighborhoodNameKo: selectedSpot.nameKo,
        district: selectedSpot.district,
        apartmentName: selectedSpot.apartmentName,
        observation: payload,
        blueprint: data.blueprint,
        verification: data.verification,
      };

      setSavedMemories((prev) => {
        const filtered = prev.filter((m) => m.neighborhoodId !== selectedSpot.id);
        return [newMemory, ...filtered];
      });

      setActiveTab('verify');
      setStampBanner(
        lang === 'ko'
          ? `💮 새 스탬프 획득: "${data.blueprint.stamp.badgeTitle}" (Gemini 4 Argon 검증 ${data.verification.overallFidelityScore}%)`
          : `💮 Stamp Unlocked: "${data.blueprint.stamp.badgeTitle}" (${data.verification.overallFidelityScore}% Verified)`
      );
      setTimeout(() => setStampBanner(null), 5000);
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzePolicy = async (rawPolicyText: string) => {
    setIsAnalyzingPolicy(true);
    try {
      const response = await fetch('/api/analyze-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPolicyText,
          starterHomePriceMillionKRW: selectedSpot.starterHomePriceMillionKRW,
          npcs: VILLAGE_NPCS,
          neighborhoodName: selectedSpot.name,
        }),
      });
      if (!response.ok) {
        throw new Error(`Policy analysis failed with ${response.status}`);
      }
      const result: PolicyAnalysisResult = await response.json();
      setPendingPolicy(result);
    } catch (err) {
      console.error('Policy analysis error:', err);
    } finally {
      setIsAnalyzingPolicy(false);
    }
  };

  const handleApprovePendingPolicy = () => {
    if (!pendingPolicy) return;
    setApprovedPolicy(pendingPolicy);
    setPendingPolicy(null);
    const unlockedCount = pendingPolicy.npcOutcomes.filter((o) => o.canBuyHome).length;
    setStampBanner(
      lang === 'ko'
        ? `🏛️ 3D 마을에 정책 반영 완료: "${pendingPolicy.policyTitleEn}" (주민 ${unlockedCount}/2명 내집마련 성공!)`
        : `🏛️ Applied to 3D World: "${pendingPolicy.policyTitleEn}" (${unlockedCount}/2 Residents Unlocked Home!)`
    );
    setTimeout(() => setStampBanner(null), 5000);
  };

  const handleLoadMemory = (memory: NeighborhoodMemory) => {
    const spot = SEOUL_NEIGHBORHOODS.find((s) => s.id === memory.neighborhoodId);
    if (spot) {
      setSelectedSpot(spot);
      setPhotos(
        memory.observation.photos.length > 0
          ? memory.observation.photos
          : generatePresetFieldPhotos(spot)
      );
      setVoiceNoteText(memory.observation.voiceNoteText);
      setQuickRatings(memory.observation.quickRatings);
    }
    setActiveBlueprint(memory.blueprint);
    setActiveVerification(memory.verification);
    setActivePinId(null);
  };

  const handleSelectPin = (pin: ObservationPinSpec | null) => {
    setActivePinId(pin ? pin.id : null);
  };

  const handleSelectNpcFrom3D = (npcId: string | null) => {
    setSelectedNpcId(npcId);
    if (npcId) {
      setActiveTab('policy');
    }
  };

  const tabs: Array<{
    id: ActiveTab;
    shortLabel: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'explore',
      shortLabel: t('지도 탐색', 'Map'),
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'capture',
      shortLabel: t('임장 기록', 'Capture'),
      icon: <Camera className="w-4 h-4" />,
    },
    {
      id: 'policy',
      shortLabel: t('정책 퀘스트', 'Policy'),
      icon: <Landmark className="w-4 h-4" />,
      badge: pendingPolicy ? '!' : undefined,
    },
    {
      id: 'verify',
      shortLabel: t('AI 검증', 'Verify'),
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: `${activeVerification.overallFidelityScore}%`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col pb-20 lg:pb-6">
      {/* Clean Google Stitch Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2">
          {/* Left Brand + Character Avatars */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center -space-x-1.5 shrink-0">
              <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white shadow-2xs flex items-center justify-center">
                <CharacterAvatar character="pingu" size={30} />
              </div>
              <div className="w-9 h-9 rounded-full bg-amber-50 border-2 border-white shadow-2xs flex items-center justify-center">
                <CharacterAvatar character="gyodong" size={30} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-sm sm:text-lg text-slate-900 truncate">
                  {t('동네 & 정책 퀘스트', 'Neighborhood & Policy Quest')}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-amber-300">
                  Gemini 4 Argon
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                {t(
                  '핑구(Pingu) · 교동(Gyodong)과 함께하는 3D 서울 임장 & 부동산 정책 시뮬레이터',
                  'Explore 3D Seoul islands with Pingu (핑구) & Gyodong (교동)'
                )}
              </p>
            </div>
          </div>

          {/* Right Utility Actions + KO/EN Language Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* KO / EN Language Toggle Pill */}
            <div
              className="inline-flex items-center rounded-full bg-slate-100 p-0.5 border border-slate-200 text-xs font-display font-extrabold"
              role="group"
              aria-label="Language Switcher"
            >
              <button
                type="button"
                onClick={() => setLang('ko')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  lang === 'ko'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇰🇷 KO
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  lang === 'en'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇺🇸 EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPassportOpen(true)}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-full font-display font-bold text-xs bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300/80 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>
                {t('스탬프', 'Stamps')} ({savedMemories.length}/{SEOUL_NEIGHBORHOODS.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-full font-display font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('동네 비교', 'Compare')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {stampBanner && (
        <div className="bg-emerald-700 text-white px-4 py-2 text-center text-xs sm:text-sm font-display font-bold flex items-center justify-center gap-2 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="truncate">{stampBanner}</span>
        </div>
      )}

      {/* Main Responsive Split Container */}
      <main className="max-w-[1400px] w-full mx-auto px-3 sm:px-6 pt-3 sm:pt-5 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* LEFT / HERO: Interactive 3D World Island (Always Visible) */}
          <div className="lg:col-span-7 lg:sticky lg:top-16 flex flex-col gap-2.5">
            {/* Compact Saved 3D Memories Bar */}
            <div className="flex items-center justify-between gap-2 bg-white border border-slate-200/80 rounded-2xl px-3 py-2 shadow-2xs overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-display font-bold text-slate-400 uppercase tracking-wider mr-1">
                  {t('저장된 3D 섬:', '3D Islands:')}
                </span>
                {savedMemories.map((mem) => {
                  const isCurrent = mem.blueprint.worldTitle === activeBlueprint.worldTitle;
                  return (
                    <button
                      key={mem.id}
                      type="button"
                      onClick={() => handleLoadMemory(mem)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>
                        {lang === 'ko' ? mem.neighborhoodNameKo : mem.neighborhoodName.split(' ')[0]}
                      </span>
                      <span className="text-[10px] opacity-75">
                        {mem.blueprint.livabilityMetrics.overallGrade}
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="hidden sm:inline text-[11px] font-semibold text-slate-500 shrink-0">
                {t('3D 섬의 🐧핑구 · 🐶교동이를 클릭해보세요!', 'Tap 🐧 Pingu or 🐶 Gyodong in 3D')}
              </span>
            </div>

            {/* 3D Diorama Canvas Container */}
            <div className="h-[360px] sm:h-[480px] lg:h-[560px]">
              <World3DDiorama
                blueprint={activeBlueprint}
                activePinId={activePinId}
                onSelectPin={handleSelectPin}
                npcs={VILLAGE_NPCS}
                npcOutcomes={approvedPolicy.npcOutcomes}
                selectedNpcId={selectedNpcId}
                onSelectNpc={handleSelectNpcFrom3D}
                approvedPolicyTitle={approvedPolicy.policyTitleEn}
              />
            </div>
          </div>

          {/* RIGHT / DRAWER: Clean Google Stitch Segmented Step Panel */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Desktop Segmented Tab Bar */}
            <div className="hidden lg:grid grid-cols-4 gap-1 bg-slate-200/70 p-1 rounded-2xl border border-slate-200/80">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-2.5 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.icon}
                    <span className="truncate">{tab.shortLabel}</span>
                    {tab.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                          tab.badge === '!'
                            ? 'bg-amber-400 text-slate-950 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Step Content */}
            {activeTab === 'explore' && (
              <SeoulMap
                neighborhoods={SEOUL_NEIGHBORHOODS}
                selectedSpot={selectedSpot}
                savedMemories={savedMemories}
                onSelectSpot={handleSelectSpot}
                onNextStep={() => setActiveTab('capture')}
              />
            )}

            {activeTab === 'capture' && (
              <CapturePanel
                selectedSpot={selectedSpot}
                photos={photos}
                voiceNoteText={voiceNoteText}
                voiceLanguage={voiceLanguage}
                quickRatings={quickRatings}
                isGenerating={isGenerating}
                onChangePhotos={setPhotos}
                onLoadPresetPhotos={() => setPhotos(generatePresetFieldPhotos(selectedSpot))}
                onChangeVoiceNote={setVoiceNoteText}
                onChangeVoiceLanguage={setVoiceLanguage}
                onChangeRatings={setQuickRatings}
                onGenerateWorld={handleGenerateWorld}
              />
            )}

            {activeTab === 'policy' && (
              <PolicyQuestPanel
                neighborhoodName={selectedSpot.name}
                neighborhoodNameKo={selectedSpot.nameKo}
                starterHomePriceMillionKRW={selectedSpot.starterHomePriceMillionKRW}
                npcs={VILLAGE_NPCS}
                presets={POLICY_PRESETS}
                approvedPolicy={approvedPolicy}
                pendingPolicy={pendingPolicy}
                isAnalyzingPolicy={isAnalyzingPolicy}
                selectedNpcId={selectedNpcId}
                onSelectNpc={setSelectedNpcId}
                onAnalyzePolicy={handleAnalyzePolicy}
                onApprovePendingPolicy={handleApprovePendingPolicy}
                onDiscardPendingPolicy={() => setPendingPolicy(null)}
              />
            )}

            {activeTab === 'verify' && (
              <VerificationLoopPanel
                blueprint={activeBlueprint}
                verification={activeVerification}
                onTuneBlueprint={setActiveBlueprint}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Step Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg"
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition cursor-pointer relative ${
                  active
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-900 font-semibold'
                }`}
              >
                {tab.icon}
                <span className="text-[10px]">{tab.shortLabel}</span>
                {tab.badge && (
                  <span
                    className={`absolute top-1 right-2 px-1 rounded-full text-[8px] font-extrabold ${
                      tab.badge === '!'
                        ? 'bg-amber-400 text-slate-950'
                        : active
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Native <dialog> Modals */}
      <StampPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        neighborhoods={SEOUL_NEIGHBORHOODS}
        savedMemories={savedMemories}
        onLoadMemory={handleLoadMemory}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        savedMemories={savedMemories}
      />
    </div>
  );
};

export default App;
