import React, { useRef, useState } from 'react';
import type { PhotoInput, FieldObservationInput, NeighborhoodSpot } from '../types';
import { useI18n } from '../i18n';
import {
  Camera,
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
  labelKo: string;
  labelEn: string;
  snippetKo: string;
  snippetEn: string;
  patch: Partial<FieldObservationInput['quickRatings']>;
}

const QUICK_WALK_TAGS: QuickWalkTag[] = [
  {
    id: 'steep',
    labelKo: '⛰️ 급경사 언덕',
    labelEn: '⛰️ Steep Hill',
    snippetKo: '역에서 단지 올라가는 언덕 경사가 꽤 가팔라서 계단과 엘리베이터가 필수예요.',
    snippetEn: 'The hill climb from the station to the complex is quite steep with outdoor stairs.',
    patch: { hillSteepness: 82 },
  },
  {
    id: 'flat-subway',
    labelKo: '🚇 평지 초역세권',
    labelEn: '🚇 Flat Subway Walk',
    snippetKo: '지하철역에서 아파트 정문까지 평지로 도보 4분 거리라 출퇴근이 정말 편해요.',
    snippetEn: 'Flat 4-minute walk right from the subway exit to the main apartment gate.',
    patch: { hillSteepness: 12, subwayWalkMinutes: 4 },
  },
  {
    id: 'green-park',
    labelKo: '🌳 숲세권·산책로',
    labelEn: '🌳 Lush Park Trail',
    snippetKo: '단지 조경과 바로 연결된 산책로에 나무가 울창해서 공기가 상쾌해요.',
    snippetEn: 'Lush greenery and shaded walking trails connect directly to the apartment courtyard.',
    patch: { parkGreenery: 92 },
  },
  {
    id: 'quiet-zone',
    labelKo: '🤫 조용한 단지 내부',
    labelEn: '🤫 Quiet Courtyard',
    snippetKo: '대로변과 떨어져 있어 낮에도 새소리만 들릴 정도로 조용하고 아늑합니다.',
    snippetEn: 'Set back from the main road, the interior courtyard is super quiet and peaceful.',
    patch: { trafficNoise: 24 },
  },
  {
    id: 'noisy-road',
    labelKo: '🔊 대로변 차소음',
    labelEn: '🔊 Busy Road Noise',
    snippetKo: '앞동은 왕복 대로변과 가까워서 출퇴근 시간 차량 소음이 꽤 들립니다.',
    snippetEn: 'Front-row buildings face a busy avenue with noticeable traffic noise.',
    patch: { trafficNoise: 74 },
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
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.slice(0, 4).forEach((file, idx) => {
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
            ? '걸으면서 동네 인상을 편하게 말씀해 주세요...'
            : 'Walk & speak freely about hills, parks, subway, or noise...'
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
    <div className="bg-white border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3.5">
      {/* Mobile Field Recorder Header + Big Camera/Mic Action Strip */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Camera className="w-4.5 h-4.5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display font-extrabold text-sm text-slate-900 truncate">
              {t('모바일 현장 임장 기록기', 'On-the-Go Field Recorder')}
            </h2>
            <p className="text-[11px] text-slate-500 truncate">
              {lang === 'ko' ? `${selectedSpot.nameKo} · 걸으면서 사진·음성 캡처` : `${selectedSpot.name} · Walk & Capture`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLoadPresetPhotos}
          className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('샘플복원', 'Preset')}</span>
        </button>
      </div>

      {/* Big Thumb-Friendly Mobile Action Buttons: Direct Camera + Live Voice Mic */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-display font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>{t('📸 현장 카메라 촬영', '📸 Snap Camera')}</span>
        </button>

        <button
          type="button"
          onClick={handleToggleVoiceRecording}
          className={`py-2.5 px-3 rounded-2xl font-display font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-[0.98] cursor-pointer ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isRecording ? t('⏹️ 녹음 중지', '⏹️ Stop Mic') : t('🎙️ 걸으며 음성메모', '🎙️ Voice Note')}</span>
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
        {/* Hidden input for Photo Gallery */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Photo Thumbnails Strip */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span>{t(`촬영된 현장 사진 (${photos.length}/3)`, `Captured Photos (${photos.length}/3)`)}</span>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>{t('앨범에서 추가', 'Add from Gallery')}</span>
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
      </div>

      {/* One-Thumb Field Tag Chips (For walking around without typing!) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-700" />
            {t('원터치 현장 체감 태그 (터치 시 자동 반영)', '1-Thumb Walk Tags (Auto-fills note & sliders)')}
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

        <div className="flex flex-wrap gap-1.5">
          {QUICK_WALK_TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleApplyWalkTag(tag)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 active:scale-95 text-slate-700 border border-slate-200/80 transition cursor-pointer"
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
            '걸으면서 느낀 언덕 경사, 공원 녹지, 지하철 거리, 소음을 기록하세요...',
            'Record hills, parks, subway walk, or traffic noise while walking...'
          )}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900 leading-relaxed"
        />
      </div>

      {/* Quick Environmental Sensor Sliders */}
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
              <Trees className="w-3 h-3 text-emerald-700" /> {t('공원 녹지', 'Greenery')}
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
              <Train className="w-3 h-3 text-sky-700" /> {t('지하철 도보', 'Subway Walk')}
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
              <Volume2 className="w-3 h-3 text-rose-600" /> {t('도로 소음', 'Street Noise')}
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

      {/* Primary Action Button */}
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
                'Gemini 4 Argon이 3D 동네 생성 및 검증 중...',
                'Gemini 4 Argon Building & Verifying 3D World...'
              )}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {t('✨ 3D 동네 메모리 생성 & 스탬프 찍기', '✨ Generate 3D Memory & Earn Stamp')}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
