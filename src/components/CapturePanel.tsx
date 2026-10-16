import React, { useRef, useState } from 'react';
import type { PhotoInput, FieldObservationInput, NeighborhoodSpot } from '../types';
import { useI18n } from '../i18n';
import {
  Camera,
  Video,
  Mic,
  MicOff,
  Sparkles,
  Upload,
  Trash2,
  Mountain,
  Trees,
  Train,
  Volume2,
  Loader2,
  RotateCcw,
  Tag,
  Heart,
  Users,
} from 'lucide-react';

interface CapturePanelProps {
  selectedSpot: NeighborhoodSpot;
  photos: PhotoInput[];
  voiceNoteText: string;
  voiceLanguage: 'ko-KR' | 'en-US';
  quickRatings: FieldObservationInput['quickRatings'];
  isGenerating: boolean;
  onChangePhotos: (photos: PhotoInput[]) => void;
  onLoadPresetPhotos: () => void;
  onChangeVoiceNote: (text: string) => void;
  onChangeVoiceLanguage: (lang: 'ko-KR' | 'en-US') => void;
  onChangeRatings: (ratings: FieldObservationInput['quickRatings']) => void;
  onGenerateWorld: () => void;
}

interface QuickWalkTag {
  id: string;
  category: 'physical' | 'sensory' | 'emotional';
  labelKo: string;
  labelEn: string;
  snippetKo: string;
  snippetEn: string;
  patch: Partial<FieldObservationInput['quickRatings']>;
}

const QUICK_WALK_TAGS: QuickWalkTag[] = [
  {
    id: 'steep',
    category: 'physical',
    labelKo: '⛰️ 급경사 언덕 (물리)',
    labelEn: '⛰️ Steep Hill (Physical)',
    snippetKo: '지하철역에서 집까지 가는 언덕이 생각보다 가팔라서 계단과 오르막이 꽤 있었다.',
    snippetEn: 'Walking up from the subway station was a much steeper hill with stairs than expected.',
    patch: { hillSteepness: 84 },
  },
  {
    id: 'green-park',
    category: 'physical',
    labelKo: '🌳 언덕 위 예쁜 공원 (물리)',
    labelEn: '🌳 Hilltop Park (Physical)',
    snippetKo: '언덕 끝 아파트 바로 앞에 나무가 울창하고 예쁜 산책 공원이 펼쳐져 있었다.',
    snippetEn: 'Right at the top of the hill in front of the apartment was a beautiful lush park.',
    patch: { parkGreenery: 94 },
  },
  {
    id: 'flat-subway',
    category: 'physical',
    labelKo: '🚇 평지 초역세권 (물리)',
    labelEn: '🚇 Easy Subway Walk (Physical)',
    snippetKo: '역 출구에서 단지 입구까지 평지로 4분이면 도착해서 출퇴근이 정말 편해 보였다.',
    snippetEn: 'Easy 4-minute flat walk from the subway exit straight to the apartment gate.',
    patch: { hillSteepness: 12, subwayWalkMinutes: 4 },
  },
  {
    id: 'noisy-road',
    category: 'sensory',
    labelKo: '🔊 주변 도로 차소음 (감각)',
    labelEn: '🔊 Heavy Traffic Noise (Sensory)',
    snippetKo: '주변 큰 도로에 차가 많이 다녀서 퇴근 시간 소음이 꽤 크게 들렸다.',
    snippetEn: 'Heavy traffic along the main road created noticeable street noise.',
    patch: { trafficNoise: 76 },
  },
  {
    id: 'cozy-emotion',
    category: 'emotional',
    labelKo: '💛 아늑하고 평화로움 (감정)',
    labelEn: '💛 Felt Peaceful & Cozy (Emotion)',
    snippetKo: '골목길이 아늑하고 저녁 노을 분위기가 너무 따뜻해서 여기서 살고 싶다는 설렘이 들었다.',
    snippetEn: 'The alleys felt so peaceful and cozy at sunset that I immediately pictured living here.',
    patch: { trafficNoise: 24, parkGreenery: 88 },
  },
  {
    id: 'overwhelmed-emotion',
    category: 'emotional',
    labelKo: '💭 숨차고 지치는 느낌 (감정)',
    labelEn: '💭 Felt Overwhelmed (Emotion)',
    snippetKo: '오르막을 오르니 숨이 차고 주변이 너무 복잡해서 조금 지치고 부담스럽게 느껴졌다.',
    snippetEn: 'Climbing the steep hill in the noisy evening crowd made me feel tired and overwhelmed.',
    patch: { hillSteepness: 82, trafficNoise: 74 },
  },
];

