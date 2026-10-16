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
  const [captureMode, setCaptureMode] = useState<'walk' | 'drive' | 'night'>('walk');
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [isSpeechListening, setIsSpeechListening] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(startEmpty ? 0 : 14);
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

  // Comwit UI Sensory Tactile Metric States (from Stitch Quick Capture reference)
  const [slopeFeeling, setSlopeFeeling] = useState<'gentle' | 'moderate' | 'steep'>(
    neighborhood.inclineAngleDeg >= 10
      ? 'steep'
      : neighborhood.inclineAngleDeg >= 5
        ? 'moderate'
        : 'gentle'
  );
  const [sunlightFeeling, setSunlightFeeling] = useState<'great' | 'normal' | 'shaded'>(
    neighborhood.cozinessPercent >= 85
      ? 'great'
      : neighborhood.cozinessPercent >= 70
        ? 'normal'
        : 'shaded'
  );
  const [liveNoiseDb, setLiveNoiseDb] = useState<number>(neighborhood.noiseDb);

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
    setLiveNoiseDb(neighborhood.noiseDb);
    setSlopeFeeling(
      neighborhood.inclineAngleDeg >= 10
        ? 'steep'
        : neighborhood.inclineAngleDeg >= 5
          ? 'moderate'
          : 'gentle'
    );
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

  // Pingu = 출퇴근·현실 중심, Gyodong = 감성·산책 중심
  const getInitialMoments = (p: 'pingu' | 'gyodong', currentLang: Lang): CapturedMoment[] => {
    if (p === 'gyodong') {
      return currentLang === 'ko'
        ? [
            {
              id: 'gyo-1',
              type: 'voice',
              badge: '방금 전',
              title: '음성 메모 0:18 · 교동 (감성·산책 중심)',
              description:
                '“단지 안쪽 보행 데크로 들어오니 차 소리가 차단되고 나무 그늘과 노을 조명이 정말 아늑해! 저녁마다 산책하기 딱 좋은 동네 분위기야.”',
              timeAgo: '방금 전',
              aiTag: '🌳 숲세권 산책로 · 🌅 따뜻한 골목 노을 조도 94% 확인',
              badgeColor: 'text-[#b32b00] bg-[#ffdbce]/60',
            },
            {
              id: 'gyo-2',
              type: 'photo',
              badge: '2분 전',
              title: '첨부 현장 사진 → 3D 지형·건물 깊이맵 추출',
              description:
                '단지 산책로, 조경수 및 보행로 사진을 Gemini 4 Argon이 3D 메쉬로 복원 준비',
              timeAgo: '2분 전',
              aiTag: '📸 첨부 이미지 기반 3D 입체 복원 연동됨',
              badgeColor: 'text-[#003dc7] bg-[#dde1ff]',
              imageDataUrl: neighborhood.photos?.[0]?.url || neighborhood.dioramaImageUrl,
            },
          ]
        : [
            {
              id: 'gyo-1',
              type: 'voice',
              badge: 'Just now',
              title: 'Voice Memo 0:18 · Gyodong (Vibe & Walk)',
              description:
                '“Stepping onto the inner pedestrian deck blocks out traffic noise—the lush trees and warm sunset glow make it perfect for evening walks!”',
              timeAgo: 'Just now',
              aiTag: '🌳 Forest Trail · 🌅 Warm Sunset Coziness 94%',
              badgeColor: 'text-[#b32b00] bg-[#ffdbce]/60',
            },
            {
              id: 'gyo-2',
              type: 'photo',
              badge: '2m ago',
              title: 'Attached Photo → 3D Depth Relief & Towers Ready',
              description:
                'Gemini 4 Argon extracts 3D relief mesh and building volumes from attached photo',
              timeAgo: '2m ago',
              aiTag: '📸 Photo-to-3D Reconstruction Ready',
              badgeColor: 'text-[#003dc7] bg-[#dde1ff]',
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
            title: '음성 메모 0:14 · 핑구 (출퇴근·현실 중심)',
            description:
              '“역에서 단지 정문까지 거리와 오르막 경사도를 실측했어. 1군 브랜드 대단지 문주와 세대수 환금성은 탄탄한데 아침 출퇴근 경사 체감을 3D로 체크해보자!”',
            timeAgo: '방금 전',
            aiTag: `🏛️ 환금성(역세권·세대수) 확인 · ⛰️ 경사 ${neighborhood.inclineAngleDeg}° · 🤫 소음 ${neighborhood.noiseDb}dB`,
            badgeColor: 'text-[#003dc7] bg-[#dde1ff]',
          },
          {
            id: 'm-2',
            type: 'photo',
            badge: '3분 전',
            title: '첨부 현장 사진 → 3D 입체 복원 연결됨',
            description:
              '첨부된 사진의 건물 실루엣, 하늘 색감, 도로 구도를 샘플링해 3D 디오라마에 즉시 투영합니다',
            timeAgo: '3분 전',
            aiTag: '📸 Gemini 4 Argon Photo-to-3D Relief 활성',
            badgeColor: 'text-[#006c47] bg-[#68fadd]/40',
            imageDataUrl: neighborhood.photos?.[0]?.url || neighborhood.dioramaImageUrl,
          },
        ]
      : [
          {
            id: 'm-1',
            type: 'voice',
            badge: 'Just now',
            title: 'Voice Memo 0:14 · Pingu (Commute & Practical)',
            description:
              '“Measured station walk distance and uphill slope. Tier-1 brand gatehouse and household liquidity are solid; let’s verify the 3D commute slope!”',
            timeAgo: 'Just now',
            aiTag: `🏛️ Liquidity Verified · ⛰️ Slope ${neighborhood.inclineAngleDeg}° · 🤫 Noise ${neighborhood.noiseDb}dB`,
            badgeColor: 'text-[#003dc7] bg-[#dde1ff]',
          },
          {
            id: 'm-2',
            type: 'photo',
            badge: '3m ago',
            title: 'Attached Field Photo → 3D Reconstruction Linked',
            description:
              'Samples building silhouettes, sky palette, and depth from your photo into 3D',
            timeAgo: '3m ago',
            aiTag: '📸 Gemini 4 Argon Photo-to-3D Active',
            badgeColor: 'text-[#006c47] bg-[#68fadd]/40',
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

  const handleSlopeTagChange = (level: 'gentle' | 'moderate' | 'steep') => {
    setSlopeFeeling(level);
    if (level === 'gentle') {
      setLiquidityScores((prev) => ({ ...prev, flatness: 94 }));
    } else if (level === 'moderate') {
      setLiquidityScores((prev) => ({ ...prev, flatness: 74 }));
    } else {
      setLiquidityScores((prev) => ({ ...prev, flatness: 48 }));
    }
  };

  const handleStartVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const fallbackText =
        perspective === 'pingu'
          ? lang === 'ko'
            ? '역에서 단지로 올라오는 길 마지막 구간 경사가 조금 있지만, 1군 브랜드 대단지라 거래 환금성과 출퇴근 버스 동선이 훌륭해요.'
            : 'There is a slight uphill stretch from the station, but the Tier-1 brand complex offers strong resale liquidity and transit access.'
          : lang === 'ko'
            ? '단지 안쪽 산책로에 소나무 조경이 울창하고 저녁 노을빛이 따뜻해서 산책할 때 마음이 정말 평화로워요.'
            : 'The inner complex trail has lush pine landscaping and a warm sunset glow that feels peaceful for evening walks.';
      setMoments((prev) => [
        {
          id: `voice-${Date.now()}`,
          type: 'voice',
          badge: lang === 'ko' ? '음성 기록됨' : 'Voice Recorded',
          title:
            lang === 'ko'
              ? `실시간 음성 메모 · ${perspective === 'gyodong' ? '교동(감성·산책)' : '핑구(출퇴근·현실)'}`
              : `Live Voice Memo · ${perspective === 'gyodong' ? 'Gyodong' : 'Pingu'}`,
          description: `“${fallbackText}”`,
          timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
          aiTag: analyzeTextToAiTag(fallbackText, lang),
          badgeColor: 'text-[#003dc7] bg-[#dde1ff]',
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
                  ? `마이크 음성 메모 · ${perspective === 'gyodong' ? '교동(감성·산책)' : '핑구(출퇴근·현실)'}`
                  : `Mic Voice Memo · ${perspective === 'gyodong' ? 'Gyodong' : 'Pingu'}`,
              description: `“${transcript}”`,
              timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
              aiTag: analyzeTextToAiTag(transcript, lang),
              badgeColor: 'text-[#003dc7] bg-[#dde1ff]',
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
          badgeColor: 'text-[#003dc7] bg-[#dde1ff]',
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
            ? `현장 메모 · ${perspective === 'gyodong' ? '교동(감성·산책)' : '핑구(출퇴근·현실)'}`
            : `Field Note · ${perspective === 'gyodong' ? 'Gyodong' : 'Pingu'}`,
        description: `“${trimmed}”`,
        timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
        aiTag: analyzeTextToAiTag(trimmed, lang),
        badgeColor: 'text-[#003dc7] bg-[#dde1ff]',
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
    presetType: 'brand_flat_complex' | 'pingu_tough_commute' | 'gyodong_cozy_walk'
  ) => {
    if (presetType === 'brand_flat_complex') {
      setPerspective('pingu');
      setSlopeFeeling('gentle');
      setLiquidityScores({
        brand: 98,
        newBuild: 92,
        subway: 96,
        school: 94,
        flatness: 94,
        households: 99,
      });
      addCustomTextNote(
        lang === 'ko'
          ? '역에서 3분 거리 완전 평지에 1군 브랜드 대단지 문주가 웅장하게 서 있고, 초품아 통학로와 출퇴근 동선이 완벽해요.'
          : '3-minute flat walk from the station with a grand Tier-1 brand gatehouse, on-site elementary school, and effortless commute.'
      );
    } else if (presetType === 'pingu_tough_commute') {
      setPerspective('pingu');
      setSlopeFeeling('steep');
      setLiquidityScores({
        brand: 84,
        newBuild: 76,
        subway: 74,
        school: 88,
        flatness: 46,
        households: 95,
      });
      addCustomTextNote(
        lang === 'ko'
          ? '언덕 경사가 가팔라서 매일 아침 출퇴근할 때 숨이 좀 차겠지만, 3,000세대급 대단지라 상가와 마을버스 환승, 거래 환금성은 탄탄하네.'
          : 'The uphill slope is steep for daily commuting, though the large household scale keeps shuttle bus access and resale liquidity strong.'
      );
    } else {
      setPerspective('gyodong');
      setSlopeFeeling('moderate');
      setSunlightFeeling('great');
      setLiquidityScores({
        brand: 86,
        newBuild: 80,
        subway: 82,
        school: 88,
        flatness: 68,
        households: 90,
      });
      addCustomTextNote(
        lang === 'ko'
          ? '단지 뒤편으로 숲세권 산책로가 바로 이어지고, 해질녘 주황빛 노을과 조용한 공원 분위기가 너무 따뜻하고 힐링돼요.'
          : 'A lush park trail connects right behind the complex, and the warm sunset glow and quiet evening vibe feel super cozy.'
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
              ? `현장 메모 · ${perspective === 'gyodong' ? '교동(감성·산책)' : '핑구(출퇴근·현실)'}`
              : `Field Note · ${perspective === 'gyodong' ? 'Gyodong' : 'Pingu'}`,
          description: `“${noteInput.trim()}”`,
          timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
          aiTag: analyzeTextToAiTag(noteInput.trim(), lang),
          badgeColor: 'text-[#003dc7] bg-[#dde1ff]',
        };
        effectiveMoments.unshift(autoMoment);
        setNoteInput('');
      }

      if (onSynthesizeWithGemini) {
        const combinedText = effectiveMoments
          .map((m) => `${m.title} ${m.description}`)
          .join(' ')
          .toLowerCase();

        let inclinePercent =
          slopeFeeling === 'steep'
            ? 84
            : slopeFeeling === 'moderate'
              ? 48
              : Math.max(10, 100 - (liquidityScores.flatness ?? 85));
        if (/평지|평탄|완만|걷기 편|flat|level|easy walk/.test(combinedText)) {
          inclinePercent = 12;
        } else if (
          /언덕|가파|오르막|경사|계단|숨차|숨이 차|steep|hill|slope|uphill/.test(combinedText)
        ) {
          inclinePercent = 85;
        }

        let noiseDb = liveNoiseDb;
        if (
          /시끄|차 소리|차소리|대로변|소음|트럭|오토바이|복잡|loud|noisy|traffic/.test(combinedText)
        ) {
          noiseDb = 66;
        } else if (
          /조용|한적|고요|평화|바람 소리|나뭇잎|quiet|calm|peaceful/.test(combinedText)
        ) {
          noiseDb = 26;
        }

        let greenWalkMinutes = neighborhood.greenWalkMinutes;
        if (/공원|숲|나무|산책로|녹지|바로 옆|가깝|park|trees|greenery/.test(combinedText)) {
          greenWalkMinutes = 2;
        }

        let cozinessPercent =
          sunlightFeeling === 'great' ? 94 : sunlightFeeling === 'normal' ? 82 : 68;
        if (/힘들|부담|숨차|좁|피곤|tiring|exhausting|tight/.test(combinedText)) {
          cozinessPercent = 68;
        } else if (
          /따뜻|아늑|노을|예쁘|힐링|좋다|쾌적|cozy|warm|sunset|lovely/.test(combinedText)
        ) {
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
    <div className="flex flex-col gap-4 pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* 1. Neo-Tactile Status Banner & Segmented Mode Control (From Stitch Quick Capture) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#003dc7] block mb-0.5">
              {lang === 'ko' ? '현장 임장 발자국' : 'FIELD CAPTURE FOOTPRINT'}
            </span>
            <h2 className="text-[19px] font-extrabold tracking-tight text-[#111c2d]">
              {lang === 'en' && neighborhood.nameEn ? neighborhood.nameEn : neighborhood.name}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 bg-[#00885a]/10 text-[#006844] px-3 py-1.5 rounded-full border border-[#68fadd]/40">
            <span
              className="material-symbols-outlined text-[15px] text-[#006c47]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              my_location
            </span>
            <span className="text-[11px] font-extrabold">GPS 정확도 99%</span>
          </div>
        </div>

        {/* 3-Way Mode Segmented Control: 도보 실측 | 차량 탐색 | 야간 분위기 */}
        <div className="bg-[#e5eeff] p-1 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCaptureMode('walk')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              captureMode === 'walk'
                ? 'bg-white text-[#003dc7] shadow-xs'
                : 'text-[#515f74] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">directions_walk</span>
            <span>{lang === 'ko' ? '도보 실측' : 'Walk'}</span>
          </button>
          <button
            type="button"
            onClick={() => setCaptureMode('drive')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              captureMode === 'drive'
                ? 'bg-white text-[#003dc7] shadow-xs'
                : 'text-[#515f74] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">directions_car</span>
            <span>{lang === 'ko' ? '차량 탐색' : 'Drive'}</span>
          </button>
          <button
            type="button"
            onClick={() => setCaptureMode('night')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              captureMode === 'night'
                ? 'bg-white text-[#003dc7] shadow-xs'
                : 'text-[#515f74] hover:text-[#111c2d]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">nights_stay</span>
            <span>{lang === 'ko' ? '야간 분위기' : 'Night Vibe'}</span>
          </button>
        </div>

        {/* Explorer Perspective Switcher: 🐧 핑구(출퇴근·현실 중심) vs 🐶 교동(감성·산책 중심) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPerspective('pingu')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
              perspective === 'pingu'
                ? 'bg-[#003dc7] text-white border-[#003dc7] shadow-md shadow-[#003dc7]/15'
                : 'bg-white text-[#111c2d] border-slate-200/80 hover:border-[#003dc7]/40'
            }`}
          >
            <CharacterAvatar character="pingu" size={28} />
            <div className="min-w-0">
              <div className="text-[12px] font-extrabold truncate">
                {lang === 'ko' ? '🐧 핑구 시점' : '🐧 Pingu'}
              </div>
              <div
                className={`text-[10px] font-bold truncate ${
                  perspective === 'pingu' ? 'text-blue-100' : 'text-[#515f74]'
                }`}
              >
                {lang === 'ko' ? '출퇴근 · 현실 · 환금성 중심' : 'Commute & Liquidity'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPerspective('gyodong')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
              perspective === 'gyodong'
                ? 'bg-[#b32b00] text-white border-[#b32b00] shadow-md shadow-[#b32b00]/15'
                : 'bg-white text-[#111c2d] border-slate-200/80 hover:border-[#b32b00]/40'
            }`}
          >
            <CharacterAvatar character="gyodong" size={28} />
            <div className="min-w-0">
              <div className="text-[12px] font-extrabold truncate">
                {lang === 'ko' ? '🐶 교동 시점' : '🐶 Gyodong'}
              </div>
              <div
                className={`text-[10px] font-bold truncate ${
                  perspective === 'gyodong' ? 'text-amber-100' : 'text-[#515f74]'
                }`}
              >
                {lang === 'ko' ? '감성 · 산책 · 분위기 중심' : 'Vibe & Park Walk'}
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 2. Comwit UI Voice & Multimodal Capture Card (Stitch Primary Tactile Module) */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-[0_12px_32px_-4px_rgba(17,28,45,0.06)] border border-[#c4c5d9]/30">
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#003dc7]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-full flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff4ff] text-[#515f74] text-[11px] font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeechListening || isRecording ? 'bg-[#ba1a1a] animate-ping' : 'bg-[#006c47]'
                }`}
              />
              <span>
                {isSpeechListening
                  ? lang === 'ko'
                    ? '마이크 음성 인식 중...'
                    : 'Listening...'
                  : lang === 'ko'
                    ? `터치하여 현장 감상을 말해보세요 (${formatTimeSeconds(elapsedSeconds)})`
                    : `Tap mic to record (${formatTimeSeconds(elapsedSeconds)})`}
              </span>
            </div>

            <button
              type="button"
              onClick={isEmptyMode ? handleLoadSample : handleResetEmpty}
              className="text-[11px] font-bold text-[#003dc7] hover:underline cursor-pointer"
            >
              {isEmptyMode
                ? lang === 'ko'
                  ? '샘플 불러오기'
                  : 'Load Sample'
                : lang === 'ko'
                  ? '초기화'
                  : 'Reset'}
            </button>
          </div>

          {/* Tactile Pulsing Mic Button */}
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute w-24 h-24 rounded-full bg-[#003dc7]/10 animate-ping opacity-40" />
            <div className="absolute w-20 h-20 rounded-full bg-[#003dc7]/15" />
            <button
              type="button"
              onClick={handleStartVoiceRecognition}
              className="relative z-10 w-18 h-18 rounded-full bg-gradient-to-tr from-[#003dc7] to-[#1d56eb] text-white shadow-xl shadow-[#003dc7]/25 flex flex-col items-center justify-center active:scale-95 transition-transform cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[30px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mic
              </span>
              <span className="text-[9px] font-extrabold tracking-tighter mt-0.5">REC</span>
            </button>
          </div>

          {/* Simulated 9-Bar Audio Waveform */}
          <div className="w-full flex items-center justify-center gap-1.5 h-8 px-6">
            {[3, 6, 8, 4, 9, 7, 5, 3, 6].map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full ${
                  i === 4
                    ? 'bg-[#003dc7] animate-pulse'
                    : i % 2 === 1
                      ? 'bg-[#003dc7]/65'
                      : 'bg-[#003dc7]/30'
                }`}
                style={{ height: `${h * 3.2}px` }}
              />
            ))}
          </div>

          {/* Live Transcript Preview Box */}
          <div className="w-full bg-[#f8f9ff] rounded-2xl p-3.5 text-left border border-[#c4c5d9]/25">
            <span className="text-[11px] font-bold text-[#515f74] block mb-1">
              {lang === 'ko' ? '인식된 텍스트 프리뷰' : 'Recognized Transcript Preview'}
            </span>
            <p className="text-[13px] font-semibold text-[#111c2d] leading-relaxed">
              {moments[0]?.description ||
                '“정문 앞 경사가 생각보다 가파르네요. 그래도 보도블록이 새로 깔려있고 나무 그늘이 많아서 산책하긴 쾌적해요...”'}
            </p>
          </div>

          {/* Direct Text Memo Form */}
          <form
            onSubmit={handleAddNote}
            className="w-full bg-[#eff4ff] rounded-2xl p-1.5 pl-3.5 border border-[#c4c5d9]/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[#003dc7] text-[19px]">edit_note</span>
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={
                lang === 'ko'
                  ? '직접 메모 입력 (예: 역에서 오르막이지만 숲세권이라 조용해요)'
                  : 'Type field note here...'
              }
              className="flex-1 text-[12px] text-[#111c2d] placeholder-[#515f74] focus:outline-none bg-transparent font-medium"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-[#003dc7] text-white text-[11px] font-extrabold hover:bg-[#1d56eb] transition-colors cursor-pointer shrink-0"
            >
              {lang === 'ko' ? '기록 추가' : 'Add'}
            </button>
          </form>

          {/* Scenario Quick-Try Chips */}
          <div className="w-full flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleApplyScenarioPreset('brand_flat_complex')}
              className="px-2.5 py-1 rounded-xl bg-[#eff4ff] hover:bg-[#dde1ff] text-[10px] font-bold text-[#003dc7] transition-colors cursor-pointer"
            >
              🏛️ {lang === 'ko' ? '1군 브랜드 평지 대단지' : 'Flat Brand Complex'}
            </button>
            <button
              type="button"
              onClick={() => handleApplyScenarioPreset('pingu_tough_commute')}
              className="px-2.5 py-1 rounded-xl bg-[#eff4ff] hover:bg-[#dde1ff] text-[10px] font-bold text-[#111c2d] transition-colors cursor-pointer"
            >
              🐧 {lang === 'ko' ? '핑구: 출퇴근 오르막 & 대단지 체크' : 'Pingu: Commute Slope Check'}
            </button>
            <button
              type="button"
              onClick={() => handleApplyScenarioPreset('gyodong_cozy_walk')}
              className="px-2.5 py-1 rounded-xl bg-[#ffdbce]/40 hover:bg-[#ffdbce] text-[10px] font-bold text-[#b32b00] transition-colors cursor-pointer"
            >
              🐶 {lang === 'ko' ? '교동: 따뜻한 노을 & 숲세권 산책' : 'Gyodong: Cozy Park Walk'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Comwit UI Sensory Tactile Metric Chips (Stitch Section 3: 오르막 체감 · 주변 소음 · 골목 채광) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[14px] font-extrabold text-[#111c2d]">
            {lang === 'ko' ? '현장 오감 감각 지표' : 'Tactile Sensory Metrics'}
          </h3>
          <span className="text-[11px] text-[#515f74] font-semibold">
            {lang === 'ko' ? '원터치 태깅 · 3D 즉시 연동' : 'One-Touch Tagging'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Metric 1: Slope Gauge (오르막 체감) */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_8px_24px_-4px_rgba(17,28,45,0.04)] border border-[#c4c5d9]/25 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ffdbce]/60 text-[#b32b00] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">trending_up</span>
                </div>
                <div>
                  <span className="text-[13px] font-extrabold text-[#111c2d] block">
                    {lang === 'ko' ? '오르막 체감' : 'Perceived Slope'}
                  </span>
                  <span className="text-[11px] text-[#515f74]">
                    {lang === 'ko'
                      ? `현재 구간 추정 경사도 ${
                          slopeFeeling === 'steep'
                            ? '14°'
                            : slopeFeeling === 'moderate'
                              ? '8°'
                              : '2°'
                        }`
                      : `Estimated slope ${
                          slopeFeeling === 'steep'
                            ? '14°'
                            : slopeFeeling === 'moderate'
                              ? '8°'
                              : '2°'
                        }`}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#ffdbce] text-[#891f00] text-[11px] font-extrabold">
                {slopeFeeling === 'steep'
                  ? '경사 주의'
                  : slopeFeeling === 'moderate'
                    ? '완경사'
                    : '평지 쾌적'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSlopeTagChange('gentle')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  slopeFeeling === 'gentle'
                    ? 'bg-[#003dc7] text-white shadow-xs'
                    : 'bg-[#eff4ff] text-[#515f74] hover:bg-[#e5eeff]'
                }`}
              >
                완만함
              </button>
              <button
                type="button"
                onClick={() => handleSlopeTagChange('moderate')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  slopeFeeling === 'moderate'
                    ? 'bg-[#003dc7] text-white shadow-xs'
                    : 'bg-[#eff4ff] text-[#515f74] hover:bg-[#e5eeff]'
                }`}
              >
                보통
              </button>
              <button
                type="button"
                onClick={() => handleSlopeTagChange('steep')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  slopeFeeling === 'steep'
                    ? 'bg-[#b32b00] text-white shadow-md shadow-[#b32b00]/20'
                    : 'bg-[#eff4ff] text-[#515f74] hover:bg-[#e5eeff]'
                }`}
              >
                가파름 🔥
              </button>
            </div>
          </div>

          {/* Metric 2 & 3 Grid: 주변 소음 dB & 골목 채광 */}
          <div className="grid grid-cols-2 gap-3">
            {/* Noise Level */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_24px_-4px_rgba(17,28,45,0.04)] border border-[#c4c5d9]/25 flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#68fadd]/35 text-[#006c47] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
                </div>
                <span className="text-[10px] font-bold text-[#006c47] bg-[#68fadd]/30 px-2 py-0.5 rounded-full">
                  실시간 측정
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#515f74] block">주변 소음</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-extrabold text-[#111c2d]">{liveNoiseDb}</span>
                  <span className="text-xs font-bold text-[#515f74]">dB</span>
                </div>
              </div>
              <input
                type="range"
                min={24}
                max={78}
                value={liveNoiseDb}
                onChange={(e) => setLiveNoiseDb(Number(e.target.value))}
                className="w-full accent-[#006c47] cursor-pointer h-1.5"
              />
              <span className="text-[11px] font-semibold text-[#006c47]">
                {liveNoiseDb <= 45 ? '도서관 수준의 정숙함' : '일상 보행 소음'}
              </span>
            </div>

            {/* Sunlight Level */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_24px_-4px_rgba(17,28,45,0.04)] border border-[#c4c5d9]/25 flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#dde1ff] text-[#003dc7] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                </div>
                <span className="text-[10px] font-bold text-[#515f74]">오후 기준</span>
              </div>
              <div>
                <span className="text-[11px] text-[#515f74] block mb-1.5">골목 채광</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSunlightFeeling('great')}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between cursor-pointer ${
                      sunlightFeeling === 'great'
                        ? 'bg-[#003dc7] text-white'
                        : 'bg-[#eff4ff] text-[#515f74]'
                    }`}
                  >
                    <span>우수 ☀️</span>
                    {sunlightFeeling === 'great' && (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    )}
                  </button>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setSunlightFeeling('normal')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-semibold cursor-pointer ${
                        sunlightFeeling === 'normal'
                          ? 'bg-[#003dc7] text-white'
                          : 'bg-[#eff4ff] text-[#515f74]'
                      }`}
                    >
                      보통
                    </button>
                    <button
                      type="button"
                      onClick={() => setSunlightFeeling('shaded')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-semibold cursor-pointer ${
                        sunlightFeeling === 'shaded'
                          ? 'bg-[#003dc7] text-white'
                          : 'bg-[#eff4ff] text-[#515f74]'
                      }`}
                    >
                      그늘짐
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Photo & Video Snap Dock (현장 디테일 스냅 · Photo-to-3D — Stitch Section 4) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[14px] font-extrabold text-[#111c2d]">
            {lang === 'ko' ? '현장 디테일 스냅 · 사진 3D 변환' : 'Field Detail Snap · Photo-to-3D'}
          </h3>
          <span className="text-xs text-[#003dc7] font-bold">
            {neighborhood.photos.length + 1}장 기록됨
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Add Photo / Video Action */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-32 rounded-2xl bg-[#eff4ff] border-2 border-dashed border-[#c4c5d9] flex flex-col items-center justify-center gap-2 text-[#515f74] hover:border-[#003dc7] hover:text-[#003dc7] transition-colors active:scale-98 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center">
              <span className="material-symbols-outlined text-[#003dc7]">add_a_photo</span>
            </div>
            <span className="text-xs font-bold">사진 / 3D 원본 추가</span>
          </button>

          {/* Recent Captured Snap Preview */}
          <div className="relative h-32 rounded-2xl overflow-hidden shadow-xs group bg-slate-900">
            <img
              src={attachedPhotoUrl}
              alt={attachedPhotoLabel}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
              <span
                className="material-symbols-outlined text-[12px] text-[#68fadd]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              3D 매핑됨
            </div>
            <div className="absolute bottom-2.5 left-3 right-3 text-white">
              <span className="text-[10px] text-white/80 block">첨부 이미지 3D 깊이맵</span>
              <span className="text-xs font-bold truncate block">{attachedPhotoLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Gemini 4 Argon Intelligence Real-Time Synthesis Card (Stitch Section 5) */}
      <section className="rounded-2xl bg-gradient-to-br from-[#003dc7]/10 via-[#dde1ff]/50 to-[#68fadd]/20 p-4 border border-[#003dc7]/15 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#003dc7] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#003dc7] uppercase tracking-wider">
                Gemini 4 Argon 인텔리전스
              </span>
              <span className="text-[10px] font-bold text-[#006844] bg-[#68fadd]/60 px-2 py-0.5 rounded-full">
                실시간 분석 중
              </span>
            </div>
            <p className="text-xs text-[#111c2d] leading-relaxed font-medium">
              기록된 음성·메모와 경사도·소음 데이터를 결합하여{' '}
              <strong>‘{neighborhood.name}’ 3D 디오라마</strong>의 지형 경사각과 환금성 리포트에 실시간 반영합니다.
            </p>
          </div>
        </div>

        {/* Recorded Memory Fragments Stream */}
        <div className="space-y-2 pt-1">
          {moments.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-white flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-xl bg-[#eff4ff] text-[#003dc7] flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">
                  {item.type === 'voice'
                    ? 'graphic_eq'
                    : item.type === 'photo'
                      ? 'collections'
                      : 'notes'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#111c2d]">{item.title}</span>
                  <span className="text-[10px] text-[#515f74]">{item.timeAgo}</span>
                </div>
                <p className="text-[11px] text-[#515f74] leading-snug mt-0.5">{item.description}</p>
                <span className="mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eff4ff] text-[#003dc7]">
                  {item.aiTag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Personal Sensory Priorities & Objective 6 Liquidity Pillars Sliders */}
      <section className="bg-white rounded-3xl p-4 border border-[#c4c5d9]/25 shadow-[0_8px_24px_-4px_rgba(17,28,45,0.04)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-extrabold text-[#111c2d]">
            ✨ {lang === 'ko' ? '내가 고른 감각기억 & 환금성 6대 기준' : 'Sensory Priorities & 6 Liquidity Pillars'}
          </span>
          <span className="text-[10px] font-bold text-[#003dc7] bg-[#dde1ff] px-2 py-0.5 rounded-full">
            {selectedSensoryPriorities.length}개 선택됨
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
                    ? 'bg-[#003dc7] text-white border-[#003dc7] shadow-2xs'
                    : 'bg-[#eff4ff] text-[#515f74] border-transparent hover:bg-[#e5eeff]'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{lang === 'en' ? opt.labelEn : opt.labelKo}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LIQUIDITY_PILLAR_META.map((pillar) => {
            const val = liquidityScores[pillar.key] ?? 85;
            return (
              <div
                key={pillar.key}
                className="bg-[#f8f9ff] rounded-xl p-2.5 border border-[#c4c5d9]/25 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-[#111c2d]">
                    {pillar.step}. {lang === 'en' ? pillar.labelEn : pillar.labelKo}
                  </span>
                  <span className="font-extrabold text-[#003dc7]">{val}점</span>
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
                  className="w-full accent-[#003dc7] cursor-pointer h-1.5"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Floating Transform to 3D Diorama Button */}
      <div className="fixed bottom-[4.5rem] inset-x-0 px-4 max-w-md mx-auto z-40 pointer-events-none">
        <button
          type="button"
          disabled={isSynthesizing}
          onClick={handleSynthesizeClick}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#003dc7] to-[#1d56eb] hover:opacity-95 text-white font-extrabold text-[14px] shadow-[0_12px_28px_rgba(0,61,199,0.28)] flex items-center justify-between px-5 active:scale-98 transition-all pointer-events-auto cursor-pointer disabled:opacity-75"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-[22px]">view_in_ar</span>
            <span>
              {isSynthesizing
                ? lang === 'ko'
                  ? 'Gemini 4 Argon 이미지·입지 3D 합성 중...'
                  : 'Synthesizing Photo & 3D World...'
                : lang === 'ko'
                  ? '기록 완료 · 3D 디오라마 월드 생성하기'
                  : 'Build Photo-Based 3D Diorama'}
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
