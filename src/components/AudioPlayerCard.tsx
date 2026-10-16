import React, { useState, useEffect, useRef } from 'react';
import { AudioMemo, Lang } from '../types/index.ts';
import { formatTimeSeconds } from '../utils/sensoryCalculations.ts';

interface AudioPlayerCardProps {
  memo: AudioMemo;
  isPlayingExternal?: boolean;
  lang?: Lang;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({
  memo,
  isPlayingExternal,
  lang = 'ko',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlayingExternal !== undefined) {
      setIsPlaying(isPlayingExternal);
    }
  }, [isPlayingExternal]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= memo.durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, memo.durationSeconds]);

  const togglePlay = () => {
    if (!isPlaying && currentSeconds >= memo.durationSeconds) {
      setCurrentSeconds(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const toggleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  // 12 waveform bar heights
  const baseHeights = [10, 14, 8, 16, 12, 10, 6, 12, 8, 14, 6, 10];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full bg-[#3182f6] ${
              isPlaying ? 'animate-ping' : 'animate-pulse'
            }`}
          />
          <span className="text-[13px] font-bold text-[#191f28]">{memo.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSpeed}
            className="text-[10px] font-bold text-[#4e5968] bg-[#f2f4f6] hover:bg-[#e5e8eb] px-1.5 py-0.5 rounded transition-colors"
          >
            {playbackSpeed}x
          </button>
          <span className="text-[12px] font-semibold text-[#8b95a1] tabular-nums">
            {isPlaying ? formatTimeSeconds(currentSeconds) : memo.durationStr}
          </span>
        </div>
      </div>

      <p className="text-[14px] text-[#4e5968] leading-snug">{memo.quote}</p>

      {/* Audio waveform bar player */}
      <div className="flex items-center gap-3 bg-[#f2f4f6] p-2.5 rounded-xl">
        <button
          type="button"
          aria-label={isPlaying ? (lang === 'ko' ? '일시정지' : 'Pause') : (lang === 'ko' ? '재생' : 'Play')}
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-[#111315] text-white flex items-center justify-center shrink-0 active:scale-95 hover:bg-black transition-all focus:outline-none"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Waveform visualizer */}
        <div className="flex-1 flex items-center justify-between px-1 h-5 gap-1">
          {baseHeights.map((h, i) => {
            const progress = (currentSeconds / memo.durationSeconds) * baseHeights.length;
            const isPlayed = i <= progress;
            const currentHeight = isPlaying ? Math.min(20, Math.max(4, h + ((i % 3) - 1) * 4)) : h;

            return (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlayed ? 'bg-[#3182f6]' : 'bg-[#b0b8c1]'
                }`}
                style={{ height: `${currentHeight}px` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