export const CapturePanel: React.FC<CapturePanelProps> = ({
  selectedSpot,
  photos,
  voiceNoteText,
  voiceLanguage,
  quickRatings,
  isGenerating,
  onChangePhotos,
  onLoadPresetPhotos,
  onChangeVoiceNote,
  onChangeVoiceLanguage,
  onChangeRatings,
  onGenerateWorld,
}) => {
  const { lang, t } = useI18n();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);
  const [activePerspective, setActivePerspective] = useState<'jamie' | 'sam'>('jamie');
  const [attachedVideoName, setAttachedVideoName] = useState<string | null>(
    'walk_uphill_to_park_08s.mp4'
  );

  // Same neighborhood, two personal perspectives (Jamie vs. Sam)
  const applyPerspectivePreset = (persona: 'jamie' | 'sam') => {
    setActivePerspective(persona);
    if (persona === 'jamie') {
      const textKo = `${selectedSpot.nameKo} 주말 임장 기록: 역에서 올라오는 오르막이 조금 있었지만, 언덕 위 아파트 바로 앞에 정말 예쁜 공원과 산책로가 있어서 숨이 탁 트였다. 저녁 노을빛 골목길이 너무 따뜻하고 평화로워서 '이 동네에 살고 싶다'는 기분이 들었다.`;
      const textEn = `Weekend visit to ${selectedSpot.name}: I remember walking up a hill from the subway, but the park at the top was so peaceful and beautiful. The golden sunset over the quiet alleys felt cozy and welcoming.`;
      onChangeVoiceNote(lang === 'ko' ? textKo : textEn);
      onChangeRatings({
        hillSteepness: 48,
        parkGreenery: 94,
        subwayWalkMinutes: 6,
        trafficNoise: 26,
        cafeMartConvenience: 88,
      });
      setAttachedVideoName('sunset_park_alley_walk_08s.mp4');
    } else {
      const textKo = `${selectedSpot.nameKo} 퇴근길 방문 기록: 지하철역에서 단지까지 올라가는 언덕 계단이 생각보다 너무 가파르고 숨이 찼다. 큰길가 차 소음도 시끄럽고 사람이 많아 피곤한 퇴근길에 매일 걸어 올라오긴 힘들겠다는 부담감이 들었다.`;
      const textEn = `Evening visit to ${selectedSpot.name}: The uphill climb from the station felt exhausting and steep, and the heavy roadside traffic felt loud and overwhelming after work.`;
      onChangeVoiceNote(lang === 'ko' ? textKo : textEn);
      onChangeRatings({
        hillSteepness: 86,
        parkGreenery: 52,
        subwayWalkMinutes: 11,
        trafficNoise: 78,
        cafeMartConvenience: 72,
      });
      setAttachedVideoName('evening_steep_hill_traffic_06s.mp4');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.slice(0, 4).forEach((file, idx) => {
      if (file.type.startsWith('video/')) {
        setAttachedVideoName(file.name);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        if (dataUrl) {
          const newPhoto: PhotoInput = {
            id: `upload-${Date.now()}-${idx}`,
            dataUrl,
            mimeType: file.type || 'image/jpeg',
            caption: file.name.replace(/\.[^.]+$/, '') || t('현장 촬영 사진', 'Field Photo'),
            tag: idx === 0 ? 'street' : idx === 1 ? 'apartment' : 'park',
          };
          onChangePhotos([newPhoto, ...photos].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleApplyWalkTag = (tag: QuickWalkTag) => {
    onChangeRatings({
      ...quickRatings,
      ...tag.patch,
    });
    const snippet = lang === 'ko' ? tag.snippetKo : tag.snippetEn;
    if (!voiceNoteText.includes(snippet)) {
      onChangeVoiceNote(voiceNoteText ? `${voiceNoteText.trim()} ${snippet}` : snippet);
    }
  };

  const handleToggleVoiceRecording = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setSpeechStatus(null);
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      const sample =
        voiceLanguage === 'ko-KR' ? selectedSpot.sampleVoiceNoteKo : selectedSpot.sampleVoiceNoteEn;
      onChangeVoiceNote(sample);
      setSpeechStatus(
        t(
          '샘플 현장 음성 메모를 불러왔습니다.',
          'Loaded field voice transcript (Web Speech API fallback).'
        )
      );
      setTimeout(() => setSpeechStatus(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = voiceLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechStatus(
          voiceLanguage === 'ko-KR'
            ? '걸으면서 본 풍경, 들리는 소리, 느낀 감정을 자유롭게 말씀해 주세요...'
            : 'Speak freely about what you see, hear, and how this place feels...'
        );
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onChangeVoiceNote(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setSpeechStatus(
          t(
            '음성 입력이 종료되었습니다 — 아래 원터치 태그를 눌러보세요.',
            'Speech input ended — tap a 1-thumb tag below.'
          )
        );
        setTimeout(() => setSpeechStatus(null), 3500);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setTimeout(() => setSpeechStatus(null), 1500);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3">
      {/* Header: Effortless Multimodal Capture */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Camera className="w-4.5 h-4.5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display font-extrabold text-sm text-slate-900 truncate">
              {t('자유로운 현장 기억 캡처 (Capture Freely)', 'Capture Freely · Multimodal Input')}
            </h2>
            <p className="text-[11px] text-slate-500 truncate">
              {t(
                '사진·영상·음성·메모 어떤 형태든 그곳의 경험과 감정을 남기세요',
                'Photos, video, voice, or text — we bring how you felt there to life'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLoadPresetPhotos}
          className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('초기화', 'Reset')}</span>
        </button>
      </div>

      {/* Persona Perspective Switcher: Same Place, Different 3D Memory! */}
      <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-emerald-50/80 border border-amber-200/80 rounded-2xl p-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] font-display font-extrabold text-slate-800 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-orange-600" />
            {t(
              '같은 동네, 다른 기억 (페르소나 시선 전환 데모)',
              'Same Place, Different Memory (Persona Perspective)'
            )}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
            Why 3D? #3
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => applyPerspectivePreset('jamie')}
            className={`p-2 rounded-xl text-left border transition cursor-pointer ${
              activePerspective === 'jamie'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-display font-extrabold flex items-center gap-1">
              <span>👩 Jamie (29)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/25 text-amber-300">
                {t('힐링·공원', 'Cozy Park')}
              </span>
            </div>
            <p className="text-[10px] opacity-85 mt-0.5 truncate">
              {t('"언덕 위 공원과 노을이 따뜻했어"', '"Hilltop park & sunset felt cozy"')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPerspectivePreset('sam')}
            className={`p-2 rounded-xl text-left border transition cursor-pointer ${
              activePerspective === 'sam'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-display font-extrabold flex items-center gap-1">
              <span>🧑 Sam (31)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-400/25 text-rose-300">
                {t('경사·소음 피로', 'Tiring Climb')}
              </span>
            </div>
            <p className="text-[10px] opacity-85 mt-0.5 truncate">
              {t('"오르막이 숨차고 차소리가 시끄러웠어"', '"Steep climb & traffic felt tiring"')}
            </p>
          </button>
        </div>
      </div>

      {/* 3 Multimodal Capture Buttons: Camera Photo + Short Video + Voice Mic */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="py-2 px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-display font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('📸 사진 촬영', '📸 Photo')}</span>
        </button>

        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="py-2 px-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-display font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer"
        >
          <Video className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('🎥 짧은 영상', '🎥 Video')}</span>
        </button>

        <button
          type="button"
          onClick={handleToggleVoiceRecording}
          className={`py-2 px-2 rounded-2xl font-display font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition active:scale-[0.98] cursor-pointer ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isRecording ? <MicOff className="w-3.5 h-3.5 shrink-0" /> : <Mic className="w-3.5 h-3.5 shrink-0" />}
          <span className="truncate">
            {isRecording ? t('⏹️ 녹음 중지', '⏹️ Stop') : t('🎙️ 음성 메모', '🎙️ Voice')}
          </span>
        </button>

        {/* Hidden input for Mobile Rear Camera (capture="environment") */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
        {/* Hidden input for Mobile Video Clip */}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
        {/* Hidden input for Photo Gallery */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Photo Thumbnails + Attached Video Badge */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span>
            {t(
              `멀티모달 시각 기록 (사진 ${photos.length}장 + 영상 1개)`,
              `Visual Records (${photos.length} Photos + 1 Video Clip)`
            )}
          </span>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>{t('앨범 추가', 'Gallery')}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-3/2"
            >
              <img
                src={photo.dataUrl}
                alt={photo.caption}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChangePhotos(photos.filter((p) => p.id !== photo.id))}
                title={t('사진 삭제', 'Remove photo')}
                className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white opacity-85 sm:opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-[10px] font-semibold px-1.5 py-0.5 truncate">
                {photo.caption}
              </div>
            </div>
          ))}
        </div>

        {attachedVideoName && (
          <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 rounded-xl px-2.5 py-1 text-[11px] font-semibold">
            <span className="truncate">
              🎥 {attachedVideoName}{' '}
              <span className="text-[10px] text-indigo-700 font-bold">
                ({t('경사·현장음 멀티모달 스트림', 'Walk & Ambient Audio Stream')})
              </span>
            </span>
            <button
              type="button"
              onClick={() => setAttachedVideoName(null)}
              className="text-[10px] text-indigo-600 hover:underline ml-2 shrink-0 cursor-pointer"
            >
              {t('제거', 'Remove')}
            </button>
          </div>
        )}
      </div>

      {/* One-Thumb Field & Emotion Tag Chips */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-700" />
            {t(
              '물리·감각·감정 원터치 태그 (걸으며 톡 누르세요)',
              'Physical · Sensory · Emotional Tags'
            )}
          </span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => {
                onChangeVoiceLanguage('ko-KR');
                onChangeVoiceNote(selectedSpot.sampleVoiceNoteKo);
              }}
              className={`px-1.5 py-0.5 rounded-md transition cursor-pointer ${
                voiceLanguage === 'ko-KR' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              KO
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeVoiceLanguage('en-US');
                onChangeVoiceNote(selectedSpot.sampleVoiceNoteEn);
              }}
              className={`px-1.5 py-0.5 rounded-md transition cursor-pointer ${
                voiceLanguage === 'en-US' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {QUICK_WALK_TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleApplyWalkTag(tag)}
              className={`px-2 py-1 rounded-full text-[10px] font-bold active:scale-95 border transition cursor-pointer ${
                tag.category === 'emotional'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                  : tag.category === 'sensory'
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border-slate-200/80'
              }`}
            >
              {lang === 'ko' ? tag.labelKo : tag.labelEn}
            </button>
          ))}
        </div>

        {speechStatus && (
          <div className="text-[11px] font-semibold text-orange-800 bg-orange-50 border border-orange-200 rounded-xl px-2.5 py-1.5">
            🎙️ {speechStatus}
          </div>
        )}

        <textarea
          rows={2}
          value={voiceNoteText}
          onChange={(e) => onChangeVoiceNote(e.target.value)}
          placeholder={t(
            '그 동네에서 본 풍경(물리), 들리는 소리(감각), 그리고 걸으며 느낀 감정(설렘·피로감 등)을 형식 없이 자유롭게 적어보세요...',
            'Freely describe what you saw (physical), heard (sensory), and how you felt there (emotional)...'
          )}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900 leading-relaxed"
        />
      </div>

      {/* Quick Physical & Sensory Sliders */}
      <div className="grid grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-700">
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Mountain className="w-3 h-3 text-orange-600" /> {t('언덕 경사도', 'Hill Slope')}
            </span>
            <span className="text-orange-700">{quickRatings.hillSteepness}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={quickRatings.hillSteepness}
            onChange={(e) =>
              onChangeRatings({ ...quickRatings, hillSteepness: Number(e.target.value) })
            }
            className="accent-orange-600 cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-700">
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Trees className="w-3 h-3 text-emerald-700" /> {t('공원·녹지감', 'Greenery')}
            </span>
            <span className="text-emerald-700">{quickRatings.parkGreenery}%</span>
          </span>
          <input
            type="range"
            min={10}
            max={100}
            value={quickRatings.parkGreenery}
            onChange={(e) =>
              onChangeRatings({ ...quickRatings, parkGreenery: Number(e.target.value) })
            }
            className="accent-emerald-600 cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-700">
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Train className="w-3 h-3 text-sky-700" /> {t('지하철 체감거리', 'Subway Walk')}
            </span>
            <span className="text-sky-700">
              {quickRatings.subwayWalkMinutes} {t('분', 'min')}
            </span>
          </span>
          <input
            type="range"
            min={1}
            max={20}
            value={quickRatings.subwayWalkMinutes}
            onChange={(e) =>
              onChangeRatings({ ...quickRatings, subwayWalkMinutes: Number(e.target.value) })
            }
            className="accent-sky-600 cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-700">
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-rose-600" /> {t('소음·번잡도', 'Street Noise')}
            </span>
            <span className="text-rose-600">{quickRatings.trafficNoise} dB</span>
          </span>
          <input
            type="range"
            min={10}
            max={95}
            value={quickRatings.trafficNoise}
            onChange={(e) =>
              onChangeRatings({ ...quickRatings, trafficNoise: Number(e.target.value) })
            }
            className="accent-rose-600 cursor-pointer"
          />
        </label>
      </div>

      {/* Primary Action Button: Transform into 3D Memory */}
      <button
        type="button"
        disabled={isGenerating}
        onClick={onGenerateWorld}
        className="w-full py-3 px-4 rounded-2xl font-display font-extrabold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            <span>
              {t(
                'Gemini 4 Argon이 물리·감각·감정을 3D 기억으로 변환 중...',
                'Gemini 4 Argon Transforming Multimodal Memory into 3D...'
              )}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>
              {t(
                '✨ 그곳의 감정까지 살아있는 3D 기억으로 변환 (Transform)',
                '✨ Transform Experience into 3D Memory & Earn Stamp'
              )}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
