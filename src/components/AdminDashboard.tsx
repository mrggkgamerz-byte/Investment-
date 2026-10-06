import React, { useState } from 'react';
import {
  CheckCircle2,
  LogOut,
  MinusCircle,
  PlusCircle,
  Save,
  Settings,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  DemoUser,
  OptionPlan,
  PlatformDemoStats,
  TransactionRecord,
} from '../types/investment';
import {
  formatBDT,
  getGatewayLabelBn,
  getTransactionTypeLabelBn,
  toBengaliDigits,
  toEnglishDigits,
} from '../utils/formatters';

interface AdminDashboardProps {
  users: DemoUser[];
  plans: OptionPlan[];
  platformStats: PlatformDemoStats;
  transactions: TransactionRecord[];
  useBengaliDigits: boolean;
  onUpdateUserBalance: (userId: string, deltaAmount: number, reasonBn: string) => void;
  onUpdatePlanInterest: (planId: string, newTotalRoiPercent: number, newDurationDays: number) => void;
  onUpdatePlatformStats: (newStats: PlatformDemoStats) => void;
  onApproveTransaction: (txId: string) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  plans,
  platformStats,
  transactions,
  useBengaliDigits,
  onUpdateUserBalance,
  onUpdatePlanInterest,
  onUpdatePlatformStats,
  onApproveTransaction,
  onLogout,
}) => {
  const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});
  const [planEdits, setPlanEdits] = useState<
    Record<string, { roi: string; duration: string }>
  >(() => {
    const init: Record<string, { roi: string; duration: string }> = {};
    plans.forEach((p) => {
      init[p.id] = {
        roi: String(p.totalRoiPercent),
        duration: String(p.durationDays),
      };
    });
    return init;
  });

  const [incomeInput, setIncomeInput] = useState<string>(
    String(platformStats.totalDemoIncome)
  );
  const [membersInput, setMembersInput] = useState<string>(
    String(platformStats.totalDemoMembers)
  );
  const [noticeInput, setNoticeInput] = useState<string>(platformStats.noticeBn);
  const [feedback, setFeedback] = useState<string | null>(null);

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIncome =
      Number(toEnglishDigits(incomeInput).replace(/[^0-9]/g, '')) || 0;
    const cleanMembers =
      Number(toEnglishDigits(membersInput).replace(/[^0-9]/g, '')) || 0;

    onUpdatePlatformStats({
      totalDemoIncome: cleanIncome,
      totalDemoMembers: cleanMembers,
      noticeBn: noticeInput.trim() || platformStats.noticeBn,
    });
    notify('ডেমো প্ল্যাটফর্মের মোট আয় ও সদস্য সংখ্যা আপডেট করা হয়েছে।');
  };

  const regularUsers = users.filter((u) => u.role !== 'admin');

  return (
    <div className="min-h-screen bg-[#07110E] text-[#F0FDF4] flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#07110E]/95 backdrop-blur-md border-b border-emerald-500/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="font-display text-xl sm:text-2xl font-bold text-[#F0FDF4]">
            অর্থধারা — ডেমো অ্যাডমিন প্যানেল
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-[#132922] hover:bg-red-500/20 text-[#F0FDF4] border border-emerald-500/25 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#F59E0B]" />
            <span>লগআউট (Logout)</span>
          </button>
        </div>
      </header>

      {/* Persistent Demo Notice */}
      <div className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-2.5 text-xs text-[#F0FDF4]">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>
            <strong>ডেমো স্যান্ডবক্স কন্ট্রোল:</strong> এই অ্যাডমিন প্যানেল থেকে পরিবর্তিত সকল ব্যালেন্স, মুনাফার হার ও পরিসংখ্যান শুধুমাত্র ডেমো প্রদর্শনের জন্য।
          </span>
        </div>
      </div>

      {feedback && (
        <div className="bg-[#132922] border-b border-emerald-500/30">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-2 text-xs sm:text-sm text-[#10B981]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* SECTION 1: Customize Platform Demo Stats (Total Income & Total Members) */}
        <section className="rounded-xl bg-[#0D1D18] border border-emerald-500/15 p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#10B981]" />
            <div>
              <h2 className="font-display text-lg font-bold text-[#F0FDF4]">
                ডেমো প্ল্যাটফর্ম ওভারভিউ কাস্টমাইজেশন (মোট ডেমো আয় ও সদস্য সংখ্যা)
              </h2>
              <p className="text-xs text-[#94A3B8]">
                হোম পেজে প্রদর্শিত ডেমো মোট আয় (Total Income) এবং ডেমো মোট মেম্বার সংখ্যা পরিবর্তন করুন
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveStats} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                মোট ডেমো আয় / ভলিউম (৳)
              </label>
              <input
                type="text"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] font-mono text-sm focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                মোট ডেমো মেম্বার সংখ্যা
              </label>
              <input
                type="text"
                value={membersInput}
                onChange={(e) => setMembersInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] font-mono text-sm focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#042F2E] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>পরিসংখ্যান আপডেট করুন</span>
            </button>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                ডেমো নোটিশ বার্তা
              </label>
              <input
                type="text"
                value={noticeInput}
                onChange={(e) => setNoticeInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] text-xs focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </form>
        </section>

        {/* SECTION 2: Control Plan Interest Rates (প্ল্যান ইন্টারেস্ট কন্ট্রোল) */}
        <section className="rounded-xl bg-[#0D1D18] border border-emerald-500/15 p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
            <div>
              <h2 className="font-display text-lg font-bold text-[#F0FDF4]">
                ডেমো প্ল্যান মুনাফার হার (% Interest) ও মেয়াদ নিয়ন্ত্রণ
              </h2>
              <p className="text-xs text-[#94A3B8]">
                প্রতিটি ডেমো প্ল্যানের শতকরা মুনাফার হার এবং দিনের মেয়াদ পরিবর্তন করুন
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const editState = planEdits[plan.id] || {
                roi: String(plan.totalRoiPercent),
                duration: String(plan.durationDays),
              };

              return (
                <div
                  key={plan.id}
                  className="p-4 rounded-xl bg-[#07110E] border border-emerald-500/15 space-y-3"
                >
                  <div className="font-bold text-sm text-[#F0FDF4]">{plan.nameBn}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1">
                        মোট মুনাফা (%)
                      </label>
                      <input
                        type="text"
                        value={editState.roi}
                        onChange={(e) =>
                          setPlanEdits((prev) => ({
                            ...prev,
                            [plan.id]: { ...editState, roi: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-[#0D1D18] border border-emerald-500/20 text-[#F0FDF4] font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1">
                        মেয়াদ (দিন)
                      </label>
                      <input
                        type="text"
                        value={editState.duration}
                        onChange={(e) =>
                          setPlanEdits((prev) => ({
                            ...prev,
                            [plan.id]: { ...editState, duration: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-[#0D1D18] border border-emerald-500/20 text-[#F0FDF4] font-mono text-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newRoi =
                        Number(toEnglishDigits(editState.roi).replace(/[^0-9.]/g, '')) ||
                        plan.totalRoiPercent;
                      const newDur =
                        Number(toEnglishDigits(editState.duration).replace(/[^0-9]/g, '')) ||
                        plan.durationDays;
                      onUpdatePlanInterest(plan.id, newRoi, newDur);
                      notify(`${plan.nameBn}-এর ডেমো মুনাফা ${newRoi}% এবং মেয়াদ ${newDur} দিনে আপডেট হয়েছে।`);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#132922] hover:bg-[#10B981] text-[#F0FDF4] hover:text-[#042F2E] border border-emerald-500/25 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    প্ল্যান আপডেট করুন
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: User Balance Add & Remove (ইউজার ব্যালেন্স অ্যাড ও রিমুভ) */}
        <section className="rounded-xl bg-[#0D1D18] border border-emerald-500/15 p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#10B981]" />
            <div>
              <h2 className="font-display text-lg font-bold text-[#F0FDF4]">
                ডেমো ইউজার তালিকা এবং ব্যালেন্স অ্যাড / রিমুভ কন্ট্রোল
              </h2>
              <p className="text-xs text-[#94A3B8]">
                রেজিস্টার্ড ইউজারদের মেইন ডেমো ব্যালেন্সে ভার্চুয়াল টাকা যোগ বা কর্তন করুন
              </p>
            </div>
          </div>

          {regularUsers.length === 0 ? (
            <div className="p-8 text-center rounded-lg bg-[#07110E] border border-emerald-500/15 text-xs text-[#94A3B8]">
              এখনও কোনো সাধারণ ইউজার অ্যাকাউন্ট রেজিস্টার করা হয়নি। লগআউট করে নতুন ইউজার রেজিস্টার করুন।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-emerald-500/15 text-xs text-[#94A3B8]">
                    <th className="py-3 px-4">ইউজারনেম</th>
                    <th className="py-3 px-4">খোলার তারিখ</th>
                    <th className="py-3 px-4 text-right">বর্তমান ডেমো ব্যালেন্স</th>
                    <th className="py-3 px-4 text-right">ব্যালেন্স অ্যাড / রিমুভ (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10 text-xs sm:text-sm">
                  {regularUsers.map((u) => {
                    const inputVal = balanceInputs[u.id] ?? '5000';
                    const parsedAmt =
                      Number(toEnglishDigits(inputVal).replace(/[^0-9]/g, '')) || 0;

                    return (
                      <tr key={u.id} className="hover:bg-[#132922]/40">
                        <td className="py-3.5 px-4 font-semibold text-[#F0FDF4]">
                          {u.username}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#94A3B8]">
                          {u.createdAt}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#10B981] tabular-nums">
                          {formatBDT(u.balance, useBengaliDigits)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <input
                              type="text"
                              value={inputVal}
                              onChange={(e) =>
                                setBalanceInputs((prev) => ({
                                  ...prev,
                                  [u.id]: e.target.value,
                                }))
                              }
                              className="w-28 px-2.5 py-1.5 rounded bg-[#07110E] border border-emerald-500/20 text-[#F0FDF4] font-mono text-xs text-right"
                              placeholder="5000"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (parsedAmt <= 0) return;
                                onUpdateUserBalance(
                                  u.id,
                                  parsedAmt,
                                  'অ্যাডমিন কর্তৃক ডেমো ব্যালেন্স যোগ'
                                );
                                notify(
                                  `${u.username}-এর অ্যাকাউন্টে +${formatBDT(parsedAmt, useBengaliDigits)} ডেমো ব্যালেন্স যোগ করা হয়েছে।`
                                );
                              }}
                              className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded bg-[#10B981] hover:bg-[#34D399] text-[#042F2E] font-semibold text-xs cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>অ্যাড</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (parsedAmt <= 0) return;
                                onUpdateUserBalance(
                                  u.id,
                                  -parsedAmt,
                                  'অ্যাডমিন কর্তৃক ডেমো ব্যালেন্স কর্তন'
                                );
                                notify(
                                  `${u.username}-এর অ্যাকাউন্ট থেকে -${formatBDT(parsedAmt, useBengaliDigits)} ডেমো ব্যালেন্স কমানো হয়েছে।`
                                );
                              }}
                              className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold text-xs cursor-pointer"
                            >
                              <MinusCircle className="w-3.5 h-3.5" />
                              <span>রিমুভ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* SECTION 4: All Users Withdraw & Deposit Log */}
        <section className="rounded-xl bg-[#0D1D18] border border-emerald-500/15 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#F0FDF4]">
            সকল ইউজারের ডেমো উত্তোলন ও লেনদেন হিস্ট্রি
          </h2>
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#94A3B8]">
              এখনও কোনো ডেমো লেনদেন রেকর্ড হয়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-emerald-500/15 text-[#94A3B8]">
                    <th className="py-2.5 px-3">ইউজার</th>
                    <th className="py-2.5 px-3">ধরন</th>
                    <th className="py-2.5 px-3">মাধ্যম ও নম্বর</th>
                    <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                    <th className="py-2.5 px-3">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-2.5 px-3 font-semibold text-[#F0FDF4]">
                        {tx.username}
                      </td>
                      <td className="py-2.5 px-3 text-[#94A3B8]">
                        {getTransactionTypeLabelBn(tx.type)} · {tx.createdAt}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#94A3B8]">
                        {getGatewayLabelBn(tx.gateway)} ({tx.mobileNumber})
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#10B981]">
                        {formatBDT(tx.amount, useBengaliDigits)}
                      </td>
                      <td className="py-2.5 px-3">
                        {tx.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => {
                              onApproveTransaction(tx.id);
                              notify(`লেনদেন ${tx.trxId} অনুমোদন করা হয়েছে।`);
                            }}
                            className="py-1 px-2.5 rounded bg-[#10B981] text-[#042F2E] font-semibold text-xs cursor-pointer"
                          >
                            অনুমোদন করুন
                          </button>
                        ) : (
                          <span className="text-[#10B981]">সম্পন্ন (ডেমো)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
