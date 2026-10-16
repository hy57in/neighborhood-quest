import React, { useState, useEffect, useRef } from 'react';
import { Lang, NeighborhoodData } from '../types/index.ts';
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
  onFinishToDiorama: () => void;
  onSynthesizeWithGemini?: (params: {
    perspective: 'jamie' | 'sam';
    moments: CapturedMoment[];
    inclinePercent: number;
    cozinessPercent: number;
    noiseDb: number;
    greenWalkMinutes: number;
    quote: string;
    quoteEn: string;
    uploadedPhotos: string[];
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

  if (/따뜻|아늑|노을|예쁘|힐링|좋다|마음에|설레|cozy|warm|sunset|lovely/.test(lower)) {
    tags.push(lang === 'ko' ? '🧡 아늑함 94%' : '🧡 Coziness 94%');
  } else if (/힘들|부담|피곤|좁|답답|위험|무섭|tiring|tight|exhausting/.test(lower)) {
    tags.push(lang === 'ko' ? '💭 체감 부담 요소 반영' : '💭 Practical Strain Logged');
  }

  if (tags.length === 0) {
    return lang === 'ko'
      ? '✨ Gemini 4가 3-Layer 공간 기억으로 추출 완료'
      : '✨ Extracted into 3-Layer Spatial Memory';
  }
  return tags.join(' · ');
}

export const RecordingView: React.FC<RecordingViewProps> = ({
  neighborhood,
  startEmpty = false,
  onFinishToDiorama,
  onSynthesizeWithGemini,
  lang = 'ko',
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [isSpeechListening, setIsSpeechListening] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(startEmpty ? 0 : 20);
  const [noteInput, setNoteInput] = useState<string>('');
  const [perspective, setPerspective] = useState<'jamie' | 'sam'>(
    neighborhood.perspective || 'jamie'
  );
  const [isEmptyMode, setIsEmptyMode] = useState<boolean>(startEmpty);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const getInitialMoments = (p: 'jamie' | 'sam', currentLang: Lang): CapturedMoment[] => {
    if (p === 'sam') {
      return currentLang === 'ko'
        ? [
            {
              id: 'sam-1',
              type: 'voice',
              badge: '방금 전',
              title: '음성 메모 0:18 · 교동(Sam) 기록',
              description:
                '“역에서 올라오는 언덕 경사가 85%라 정장 입고 매일 출퇴근하기엔 숨이 꽤 차겠어. 골목 주차 공간도 좁은 편이네.”',
              timeAgo: '방금 전',
              aiTag: '📐 물리: 경사 85% 동일 · 💭 주관적 감정: 출퇴근 피로 우려',
              badgeColor: 'text-[#e03e52] bg-[#fff0f2]',
            },
            {
              id: 'sam-2',
              type: 'photo',
              badge: '2분 전',
              title: '가파른 오르막 & 좁은 골목 촬영',
              description: '비 오는 날이나 겨울철 결빙 시 보행 체감 난이도 높음 확인',
              timeAgo: '2분 전',
              aiTag: '⛰️ 체감 경사 부담 높음 · 🚗 주차 주의',
              badgeColor: 'text-[#f59f00] bg-[#fff9db]',
            },
          ]
        : [
            {
              id: 'sam-1',
              type: 'voice',
              badge: 'Just now',
              title: 'Voice Memo 0:18 · Gyodong (Sam)',
              description:
                '“With an 85% uphill slope from the station, commuting in a suit every day will be exhausting. Alley parking looks tight too.”',
              timeAgo: 'Just now',
              aiTag: '📐 Physical: 85% Slope (Same) · 💭 Subjective: Commute strain',
              badgeColor: 'text-[#e03e52] bg-[#fff0f2]',
            },
            {
              id: 'sam-2',
              type: 'photo',
              badge: '2m ago',
              title: 'Steep Uphill & Narrow Alley Photos',
              description: 'High walking effort during rainy or icy winter mornings',
              timeAgo: '2m ago',
              aiTag: '⛰️ High Commute Effort · 🚗 Tight Parking',
              badgeColor: 'text-[#f59f00] bg-[#fff9db]',
            },
          ];
    }

    return currentLang === 'ko'
      ? [
          {
            id: 'm-1',
            type: 'voice',
            badge: '방금 전',
            title: '음성 메모 0:14 · 핑구(Jamie) 기록',
            description:
              '“역에서 올라오는 언덕이 생각보다 가파르긴 한데, 저녁 바람이 선선하고 조용해서 산책하는 기분이 든다.”',
            timeAgo: '방금 전',
            aiTag: '⛰️ 경사도 85% · 🤫 소음 28dB 추출됨',
            badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
          },
          {
            id: 'm-2',
            type: 'photo',
            badge: '3분 전',
            title: '현장 사진 3장 + 짧은 영상 1개',
            description: '해질녘 주황빛 골목 가로등과 까치산 공원 산책로 입구 촬영',
            timeAgo: '3분 전',
            aiTag: '🌅 골든아워 조도 · 🌿 녹지 2분 거리 반영',
            badgeColor: 'text-[#f59f00] bg-[#fff9db]',
          },
        ]
      : [
          {
            id: 'm-1',
            type: 'voice',
            badge: 'Just now',
            title: 'Voice Memo 0:14 · Pingu (Jamie)',
            description:
              '“The hill from the station is steeper than expected, but the cool evening breeze and quiet lane make it feel like a cozy walk.”',
            timeAgo: 'Just now',
            aiTag: '⛰️ Slope 85% · 🤫 Noise 28dB Extracted',
            badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
          },
          {
            id: 'm-2',
            type: 'photo',
            badge: '3m ago',
            title: '3 Field Photos + 1 Short Clip',
            description: 'Captured warm orange alley streetlamps at dusk and Kkachisan Park trailhead',
            timeAgo: '3m ago',
            aiTag: '🌅 Golden Hour Glow · 🌿 2m to Park',
            badgeColor: 'text-[#f59f00] bg-[#fff9db]',
          },
        ];
  };

  const [moments, setMoments] = useState<CapturedMoment[]>(() =>
    startEmpty ? [] : getInitialMoments(neighborhood.perspective || 'jamie', lang)
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
  }, [perspective, lang, isEmptyMode]);

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
      // Fallback: focus the note input if browser doesn't support Web Speech API
      const fallbackText =
        lang === 'ko'
          ? '역에서 올라오는 언덕이 꽤 가파르지만, 골목 끝 공원이 가깝고 저녁 불빛이 따뜻해서 마음이 놓여요.'
          : 'The hill from the station is quite steep, but the park at the end of the lane is close and the warm evening lights feel cozy.';
      setMoments((prev) => [
        {
          id: `voice-${Date.now()}`,
          type: 'voice',
          badge: lang === 'ko' ? '음성 기록됨' : 'Voice Recorded',
          title:
            lang === 'ko'
              ? `실시간 음성 메모 · ${perspective === 'sam' ? '교동(Sam)' : '핑구(Jamie)'}`
              : `Live Voice Memo · ${perspective === 'sam' ? 'Gyodong (Sam)' : 'Pingu (Jamie)'}`,
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

      recognition.onstart = () => {
        setIsSpeechListening(true);
      };

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
                  ? `마이크 음성 메모 · ${perspective === 'sam' ? '교동(Sam)' : '핑구(Jamie)'}`
                  : `Mic Voice Memo · ${perspective === 'sam' ? 'Gyodong (Sam)' : 'Pingu (Jamie)'}`,
              description: `“${transcript}”`,
              timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
              aiTag: analyzeTextToAiTag(transcript, lang),
              badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
            },
            ...prev,
          ]);
        }
      };

      recognition.onend = () => {
        setIsSpeechListening(false);
      };

      recognition.onerror = () => {
        setIsSpeechListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsSpeechListening(false);
    }
  };

  const handleQuickAdd = (type: 'photo' | 'video' | 'emotion') => {
    if (type === 'photo' && fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }

    const presets: Record<'photo' | 'video' | 'emotion', Omit<CapturedMoment, 'id'>> =
      lang === 'ko'
        ? {
            photo: {
              type: 'photo',
              badge: '방금 추가됨',
              title: '연사 촬영 사진 2장 추가',
              description: '골목 코너 베이커리 조명 및 보행자 전용 데크 구간 포착',
              timeAgo: '방금 전',
              aiTag: '💡 골목 조도 +4% · 보행 안전도 상승',
              badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
            },
            video: {
              type: 'video',
              badge: '방금 추가됨',
              title: '주변 환경음 & 바람 소리 5초 클립',
              description: '차량 경적 없이 나뭇잎 스치는 소리와 잔잔한 생활 소음만 감지됨',
              timeAgo: '방금 전',
              aiTag: '🔊 실측 평균 27dB · 극저소음 구역 인증',
              badgeColor: 'text-[#0ca678] bg-[#e6fcf5]',
            },
            emotion: {
              type: 'emotion',
              badge: '방금 추가됨',
              title:
                perspective === 'sam'
                  ? '감정 핀 · “언덕 출퇴근이 조금 부담스러움”'
                  : '감정 핀 · “마음이 놓이는 따뜻한 골목”',
              description:
                perspective === 'sam'
                  ? '가파른 오르막과 좁은 골목 주차 때문에 매일 출퇴근할 때 체력 부담이 느껴짐'
                  : '퇴근길 혼자 걸어도 무섭지 않고 노을빛이 아늑하다는 감정 태그 기록',
              timeAgo: '방금 전',
              aiTag:
                perspective === 'sam'
                  ? '💭 체감 아늑함 62% · 출퇴근 피로도 반영'
                  : '🧡 체감 아늑함 지수 94% 보정',
              badgeColor: 'text-[#f59f00] bg-[#fff9db]',
            },
          }
        : {
            photo: {
              type: 'photo',
              badge: 'Just added',
              title: '2 Burst Photos Added',
              description: 'Captured warm corner bakery lights and pedestrian-only deck',
              timeAgo: 'Just now',
              aiTag: '💡 Alley Lighting +4% · High Walk Safety',
              badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
            },
            video: {
              type: 'video',
              badge: 'Just added',
              title: '5s Ambient Sound & Breeze Clip',
              description: 'Detected rustling leaves and calm residential hum with zero traffic horns',
              timeAgo: 'Just now',
              aiTag: '🔊 Avg 27dB · Certified Quiet Zone',
              badgeColor: 'text-[#0ca678] bg-[#e6fcf5]',
            },
            emotion: {
              type: 'emotion',
              badge: 'Just added',
              title:
                perspective === 'sam'
                  ? 'Emotion Pin · “Uphill Commute Feels Taxing”'
                  : 'Emotion Pin · “Warm & Safe Evening Alley”',
              description:
                perspective === 'sam'
                  ? 'Logged concern about daily uphill walking effort and tight alley parking'
                  : 'Tagged feeling safe and cozy walking home alone after sunset',
              timeAgo: 'Just now',
              aiTag:
                perspective === 'sam'
                  ? '💭 Perceived Coziness 62% · Commute Strain'
                  : '🧡 Perceived Coziness Calibrated to 94%',
              badgeColor: 'text-[#f59f00] bg-[#fff9db]',
            },
          };

    const selected = presets[type];
    setMoments((prev) => [{ id: `moment-${Date.now()}`, ...selected }, ...prev]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : undefined;
      setMoments((prev) => [
        {
          id: `photo-upload-${Date.now()}`,
          type: 'photo',
          badge: lang === 'ko' ? '실제 사진 업로드' : 'Uploaded Photo',
          title:
            lang === 'ko'
              ? `현장 사진 업로드 (${file.name})`
              : `Field Photo Uploaded (${file.name})`,
          description:
            lang === 'ko'
              ? '직접 촬영한 동네 사진을 기반으로 Gemini 4 Argon이 골목 경사도와 분위기를 분석합니다.'
              : 'Gemini 4 Argon Multimodal Vision analyzes alley slope and mood from your photo.',
          timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
          aiTag:
            lang === 'ko'
              ? '📸 Gemini Vision 검증 대기 · 3D 반영 준비'
              : '📸 Gemini Vision Ready for 3D',
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
            ? `현장 메모 · ${perspective === 'sam' ? '교동(Sam)' : '핑구(Jamie)'}`
            : `Field Note · ${perspective === 'sam' ? 'Gyodong (Sam)' : 'Pingu (Jamie)'}`,
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

  const handleApplyScenarioPreset = (presetType: 'pingu_cozy_hill' | 'gyodong_tough_hill' | 'flat_noisy_cafe') => {
    if (presetType === 'pingu_cozy_hill') {
      setPerspective('jamie');
      addCustomTextNote(
        lang === 'ko'
          ? '역에서 올라오는 언덕이 꽤 가파르긴 한데, 골목 끝 작은 공원이 바로 옆이고 해질녘 노을빛이 너무 따뜻하고 조용해서 마음이 놓인다.'
          : 'The hill from the station is quite steep, but the little park at the end of the alley is right next door and the warm sunset glow feels so quiet and cozy.'
      );
    } else if (presetType === 'gyodong_tough_hill') {
      setPerspective('sam');
      addCustomTextNote(
        lang === 'ko'
          ? '언덕 경사가 너무 가팔라서 정장 입고 매일 출퇴근하기엔 숨이 턱까지 차겠다. 골목 주차 공간도 좁아서 차 빼기 힘들겠어.'
          : 'The uphill slope is so steep that commuting in a suit every day will leave me out of breath. Alley parking is super tight too.'
      );
    } else {
      setPerspective('jamie');
      addCustomTextNote(
        lang === 'ko'
          ? '완전 평지라서 역에서 걸어오기 정말 편하고 예쁜 카페가 많지만, 대로변이라 차 소리와 오토바이 소음이 꽤 시끄럽다.'
          : 'Completely flat walk from the station with lots of cute cafes, but traffic and motorcycle noise from the main road is quite loud.'
      );
    }
  };

  const handleSynthesizeClick = async () => {
    setIsSynthesizing(true);
    try {
      // If user typed something in noteInput without pressing "남기기", include it automatically!
      const effectiveMoments = [...moments];
      if (noteInput.trim()) {
        const autoMoment: CapturedMoment = {
          id: `note-auto-${Date.now()}`,
          type: 'note',
          badge: lang === 'ko' ? '직접 입력한 메모' : 'Custom Field Note',
          title:
            lang === 'ko'
              ? `현장 메모 · ${perspective === 'sam' ? '교동(Sam)' : '핑구(Jamie)'}`
              : `Field Note · ${perspective === 'sam' ? 'Gyodong (Sam)' : 'Pingu (Jamie)'}`,
          description: `“${noteInput.trim()}”`,
          timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
          aiTag: analyzeTextToAiTag(noteInput.trim(), lang),
          badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
        };
        effectiveMoments.unshift(autoMoment);
        setNoteInput('');
      }

      if (onSynthesizeWithGemini) {
        const isSam = perspective === 'sam';
        const combinedText = effectiveMoments
          .map((m) => `${m.title} ${m.description}`)
          .join(' ')
          .toLowerCase();

        // Extract physical & sensory values from the user's actual recorded moments
        let inclinePercent = neighborhood.inclinePercent;
        if (/평지|평탄|완만|걷기 편|flat|level|easy walk/.test(combinedText)) {
          inclinePercent = 12;
        } else if (/언덕|가파|오르막|경사|계단|숨차|숨이 차|steep|hill|slope|uphill/.test(combinedText)) {
          inclinePercent = 88;
        }

        let noiseDb = isSam ? 36 : 28;
        if (/시끄|차 소리|차소리|대로변|소음|트럭|오토바이|복잡|loud|noisy|traffic/.test(combinedText)) {
          noiseDb = 68;
        } else if (/조용|한적|고요|평화|바람 소리|나뭇잎|quiet|calm|peaceful/.test(combinedText)) {
          noiseDb = 27;
        }

        let greenWalkMinutes = neighborhood.greenWalkMinutes;
        if (/공원|숲|나무|산책로|녹지|바로 옆|가깝|park|trees|greenery/.test(combinedText)) {
          greenWalkMinutes = 2;
        } else if (/삭막|나무가 없|빌딩만|concrete/.test(combinedText)) {
          greenWalkMinutes = 12;
        }

        let cozinessPercent = isSam ? 62 : 94;
        if (/힘들|부담|숨차|숨이 턱|좁|피곤|위험|무섭|답답|tiring|exhausting|tight/.test(combinedText)) {
          cozinessPercent = 60;
        } else if (/따뜻|아늑|노을|예쁘|힐링|좋다|마음이 놓|편하|cozy|warm|sunset|lovely/.test(combinedText)) {
          cozinessPercent = 95;
        }

        const primaryUserMoment = effectiveMoments[0];
        const customQuote = primaryUserMoment
          ? primaryUserMoment.description
          : isSam
            ? '“역에서 올라오는 85% 경사 언덕이 출퇴근길엔 꽤 부담스럽고 골목 주차도 빠듯하지만, 밤공기는 조용한 편이에요.”'
            : '“역에서 올라오는 언덕은 꽤 가팔랐지만, 골목 끝 노을빛과 작은 공원, 그리고 아늑한 저녁 불빛이 하루의 피로를 씻어주는 동네였어요.”';

        const uploadedPhotos = effectiveMoments
          .map((m) => m.imageDataUrl)
          .filter((url): url is string => Boolean(url));

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
        });
      }
    } finally {
      setIsSynthesizing(false);
      onFinishToDiorama();
    }
  };

  const waveBars = [4, 7, 11, 6, 13, 16, 9, 14, 18, 10, 7, 15, 19, 12, 8, 14, 9, 6, 10, 5];

  return (
    <div className="flex flex-col gap-4 pb-16">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Recording Context Header + Fresh Start Reset Button */}
      <div className="bg-white rounded-3xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#e8f3ff] flex items-center justify-center text-[#0051ff] shrink-0">
            <span className="material-symbols-outlined text-[22px]">location_on</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[15px] font-extrabold text-[#191f28] truncate">
                {neighborhood.name}
              </span>
              <span className="text-[10px] font-bold text-[#0051ff] bg-[#e8f3ff] px-2 py-0.5 rounded-full">
                {isEmptyMode
                  ? lang === 'ko'
                    ? '새 기록 모드'
                    : 'Fresh Mode'
                  : 'Quest #09'}
              </span>
            </div>
            <p className="text-[11px] text-[#8b95a1] mt-0.5 truncate">
              {neighborhood.stationDistance} ·{' '}
              {lang === 'ko' ? '자유롭게 말하고 찍으면 3D로 변환됩니다' : 'Capture freely into 3D'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={isEmptyMode ? handleLoadSample : handleResetEmpty}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
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
      </div>

      {/* Perspective Preset Switcher (Pingu·Jamie vs Gyodong·Sam) */}
      <section className="bg-white rounded-2xl p-3.5 border border-[#edf0f3] flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#0051ff]">
            {lang === 'ko'
              ? 'Step 1. 누구의 시선으로 기록할까요?'
              : 'Step 1. Choose Explorer Perspective'}
          </span>
          <span className="text-[11px] text-[#8b95a1]">
            {lang === 'ko'
              ? '핑구(감성·산책 중심) vs 교동(출퇴근·현실 중심)'
              : 'Pingu (Cozy/Walk vibe) vs Gyodong (Commute/Practical)'}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#f2f4f6] p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setPerspective('jamie')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              perspective === 'jamie'
                ? 'bg-white text-[#191f28] shadow-xs'
                : 'text-[#8b95a1] hover:text-[#191f28]'
            }`}
          >
            <CharacterAvatar character="pingu" size={20} />
            <span>{lang === 'ko' ? '핑구' : 'Pingu'}</span>
          </button>
          <button
            type="button"
            onClick={() => setPerspective('sam')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              perspective === 'sam'
                ? 'bg-white text-[#191f28] shadow-xs'
                : 'text-[#8b95a1] hover:text-[#191f28]'
            }`}
          >
            <CharacterAvatar character="gyodong" size={20} />
            <span>{lang === 'ko' ? '교동' : 'Gyodong'}</span>
          </button>
        </div>
      </section>

      {/* Step 2: Direct Text / Voice / Photo Input */}
      <section className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#edf0f3] flex flex-col gap-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#0051ff] uppercase tracking-wider">
            {lang === 'ko'
              ? 'Step 2. 동네에서 느낀 점을 자유롭게 남기세요'
              : 'Step 2. Capture What You Saw & Felt'}
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-bold">
            <span
              className={`w-1.5 h-1.5 rounded-full bg-red-500 ${
                isRecording ? 'animate-ping' : ''
              }`}
            />
            <span>REC {formatTimeSeconds(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Direct 1-Line / Multi-word Note Input Form */}
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
                ? '직접 입력 (예: 언덕이 가파르지만 공원이 가깝고 조용해요)'
                : 'Type here (e.g., Steep hill, but quiet alley near the park)'
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

        {/* Scenario Quick-Try Chips so user can test immediately or see examples */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-[#8b95a1]">
            {lang === 'ko'
              ? '💡 시나리오 예시 (터치하면 기록에 바로 추가됩니다):'
              : '💡 Quick Scenario Presets (Tap to add):'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyScenarioPreset('pingu_cozy_hill')}
              className="px-2.5 py-1.5 rounded-xl bg-[#f7f9fb] hover:bg-[#e8f3ff] border border-[#edf0f3] text-[11px] font-bold text-[#4e5968] hover:text-[#0051ff] transition-colors cursor-pointer text-left"
            >
              🐧 {lang === 'ko' ? '시나리오 A: 가파른 언덕 + 따뜻한 노을과 공원' : 'Scenario A: Steep Hill + Cozy Sunset Park'}
            </button>
            <button
              type="button"
              onClick={() => handleApplyScenarioPreset('gyodong_tough_hill')}
              className="px-2.5 py-1.5 rounded-xl bg-[#f7f9fb] hover:bg-[#fff0f2] border border-[#edf0f3] text-[11px] font-bold text-[#4e5968] hover:text-[#e03e52] transition-colors cursor-pointer text-left"
            >
              🐟 {lang === 'ko' ? '시나리오 B: 숨이 차는 급경사 + 좁은 골목 주차' : 'Scenario B: Exhausting Uphill + Tight Parking'}
            </button>
            <button
              type="button"
              onClick={() => handleApplyScenarioPreset('flat_noisy_cafe')}
              className="px-2.5 py-1.5 rounded-xl bg-[#f7f9fb] hover:bg-[#fff9db] border border-[#edf0f3] text-[11px] font-bold text-[#4e5968] hover:text-[#f59f00] transition-colors cursor-pointer text-left"
            >
              ☕ {lang === 'ko' ? '시나리오 C: 걷기 편한 평지 + 시끄러운 대로변 소음' : 'Scenario C: Easy Flat Walk + Loud Roadside Noise'}
            </button>
          </div>
        </div>

        {/* Multimodal Action Buttons: Mic Speech, Photo Upload, Sound Check, Mood Pin */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={handleStartVoiceRecognition}
            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer ${
              isSpeechListening
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'bg-[#f7f9fb] border-[#edf0f3] text-[#191f28] hover:border-[#0051ff]/40'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">
                {isSpeechListening ? 'graphic_eq' : 'mic'}
              </span>
            </div>
            <span className="text-[11px] font-bold">
              {isSpeechListening
                ? lang === 'ko'
                  ? '듣는 중...'
                  : 'Listening...'
                : lang === 'ko'
                  ? '음성 말하기'
                  : 'Speak'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd('photo')}
            className="bg-[#f7f9fb] p-2.5 rounded-2xl border border-[#edf0f3] flex flex-col items-center gap-1 active:scale-95 transition-transform hover:border-[#0051ff]/40 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0051ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </div>
            <span className="text-[11px] font-bold text-[#191f28]">
              {lang === 'ko' ? '사진 업로드' : 'Photo'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd('video')}
            className="bg-[#f7f9fb] p-2.5 rounded-2xl border border-[#edf0f3] flex flex-col items-center gap-1 active:scale-95 transition-transform hover:border-[#0051ff]/40 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">hearing</span>
            </div>
            <span className="text-[11px] font-bold text-[#191f28]">
              {lang === 'ko' ? '환경음 측정' : 'Sound Clip'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd('emotion')}
            className="bg-[#f7f9fb] p-2.5 rounded-2xl border border-[#edf0f3] flex flex-col items-center gap-1 active:scale-95 transition-transform hover:border-[#0051ff]/40 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">mood</span>
            </div>
            <span className="text-[11px] font-bold text-[#191f28]">
              {lang === 'ko' ? '감정 핀' : 'Mood Pin'}
            </span>
          </button>
        </div>

        {/* Mini Waveform */}
        <div className="w-full h-8 bg-[#f7f9fb] rounded-xl px-3 flex items-center justify-center gap-1 border border-[#edf0f3]">
          {waveBars.map((barHeight, idx) => {
            const dynamicH = isRecording
              ? Math.max(3, (barHeight + ((elapsedSeconds * 3 + idx * 5) % 9) - 4) * 1.1)
              : 4;
            const isHighlight = idx >= 6 && idx <= 14;
            return (
              <div
                key={idx}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isHighlight ? 'bg-[#0051ff]' : 'bg-[#0051ff]/35'
                }`}
                style={{ height: `${dynamicH}px` }}
              />
            );
          })}
        </div>
      </section>

      {/* Collected Memory Fragments Stream */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[14px] font-bold text-[#191f28]">
            {lang === 'ko'
              ? `내가 기록한 기억 조각 (${moments.length}개)`
              : `Recorded Memory Fragments (${moments.length})`}
          </h3>
          {moments.length > 0 && (
            <button
              type="button"
              onClick={handleResetEmpty}
              className="text-[11px] font-bold text-[#e03e52] hover:underline cursor-pointer"
            >
              {lang === 'ko' ? '전체 비우기' : 'Clear All'}
            </button>
          )}
        </div>

        {moments.length === 0 ? (
          <div className="bg-white rounded-3xl p-7 border border-dashed border-[#cbd5e1] text-center flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 mb-1">
              <CharacterAvatar character="pingu" size={38} />
              <CharacterAvatar character="gyodong" size={38} />
            </div>
            <p className="text-[14px] font-extrabold text-[#191f28]">
              {lang === 'ko'
                ? '아직 기록된 조각이 없어요! (빈 백지 상태)'
                : 'No memories recorded yet! (Blank Slate)'}
            </p>
            <p className="text-[12px] text-[#8b95a1] max-w-[270px] leading-relaxed">
              {lang === 'ko'
                ? '위 입력창에 동네 인상(언덕, 공원, 소음 등)을 직접 적거나 시나리오 A/B/C 버튼을 눌러보세요.'
                : 'Type your impressions above or tap Scenario A/B/C to test building a 3D world from scratch.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {moments.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#f2f4f6] text-[#191f28] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.type === 'voice'
                      ? 'graphic_eq'
                      : item.type === 'photo'
                        ? 'collections'
                        : item.type === 'video'
                          ? 'videocam'
                          : item.type === 'emotion'
                            ? 'favorite'
                            : 'notes'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold text-[#191f28]">{item.title}</span>
                    <span className="text-[10px] text-[#8b95a1]">{item.timeAgo}</span>
                  </div>
                  <p className="text-[13px] text-[#4e5968] leading-snug">{item.description}</p>
                  {item.imageDataUrl && (
                    <img
                      src={item.imageDataUrl}
                      alt={item.title}
                      className="mt-2 h-20 w-28 object-cover rounded-xl border border-[#edf0f3]"
                    />
                  )}
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#f7f9fb] text-[#0051ff] border border-[#e8f3ff]">
                    <span>{item.aiTag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Floating Transform to 3D Diorama Button */}
      <div className="fixed bottom-[4.5rem] inset-x-0 px-4 max-w-md mx-auto z-40 pointer-events-none">
        <button
          type="button"
          disabled={isSynthesizing}
          onClick={handleSynthesizeClick}
          className="w-full h-14 rounded-2xl bg-[#191f28] hover:bg-black text-white font-bold text-[15px] shadow-[0_10px_25px_rgba(25,31,40,0.22)] flex items-center justify-between px-5 active:scale-98 transition-all pointer-events-auto cursor-pointer disabled:opacity-75"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#0051ff] text-[22px]">
              view_in_ar
            </span>
            <span>
              {isSynthesizing
                ? lang === 'ko'
                  ? 'Gemini 4 Argon 3D 합성 중...'
                  : 'Synthesizing 3D with Gemini 4...'
                : lang === 'ko'
                  ? 'Step 3. 3D 디오라마로 만들기'
                  : 'Step 3. Build 3D Diorama'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[12px] font-semibold text-white/80">
            <span>
              {lang === 'ko'
                ? `${moments.length + (noteInput.trim() ? 1 : 0)}개 기억 반영`
                : `Apply ${moments.length + (noteInput.trim() ? 1 : 0)} notes`}
            </span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </button>
      </div>
    </div>
  );
};
