import React, { useEffect, useRef } from 'react';
import type { NeighborhoodMemory, NeighborhoodSpot } from '../types';
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

  // Modern Web Guidance: click-outside light-dismiss fallback for browsers without closedBy
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
      className="m-auto w-full max-w-2xl rounded-3xl border-4 border-[#E6D5B8] bg-[#FFF8F0] p-0 text-[#2F3E46] shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-xs"
    >
      <div className="p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E6D5B8] pb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-[#FFD166] text-[#5C3D00] flex items-center justify-center shadow-xs">
              <Award className="w-6 h-6" />
            </span>
            <div>
              <h2 id="passport-dialog-title" className="font-display font-extrabold text-xl text-[#2F3E46]">
                Seoul Explorer Stamp Passport
              </h2>
              <p className="text-xs text-[#6B705C]">
                Collect interactive 3D neighborhood stamps as you visit apartments across Seoul ({savedMemories.length}/{neighborhoods.length} collected)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Stamp Passport"
            className="p-2 rounded-2xl bg-white border border-[#E6D5B8] hover:bg-[#F4EAE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {neighborhoods.map((spot) => {
            const memory = savedMemories.find((m) => m.neighborhoodId === spot.id);
            return (
              <div
                key={spot.id}
                className={`rounded-2xl p-4 border-2 transition flex items-center justify-between gap-3 ${
                  memory
                    ? 'bg-white border-[#95D5B2] shadow-sm'
                    : 'bg-[#F4EAE0]/60 border-dashed border-[#D4C5B1] opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Stamp Medallion */}
                  <div
                    className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 shrink-0 ${
                      memory
                        ? 'border-double shadow-inner rotate-[-6deg]'
                        : 'border-[#D4C5B1] bg-[#E8DEC8]/50 text-[#8D99AE]'
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
                        <span className="text-[9px] font-extrabold uppercase tracking-tighter text-[#E07A5F] mt-0.5">
                          STAMPED
                        </span>
                      </>
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-sm text-[#2F3E46]">
                        {spot.name}
                      </h3>
                      {memory && (
                        <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#6B705C] font-semibold">
                      {spot.apartmentName}
                    </p>
                    {memory ? (
                      <p className="text-[11px] font-bold text-[#E07A5F] mt-1">
                        “{memory.blueprint.stamp.motto}”
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#8D99AE] mt-1">
                        Visit & generate a 3D memory to unlock stamp
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
                    className="px-3 py-1.5 rounded-xl bg-[#D8F3DC] hover:bg-[#B7E4C7] text-[#1B4332] text-xs font-bold shrink-0 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    View 3D
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
