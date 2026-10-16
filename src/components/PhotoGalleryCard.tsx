import React, { useState } from 'react';
import { Lang, PhotoRecord } from '../types/index.ts';

interface PhotoGalleryCardProps {
  photos: PhotoRecord[];
  timeTaken?: string;
  caption?: string;
  lang?: Lang;
}

export const PhotoGalleryCard: React.FC<PhotoGalleryCardProps> = ({
  photos,
  timeTaken,
  caption,
  lang = 'ko',
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const defaultTime = lang === 'ko' ? '18:32 촬영' : 'Taken 18:32';
  const defaultCaption =
    lang === 'ko'
      ? '골목 조도 및 둘레길 연결 지점 확인 완료'
      : 'Alley lighting & park trail entry verified';

  const handleNext = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev! + 1) % photos.length);
  };

  const handlePrev = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => (prev! - 1 + photos.length) % photos.length);
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#191f28]">
            {lang === 'ko' ? `현장 사진 ${photos.length}장` : `${photos.length} Field Photos`}
          </span>
          <span className="text-[11px] text-[#8b95a1]">{timeTaken || defaultTime}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedPhotoIndex(index)}
              className="aspect-square rounded-xl overflow-hidden bg-[#f2f4f6] border border-[#edf0f3] hover:ring-2 hover:ring-[#3182f6] transition-all cursor-pointer group focus:outline-none relative"
            >
              <img
                src={photo.url}
                alt={photo.alt}
                data-alt={photo.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>

        <p className="text-[11px] text-[#8b95a1]">{caption || defaultCaption}</p>
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-between p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Top Bar */}
          <div className="w-full max-w-md flex items-center justify-between pt-safe text-white z-10">
            <span className="text-sm font-semibold">
              {selectedPhotoIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              aria-label={lang === 'ko' ? '닫기' : 'Close'}
              onClick={() => setSelectedPhotoIndex(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Image & navigation */}
          <div
            className="relative flex-1 w-full max-w-md flex items-center justify-center py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedPhotoIndex].url}
              alt={photos[selectedPhotoIndex].alt}
              className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {/* Left / Right buttons */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label={lang === 'ko' ? '이전 사진' : 'Previous photo'}
                  onClick={handlePrev}
                  className="absolute left-2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  aria-label={lang === 'ko' ? '다음 사진' : 'Next photo'}
                  onClick={handleNext}
                  className="absolute right-2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Bottom caption */}
          <div
            className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl p-3 text-white text-center text-xs pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-medium">{photos[selectedPhotoIndex].alt}</p>
            <span className="text-slate-300 text-[10px] block mt-1">
              {photos[selectedPhotoIndex].timeTaken}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
