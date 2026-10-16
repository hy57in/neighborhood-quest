import React, { useState, useEffect, useRef } from 'react';
import {
  Lang,
  LiquidityMetrics,
  NeighborhoodData,
  SensoryPriorityId,
} from '../types/index.ts';
import {
  LIQUIDITY_PILLAR_META,
  SENSORY_PRIORITY_OPTIONS,
} from '../data/neighborhoods.ts';
import { formatTimeSeconds } from '../utils/sensoryCalculations.ts';
import { CharacterAvatar } from './CharacterAvatar.tsx';

export interface CapturedMoment {
  id: string;
  type: 'voice' | 'photo' | 'video' | 'emotion' | 'note';
  badge: string;
  title: string;
  description: string;
  timeAgo: string;
  aiTag: string;
  badgeColor: string;
  imageDataUrl?: string;
}

interface RecordingViewProps {
  neighborhood: NeighborhoodData;
  startEmpty?: boolean;
  selectedSensoryPriorities?: SensoryPriorityId[];
  onToggleSensoryPriority?: (id: SensoryPriorityId) => void;
  onFinishToDiorama: () => void;
  onSynthesizeWithGemini?: (params: {
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
  }) => Promise<void> | void;
  lang?: Lang;
}

function analyzeTextToAiTag(text: string, lang: Lang): string {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  if (/언덕|가파|오르막|경사|계단|숨차|숨이 차|steep|hill|slope|uphill/.test(lower)) {
    tags.push(lang === 'ko' ? '⛰️ 급경사(88%) 감지' : '⛰️ Steep Slope (88%)');
  } else if (/평지|평탄|완만|걷기 편|flat|easy walk/.test(lower)) {
    tags.push(lang === 'ko' ? '👟 평지 지형(12%) 감지' : '👟 Flat Terrain (12%)');
  }

  if (/시끄|차 소리|차소리|대로변|소음|복잡|트럭|loud|noisy|traffic/.test(lower)) {
    tags.push(lang === 'ko' ? '🔊 도로 소음(68dB) 감지' : '🔊 Traffic Noise (68dB)');
  } else if (/조용|한적|고요|평화|풀벌레|바람|quiet|calm|peaceful/.test(lower)) {
    tags.push(lang === 'ko' ? '🤫 정온 구역(27dB) 감지' : '🤫 Quiet Zone (27dB)');
  }

  if (/공원|나무|숲|산책로|녹지|벚꽃|park|trees|greenery/.test(lower)) {
    tags.push(lang === 'ko' ? '🌿 공원 도보 2분' : '🌿 2m to Park');
  }

  if (/래미안|자이|푸르지오|힐스테이트|아크로|문주|대단지|신축|brand|new/.test(lower)) {
    tags.push(lang === 'ko' ? '🏛️ 1군 브랜드/대단지 입지 반영' : '🏛️ Tier-1 Brand Complex');
  }

  if (/따뜻|아늑|노을|예쁘|힐링|좋다|마음에|설레|cozy|warm|sunset|lovely/.test(lower)) {
    tags.push(lang === 'ko' ? '🧡 아늑함 94%' : '🧡 Coziness 94%');
  } else if (/힘들|부담|피곤|좁|답답|위험|무섭|tiring|tight|exhausting/.test(lower)) {
    tags.push(lang === 'ko' ? '💭 체감 부담 요소 반영' : '💭 Practical Strain Logged');
  }

  if (tags.length === 0) {
    return lang === 'ko'
      ? '✨ Gemini 4 Argon이 3D 공간 기억으로 추출 완료'
      : '✨ Extracted into 3D Spatial Memory by Gemini 4 Argon';
  }
  return tags.join(' · ');
}

