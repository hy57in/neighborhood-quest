import React, { useEffect, useRef } from 'react';
import type { NeighborhoodMemory, NeighborhoodSpot } from '../types';
import { useI18n, SPOT_KO_DESC } from '../i18n';
import { Award, CheckCircle2, Lock, Sparkles, X } from 'lucide-react';

interface StampPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: NeighborhoodSpot[];
  savedMemories: NeighborhoodMemory[];
  onLoadMemory: (memory: NeighborhoodMemory) => void;
}

export const StampPassportModal: React.FC<StampPassportModalProps> = ({
  isOpen,
  onClose,
  neighborhoods,
  savedMemories,
  onLoadMemory,
}) => {
  const { lang, t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const getIconEmoji = (icon?: string) => {
    switch (icon) {
      case 'sakura':
        return '🌸';
      case 'mountain':
        return '⛰️';
      case 'train':
        return '🚇';
      case 'coffee':
        return '☕';
      case 'river':
        return '🌊';
      default:
        return '✨';
    }
  };

  return (
    <dialog
      ref={dialogRef}
      // @ts-expect-error closedby is a modern HTML standard attribute per modern-web-guidance
      closedby="any"
      aria-labelledby="passport-dialog-title"
      onClose={onClose}
      onClick={handleDialogClick}
      className="m-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-xs"
    >
      <div className="p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-2xs">
              <Award className="w-6 h-6" />
            </span>
            <div>
              <h2 id="passport-dialog-title" className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
                {t('서울 동네 탐험 스탬프 여권', 'Seoul Explorer Stamp Passport')}
              </h2>
              <p className="text-xs text-slate-500">
                {t(
                  `서울 아파트를 방문하고 3D 메모리를 생성해 동네 스탬프를 수집하세요 (${savedMemories.length}/${neighborhoods.length} 수집 완료)`,
                  `Collect interactive 3D neighborhood stamps as you visit apartments across Seoul (${savedMemories.length}/${neighborhoods.length} collected)`
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Stamp Passport"
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {neighborhoods.map((spot) => {
            const memory = savedMemories.find((m) => m.neighborhoodId === spot.id);
            const koSpot = SPOT_KO_DESC[spot.id];
            return (
              <div
                key={spot.id}
                className={`rounded-2xl p-4 border-2 transition flex items-center justify-between gap-3 ${
                  memory
                    ? 'bg-white border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 border-dashed border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Stamp Medallion */}
                  <div
                    className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 shrink-0 ${
                      memory
                        ? 'border-double shadow-inner rotate-[-6deg]'
                        : 'border-slate-200 bg-slate-100 text-slate-400'
                    }`}
                    style={
                      memory
                        ? {
                            borderColor: memory.blueprint.stamp.stampColor || '#E07A5F',
                            backgroundColor: '#FFFDF9',
                          }
                        : undefined
                    }
                  >
                    {memory ? (
                      <>
                        <span className="text-xl leading-none">
                          {getIconEmoji(memory.blueprint.stamp.stampIcon)}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase tracking-tighter text-orange-600 mt-0.5">
                          {t('인증완료', 'STAMPED')}
                        </span>
                      </>
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-sm text-slate-900">
                        {lang === 'ko' ? `${spot.nameKo} (${spot.name.split(' ')[0]})` : spot.name}
                      </h3>
                      {memory && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">
                      {lang === 'ko' && koSpot ? koSpot.apartmentNameKo : spot.apartmentName}
                    </p>
                    {memory ? (
                      <p className="text-[11px] font-bold text-orange-700 mt-1">
                        “{memory.blueprint.stamp.motto}”
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {t(
                          '방문 기록 후 3D 메모리를 생성하면 스탬프가 열립니다',
                          'Visit & generate a 3D memory to unlock stamp'
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {memory && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadMemory(memory);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold shrink-0 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('3D 보기', 'View 3D')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </dialog>
  );
};
