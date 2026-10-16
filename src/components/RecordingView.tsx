import React, { useState, useEffect, useRef } from 'react';
import { Lang, NeighborhoodData } from '../types/index.ts';
import { formatTimeSeconds } from '../utils/sensoryCalculations.ts';
import { CharacterAvatar } from './CharacterAvatar.tsx';

interface CapturedMoment {
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
  }) => Promise<void> | void;
  lang?: Lang;
}

export const RecordingView: React.FC<RecordingViewProps> = ({
  neighborhood,
  onFinishToDiorama,
  onSynthesizeWithGemini,
  lang = 'ko',
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(20);
  const [noteInput, setNoteInput] = useState<string>('');
  const [perspective, setPerspective] = useState<'jamie' | 'sam'>(
    neighborhood.perspective || 'jamie'
  );
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getInitialMoments = (p: 'jamie' | 'sam', currentLang: Lang): CapturedMoment[] => {
    if (p === 'sam') {
      return currentLang === 'ko'
        ? [
            {
              id: 'sam-1',
              type: 'voice',
              badge: '방금 전',
              title: '음성 메모 0:18 · Sam 기록',
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
              title: 'Voice Memo 0:18 · Sam’s Note',
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
            title: '음성 메모 0:14 · Jamie 기록',
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
            title: 'Voice Memo 0:14 · Jamie’s Note',
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
    getInitialMoments(neighborhood.perspective || 'jamie', lang)
  );

  useEffect(() => {
    setMoments(getInitialMoments(perspective, lang));
  }, [perspective, lang]);

  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleQuickAdd = (type: 'photo' | 'video' | 'emotion') => {
    if (type === 'photo' && fileInputRef.current) {
      fileInputRef.current.click();
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
              title: '감정 핀 · “마음이 놓이는 따뜻한 골목”',
              description: '퇴근길 혼자 걸어도 무섭지 않고 아늑하다는 감정 태그 기록',
              timeAgo: '방금 전',
              aiTag: '🧡 체감 아늑함 지수 94% 보정',
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
              title: 'Emotion Pin · “Warm & Safe Evening Alley”',
              description: 'Tagged feeling safe and cozy walking home alone after sunset',
              timeAgo: 'Just now',
              aiTag: '🧡 Perceived Coziness Calibrated to 94%',
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
              ? 'Gemini 4 Argon 멀티모달 비전이 골목 경사도와 저녁 조도를 분석했습니다.'
              : 'Gemini 4 Argon Multimodal Vision analyzed alley slope and lighting.',
          timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
          aiTag:
            lang === 'ko'
              ? '📸 Gemini Vision 검증 완료 · 3D 반영 준비'
              : '📸 Gemini Vision Verified · Ready for 3D',
          badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
          imageDataUrl: dataUrl,
        },
        ...prev,
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setMoments((prev) => [
      {
        id: `note-${Date.now()}`,
        type: 'note',
        badge: lang === 'ko' ? '방금 메모됨' : 'Just noted',
        title: lang === 'ko' ? '현장 한줄 텍스트 메모' : 'Quick Field Text Note',
        description: `“${noteInput.trim()}”`,
        timeAgo: lang === 'ko' ? '방금 전' : 'Just now',
        aiTag:
          lang === 'ko'
            ? '✨ Gemini 4가 3D 디오라마 오브젝트로 변환 대기 중'
            : '✨ Queued for Gemini 4 3D Diorama synthesis',
        badgeColor: 'text-[#0051ff] bg-[#e8f3ff]',
      },
      ...prev,
    ]);
    setNoteInput('');
  };

  const handleSynthesizeClick = async () => {
    setIsSynthesizing(true);
    try {
      if (onSynthesizeWithGemini) {
        const isSam = perspective === 'sam';
        await onSynthesizeWithGemini({
          perspective,
          moments,
          inclinePercent: neighborhood.inclinePercent, // Physical reality stays identical!
          cozinessPercent: isSam ? 64 : 94,
          noiseDb: isSam ? 36 : 28,
          greenWalkMinutes: neighborhood.greenWalkMinutes,
          quote: isSam
            ? '“역에서 올라오는 85% 경사 언덕이 출퇴근길엔 꽤 부담스럽고 골목 주차도 빠듯하지만, 밤공기는 조용한 편이에요.”'
            : '“역에서 올라오는 언덕은 꽤 가팔랐지만, 골목 끝 노을빛과 작은 공원, 그리고 아늑한 저녁 불빛이 하루의 피로를 씻어주는 동네였어요.”',
          quoteEn: isSam
            ? '“The 85% uphill climb from the station feels taxing for daily commutes and parking is tight, though the night air is quiet.”'
            : '“The hill from the station was quite steep, but the sunset glow at the end of the alley, the little park, and the warm evening lights washed away the day’s fatigue.”',
        });
      }
    } finally {
      setIsSynthesizing(false);
      onFinishToDiorama();
    }
  };

  const waveBars = [4, 7, 11, 6, 13, 16, 9, 14, 18, 10, 7, 15, 19, 12, 8, 14, 9, 6, 10, 5];

  return (
    <div className="flex flex-col gap-5 pb-16">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Recording Context Header */}
      <div className="bg-white rounded-3xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#e8f3ff] flex items-center justify-center text-[#0051ff]">
            <span className="material-symbols-outlined text-[22px]">location_on</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-extrabold text-[#191f28]">
                {neighborhood.name}
              </span>
              <span className="text-[11px] font-bold text-[#0051ff] bg-[#e8f3ff] px-2 py-0.5 rounded-full">
                Quest #09
              </span>
            </div>
            <p className="text-[12px] text-[#8b95a1] mt-0.5">
              {neighborhood.stationDistance} ·{' '}
              {lang === 'ko' ? '실시간 감각 수집 중' : 'Live Sensory Capture'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onFinishToDiorama}
          className="px-3 py-1.5 rounded-full bg-[#f2f4f6] hover:bg-[#e5e8eb] text-[12px] font-bold text-[#4e5968] transition-colors"
        >
          {lang === 'ko' ? '3D 보기' : 'View 3D'}
        </button>
      </div>

      {/* Hero Live Voice & Sensory Recorder Card */}
      <section className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#edf0f3] flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#0051ff]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Live Recording Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[12px] font-bold mb-3">
          <span
            className={`w-2 h-2 rounded-full bg-red-500 ${
              isRecording ? 'animate-ping' : ''
            }`}
          />
          <span>
            {isRecording
              ? `REC ${formatTimeSeconds(elapsedSeconds)}`
              : lang === 'ko'
                ? `일시정지 ${formatTimeSeconds(elapsedSeconds)}`
                : `PAUSED ${formatTimeSeconds(elapsedSeconds)}`}
          </span>
        </div>

        <h2 className="text-[19px] font-extrabold text-[#191f28] leading-snug mb-1">
          {lang === 'ko' ? '걸으면서 편하게 말해보세요' : 'Speak freely as you walk'}
        </h2>
        <p className="text-[13px] text-[#8b95a1] max-w-[260px] leading-relaxed mb-5">
          {lang === 'ko'
            ? '언덕 경사, 골목 분위기, 소음까지 AI가 알아서 감각을 요약하고 3D 디오라마로 옮겨둬요'
            : 'Gemini 4 Argon automatically extracts slope, alley mood, and noise into your 3D diorama'}
        </p>

        {/* Live Audio Waveform Visualizer */}
        <div className="w-full h-14 bg-[#f7f9fb] rounded-2xl px-4 flex items-center justify-center gap-1.5 mb-5 border border-[#edf0f3]">
          {waveBars.map((barHeight, idx) => {
            const dynamicH = isRecording
              ? Math.max(4, (barHeight + ((elapsedSeconds * 3 + idx * 5) % 9) - 4) * 2)
              : 6;
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

        {/* Mic Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsRecording((prev) => !prev)}
            className="w-12 h-12 rounded-full bg-[#f2f4f6] text-[#4e5968] flex items-center justify-center active:scale-95 transition-transform hover:bg-[#e5e8eb]"
            aria-label={
              isRecording
                ? lang === 'ko'
                  ? '일시정지'
                  : 'Pause'
                : lang === 'ko'
                  ? '녹음 재개'
                  : 'Resume'
            }
          >
            <span className="material-symbols-outlined text-[22px]">
              {isRecording ? 'pause' : 'mic'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSynthesizeClick}
            disabled={isSynthesizing}
            className="w-16 h-16 rounded-full bg-[#0051ff] text-white shadow-[0_8px_20px_rgba(0,81,255,0.32)] flex items-center justify-center active:scale-95 transition-transform hover:bg-[#0041cc]"
            aria-label={lang === 'ko' ? '녹음 완료 및 디오라마 변환' : 'Finish and build 3D diorama'}
          >
            <span
              className="material-symbols-outlined text-[30px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stop
            </span>
          </button>
        </div>

        <div className="flex items-center gap-6 mt-2 text-[11px] font-semibold text-[#8b95a1]">
          <span>
            {isRecording
              ? lang === 'ko'
                ? '잠시 멈춤'
                : 'Pause'
              : lang === 'ko'
                ? '이어서 녹음'
                : 'Resume'}
          </span>
          <span className="text-[#0051ff] font-bold">
            {lang === 'ko' ? '기록 완료' : 'Finish'}
          </span>
        </div>
      </section>

      {/* Quick Multi-modal Capture Tools */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[14px] font-bold text-[#191f28]">
            {lang === 'ko' ? '빠른 감각 남기기' : 'Quick Multimodal Capture'}
          </h3>
          <span className="text-[11px] text-[#8b95a1]">
            {lang === 'ko' ? '터치 한 번으로 위치·시간 자동 태깅' : '1-tap auto geotag & timestamp'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickAdd('photo')}
            className="bg-white p-3.5 rounded-2xl border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center gap-1.5 active:scale-95 transition-transform hover:border-[#0051ff]/40"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0051ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">photo_camera</span>
            </div>
            <span className="text-[13px] font-bold text-[#191f28]">
              {lang === 'ko' ? '사진' : 'Photo'}
            </span>
            <span className="text-[10px] text-[#8b95a1]">
              {lang === 'ko' ? '연사 촬영' : 'Burst / Upload'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd('video')}
            className="bg-white p-3.5 rounded-2xl border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center gap-1.5 active:scale-95 transition-transform hover:border-[#0051ff]/40"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">videocam</span>
            </div>
            <span className="text-[13px] font-bold text-[#191f28]">
              {lang === 'ko' ? '영상' : 'Video'}
            </span>
            <span className="text-[10px] text-[#8b95a1]">
              {lang === 'ko' ? '소음 분석' : 'Noise Check'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd('emotion')}
            className="bg-white p-3.5 rounded-2xl border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center gap-1.5 active:scale-95 transition-transform hover:border-[#0051ff]/40"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">mood</span>
            </div>
            <span className="text-[13px] font-bold text-[#191f28]">
              {lang === 'ko' ? '감정 핀' : 'Mood Pin'}
            </span>
            <span className="text-[10px] text-[#8b95a1]">
              {lang === 'ko' ? '체감 안전' : 'Safety & Vibe'}
            </span>
          </button>
        </div>

        {/* Quick 1-line Input */}
        <form
          onSubmit={handleAddNote}
          className="bg-white rounded-2xl p-2 pl-3.5 border border-[#edf0f3] flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
        >
          <span className="material-symbols-outlined text-[#8b95a1] text-[18px]">edit_note</span>
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder={
              lang === 'ko'
                ? '지금 발로 밟고 느낀 기분은? (예: 언덕 끝 노을이 예쁨)'
                : 'How does this spot feel right now? (e.g., Cozy sunset alley)'
            }
            className="flex-1 text-[13px] text-[#191f28] placeholder-[#8b95a1] focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[#191f28] text-white text-[12px] font-bold hover:bg-black transition-colors"
          >
            {lang === 'ko' ? '남기기' : 'Add'}
          </button>
        </form>
      </section>

      {/* Perspective Preset Switcher (Jamie vs Sam - Same Physical Place, Different Subjective Emotion) */}
      <section className="bg-white rounded-2xl p-3 border border-[#edf0f3] flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#0051ff]">
            {lang === 'ko'
              ? '3-Layer 기억 분리 데모 (핑구·Jamie & 교동·Sam)'
              : '3-Layer Memory Demo (Pingu·Jamie & Gyodong·Sam)'}
          </span>
          <span className="text-[11px] text-[#8b95a1]">
            {lang === 'ko'
              ? '같은 경사(85%)도 기록자의 감정에 따라 다른 3D 기억이 됩니다'
              : 'Same 85% physical slope, different subjective 3D memory'}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#f2f4f6] p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setPerspective('jamie')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              perspective === 'jamie'
                ? 'bg-white text-[#191f28] shadow-xs'
                : 'text-[#8b95a1] hover:text-[#191f28]'
            }`}
          >
            <CharacterAvatar character="pingu" size={18} />
            <span>{lang === 'ko' ? '핑구' : 'Pingu'}</span>
          </button>
          <button
            type="button"
            onClick={() => setPerspective('sam')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              perspective === 'sam'
                ? 'bg-white text-[#191f28] shadow-xs'
                : 'text-[#8b95a1] hover:text-[#191f28]'
            }`}
          >
            <CharacterAvatar character="gyodong" size={18} />
            <span>{lang === 'ko' ? '교동' : 'Gyodong'}</span>
          </button>
        </div>
      </section>

      {/* Collected Memory Fragments Stream */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[14px] font-bold text-[#191f28]">
            {lang === 'ko' ? '모인 기억 조각들' : 'Collected Memory Fragments'}
          </h3>
          <span className="text-[12px] font-bold text-[#0051ff]">
            {lang === 'ko' ? 'Gemini 4 분석 완료' : 'Gemini 4 Analyzed'}
          </span>
        </div>

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
                  ? '3D 디오라마로 만들기'
                  : 'Transform into 3D Diorama'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[12px] font-semibold text-white/80">
            <span>
              {lang === 'ko'
                ? `${moments.length}개 기억 합치기`
                : `Merge ${moments.length} memories`}
            </span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </button>
      </div>
    </div>
  );
};
