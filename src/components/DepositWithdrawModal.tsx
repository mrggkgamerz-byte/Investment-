import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { GATEWAY_CONFIG } from '../data/initialData';
import { BkashMark, NagadMark } from './PaymentLogos';
import {
  formatBDT,
  isValidBangladeshMobile,
  normalizeBangladeshMobile,
  toEnglishDigits,
} from '../utils/formatters';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  initialMode: 'deposit' | 'withdraw';
  initialGateway?: 'bkash' | 'nagad';
  walletBalance: number;
  useBengaliDigits: boolean;
  onClose: () => void;
  onRequestDemoDeposit: (amount: number) => void;
  onSubmitWithdraw: (payload: {
    gateway: 'bkash' | 'nagad';
    amount: number;
    mobileNumber: string;
    accountType: 'personal' | 'agent';
  }) => void;
}

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  isOpen,
  initialMode,
  initialGateway = 'bkash',
  walletBalance,
  useBengaliDigits,
  onClose,
  onRequestDemoDeposit,
  onSubmitWithdraw,
}) => {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>(initialMode);
  const [gateway, setGateway] = useState<'bkash' | 'nagad'>(initialGateway);
  const [amountInput, setAmountInput] = useState<string>('5000');
  const [mobileInput, setMobileInput] = useState<string>('01700000000');
  const [accountType, setAccountType] = useState<'personal' | 'agent'>('personal');
  const [pinInput, setPinInput] = useState<string>('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setGateway(initialGateway);
      setErrorMsg(null);
    }
  }, [isOpen, initialMode, initialGateway]);

  if (!isOpen) return null;

  const activeConfig = GATEWAY_CONFIG[gateway];
  const numericAmount = Number(toEnglishDigits(amountInput).replace(/[^0-9]/g, '')) || 0;

  const handleWithdrawFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValidBangladeshMobile(mobileInput)) {
      setErrorMsg('অনুগ্রহ করে সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    const normalizedMobile = normalizeBangladeshMobile(mobileInput);

    if (numericAmount < activeConfig.minWithdraw) {
      setErrorMsg(`সর্বনিম্ন ডেমো উত্তোলন সীমা ${formatBDT(activeConfig.minWithdraw, useBengaliDigits)}।`);
      return;
    }
    if (numericAmount > walletBalance) {
      setErrorMsg(
        `আপনার মেইন ব্যালেন্সে পর্যাপ্ত ডেমো তহবিল নেই। বর্তমান ব্যালেন্স ${formatBDT(
          walletBalance,
          useBengaliDigits
        )}।`
      );
      return;
    }
    const cleanPin = toEnglishDigits(pinInput).trim();
    if (cleanPin.length !== 4) {
      setErrorMsg('নিরাপত্তা নিশ্চিত করতে ৪ সংখ্যার ডেমো পিন দিন (যেমন: 1234)।');
      return;
    }

    onSubmitWithdraw({
      gateway,
      amount: numericAmount,
      mobileNumber: normalizedMobile,
      accountType,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gateway-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-xl bg-[#0D1D18] border border-emerald-500/25 shadow-2xl overflow-hidden my-8">
        {/* Top Navigation Back Bar */}
        <div className="bg-[#07110E] px-5 py-3.5 border-b border-emerald-500/20 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#10B981] hover:text-[#34D399] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ডে ফিরে যান (Back)</span>
          </button>
          <span className="text-[11px] font-medium text-[#F59E0B]">
            ডেমো সিমুলেটর মোড
          </span>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-500/15">
          <h2 id="gateway-modal-title" className="text-xl font-bold text-[#F0FDF4]">
            {mode === 'deposit'
              ? 'ভার্চুয়াল ডেমো ডিপোজিট প্যানেল'
              : 'ডেমো ব্যালেন্স উত্তোলন (Withdraw)'}
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            এটি একটি শিক্ষামূলক ডেমো অ্যাপ — এখানে কোনো প্রকৃত টাকার লেনদেন হয় না
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode Switcher: Deposit vs Withdraw */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#07110E] rounded-lg border border-emerald-500/15">
            <button
              type="button"
              onClick={() => {
                setMode('deposit');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'deposit'
                  ? 'bg-[#10B981] text-[#042F2E]'
                  : 'text-[#94A3B8] hover:text-[#F0FDF4]'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>ডিপোজিট (ডেমো)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('withdraw');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'withdraw'
                  ? 'bg-[#D4AF37] text-[#07110E]'
                  : 'text-[#94A3B8] hover:text-[#F0FDF4]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>উত্তোলন (ডেমো)</span>
            </button>
          </div>

          {mode === 'deposit' ? (
            /* DEPOSIT VIEW: No phone number or TrxID fields; clean virtual demo deposit panel */
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <div className="text-xs text-[#F0FDF4] leading-relaxed">
                  <strong>ডেমো সিমুলেটর সতর্কবার্তা:</strong> এটি শুধুমাত্র একটি ডেমো অ্যাপ। কোনো ব্যক্তিগত বিকাশ, নগদ বা টেলিগ্রাম অ্যাকাউন্টে প্রকৃত টাকা পাঠাবেন না। অ্যাডমিন প্যানেল থেকে অথবা নিচের বাটনে ক্লিক করে ভার্চুয়াল ডেমো ব্যালেন্স যুক্ত করা যাবে।
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#07110E] border border-emerald-500/20 text-center space-y-4">
                <div className="text-xs text-[#94A3B8]">
                  আপনার বর্তমান মেইন ব্যালেন্স (ডেমো):{' '}
                  <span className="font-mono font-bold text-[#10B981]">
                    {formatBDT(walletBalance, useBengaliDigits)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#F0FDF4]">
                    ভার্চুয়াল ডেমো ক্রেডিট পরিমাণ নির্বাচন করুন
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountInput(String(amt))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                          numericAmount === amt
                            ? 'bg-[#10B981] text-[#042F2E]'
                            : 'bg-[#0D1D18] text-[#94A3B8] border border-emerald-500/20 hover:text-white'
                        }`}
                      >
                        {formatBDT(amt, useBengaliDigits)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onRequestDemoDeposit(numericAmount || 5000);
                    onClose();
                  }}
                  className="w-full py-3 px-5 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#042F2E] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    +{formatBDT(numericAmount || 5000, useBengaliDigits)} ডেমো ব্যালেন্স রিকোয়েস্ট পাঠান
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-lg bg-[#132922] hover:bg-emerald-500/20 text-[#F0FDF4] border border-emerald-500/25 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ড্যাশবোর্ডে ফিরে যান</span>
              </button>
            </div>
          ) : (
            /* WITHDRAW VIEW: Immediately deducts from main balance and logs in Withdraw History */
            <form onSubmit={handleWithdrawFormSubmit} className="space-y-4">
              {/* Gateway Selector */}
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                  উত্তোলনের মাধ্যম নির্বাচন করুন (বিকাশ ও নগদ ডেমো)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGateway('bkash')}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      gateway === 'bkash'
                        ? 'bg-[#E2136E]/12 border-[#E2136E] text-white'
                        : 'bg-[#07110E] border-emerald-500/15 text-[#94A3B8]'
                    }`}
                  >
                    <BkashMark className="w-8 h-8 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-[#F0FDF4] truncate">
                        বিকাশ (ডেমো)
                      </div>
                      <div className="text-[11px] text-[#94A3B8] truncate">তাৎক্ষণিক কর্তন</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGateway('nagad')}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      gateway === 'nagad'
                        ? 'bg-[#F7941D]/12 border-[#F7941D] text-white'
                        : 'bg-[#07110E] border-emerald-500/15 text-[#94A3B8]'
                    }`}
                  >
                    <NagadMark className="w-8 h-8 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-[#F0FDF4] truncate">
                        নগদ (ডেমো)
                      </div>
                      <div className="text-[11px] text-[#94A3B8] truncate">তাৎক্ষণিক কর্তন</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Main Balance Display */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#07110E] border border-emerald-500/15">
                <div>
                  <span className="text-xs text-[#94A3B8]">উত্তোলনযোগ্য মেইন ব্যালেন্স (ডেমো)</span>
                  <div className="text-lg font-bold text-[#10B981] tabular-nums mt-0.5">
                    {formatBDT(walletBalance, useBengaliDigits)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAmountInput(String(walletBalance))}
                  className="px-3 py-1.5 rounded-md bg-[#132922] hover:bg-emerald-500/20 text-xs font-medium text-[#D4AF37] border border-[#D4AF37]/30 transition-colors whitespace-nowrap cursor-pointer"
                >
                  সম্পূর্ণ ব্যালেন্স নিন
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="withdraw-amount" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  উত্তোলনের পরিমাণ (উত্তোলন করার সাথে সাথে মেইন ব্যালেন্স থেকে কেটে নেওয়া হবে)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#10B981]">
                    ৳
                  </span>
                  <input
                    id="withdraw-amount"
                    type="text"
                    inputMode="numeric"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="500"
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] font-mono text-base font-semibold tabular-nums focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              {/* Receiver Mobile & PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="withdraw-mobile" className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    গ্রাহকের ডেমো নম্বর
                  </label>
                  <input
                    id="withdraw-mobile"
                    type="tel"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] font-mono text-sm tabular-nums focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    অ্যাকাউন্টের ধরন ও পিন (1234)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as 'personal' | 'agent')}
                      className="px-2.5 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] text-xs focus:outline-none focus:border-[#10B981]"
                    >
                      <option value="personal">পার্সোনাল</option>
                      <option value="agent">এজেন্ট</option>
                    </select>
                    <div className="relative flex-1">
                      <Lock className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        maxLength={4}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="1234"
                        aria-label="সিকিউরিটি পিন"
                        className="w-full pl-8 pr-2.5 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] font-mono text-sm tracking-widest focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-lg bg-[#132922] hover:bg-emerald-500/20 text-[#F0FDF4] border border-emerald-500/25 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ফিরে যান</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-lg font-semibold text-sm text-[#042F2E] bg-[#10B981] hover:bg-[#34D399] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    ডেমো উত্তোলন নিশ্চিত করুন ({formatBDT(numericAmount, useBengaliDigits)})
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
