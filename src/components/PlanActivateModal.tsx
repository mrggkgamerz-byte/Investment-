import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Wallet, X } from 'lucide-react';
import { OptionPlan } from '../types/investment';
import { formatBDT, toBengaliDigits, toEnglishDigits } from '../utils/formatters';

interface PlanActivateModalProps {
  plan: OptionPlan | null;
  initialAmount: number;
  walletBalance: number;
  useBengaliDigits: boolean;
  onClose: () => void;
  onConfirmActivate: (plan: OptionPlan, amount: number) => void;
  onOpenDeposit: () => void;
}

export const PlanActivateModal: React.FC<PlanActivateModalProps> = ({
  plan,
  initialAmount,
  walletBalance,
  useBengaliDigits,
  onClose,
  onConfirmActivate,
  onOpenDeposit,
}) => {
  const [amountInput, setAmountInput] = useState<string>(String(initialAmount));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setAmountInput(String(initialAmount || plan.defaultCalcAmount));
      setErrorMsg(null);
    }
  }, [plan, initialAmount]);

  if (!plan) return null;

  const numericAmount = Number(toEnglishDigits(amountInput).replace(/[^0-9]/g, '')) || 0;
  const totalProfit = Math.round((numericAmount * plan.totalRoiPercent) / 100);
  const dailyProfit = Math.round(totalProfit / plan.durationDays);
  const totalMaturityReturn = numericAmount + totalProfit;
  const hasEnoughBalance = walletBalance >= numericAmount;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numericAmount < plan.minAmount || numericAmount > plan.maxAmount) {
      setErrorMsg(
        `এই ডেমো প্ল্যানে বিনিয়োগ সীমা ${formatBDT(plan.minAmount, useBengaliDigits)} থেকে ${formatBDT(
          plan.maxAmount,
          useBengaliDigits
        )}।`
      );
      return;
    }

    if (!hasEnoughBalance) {
      setErrorMsg('আপনার ডেমো ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।');
      return;
    }

    onConfirmActivate(plan, numericAmount);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activate-plan-title"
    >
      <div className="relative w-full max-w-md rounded-xl bg-[#0D1D18] border border-emerald-500/25 shadow-2xl overflow-hidden my-8">
        <div className="bg-[#07110E] px-5 py-3 border-b border-emerald-500/20 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] hover:text-[#34D399] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ডে ফিরে যান</span>
          </button>
          <span className="text-[11px] text-[#F59E0B] font-medium">ডেমো প্ল্যান</span>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/15">
          <div>
            <h2 id="activate-plan-title" className="text-lg font-bold text-[#F0FDF4]">
              {plan.nameBn} চালু করুন
            </h2>
            <p className="text-xs text-[#94A3B8]">
              মেয়াদ: {useBengaliDigits ? toBengaliDigits(plan.durationDays) : plan.durationDays} দিন · ডেমো মুনাফা:{' '}
              {useBengaliDigits ? toBengaliDigits(plan.totalRoiPercent) : plan.totalRoiPercent}%
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#132922] transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          {/* Wallet Balance Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#07110E] border border-emerald-500/15">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Wallet className="w-4 h-4 text-[#10B981]" />
              <span>আপনার বর্তমান ডেমো ব্যালেন্স</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#10B981] tabular-nums">
              {formatBDT(walletBalance, useBengaliDigits)}
            </span>
          </div>

          {/* Investment Amount Input & Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="plan-invest-amount" className="text-xs font-medium text-[#94A3B8]">
                ডেমো বিনিয়োগের পরিমাণ নির্ধারণ করুন
              </label>
              <span className="text-xs text-[#64748B] tabular-nums">
                {formatBDT(plan.minAmount, useBengaliDigits)} – {formatBDT(plan.maxAmount, useBengaliDigits)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#10B981]">
                ৳
              </span>
              <input
                id="plan-invest-amount"
                type="text"
                inputMode="numeric"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] font-mono text-base font-semibold tabular-nums focus:outline-none focus:border-[#10B981]"
              />
            </div>
            <input
              type="range"
              min={plan.minAmount}
              max={plan.maxAmount}
              step={500}
              value={Math.min(Math.max(numericAmount, plan.minAmount), plan.maxAmount)}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full mt-3"
              aria-label="বিনিয়োগের পরিমাণ স্লাইডার"
            />
          </div>

          {/* Return Breakdown Summary */}
          <div className="p-4 rounded-lg bg-[#07110E] border border-emerald-500/15 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">দৈনিক ডেমো মুনাফা</span>
              <span className="font-mono font-semibold text-[#10B981] tabular-nums">
                +{formatBDT(dailyProfit, useBengaliDigits)} / দিন
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">
                {useBengaliDigits ? toBengaliDigits(plan.durationDays) : plan.durationDays} দিনে মোট ডেমো মুনাফা (
                {useBengaliDigits ? toBengaliDigits(plan.totalRoiPercent) : plan.totalRoiPercent}%)
              </span>
              <span className="font-mono font-semibold text-[#D4AF37] tabular-nums">
                +{formatBDT(totalProfit, useBengaliDigits)}
              </span>
            </div>
            <div className="border-t border-emerald-500/15 pt-2.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#F0FDF4]">মেয়াদ শেষে মোট ডেমো প্রাপ্য</span>
              <span className="font-mono font-bold text-[#F0FDF4] tabular-nums">
                {formatBDT(totalMaturityReturn, useBengaliDigits)}
              </span>
            </div>
          </div>

          <div className="text-xs text-[#94A3B8] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>{plan.payoutScheduleBn} · {plan.capitalReturnBn}</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {!hasEnoughBalance ? (
            <div className="space-y-2.5">
              <p className="text-xs text-[#F59E0B]">
                এই অঙ্কের ডেমো বিনিয়োগের জন্য আপনার ওয়ালেটে আরও{' '}
                {formatBDT(numericAmount - walletBalance, useBengaliDigits)} ডেমো ক্রেডিট প্রয়োজন।
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="w-full py-3 px-4 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#042F2E] font-semibold text-xs transition-colors cursor-pointer"
              >
                ডেমো ব্যালেন্স রিকোয়েস্ট করুন
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3 px-5 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#042F2E] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ডেমো প্ল্যান চালু করুন ({formatBDT(numericAmount, useBengaliDigits)})</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
