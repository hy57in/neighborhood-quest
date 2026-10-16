import React from 'react';
import { Lang, NeighborhoodData } from '../types/index.ts';

interface BookmarkViewProps {
  neighborhoods: NeighborhoodData[];
  bookmarkedIds: string[];
  onSelectNeighborhood: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  lang?: Lang;
}

export const BookmarkView: React.FC<BookmarkViewProps> = ({
  neighborhoods,
  bookmarkedIds,
  onSelectNeighborhood,
  onToggleBookmark,
  lang = 'ko',
}) => {
  const bookmarked = neighborhoods.filter((n) => bookmarkedIds.includes(n.id));

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[17px] font-bold text-[#191f28]">
            {lang === 'ko' ? '보관된 임장 퀘스트' : 'Saved Neighborhood Quests'}
          </h2>
          <span className="text-[11px] font-bold text-[#3182f6] bg-[#e8f3ff] px-2 py-0.5 rounded-full">
            {lang === 'ko' ? `${bookmarked.length}개 보관 중` : `${bookmarked.length} Saved`}
          </span>
        </div>
        <p className="text-[12px] text-[#4e5968]">
          {lang === 'ko'
            ? '나만의 감각 기록과 3D 디오라마가 저장된 동네 목록입니다.'
            : 'Your personal sensory records and interactive 3D dioramas.'}
        </p>
      </div>

      {bookmarked.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-[#edf0f3] flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[40px] text-[#b0b8c1]">
            bookmark_border
          </span>
          <p className="text-[15px] font-bold text-[#191f28]">
            {lang === 'ko' ? '보관된 동네가 없습니다' : 'No saved neighborhoods yet'}
          </p>
          <p className="text-[12px] text-[#8b95a1]">
            {lang === 'ko'
              ? '우측 상단의 북마크 버튼을 눌러 관심 있는 동네를 저장해보세요.'
              : 'Tap the bookmark icon in the top-right to save neighborhoods you love.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookmarked.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-[#e8f3ff] text-[#3182f6] text-[10px] font-bold">
                      {item.stationDistance}
                    </span>
                    <span className="text-[11px] text-[#8b95a1]">· {item.timeContext}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-[#191f28]">{item.name}</h3>
                  <span className="text-[12px] text-[#8b95a1]">{item.subName}</span>
                </div>

                <button
                  type="button"
                  aria-label={lang === 'ko' ? '보관함에서 제거' : 'Remove bookmark'}
                  onClick={() => onToggleBookmark(item.id)}
                  className="w-8 h-8 rounded-full bg-[#f2f4f6] text-[#3182f6] flex items-center justify-center hover:bg-[#e5e8eb]"
                >
                  <span className="material-symbols-outlined text-[18px] fill-1">bookmark</span>
                </button>
              </div>

              {/* Photo preview */}
              <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                {item.photos.map((photo) => (
                  <div key={photo.id} className="aspect-square bg-[#f2f4f6] overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Voice memo quote preview */}
              <div className="bg-[#f7f9fb] p-2.5 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#3182f6]">mic</span>
                <span className="text-[12px] text-[#4e5968] truncate flex-1">
                  {item.audioMemo.quote}
                </span>
                <span className="text-[10px] font-bold text-[#8b95a1]">
                  {item.audioMemo.durationStr}
                </span>
              </div>

              {/* Action button */}
              <button
                type="button"
                onClick={() => onSelectNeighborhood(item.id)}
                className="w-full h-10 rounded-xl bg-[#111315] hover:bg-black text-white text-[13px] font-bold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-[#3182f6]">
                  holiday_village
                </span>
                <span>{lang === 'ko' ? '디오라마 열기' : 'Open 3D Diorama'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
