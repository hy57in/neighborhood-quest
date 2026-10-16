import React, { useRef, useState } from 'react';
import type { PhotoInput, FieldObservationInput, NeighborhoodSpot } from '../types';
import {
  Camera,
  Mic,
  MicOff,
  Sparkles,
  Upload,
  Trash2,
  Languages,
  Mountain,
  Trees,
  Train,
  Volume2,
  Loader2,
  RotateCcw,
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
            caption: file.name.replace(/\.[^.]+$/, ''),
            tag: idx === 0 ? 'street' : idx === 1 ? 'apartment' : 'park',
          };
          onChangePhotos([...photos.slice(0, 3), newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
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
      setSpeechStatus('Loaded field voice transcript (Web Speech API fallback).');
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
            ? 'Listening in Korean (한국어로 동네 인상을 말씀해 주세요)...'
            : 'Listening in English (Describe hills, parks, subway, or noise)...'
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
        setSpeechStatus('Speech input ended — you can type or click a sample note below.');
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
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Camera className="w-4.5 h-4.5" />
          </span>
          <div>
            <h2 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
              Capture Photos & Voice Impression
            </h2>
            <p className="text-xs text-slate-500">
              {selectedSpot.name} · Gemini 4 Argon Multimodal 3D Synthesis
            </p>
          </div>
        </div>
      </div>

      {/* Field Photos Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Visit Photos ({photos.length}/3)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onLoadPresetPhotos}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Preset</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Photo Thumbnails Grid */}
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
                title="Remove photo"
                className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-[10px] font-semibold px-2 py-1 truncate">
                {photo.caption}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice & Text Impression Recorder */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-orange-600" />
            Voice / Text Note (KR 🇰🇷 & EN 🇺🇸)
          </span>

          <div className="flex items-center gap-1.5">
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  onChangeVoiceLanguage('ko-KR');
                  onChangeVoiceNote(selectedSpot.sampleVoiceNoteKo);
                }}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  voiceLanguage === 'ko-KR'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇰🇷 KO
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeVoiceLanguage('en-US');
                  onChangeVoiceNote(selectedSpot.sampleVoiceNoteEn);
                }}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  voiceLanguage === 'en-US'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇺🇸 EN
              </button>
            </div>

            <button
              type="button"
              onClick={handleToggleVoiceRecording}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecording ? 'Stop' : 'Mic'}</span>
            </button>
          </div>
        </div>

        {speechStatus && (
          <div className="text-[11px] font-semibold text-orange-800 bg-orange-50 border border-orange-200 rounded-xl px-2.5 py-1.5">
            🎙️ {speechStatus}
          </div>
        )}

        <textarea
          rows={3}
          value={voiceNoteText}
          onChange={(e) => onChangeVoiceNote(e.target.value)}
          placeholder="Describe hills, parks, subway walk, or traffic noise in Korean or English..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900 leading-relaxed"
        />
      </div>

      {/* Quick Environmental Sensor Sliders */}
      <div className="grid grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
        <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-700">
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Mountain className="w-3 h-3 text-orange-600" /> Hill Slope
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
              <Trees className="w-3 h-3 text-emerald-700" /> Greenery
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
              <Train className="w-3 h-3 text-sky-700" /> Subway Walk
            </span>
            <span className="text-sky-700">{quickRatings.subwayWalkMinutes} min</span>
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
              <Volume2 className="w-3 h-3 text-rose-600" /> Street Noise
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
            <span>Gemini 4 Argon Building & Verifying 3D World...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate 3D Memory & Earn Stamp</span>
          </>
        )}
      </button>
    </div>
  );
};