export const RecordingView: React.FC<RecordingViewProps> = ({
  neighborhood,
  startEmpty = false,
  selectedSensoryPriorities = ['quiet_night', 'safe_walkway', 'park_forest', 'sunset_lighting'],
  onToggleSensoryPriority,
  onFinishToDiorama,
  onSynthesizeWithGemini,
  lang = 'ko',
}) => {
  const [isRecording] = useState<boolean>(true);
  const [isSpeechListening, setIsSpeechListening] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(startEmpty ? 0 : 20);
  const [noteInput, setNoteInput] = useState<string>('');
  const [perspective, setPerspective] = useState<'pingu' | 'gyodong'>(
    neighborhood.perspective || 'pingu'
  );
  const [isEmptyMode, setIsEmptyMode] = useState<boolean>(startEmpty);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [attachedPhotoUrl, setAttachedPhotoUrl] = useState<string>(
    neighborhood.photos?.[0]?.url || neighborhood.dioramaImageUrl
  );
  const [attachedPhotoLabel, setAttachedPhotoLabel] = useState<string>(
    neighborhood.photos?.[0]?.caption || '현장 첨부 사진'
  );

  // Editable 6-pillar liquidity scores so user can customize objective location criteria
  const [liquidityScores, setLiquidityScores] = useState<Record<string, number>>(() => ({
    brand: neighborhood.liquidity?.brand.score ?? 92,
    newBuild: neighborhood.liquidity?.newBuild.score ?? 88,
    subway: neighborhood.liquidity?.subway.score ?? 94,
    school: neighborhood.liquidity?.school.score ?? 90,
    flatness: neighborhood.liquidity?.flatness.score ?? 86,
    households: neighborhood.liquidity?.households.score ?? 95,
  }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setAttachedPhotoUrl(neighborhood.photos?.[0]?.url || neighborhood.dioramaImageUrl);
    setAttachedPhotoLabel(neighborhood.photos?.[0]?.caption || neighborhood.name);
    if (neighborhood.liquidity) {
      setLiquidityScores({
        brand: neighborhood.liquidity.brand.score,
        newBuild: neighborhood.liquidity.newBuild.score,
        subway: neighborhood.liquidity.subway.score,
        school: neighborhood.liquidity.school.score,
        flatness: neighborhood.liquidity.flatness.score,
        households: neighborhood.liquidity.households.score,
      });
    }
  }, [neighborhood.id]);

  const getInitialMoments = (p: 'pingu' | 'gyodong', currentLang: Lang): CapturedMoment[] => {
    if (p === 'gyodong') {
      return currentLang === 'ko'
        ? [
            {
              id: 'gyo-1',
              type: 'voice',
              badge: '방금 전',
              title: '음성 메모 0:18 · 교동 기록',
              description:
                '“역에서 단지 입구까지 거리와 경사도를 체크했어. 브랜드 대단지 문주와 세대수는 훌륭한데 출퇴근 동선 체감을 3D로 꼼꼼히 봐야겠어.”',
              timeAgo: '방금 전',
              aiTag: '🏛️ 환금성(역세권·세대수) 확인 · 💭 출퇴근 보행 체감 기록',
              badgeColor: 'text-[#e03e52] bg-[#fff0f2]',
            },
            {
              id: 'gyo-2',
              type: 'photo',
              badge: '2분 전',
              title: '첨부 현장 사진 → 3D 지형·건물 깊이맵 추출',
              description: '단지 문주, 아파트 동 배치 및 보행로 사진을 Gemini 4 Argon이 3D 메쉬로 복원 준비',
              timeAgo: '2분 전',
              aiTag: '📸 첨부 이미지 기반 3D 입체 복원 연동됨',
              badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
              imageDataUrl: neighborhood.photos?.[0]?.url || neighborhood.dioramaImageUrl,
            },
          ]
        : [
            {
              id: 'gyo-1',
              type: 'voice',
              badge: 'Just now',
              title: 'Voice Memo 0:18 · Gyodong',
              description:
                '“Checked station walk distance and slope. Tier-1 brand gatehouse and household scale are great; let’s inspect the 3D commute terrain.”',
              timeAgo: 'Just now',
              aiTag: '🏛️ Liquidity (Subway/Scale) Verified · 💭 Commute Check',
              badgeColor: 'text-[#e03e52] bg-[#fff0f2]',
            },
            {
              id: 'gyo-2',
              type: 'photo',
              badge: '2m ago',
              title: 'Attached Photo → 3D Depth Relief & Towers Ready',
              description: 'Gemini 4 Argon extracts 3D relief mesh and building volumes from attached photo',
              timeAgo: '2m ago',
              aiTag: '📸 Photo-to-3D Reconstruction Ready',
              badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
              imageDataUrl: neighborhood.photos?.[0]?.url || neighborhood.dioramaImageUrl,
            },
          ];
    }

    return currentLang === 'ko'
      ? [
          {
            id: 'm-1',
            type: 'voice',
            badge: '방금 전',
            title: '음성 메모 0:14 · 핑구 기록',
            description: neighborhood.quote,
            timeAgo: '방금 전',
            aiTag: `⛰️ 경사 ${neighborhood.inclineAngleDeg}° · 🤫 소음 ${neighborhood.noiseDb}dB 추출됨`,
            badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
          },
          {
            id: 'm-2',
            type: 'photo',
            badge: '3분 전',
            title: '첨부 현장 사진 → 3D 입체 복원 연결됨',
            description: '첨부된 사진의 건물 실루엣, 하늘 색감, 도로 구도를 샘플링해 3D 디오라마에 즉시 투영합니다',
            timeAgo: '3분 전',
            aiTag: '📸 Gemini 4 Argon Photo-to-3D Relief 활성',
            badgeColor: 'text-[#f59f00] bg-[#fff9db]',
            imageDataUrl: neighborhood.photos?.[0]?.url || neighborhood.dioramaImageUrl,
          },
        ]
      : [
          {
            id: 'm-1',
            type: 'voice',
            badge: 'Just now',
            title: 'Voice Memo 0:14 · Pingu',
            description: neighborhood.quoteEn || neighborhood.quote,
            timeAgo: 'Just now',
            aiTag: `⛰️ Slope ${neighborhood.inclineAngleDeg}° · 🤫 Noise ${neighborhood.noiseDb}dB`,
            badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
          },
          {
            id: 'm-2',
            type: 'photo',
            badge: '3m ago',
            title: 'Attached Field Photo → 3D Reconstruction Linked',
            description: 'Samples building silhouettes, sky palette, and depth from your photo into 3D',
            timeAgo: '3m ago',
            aiTag: '📸 Gemini 4 Argon Photo-to-3D Active',
            badgeColor: 'text-[#f59f00] bg-[#fff9db]',
            imageDataUrl: neighborhood.photos?.[0]?.url || neighborhood.dioramaImageUrl,
          },
        ];
  };

  const [moments, setMoments] = useState<CapturedMoment[]>(() =>
    startEmpty ? [] : getInitialMoments(neighborhood.perspective || 'pingu', lang)
  );

  useEffect(() => {
    if (startEmpty) {
      setIsEmptyMode(true);
      setMoments([]);
      setElapsedSeconds(0);
    }
  }, [startEmpty]);

  useEffect(() => {
    if (!isEmptyMode) {
      setMoments(getInitialMoments(perspective, lang));
    }
  }, [perspective, lang, isEmptyMode, neighborhood.id]);

  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleResetEmpty = () => {
    setIsEmptyMode(true);
    setMoments([]);
    setElapsedSeconds(0);
    setNoteInput('');
  };

  const handleLoadSample = () => {
    setIsEmptyMode(false);
    setMoments(getInitialMoments(perspective, lang));
  };

  const handleStartVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const fallbackText =
        lang === 'ko'
          ? '역에서 단지로 들어오는 길에 1군 브랜드 문주가 웅장하고, 조경 공원이 울창해서 저녁 산책하기 정말 쾌적해요.'
          : 'Walking from the station into the complex shows a grand Tier-1 brand gatehouse and lush park trails that feel super cozy.';
      setMoments((prev) => [
        {
          id: `voice-${Date.now()}`,
          type: 'voice',
          badge: lang === 'ko' ? '음성 기록됨' : 'Voice Recorded',
          title:
            lang === 'ko'
              ? `실시간 음성 메모 · ${perspective === 'gyodong' ? '교동' : '핑구'}`
              : `Live Voice Memo · ${perspective === 'gyodong' ? 'Gyodong' : 'Pingu'}`,
          description: `“${fallbackText}”`,
          timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
          aiTag: analyzeTextToAiTag(fallbackText, lang),
          badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
        },
        ...prev,
      ]);
      return;
    }

    if (isSpeechListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsSpeechListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsSpeechListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) {
          setMoments((prev) => [
            {
              id: `voice-${Date.now()}`,
              type: 'voice',
              badge: lang === 'ko' ? '마이크 음성 인식' : 'Mic Speech-to-Text',
              title:
                lang === 'ko'
                  ? `마이크 음성 메모 · ${perspective === 'gyodong' ? '교동' : '핑구'}`
                  : `Mic Voice Memo · ${perspective === 'gyodong' ? 'Gyodong' : 'Pingu'}`,
              description: `“${transcript}”`,
              timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
              aiTag: analyzeTextToAiTag(transcript, lang),
              badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
            },
            ...prev,
          ]);
        }
      };
      recognition.onend = () => setIsSpeechListening(false);
      recognition.onerror = () => setIsSpeechListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsSpeechListening(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : undefined;
      if (dataUrl) {
        setAttachedPhotoUrl(dataUrl);
        setAttachedPhotoLabel(file.name);
      }
      setMoments((prev) => [
        {
          id: `photo-upload-${Date.now()}`,
          type: 'photo',
          badge: lang === 'ko' ? '첨부 이미지 3D 변환' : 'Photo-to-3D Ready',
          title:
            lang === 'ko'
              ? `첨부 사진 업로드 (${file.name})`
              : `Attached Photo Uploaded (${file.name})`,
          description:
            lang === 'ko'
              ? '첨부한 사진을 기반으로 Gemini 4 Argon이 3D 깊이 릴리프 지형과 건물 볼륨을 생성합니다.'
              : 'Gemini 4 Argon builds a 3D depth relief mesh and building volumes directly from your photo.',
          timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
          aiTag:
            lang === 'ko'
              ? '📸 첨부 이미지 기반 3D 입체 복원 준비 완료'
              : '📸 Attached Image → 3D Reconstruction Ready',
          badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
          imageDataUrl: dataUrl,
        },
        ...prev,
      ]);
    };
    reader.readAsDataURL(file);
  };

  const addCustomTextNote = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMoments((prev) => [
      {
        id: `note-${Date.now()}`,
        type: 'note',
        badge: lang === 'ko' ? '직접 입력한 메모' : 'Custom Field Note',
        title:
          lang === 'ko'
            ? `현장 메모 · ${perspective === 'gyodong' ? '교동' : '핑구'}`
            : `Field Note · ${perspective === 'gyodong' ? 'Gyodong' : 'Pingu'}`,
        description: `“${trimmed}”`,
        timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
        aiTag: analyzeTextToAiTag(trimmed, lang),
        badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
      },
      ...prev,
    ]);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addCustomTextNote(noteInput);
    setNoteInput('');
  };

  const handleApplyScenarioPreset = (
    presetType: 'brand_flat_complex' | 'pingu_cozy_hill' | 'gyodong_tough_hill'
  ) => {
    if (presetType === 'brand_flat_complex') {
      setPerspective('pingu');
      setLiquidityScores({
        brand: 98,
        newBuild: 92,
        subway: 96,
        school: 94,
        flatness: 92,
        households: 99,
      });
      addCustomTextNote(
        lang === 'ko'
          ? '역에서 3분 거리 평지에 1군 브랜드 대단지 문주가 웅장하게 서 있고, 단지 안 초품아 학교와 공원 산책로가 너무 조용하고 쾌적해요.'
          : '3-minute flat walk from the station with a grand Tier-1 brand gatehouse, an on-site elementary school, and quiet park trails.'
      );
    } else if (presetType === 'pingu_cozy_hill') {
      setPerspective('pingu');
      setLiquidityScores({
        brand: 84,
        newBuild: 76,
        subway: 78,
        school: 88,
        flatness: 52,
        households: 94,
      });
      addCustomTextNote(
        lang === 'ko'
          ? '역에서 올라오는 언덕이 꽤 가파르긴 한데, 골목 끝 공원이 바로 옆이고 해질녘 노을빛이 너무 따뜻하고 조용해서 마음이 놓인다.'
          : 'The hill from the station is quite steep, but the park at the end of the alley is right next door and the warm sunset glow feels cozy.'
      );
    } else {
      setPerspective('gyodong');
      setLiquidityScores({
        brand: 82,
        newBuild: 74,
        subway: 72,
        school: 85,
        flatness: 45,
        households: 90,
      });
      addCustomTextNote(
        lang === 'ko'
          ? '언덕 경사가 가팔라서 매일 출퇴근할 때 숨이 좀 차겠지만, 대단지 세대수가 많아서 상가와 버스 정류장은 잘 갖춰져 있네.'
          : 'The uphill slope is steep for daily commuting, though the large household count keeps retail and bus access convenient.'
      );
    }
  };

  const handleSynthesizeClick = async () => {
    setIsSynthesizing(true);
    try {
      const effectiveMoments = [...moments];
      if (noteInput.trim()) {
        const autoMoment: CapturedMoment = {
          id: `note-auto-${Date.now()}`,
          type: 'note',
          badge: lang === 'ko' ? '직접 입력한 메모' : 'Custom Field Note',
          title:
            lang === 'ko'
              ? `현장 메모 · ${perspective === 'gyodong' ? '교동' : '핑구'}`
              : `Field Note · ${perspective === 'gyodong' ? 'Gyodong' : 'Pingu'}`,
          description: `“${noteInput.trim()}”`,
          timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
          aiTag: analyzeTextToAiTag(noteInput.trim(), lang),
          badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
        };
        effectiveMoments.unshift(autoMoment);
        setNoteInput('');
      }

      if (onSynthesizeWithGemini) {
        const isGyodong = perspective === 'gyodong';
        const combinedText = effectiveMoments
          .map((m) => `${m.title} ${m.description}`)
          .join(' ')
          .toLowerCase();

        let inclinePercent = Math.max(8, 100 - (liquidityScores.flatness ?? 80));
        if (/평지|평탄|완만|걷기 편|flat|level|easy walk/.test(combinedText)) {
          inclinePercent = 12;
        } else if (/언덕|가파|오르막|경사|계단|숨차|숨이 차|steep|hill|slope|uphill/.test(combinedText)) {
          inclinePercent = 85;
        }

        let noiseDb = isGyodong ? 36 : 28;
        if (/시끄|차 소리|차소리|대로변|소음|트럭|오토바이|복잡|loud|noisy|traffic/.test(combinedText)) {
          noiseDb = 66;
        } else if (/조용|한적|고요|평화|바람 소리|나뭇잎|quiet|calm|peaceful/.test(combinedText)) {
          noiseDb = 26;
        }

        let greenWalkMinutes = neighborhood.greenWalkMinutes;
        if (/공원|숲|나무|산책로|녹지|바로 옆|가깝|park|trees|greenery/.test(combinedText)) {
          greenWalkMinutes = 2;
        }

        let cozinessPercent = isGyodong ? 78 : 95;
        if (/힘들|부담|숨차|좁|피곤|tiring|exhausting|tight/.test(combinedText)) {
          cozinessPercent = 68;
        } else if (/따뜻|아늑|노을|예쁘|힐링|좋다|쾌적|cozy|warm|sunset|lovely/.test(combinedText)) {
          cozinessPercent = 96;
        }

        const primaryUserMoment = effectiveMoments[0];
        const customQuote = primaryUserMoment
          ? primaryUserMoment.description
          : neighborhood.quote;

        const uploadedPhotos = [
          ...(attachedPhotoUrl ? [attachedPhotoUrl] : []),
          ...effectiveMoments
            .map((m) => m.imageDataUrl)
            .filter((url): url is string => Boolean(url)),
        ];

        const avgLiqScore = Math.round(
          (liquidityScores.brand +
            liquidityScores.newBuild +
            liquidityScores.subway +
            liquidityScores.school +
            liquidityScores.flatness +
            liquidityScores.households) /
            6
        );
        const grade: LiquidityMetrics['grade'] =
          avgLiqScore >= 92 ? 'S' : avgLiqScore >= 86 ? 'A+' : avgLiqScore >= 78 ? 'A' : 'B+';

        const baseLiq = neighborhood.liquidity;
        const liquidityOverride: LiquidityMetrics | undefined = baseLiq
          ? {
              ...baseLiq,
              brand: { ...baseLiq.brand, score: liquidityScores.brand },
              newBuild: { ...baseLiq.newBuild, score: liquidityScores.newBuild },
              subway: { ...baseLiq.subway, score: liquidityScores.subway },
              school: { ...baseLiq.school, score: liquidityScores.school },
              flatness: { ...baseLiq.flatness, score: liquidityScores.flatness },
              households: { ...baseLiq.households, score: liquidityScores.households },
              totalScore: avgLiqScore,
              grade,
            }
          : undefined;

        await onSynthesizeWithGemini({
          perspective,
          moments: effectiveMoments,
          inclinePercent,
          cozinessPercent,
          noiseDb,
          greenWalkMinutes,
          quote: customQuote,
          quoteEn: customQuote,
          uploadedPhotos,
          sensoryPriorities: selectedSensoryPriorities,
          liquidityOverride,
        });
      }
    } finally {
      setIsSynthesizing(false);
      onFinishToDiorama();
    }
  };

  return (
    <div className="flex flex-col gap-3.5 pb-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Recording Context Header */}
      <div className="bg-white rounded-3xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#e8f3ff] flex items-center justify-center text-[#0051ff] shrink-0">
            <span className="material-symbols-outlined text-[22px]">location_on</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[15px] font-extrabold text-[#191f28] truncate">
                {lang === 'en' && neighborhood.nameEn ? neighborhood.nameEn : neighborhood.name}
              </span>
              <span className="text-[10px] font-bold text-[#0051ff] bg-[#e8f3ff] px-2 py-0.5 rounded-full">
                {lang === 'ko' ? '위치 확인됨' : 'Verified Location'}
              </span>
            </div>
            <p className="text-[11px] text-[#8b95a1] mt-0.5 truncate">
              {lang === 'en' && neighborhood.stationDistanceEn
                ? neighborhood.stationDistanceEn
                : neighborhood.stationDistance}{' '}
              ·{' '}
              {lang === 'ko'
                ? `실시간 기록 중 (${formatTimeSeconds(elapsedSeconds)})`
                : `Recording (${formatTimeSeconds(elapsedSeconds)})`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={isEmptyMode ? handleLoadSample : handleResetEmpty}
          className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
            isEmptyMode
              ? 'bg-[#e8f3ff] text-[#0051ff]'
              : 'bg-[#fff0f2] text-[#e03e52] hover:bg-[#ffe3e8]'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {isEmptyMode ? 'restore' : 'restart_alt'}
          </span>
          <span>
            {isEmptyMode
              ? lang === 'ko'
                ? '샘플 불러오기'
                : 'Load Sample'
              : lang === 'ko'
                ? '비우고 처음부터'
                : 'Start Empty'}
          </span>
        </button>
      </div>

      {/* STEP 1: Attached Photo → 3D Reconstruction Preview Card */}
      <section className="bg-slate-900 text-white rounded-3xl p-4 shadow-md border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
              PHOTO-TO-3D RECONSTRUCTION · GEMINI 4 ARGON
            </span>
            <h3 className="text-[14px] font-extrabold text-white mt-0.5">
              {lang === 'ko'
                ? 'Step 1. 첨부한 이미지 기반 3D 입체 지형·건물 복원'
                : 'Step 1. Photo-Based 3D Depth & Building Reconstruction'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">add_a_photo</span>
            <span>{lang === 'ko' ? '내 사진 첨부' : 'Upload Photo'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700">
          <div className="sm:col-span-5 relative rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-700">
            <img
              src={attachedPhotoUrl}
              alt={attachedPhotoLabel}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/85 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
              📸 {attachedPhotoLabel.slice(0, 18)}
            </span>
          </div>
          <div className="sm:col-span-7 flex flex-col gap-1.5 text-[11px] text-slate-300">
            <p className="font-bold text-white">
              {lang === 'ko'
                ? '첨부 사진 픽셀 깊이맵(Depth Relief) + 3D 건축물 자동 합성'
                : 'Offscreen Canvas Depth Relief + 3D Architectural Synthesis'}
            </p>
            <p className="text-slate-400 leading-relaxed">
              {lang === 'ko'
                ? '업로드한 사진의 색상·휘도·구도를 캔버스로 분석해 3D 입체 릴리프 지형과 복셀 빌딩 숲, 아파트 타워·문주로 변환합니다.'
                : 'Samples luminance and color from your photo to extrude a 3D depth relief backdrop, foreground voxel columns, and apartment towers.'}
            </p>
            {neighborhood.photos.length > 1 && (
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                {neighborhood.photos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setAttachedPhotoUrl(p.url);
                      setAttachedPhotoLabel(p.caption);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      attachedPhotoUrl === p.url
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    🖼️ {lang === 'en' && p.captionEn ? p.captionEn : p.caption}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STEP 2: Sensory Memory (My Chosen Priorities) + Objective Location (6 Liquidity Pillars) */}
      <section className="bg-white rounded-3xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3.5">
        <div>
          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
            SENSORY PRIORITIES & 6 LIQUIDITY PILLARS
          </span>
          <h3 className="text-[14px] font-extrabold text-[#191f28] mt-0.5">
            {lang === 'ko'
              ? 'Step 2. 내가 중요하게 생각하는 감각기억 & 환금성 6대 입지'
              : 'Step 2. Your Sensory Priorities & 6 Objective Liquidity Pillars'}
          </h3>
        </div>

        {/* User-selectable Sensory Memory Chips */}
        <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-extrabold text-slate-900">
              ✨ {lang === 'ko' ? '내가 중요하게 생각하는 감각기억 선택' : 'Select Your Sensory Priorities'}
            </span>
            <span className="text-[10px] font-bold text-amber-800">
              {lang === 'ko'
                ? `${selectedSensoryPriorities.length}개 선택됨`
                : `${selectedSensoryPriorities.length} selected`}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SENSORY_PRIORITY_OPTIONS.map((opt) => {
              const active = selectedSensoryPriorities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onToggleSensoryPriority?.(opt.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{lang === 'en' ? opt.labelEn : opt.labelKo}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Liquidity Pillars Interactive Score Sliders */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-extrabold text-slate-900">
              🏛️{' '}
              {lang === 'ko'
                ? '객관적 입지: 환금성 6대 기준 (3D 건물·문주·학교·경사에 즉시 반영)'
                : 'Objective Location: 6 Liquidity Pillars (Reflected in 3D)'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LIQUIDITY_PILLAR_META.map((pillar) => {
              const val = liquidityScores[pillar.key] ?? 85;
              return (
                <div
                  key={pillar.key}
                  className="bg-white rounded-xl p-2.5 border border-slate-200/80 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-800">
                      {pillar.step}. {lang === 'en' ? pillar.labelEn : pillar.labelKo}
                    </span>
                    <span className="font-extrabold text-indigo-600">{val}점</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={val}
                    onChange={(e) =>
                      setLiquidityScores((prev) => ({
                        ...prev,
                        [pillar.key]: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-indigo-600 cursor-pointer h-1.5"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STEP 3: Explorer Perspective (Pingu vs Gyodong) & Voice/Text Note Input */}
      <section className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#edf0f3] flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-extrabold text-[#0051ff] uppercase tracking-wider">
              {lang === 'ko'
                ? 'Step 3. 동네에서 느낀 인상을 말하거나 적어보세요'
                : 'Step 3. Speak or Type What You Felt'}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#f2f4f6] p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setPerspective('pingu')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                perspective === 'pingu'
                  ? 'bg-white text-[#191f28] shadow-xs'
                  : 'text-[#8b95a1] hover:text-[#191f28]'
              }`}
            >
              <CharacterAvatar character="pingu" size={18} />
              <span>{lang === 'ko' ? '핑구' : 'Pingu'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPerspective('gyodong')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                perspective === 'gyodong'
                  ? 'bg-white text-[#191f28] shadow-xs'
                  : 'text-[#8b95a1] hover:text-[#191f28]'
              }`}
            >
              <CharacterAvatar character="gyodong" size={18} />
              <span>{lang === 'ko' ? '교동' : 'Gyodong'}</span>
            </button>
          </div>
        </div>

        {/* Direct Note Input Form */}
        <form
          onSubmit={handleAddNote}
          className="bg-[#f7f9fb] rounded-2xl p-2 pl-3.5 border border-[#e5e8eb] focus-within:border-[#0051ff] flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[#0051ff] text-[20px]">edit_note</span>
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder={
              lang === 'ko'
                ? '직접 입력 (예: 1군 브랜드 문주가 멋지고 평지라 걷기 편해요)'
                : 'Type here (e.g., Grand brand gatehouse and easy flat walk)'
            }
            className="flex-1 text-[13px] text-[#191f28] placeholder-[#8b95a1] focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-[#0051ff] text-white text-[12px] font-bold hover:bg-[#0041cc] transition-colors cursor-pointer shrink-0"
          >
            {lang === 'ko' ? '기록 추가' : 'Add Note'}
          </button>
        </form>

        {/* Scenario Quick-Try Chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleApplyScenarioPreset('brand_flat_complex')}
            className="px-2.5 py-1.5 rounded-xl bg-[#f7f9fb] hover:bg-[#e8f3ff] border border-[#edf0f3] text-[11px] font-bold text-[#4e5968] hover:text-[#0051ff] transition-colors cursor-pointer text-left"
          >
            🏛️ {lang === 'ko' ? '프리셋 A: 1군 브랜드 평지 대단지 + 초품아' : 'Preset A: Tier-1 Brand Flat Complex'}
          </button>
          <button
            type="button"
            onClick={() => handleApplyScenarioPreset('pingu_cozy_hill')}
            className="px-2.5 py-1.5 rounded-xl bg-[#f7f9fb] hover:bg-[#e8f3ff] border border-[#edf0f3] text-[11px] font-bold text-[#4e5968] hover:text-[#0051ff] transition-colors cursor-pointer text-left"
          >
            🐧 {lang === 'ko' ? '프리셋 B: 가파른 언덕 + 따뜻한 노을 숲세권' : 'Preset B: Steep Hill + Cozy Sunset Park'}
          </button>
          <button
            type="button"
            onClick={() => handleApplyScenarioPreset('gyodong_tough_hill')}
            className="px-2.5 py-1.5 rounded-xl bg-[#f7f9fb] hover:bg-[#fff0f2] border border-[#edf0f3] text-[11px] font-bold text-[#4e5968] hover:text-[#e03e52] transition-colors cursor-pointer text-left"
          >
            🐟 {lang === 'ko' ? '프리셋 C: 교동의 출퇴근 경사 & 대단지 체크' : 'Preset C: Gyodong Commute Slope Check'}
          </button>
          <button
            type="button"
            onClick={handleStartVoiceRecognition}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              isSpeechListening
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'bg-[#f7f9fb] border-[#edf0f3] text-[#191f28] hover:border-[#0051ff]/40'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-red-500">mic</span>
            <span>
              {isSpeechListening
                ? lang === 'ko'
                  ? '듣는 중...'
                  : 'Listening...'
                : lang === 'ko'
                  ? '음성으로 말하기'
                  : 'Voice Input'}
            </span>
          </button>
        </div>
      </section>

      {/* Collected Memory Fragments Stream */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[13px] font-bold text-[#191f28]">
            {lang === 'ko'
              ? `기록된 조각 (${moments.length}개)`
              : `Recorded Fragments (${moments.length})`}
          </h3>
        </div>

        {moments.map((item) => (
          <div
            key={item.id}
            className="bg-white p-3.5 rounded-2xl border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-[#f2f4f6] text-[#191f28] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[17px]">
                {item.type === 'voice'
                  ? 'graphic_eq'
                  : item.type === 'photo'
                    ? 'collections'
                    : 'notes'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[12px] font-bold text-[#191f28]">{item.title}</span>
                <span className="text-[10px] text-[#8b95a1]">{item.timeAgo}</span>
              </div>
              <p className="text-[12px] text-[#4e5968] leading-snug">{item.description}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f7f9fb] text-[#0051ff] border border-[#e8f3ff]">
                <span>{item.aiTag}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom Floating Transform to 3D Diorama Button */}
      <div className="fixed bottom-[4.5rem] inset-x-0 px-4 max-w-md mx-auto z-40 pointer-events-none">
        <button
          type="button"
          disabled={isSynthesizing}
          onClick={handleSynthesizeClick}
          className="w-full h-14 rounded-2xl bg-[#191f28] hover:bg-black text-white font-bold text-[14px] shadow-[0_10px_25px_rgba(25,31,40,0.25)] flex items-center justify-between px-5 active:scale-98 transition-all pointer-events-auto cursor-pointer disabled:opacity-75"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0051ff] text-[22px]">
              view_in_ar
            </span>
            <span>
              {isSynthesizing
                ? lang === 'ko'
                  ? 'Gemini 4 Argon 이미지·입지 3D 합성 중...'
                  : 'Synthesizing Photo & 3D World...'
                : lang === 'ko'
                  ? '첨부 이미지 + 입지·감각 3D 디오라마 생성'
                  : 'Build Photo-Based 3D Diorama'}
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
