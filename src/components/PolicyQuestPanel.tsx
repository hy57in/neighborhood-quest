import React, { useState } from 'react';
import type {
  NpcResident,
  PolicyDocumentPreset,
  PolicyAnalysisResult,
} from '../types';
import { CharacterAvatar } from './CharacterAvatar';
import {
  Landmark,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Wrench,
  FileText,
  Loader2,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PolicyQuestPanelProps {
  neighborhoodName: string;
  starterHomePriceMillionKRW: number;
  npcs: NpcResident[];
  presets: PolicyDocumentPreset[];
  approvedPolicy: PolicyAnalysisResult;
  pendingPolicy: PolicyAnalysisResult | null;
  isAnalyzingPolicy: boolean;
  selectedNpcId: string | null;
  onSelectNpc: (npcId: string | null) => void;
  onAnalyzePolicy: (rawPolicyText: string) => void;
  onApprovePendingPolicy: () => void;
  onDiscardPendingPolicy: () => void;
}

export const PolicyQuestPanel: React.FC<PolicyQuestPanelProps> = ({
  neighborhoodName,
  starterHomePriceMillionKRW,
  npcs,
  presets,
  approvedPolicy,
  pendingPolicy,
  isAnalyzingPolicy,
  selectedNpcId,
  onSelectNpc,
  onAnalyzePolicy,
  onApprovePendingPolicy,
  onDiscardPendingPolicy,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(presets[0].id);
  const [rawPolicyText, setRawPolicyText] = useState<string>(presets[0].rawPolicyText);
  const [showDocEditor, setShowDocEditor] = useState<boolean>(false);

  const handleSelectPreset = (preset: PolicyDocumentPreset) => {
    setSelectedPresetId(preset.id);
    setRawPolicyText(preset.rawPolicyText);
  };

  const displayPolicy = pendingPolicy || approvedPolicy;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Summary Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                PolicyQuest · Pingu & Gyodong Mortgage Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Target Home in {neighborhoodName.split(' ')[0]}:{' '}
                <strong className="text-slate-800">₩{starterHomePriceMillionKRW}M</strong> · Active
                LTV {displayPolicy.extractedRules.ltvFirstTimePercent}% · DSR{' '}
                {displayPolicy.extractedRules.dsrLimitPercent}%
              </p>
            </div>
          </div>

          {pendingPolicy ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold shrink-0 animate-pulse">
              ⏳ Pending Approval
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold shrink-0">
              ✓ Active Rule
            </span>
          )}
        </div>

        {/* Human-in-the-Loop Approval Banner (Shows immediately when pendingPolicy exists) */}
        {pendingPolicy && (
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs text-amber-950">
              <div className="font-display font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Gemini 4 Argon Verified: "{pendingPolicy.policyTitleEn}" (
                  {pendingPolicy.verification.fidelityScore}% Math Fidelity)
                </span>
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Approve to apply these LTV/DSR rules to Pingu & Gyodong in the 3D village.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onDiscardPendingPolicy}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onApprovePendingPolicy}
                className="px-3.5 py-1.5 rounded-xl text-xs font-display font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Approve & Apply to 3D World</span>
              </button>
            </div>
          </div>
        )}

        {/* 1-Click Government Policy Presets */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              1. Choose a Policy Scenario & Simulate with Gemini 4 Argon
            </span>
            <button
              type="button"
              onClick={() => setShowDocEditor((v) => !v)}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>{showDocEditor ? 'Hide Policy Text' : 'Edit Raw Policy Text'}</span>
              {showDocEditor ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {presets.map((preset) => {
              const active = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between gap-1 ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50/80 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-display font-extrabold text-xs leading-snug">
                    {preset.badge}
                  </div>
                  <div
                    className={`text-[10px] line-clamp-1 ${
                      active ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {preset.title}
                  </div>
                </button>
              );
            })}
          </div>

          {showDocEditor && (
            <textarea
              value={rawPolicyText}
              onChange={(e) => setRawPolicyText(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-emerald-600"
              placeholder="Paste Korean or English government LTV/DSR housing policy announcement..."
            />
          )}

          <button
            type="button"
            disabled={isAnalyzingPolicy}
            onClick={() => onAnalyzePolicy(rawPolicyText)}
            className="w-full py-2.5 px-4 rounded-2xl font-display font-extrabold text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
          >
            {isAnalyzingPolicy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini 4 Argon Calculating & Verifying LTV/DSR...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simulate Policy Impact on Pingu & Gyodong</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pingu (핑구) & Gyodong (교동) Resident Cards */}
      <div className="grid grid-cols-1 gap-3">
        {npcs.map((npc) => {
          const outcome = displayPolicy.npcOutcomes.find((o) => o.npcId === npc.id);
          if (!outcome) return null;
          const isSelected = selectedNpcId === npc.id;
          const isPingu = npc.id === 'npc-pingu' || npc.name.toLowerCase().includes('pingu');

          return (
            <div
              key={npc.id}
              onClick={() => onSelectNpc(isSelected ? null : npc.id)}
              className={`rounded-3xl p-4 border transition cursor-pointer flex flex-col gap-3 ${
                isSelected
                  ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                  : outcome.canBuyHome
                  ? 'bg-white border-emerald-200 hover:border-emerald-400'
                  : 'bg-white border-rose-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 border ${
                      outcome.canBuyHome
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-rose-50/70 border-rose-200'
                    }`}
                  >
                    <CharacterAvatar
                      character={isPingu ? 'pingu' : 'gyodong'}
                      size={46}
                      mood={outcome.canBuyHome ? 'happy' : 'worried'}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                        {npc.name}
                      </h4>
                      <span className="text-xs font-semibold text-slate-500">
                        · {npc.roleTitle}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      Income ₩{npc.annualIncomeMillionKRW}M/yr · Saved ₩{npc.cashSavingsMillionKRW}M
                      · Debt ₩{npc.existingAnnualDebtPaymentMillionKRW}M/yr
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-display font-extrabold shrink-0 ${
                    outcome.canBuyHome
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {outcome.canBuyHome
                    ? '🏡 HOME UNLOCKED'
                    : `💔 ${outcome.bindingConstraint} CAPPED`}
                </span>
              </div>

              {/* Clean 3-Metric Pill Strip */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-2.5 border border-slate-100 text-center text-xs">
                <div>
                  <div className="text-[10px] font-semibold text-slate-500">LTV Limit</div>
                  <div className="font-display font-extrabold text-slate-800">
                    ₩{outcome.maxLtvLoanMillionKRW}M
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500">Stress DSR Limit</div>
                  <div className="font-display font-extrabold text-amber-700">
                    ₩{outcome.maxDsrLoanMillionKRW}M
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500">Purchasing Power</div>
                  <div
                    className={`font-display font-extrabold ${
                      outcome.canBuyHome ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    ₩{outcome.totalPurchasingPowerMillionKRW}M
                  </div>
                </div>
              </div>

              {/* Character Speech Bubble */}
              <div className="text-xs text-slate-700 bg-slate-50/80 rounded-2xl px-3.5 py-2.5 border border-slate-200/70 italic leading-relaxed">
                "{outcome.npcReactionDialogueEn}"
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Gemini 4 Argon Math Audit Footer */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Gemini 4 Argon LTV/DSR Audit Checks
          </span>
          <span className="text-emerald-700">
            Fidelity {displayPolicy.verification.fidelityScore}%
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {displayPolicy.verification.checks.map((chk, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl px-2.5 py-1.5 border border-slate-200/70 text-[11px] flex items-center justify-between gap-2"
            >
              <div className="truncate">
                <span className="font-bold text-slate-800">{chk.ruleName}: </span>
                <span className="text-slate-400 line-through mr-1">{chk.initialDraft}</span>
                <span className="font-bold text-emerald-700">→ {chk.verifiedRule}</span>
              </div>
              {chk.status === 'auto_patched' ? (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold shrink-0 flex items-center gap-0.5">
                  <Wrench className="w-2.5 h-2.5" /> Patched
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold shrink-0 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
