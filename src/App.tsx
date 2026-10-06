import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  LogOut,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  GATEWAY_CONFIG,
  INITIAL_ACTIVE_POSITIONS,
  INITIAL_PLATFORM_STATS,
  INITIAL_TRANSACTIONS,
  OPTION_PLANS,
} from './data/initialData';
import {
  ActivePosition,
  DemoUser,
  GatewayType,
  OptionPlan,
  PlatformDemoStats,
  TransactionRecord,
} from './types/investment';
import {
  formatBDT,
  generateSecurityHash,
  generateTrxId,
  getGatewayLabelBn,
  getTransactionTypeLabelBn,
  toBengaliDigits,
  toEnglishDigits,
} from './utils/formatters';
import { BkashMark, GatewayEmblem, NagadMark } from './components/PaymentLogos';
import { DepositWithdrawModal } from './components/DepositWithdrawModal';
import { PlanActivateModal } from './components/PlanActivateModal';
import { TransactionAuditModal } from './components/TransactionAuditModal';
import { AuthView } from './components/AuthView';
import { AdminDashboard } from './components/AdminDashboard';

const STORAGE_KEYS = {
  USERS: 'orthodhara_users_v3',
  CURRENT_USER_ID: 'orthodhara_current_user_v3',
  PLANS: 'orthodhara_plans_v3',
  STATS: 'orthodhara_stats_v3',
  POSITIONS: 'orthodhara_positions_v3',
  TRANSACTIONS: 'orthodhara_transactions_v3',
};

const DEFAULT_ADMIN_USER: DemoUser = {
  id: 'admin-root',
  username: 'admin2929',
  password: 'admin2929@@',
  balance: 0,
  createdAt: '০৬ অক্টোবর ২০২৬',
  role: 'admin',
};

export default function App() {
  // Users State
  const [users, setUsers] = useState<DemoUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: DemoUser[] = JSON.parse(saved);
        if (!parsed.some((u) => u.username === 'admin2929')) {
          return [DEFAULT_ADMIN_USER, ...parsed];
        }
        return parsed;
      } catch {
        return [DEFAULT_ADMIN_USER];
      }
    }
    return [DEFAULT_ADMIN_USER];
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  });

  // Dynamic Plans State (Admin controllable)
  const [plans, setPlans] = useState<OptionPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return OPTION_PLANS;
      }
    }
    return OPTION_PLANS;
  });

  // Platform Demo Stats State (Admin controllable)
  const [platformStats, setPlatformStats] = useState<PlatformDemoStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PLATFORM_STATS;
      }
    }
    return INITIAL_PLATFORM_STATS;
  });

  // Active Positions (Starts empty, no pre-populated demo history)
  const [activePositions, setActivePositions] = useState<ActivePosition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSITIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ACTIVE_POSITIONS;
      }
    }
    return INITIAL_ACTIVE_POSITIONS;
  });

  // Transactions (Starts empty, no pre-populated demo history)
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // UI Preferences & Interactive Calculator State
  const [useBengaliDigits, setUseBengaliDigits] = useState<boolean>(true);
  const [calcAmounts, setCalcAmounts] = useState<Record<string, number>>({
    'starter-7d': 3000,
    'growth-15d': 15000,
    'sovereign-30d': 50000,
  });

  // Modal States
  const [gatewayModal, setGatewayModal] = useState<{
    isOpen: boolean;
    mode: 'deposit' | 'withdraw';
    gateway: 'bkash' | 'nagad';
  }>({
    isOpen: false,
    mode: 'deposit',
    gateway: 'bkash',
  });

  const [selectedPlanForModal, setSelectedPlanForModal] = useState<{
    plan: OptionPlan | null;
    amount: number;
  }>({
    plan: null,
    amount: 0,
  });

  const [auditModalTxId, setAuditModalTxId] = useState<string | null>(null);

  // Transaction History Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'withdraw' | 'deposit' | 'yield'>('all');
  const [gatewayFilter, setGatewayFilter] = useState<'all' | GatewayType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedTrxRow, setCopiedTrxRow] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(platformStats));
  }, [platformStats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(activePositions));
  }, [activePositions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  const showToast = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => {
      setBannerNotice((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const getCurrentTimestampBn = () => {
    const now = new Date();
    const hours = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, '0');
    const period =
      hours < 12 ? 'সকাল' : hours < 15 ? 'দুপুর' : hours < 18 ? 'বিকাল' : 'রাত';
    const h12 = hours % 12 || 12;
    return `০৬ অক্টোবর ২০২৬, ${period} ${toBengaliDigits(String(h12).padStart(2, '0'))}:${toBengaliDigits(mins)}`;
  };

  // Auth Handlers
  const handleLogin = (username: string, password: string): string | null => {
    if (username === 'admin2929' && password === 'admin2929@@') {
      const adminObj = users.find((u) => u.username === 'admin2929') || DEFAULT_ADMIN_USER;
      setCurrentUserId(adminObj.id);
      return null;
    }

    const found = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!found) {
      return 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়। নতুন ইউজার হলে রেজিস্টার ট্যাবে গিয়ে অ্যাকাউন্ট খুলুন।';
    }
    setCurrentUserId(found.id);
    return null;
  };

  const handleRegister = (
    username: string,
    password: string,
    confirmPassword: string
  ): string | null => {
    if (username.length < 3) {
      return 'ইউজারনেম অন্তত ৩ অক্ষরের হতে হবে।';
    }
    if (password.length < 4) {
      return 'পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।';
    }
    if (password !== confirmPassword) {
      return 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।';
    }
    const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return 'এই ইউজারনেম দিয়ে ইতিমধ্যে একটি ডেমো অ্যাকাউন্ট খোলা হয়েছে।';
    }

    const newUser: DemoUser = {
      id: `user-${Date.now()}`,
      username,
      password,
      balance: 0,
      createdAt: getCurrentTimestampBn(),
      role: 'user',
    };

    setUsers((prev) => [...prev, newUser]);
    setPlatformStats((prev) => ({
      ...prev,
      totalDemoMembers: prev.totalDemoMembers + 1,
    }));
    setCurrentUserId(newUser.id);
    return null;
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setBannerNotice(null);
  };

  // Admin Handlers
  const handleAdminUpdateUserBalance = (
    userId: string,
    deltaAmount: number,
    reasonBn: string
  ) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const newBal = Math.max(0, targetUser.balance + deltaAmount);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, balance: newBal } : u))
    );

    const timestamp = getCurrentTimestampBn();
    const trxId = generateTrxId('wallet');
    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      userId: targetUser.id,
      username: targetUser.username,
      trxId,
      type: deltaAmount >= 0 ? 'deposit' : 'withdraw',
      gateway: 'wallet',
      amount: Math.abs(deltaAmount),
      fee: 0,
      netAmount: Math.abs(deltaAmount),
      mobileNumber: 'অ্যাডমিন কন্ট্রোল (ডেমো)',
      accountType: 'internal',
      status: 'completed',
      createdAt: timestamp,
      verifiedAt: timestamp,
      noteBn: reasonBn,
      balanceAfter: newBal,
      securityHash: generateSecurityHash(trxId, Math.abs(deltaAmount), targetUser.username),
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleAdminUpdatePlanInterest = (
    planId: string,
    newTotalRoiPercent: number,
    newDurationDays: number
  ) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const daily = Number((newTotalRoiPercent / newDurationDays).toFixed(2));
        return {
          ...p,
          totalRoiPercent: newTotalRoiPercent,
          durationDays: newDurationDays,
          dailyRoiPercent: daily,
          subtitleBn: `${toBengaliDigits(newDurationDays)} দিনে ${toBengaliDigits(
            newTotalRoiPercent
          )}% ডেমো রিটার্ন সিমুলেশন`,
          capitalReturnBn: `${toBengaliDigits(
            newDurationDays
          )} দিন শেষে ডেমো মূলধন ও ${toBengaliDigits(newTotalRoiPercent)}% মুনাফা ফেরত`,
        };
      })
    );
  };

  const handleAdminApproveTransaction = (txId: string) => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx || targetTx.status !== 'pending') return;

    const timestamp = getCurrentTimestampBn();
    const targetUser = users.find((u) => u.id === targetTx.userId);
    const updatedBalance = targetUser
      ? targetUser.balance + targetTx.amount
      : targetTx.balanceAfter;

    if (targetUser && targetTx.type === 'deposit') {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, balance: updatedBalance } : u))
      );
    }

    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId
          ? {
              ...tx,
              status: 'completed',
              verifiedAt: timestamp,
              balanceAfter: updatedBalance,
              noteBn: 'ভার্চুয়াল ডেমো ডিপোজিট অনুমোদিত',
            }
          : tx
      )
    );
  };

  // Current User Filtered Data
  const userPositions = useMemo(
    () =>
      currentUser
        ? activePositions.filter((p) => p.userId === currentUser.id)
        : [],
    [activePositions, currentUser]
  );

  const userTransactions = useMemo(
    () =>
      currentUser
        ? transactions.filter((t) => t.userId === currentUser.id)
        : [],
    [transactions, currentUser]
  );

  const walletBalance = currentUser?.balance ?? 0;

  const activeInvestedCapital = useMemo(
    () =>
      userPositions
        .filter((p) => p.status === 'active')
        .reduce((sum, p) => sum + p.investedAmount, 0),
    [userPositions]
  );

  const totalPortfolioValue = walletBalance + activeInvestedCapital;

  const totalDailyYieldRate = useMemo(
    () =>
      userPositions
        .filter((p) => p.status === 'active')
        .reduce((sum, p) => sum + p.dailyProfit, 0),
    [userPositions]
  );

  const totalEarnedProfit = useMemo(
    () => userPositions.reduce((sum, p) => sum + p.accruedProfit, 0),
    [userPositions]
  );

  // User Actions
  const handleRequestDemoDeposit = (amount: number) => {
    if (!currentUser) return;
    const timestamp = getCurrentTimestampBn();
    const trxId = generateTrxId('wallet');
    const newBalance = currentUser.balance + amount;

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, balance: newBalance } : u))
    );

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      trxId,
      type: 'deposit',
      gateway: 'wallet',
      amount,
      fee: 0,
      netAmount: amount,
      mobileNumber: 'ভার্চুয়াল ডেমো ক্রেডিট',
      accountType: 'internal',
      status: 'completed',
      createdAt: timestamp,
      verifiedAt: timestamp,
      noteBn: 'ভার্চুয়াল ডেমো ব্যালেন্স যুক্ত করা হয়েছে',
      balanceAfter: newBalance,
      securityHash: generateSecurityHash(trxId, amount, currentUser.username),
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(
      `আপনার ডেমো অ্যাকাউন্টে +${formatBDT(amount, useBengaliDigits)} ভার্চুয়াল ডেমো ব্যালেন্স যোগ হয়েছে।`
    );
  };

  // Withdraw: Immediately deducts from main balance and logs in Withdraw History
  const handleWithdrawSubmit = ({
    gateway,
    amount,
    mobileNumber,
    accountType,
  }: {
    gateway: 'bkash' | 'nagad';
    amount: number;
    mobileNumber: string;
    accountType: 'personal' | 'agent';
  }) => {
    if (!currentUser) return;
    const timestamp = getCurrentTimestampBn();
    const newBalance = Math.max(0, currentUser.balance - amount);
    const trxId = generateTrxId(gateway);
    const gwName = GATEWAY_CONFIG[gateway].nameBn;
    const accTypeBn = accountType === 'personal' ? 'পার্সোনাল' : 'এজেন্ট';

    // Immediately deduct from user's main balance
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, balance: newBalance } : u))
    );

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      trxId,
      type: 'withdraw',
      gateway,
      amount,
      fee: 0,
      netAmount: amount,
      mobileNumber,
      accountType,
      status: 'completed',
      createdAt: timestamp,
      verifiedAt: timestamp,
      noteBn: `${gwName} ${accTypeBn} নম্বরে ডেমো উত্তোলন সম্পন্ন (মেইন ব্যালেন্স থেকে কর্তনকৃত)`,
      balanceAfter: newBalance,
      securityHash: generateSecurityHash(trxId, amount, mobileNumber),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setTypeFilter('withdraw');
    showToast(
      `${formatBDT(amount, useBengaliDigits)} আপনার মেইন ব্যালেন্স থেকে সাথে সাথে কেটে নেওয়া হয়েছে এবং উত্তোলন হিস্ট্রিতে যুক্ত হয়েছে (TrxID: ${trxId})।`
    );
  };

  const handleConfirmActivatePlan = (plan: OptionPlan, amount: number) => {
    if (!currentUser) return;
    const timestamp = getCurrentTimestampBn();
    const newBalance = Math.max(0, currentUser.balance - amount);
    const totalExpectedProfit = Math.round((amount * plan.totalRoiPercent) / 100);
    const dailyProfit = Math.round(totalExpectedProfit / plan.durationDays);
    const trxId = generateTrxId('wallet');

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, balance: newBalance } : u))
    );

    const newPosition: ActivePosition = {
      id: `pos-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      planId: plan.id,
      planNameBn: `${plan.nameBn} (${toBengaliDigits(plan.totalRoiPercent)}% ডেমো মুনাফা)`,
      investedAmount: amount,
      dailyProfit,
      totalExpectedProfit,
      durationDays: plan.durationDays,
      daysElapsed: 0,
      accruedProfit: 0,
      startedAt: timestamp,
      status: 'active',
      lastPayoutAt: timestamp,
    };

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      trxId,
      type: 'invest',
      gateway: 'wallet',
      amount,
      fee: 0,
      netAmount: amount,
      mobileNumber: 'অভ্যন্তরীণ ডেমো লেজার',
      accountType: 'internal',
      status: 'completed',
      createdAt: timestamp,
      verifiedAt: timestamp,
      noteBn: `${plan.nameBn} (${toBengaliDigits(plan.durationDays)} দিন · মোট ${toBengaliDigits(
        plan.totalRoiPercent
      )}% ডেমো মুনাফা) চালু করা হয়েছে`,
      balanceAfter: newBalance,
      securityHash: generateSecurityHash(trxId, amount, currentUser.username),
      relatedPlanNameBn: plan.nameBn,
    };

    setActivePositions((prev) => [newPosition, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);
    showToast(
      `${plan.nameBn}-এ ${formatBDT(amount, useBengaliDigits)} ডেমো বিনিয়োগ সফলভাবে সক্রিয় হয়েছে।`
    );
  };

  const handleSimulateNextDay = () => {
    if (!currentUser) return;
    const activeList = userPositions.filter((p) => p.status === 'active');
    if (activeList.length === 0) {
      showToast('বর্তমানে আপনার কোনো সক্রিয় ডেমো প্ল্যান নেই। নিচের যেকোনো একটি ডেমো প্ল্যান চালু করুন।');
      return;
    }

    const timestamp = getCurrentTimestampBn();
    let totalProfitAdded = 0;
    let totalPrincipalReturned = 0;
    const maturedNames: string[] = [];

    const updatedPositions = activePositions.map((pos) => {
      if (pos.userId !== currentUser.id || pos.status !== 'active') return pos;
      const nextDays = pos.daysElapsed + 1;
      const isNowMatured = nextDays >= pos.durationDays;

      totalProfitAdded += pos.dailyProfit;
      if (isNowMatured) {
        totalPrincipalReturned += pos.investedAmount;
        maturedNames.push(pos.planNameBn);
      }

      return {
        ...pos,
        daysElapsed: nextDays,
        accruedProfit: pos.accruedProfit + pos.dailyProfit,
        status: isNowMatured ? ('matured' as const) : ('active' as const),
        lastPayoutAt: timestamp,
      };
    });

    const newBalanceAfterProfit =
      currentUser.balance + totalProfitAdded + totalPrincipalReturned;
    const profitTrxId = generateTrxId('wallet');

    const newRecords: TransactionRecord[] = [
      {
        id: `tx-profit-${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        trxId: profitTrxId,
        type: 'profit',
        gateway: 'wallet',
        amount: totalProfitAdded,
        fee: 0,
        netAmount: totalProfitAdded,
        mobileNumber: 'অভ্যন্তরীণ ডেমো লেজার',
        accountType: 'internal',
        status: 'completed',
        createdAt: timestamp,
        verifiedAt: timestamp,
        noteBn: `${toBengaliDigits(activeList.length)}টি সক্রিয় ডেমো প্ল্যান থেকে দৈনিক মুনাফা জমা`,
        balanceAfter: currentUser.balance + totalProfitAdded,
        securityHash: generateSecurityHash(profitTrxId, totalProfitAdded, currentUser.username),
      },
    ];

    if (totalPrincipalReturned > 0) {
      const matTrxId = generateTrxId('wallet');
      newRecords.unshift({
        id: `tx-mat-${Date.now() + 1}`,
        userId: currentUser.id,
        username: currentUser.username,
        trxId: matTrxId,
        type: 'maturity',
        gateway: 'wallet',
        amount: totalPrincipalReturned,
        fee: 0,
        netAmount: totalPrincipalReturned,
        mobileNumber: 'অভ্যন্তরীণ ডেমো লেজার',
        accountType: 'internal',
        status: 'completed',
        createdAt: timestamp,
        verifiedAt: timestamp,
        noteBn: `মেয়াদ পূর্ণ হওয়ায় ডেমো মূলধন ফেরত (${maturedNames.join(', ')})`,
        balanceAfter: newBalanceAfterProfit,
        securityHash: generateSecurityHash(matTrxId, totalPrincipalReturned, currentUser.username),
      });
    }

    setActivePositions(updatedPositions);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, balance: newBalanceAfterProfit } : u
      )
    );
    setTransactions((prev) => [...newRecords, ...prev]);

    showToast(
      `+১ দিন ডেমো সিমুলেশন সম্পন্ন: মুনাফা +${formatBDT(
        totalProfitAdded,
        useBengaliDigits
      )} আপনার মেইন ব্যালেন্সে যুক্ত হয়েছে!`
    );
  };

  const filteredTransactions = useMemo(() => {
    return userTransactions.filter((tx) => {
      if (typeFilter === 'withdraw' && tx.type !== 'withdraw') return false;
      if (typeFilter === 'deposit' && tx.type !== 'deposit') return false;
      if (
        typeFilter === 'yield' &&
        tx.type !== 'invest' &&
        tx.type !== 'profit' &&
        tx.type !== 'maturity'
      ) {
        return false;
      }

      if (gatewayFilter !== 'all' && tx.gateway !== gatewayFilter) return false;

      if (searchQuery.trim() !== '') {
        const q = toEnglishDigits(searchQuery.trim()).toLowerCase();
        const matchTrx = tx.trxId.toLowerCase().includes(q);
        const matchMobile = toEnglishDigits(tx.mobileNumber).toLowerCase().includes(q);
        const matchNote = tx.noteBn.toLowerCase().includes(q);
        return matchTrx || matchMobile || matchNote;
      }

      return true;
    });
  }, [userTransactions, typeFilter, gatewayFilter, searchQuery]);

  const activeAuditTransaction = useMemo(
    () => transactions.find((t) => t.id === auditModalTxId) || null,
    [transactions, auditModalTxId]
  );

  const handleCopyRowTrx = (trxId: string) => {
    navigator.clipboard.writeText(trxId);
    setCopiedTrxRow(trxId);
    setTimeout(() => setCopiedTrxRow(null), 1800);
  };

  // 1. If not logged in, render AuthView
  if (!currentUser) {
    return <AuthView onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // 2. If logged in as Admin (admin2929), render AdminDashboard
  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        users={users}
        plans={plans}
        platformStats={platformStats}
        transactions={transactions}
        useBengaliDigits={useBengaliDigits}
        onUpdateUserBalance={handleAdminUpdateUserBalance}
        onUpdatePlanInterest={handleAdminUpdatePlanInterest}
        onUpdatePlatformStats={setPlatformStats}
        onApproveTransaction={handleAdminApproveTransaction}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Regular Logged-in Demo User View
  return (
    <div className="min-h-screen bg-[#07110E] text-[#F0FDF4] flex flex-col">
      {/* Top Bar Contract: Strict 1-Row, 3-Zone Header */}
      <header className="sticky top-0 z-30 bg-[#07110E]/90 backdrop-blur-md border-b border-emerald-500/15">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single Text Element Brand Wordmark */}
          <a
            href="#portfolio"
            className="font-display text-2xl font-bold tracking-tight text-[#F0FDF4] whitespace-nowrap shrink-0"
          >
            অর্থধারা (ডেমো)
          </a>

          {/* Zone 2: Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#94A3B8]">
            <a
              href="#portfolio"
              className="hover:text-[#F0FDF4] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              পোর্টফোলিও
            </a>
            <a
              href="#plans"
              className="hover:text-[#F0FDF4] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              ডেমো প্ল্যান
            </a>
            <a
              href="#active-positions"
              className="hover:text-[#F0FDF4] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              সক্রিয় বিনিয়োগ
            </a>
            <a
              href="#ledger"
              className="hover:text-[#F0FDF4] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              উত্তোলন ও লেনদেন হিস্ট্রি
            </a>
          </nav>

          {/* Zone 3: Primary Actions (Deposit, Withdraw & Logout) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setGatewayModal({ isOpen: true, mode: 'deposit', gateway: 'bkash' })
              }
              className="py-2 px-3.5 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#042F2E] font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              + ডিপোজিট (ডেমো)
            </button>
            <button
              type="button"
              onClick={() =>
                setGatewayModal({ isOpen: true, mode: 'withdraw', gateway: 'bkash' })
              }
              className="py-2 px-3.5 rounded-lg bg-[#132922] hover:bg-emerald-500/20 text-[#F0FDF4] border border-emerald-500/25 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              উত্তোলন
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="লগআউট"
              className="p-2 rounded-lg bg-[#0D1D18] hover:bg-red-500/20 text-[#94A3B8] hover:text-white border border-emerald-500/15 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Persistent Educational Demo Disclaimer Banner */}
      <div className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-2 flex items-center gap-2 text-xs text-[#F0FDF4]">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>{platformStats.noticeBn}</span>
        </div>
      </div>

      {/* Live Action Notification Toast */}
      {bannerNotice && (
        <div className="bg-[#132922] border-b border-emerald-500/30">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 text-xs sm:text-sm text-[#F0FDF4]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>{bannerNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerNotice(null)}
              className="text-xs text-[#94A3B8] hover:text-white whitespace-nowrap"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* SECTION 1: Portfolio Summary & Platform Overview */}
        <section id="portfolio" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs text-[#10B981] font-medium tracking-wide">
                ইউজার অ্যাকাউন্ট: {currentUser.username} · শিক্ষামূলক ডেমো সিমুলেটর
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F0FDF4] mt-1">
                আপনার ডেমো পোর্টফোলিও ও ওয়ালেট সারসংক্ষেপ
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleSimulateNextDay}
                className="inline-flex items-center gap-2 py-2 px-3.5 rounded-lg bg-[#132922] hover:bg-emerald-500/20 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+১ দিনের ডেমো মুনাফা যোগ করুন</span>
              </button>

              <button
                type="button"
                onClick={() => setUseBengaliDigits(!useBengaliDigits)}
                className="py-2 px-3 rounded-lg bg-[#0D1D18] hover:bg-[#132922] text-[#94A3B8] hover:text-[#F0FDF4] border border-emerald-500/15 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                সংখ্যা: {useBengaliDigits ? 'বাংলা (১২৩)' : 'English (123)'}
              </button>
            </div>
          </div>

          {/* Single-Elevation Portfolio Metrics Strip */}
          <div className="rounded-xl bg-[#0D1D18] border border-emerald-500/15 divide-y md:divide-y-0 md:divide-x divide-emerald-500/15 grid grid-cols-1 md:grid-cols-4">
            <div className="p-6">
              <div className="text-xs text-[#94A3B8]">মেইন ওয়ালেট ব্যালেন্স (ডেমো)</div>
              <div className="text-3xl font-bold text-[#10B981] tabular-nums tracking-tight mt-2">
                {formatBDT(walletBalance, useBengaliDigits)}
              </div>
              <div className="text-xs text-[#94A3B8] mt-2">
                মোট পোর্টফোলিও: {formatBDT(totalPortfolioValue, useBengaliDigits)}
              </div>
            </div>

            <div className="p-6">
              <div className="text-xs text-[#94A3B8]">সক্রিয় ডেমো বিনিয়োগ</div>
              <div className="text-2xl font-bold text-[#F0FDF4] tabular-nums mt-2">
                {formatBDT(activeInvestedCapital, useBengaliDigits)}
              </div>
              <div className="text-xs text-[#94A3B8] mt-2">
                দৈনিক ডেমো মুনাফা: +{formatBDT(totalDailyYieldRate, useBengaliDigits)}
              </div>
            </div>

            <div className="p-6">
              <div className="text-xs text-[#94A3B8]">প্ল্যাটফর্ম মোট ডেমো আয়</div>
              <div className="text-2xl font-bold text-[#D4AF37] tabular-nums mt-2">
                {formatBDT(platformStats.totalDemoIncome + totalEarnedProfit, useBengaliDigits)}
              </div>
              <div className="text-xs text-[#94A3B8] mt-2">
                আপনার অর্জিত ডেমো মুনাফা: +{formatBDT(totalEarnedProfit, useBengaliDigits)}
              </div>
            </div>

            <div className="p-6">
              <div className="text-xs text-[#94A3B8]">প্ল্যাটফর্ম মোট ডেমো মেম্বার</div>
              <div className="text-2xl font-bold text-[#F0FDF4] tabular-nums mt-2">
                {useBengaliDigits
                  ? toBengaliDigits(platformStats.totalDemoMembers)
                  : platformStats.totalDemoMembers}{' '}
                <span className="text-sm font-normal text-[#94A3B8]">জন</span>
              </div>
              <div className="text-xs text-[#94A3B8] mt-2">
                সক্রিয় ডেমো সিমুলেশন অ্যাকাউন্ট
              </div>
            </div>
          </div>

          {/* Dedicated Deposit & Withdraw Action Bar */}
          <div className="rounded-xl bg-[#0D1D18] border border-emerald-500/15 p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2.5">
                <BkashMark className="w-8 h-8" />
                <NagadMark className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#F0FDF4]">
                  ভার্চুয়াল ডেমো ডিপোজিট এবং তাৎক্ষণিক ডেমো উত্তোলন (বিকাশ ও নগদ সিমুলেশন)
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  উত্তোলন করার সাথে সাথে মেইন ডেমো ব্যালেন্স থেকে টাকা কেটে উত্তোলন হিস্ট্রিতে যুক্ত হবে
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <button
                type="button"
                onClick={() =>
                  setGatewayModal({ isOpen: true, mode: 'deposit', gateway: 'bkash' })
                }
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#042F2E] text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>ডিপোজিট প্যানেল (ডেমো)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setGatewayModal({ isOpen: true, mode: 'withdraw', gateway: 'bkash' })
                }
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#E2136E] hover:bg-[#c81061] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>বিকাশ উত্তোলন (ডেমো)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setGatewayModal({ isOpen: true, mode: 'withdraw', gateway: 'nagad' })
                }
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#F7941D] hover:bg-[#e08312] text-[#07110E] text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>নগদ উত্তোলন (ডেমো)</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: Option Investment Plans (বিনিয়োগ প্ল্যানসমূহ) */}
        <section id="plans" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F0FDF4]">
                নির্বাচিত ডেমো বিনিয়োগ প্ল্যানসমূহ
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
                স্লাইডার পরিবর্তন করে সম্ভাব্য ডেমো মুনাফা হিসাব করুন
              </p>
            </div>
            <div className="text-xs text-[#94A3B8]">
              শিক্ষামূলক ডেমো সিমুলেটর · কোনো প্রকৃত অর্থ নয়
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => {
              const currentAmount = calcAmounts[plan.id] ?? plan.defaultCalcAmount;
              const totalProfit = Math.round((currentAmount * plan.totalRoiPercent) / 100);
              const dailyReturn = Math.round(totalProfit / plan.durationDays);
              const totalPayout = currentAmount + totalProfit;

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl bg-[#0D1D18] p-6 flex flex-col justify-between transition-colors ${
                    plan.featured
                      ? 'border-2 border-[#10B981]/60'
                      : 'border border-emerald-500/15 hover:border-emerald-500/35'
                  }`}
                >
                  <div className="space-y-5">
                    <div>
                      <div className="text-xs text-[#10B981] font-medium">
                        ০{toBengaliDigits(idx + 1)}. {plan.audienceBn}
                        {plan.featured ? ' · সর্বাধিক নির্বাচিত' : ''}
                      </div>
                      <h3 className="font-display text-xl font-bold text-[#F0FDF4] mt-1">
                        {plan.nameBn}
                      </h3>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{plan.subtitleBn}</p>
                    </div>

                    <div className="py-3.5 border-t border-b border-emerald-500/15 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-[#94A3B8]">মোট ডেমো মুনাফা</div>
                        <div className="text-2xl font-bold text-[#10B981] tabular-nums mt-0.5">
                          {useBengaliDigits
                            ? toBengaliDigits(plan.totalRoiPercent)
                            : plan.totalRoiPercent}
                          %
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#94A3B8]">প্ল্যানের মেয়াদ</div>
                        <div className="text-2xl font-bold text-[#F0FDF4] tabular-nums mt-0.5">
                          {useBengaliDigits
                            ? toBengaliDigits(plan.durationDays)
                            : plan.durationDays}{' '}
                          <span className="text-sm font-normal text-[#94A3B8]">দিন</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8]">ডেমো বিনিয়োগ পরিমাণ</span>
                        <span className="font-mono font-bold text-sm text-[#F0FDF4] tabular-nums">
                          {formatBDT(currentAmount, useBengaliDigits)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={plan.minAmount}
                        max={plan.maxAmount}
                        step={500}
                        value={currentAmount}
                        onChange={(e) =>
                          setCalcAmounts((prev) => ({
                            ...prev,
                            [plan.id]: Number(e.target.value),
                          }))
                        }
                        aria-label={`${plan.nameBn} বিনিয়োগ পরিমাণ স্লাইডার`}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-[11px] text-[#64748B] tabular-nums">
                        <span>সর্বনিম্ন {formatBDT(plan.minAmount, useBengaliDigits)}</span>
                        <span>সর্বোচ্চ {formatBDT(plan.maxAmount, useBengaliDigits)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">দৈনিক ডেমো আয়</span>
                        <span className="font-mono font-semibold text-[#10B981] tabular-nums">
                          +{formatBDT(dailyReturn, useBengaliDigits)} / দিন
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">
                          {useBengaliDigits ? toBengaliDigits(plan.durationDays) : plan.durationDays}{' '}
                          দিনে মোট ডেমো লভ্যাংশ ({useBengaliDigits ? toBengaliDigits(plan.totalRoiPercent) : plan.totalRoiPercent}%)
                        </span>
                        <span className="font-mono font-semibold text-[#D4AF37] tabular-nums">
                          +{formatBDT(totalProfit, useBengaliDigits)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-emerald-500/15 text-sm">
                        <span className="font-medium text-[#F0FDF4]">মোট ডেমো প্রাপ্য</span>
                        <span className="font-mono font-bold text-[#F0FDF4] tabular-nums">
                          {formatBDT(totalPayout, useBengaliDigits)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPlanForModal({ plan, amount: currentAmount })
                      }
                      className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap ${
                        plan.featured
                          ? 'bg-[#10B981] hover:bg-[#34D399] text-[#042F2E]'
                          : 'bg-[#132922] hover:bg-[#10B981] text-[#F0FDF4] hover:text-[#042F2E] border border-emerald-500/25'
                      }`}
                    >
                      ডেমো প্ল্যান চালু করুন ({formatBDT(currentAmount, useBengaliDigits)})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Active Investments */}
        <section id="active-positions" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-bold text-[#F0FDF4]">
                আপনার সক্রিয় ডেমো পোর্টফোলিও
              </h2>
              <p className="text-xs text-[#94A3B8]">
                চলমান ডেমো বিনিয়োগ প্ল্যানের মেয়াদ ও অর্জিত মুনাফার অগ্রগতি
              </p>
            </div>
            <button
              type="button"
              onClick={handleSimulateNextDay}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] hover:underline cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>সব সক্রিয় প্ল্যানে +১ দিনের ডেমো মুনাফা যোগ করুন</span>
            </button>
          </div>

          <div className="rounded-xl bg-[#0D1D18] border border-emerald-500/15 divide-y divide-emerald-500/15">
            {userPositions.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm text-[#94A3B8]">
                  আপনার কোনো সক্রিয় ডেমো বিনিয়োগ প্ল্যান নেই। উপরের তালিকা থেকে একটি ডেমো প্ল্যান চালু করুন।
                </p>
              </div>
            ) : (
              userPositions.map((pos) => {
                const progressPercent = Math.min(
                  100,
                  Math.round((pos.daysElapsed / pos.durationDays) * 100)
                );

                return (
                  <div
                    key={pos.id}
                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                        <span className="font-medium text-[#10B981]">
                          {pos.status === 'active' ? 'সক্রিয় ডেমো প্ল্যান' : 'মেয়াদ পূর্ণ হয়েছে'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>শুরু: {pos.startedAt}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#F0FDF4]">{pos.planNameBn}</h3>
                      <div className="text-xs text-[#94A3B8]">
                        মূলধন:{' '}
                        <span className="font-mono text-[#F0FDF4]">
                          {formatBDT(pos.investedAmount, useBengaliDigits)}
                        </span>
                        {' · '}
                        দৈনিক মুনাফা:{' '}
                        <span className="font-mono text-[#10B981]">
                          +{formatBDT(pos.dailyProfit, useBengaliDigits)}
                        </span>
                        {' · '}
                        মোট অর্জিত:{' '}
                        <span className="font-mono text-[#D4AF37]">
                          +{formatBDT(pos.accruedProfit, useBengaliDigits)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full lg:w-72 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8] inline-flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>
                            মেয়াদ অগ্রগতি: দিন{' '}
                            {useBengaliDigits ? toBengaliDigits(pos.daysElapsed) : pos.daysElapsed} /{' '}
                            {useBengaliDigits ? toBengaliDigits(pos.durationDays) : pos.durationDays}
                          </span>
                        </span>
                        <span className="font-mono text-[#F0FDF4] tabular-nums">
                          {useBengaliDigits ? toBengaliDigits(progressPercent) : progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#07110E] overflow-hidden border border-emerald-500/15">
                        <div
                          className="h-full bg-[#10B981] transition-all duration-200"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* SECTION 4: Withdraw & Transaction History (উত্তোলন ও লেনদেন হিস্ট্রি) */}
        <section id="ledger" className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#10B981] font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>উত্তোলন ও লেনদেন ট্র্যাকিং হিস্ট্রি (ডেমো লেজার)</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F0FDF4] mt-1">
                আপনার উত্তোলন ও লেনদেন বিবরণী
              </h2>
            </div>
          </div>

          {/* Filter & Search Control Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0D1D18] rounded-lg border border-emerald-500/15">
              {[
                { id: 'all', label: 'সব লেনদেন' },
                { id: 'withdraw', label: 'উত্তোলন হিস্ট্রি (Withdraw)' },
                { id: 'deposit', label: 'ডিপোজিট' },
                { id: 'yield', label: 'বিনিয়োগ ও মুনাফা' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id as typeof typeFilter)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    typeFilter === tab.id
                      ? 'bg-[#10B981] text-[#042F2E] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F0FDF4]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex items-center gap-1 p-1 bg-[#0D1D18] rounded-lg border border-emerald-500/15">
                {[
                  { id: 'all', label: 'সব মাধ্যম' },
                  { id: 'bkash', label: 'বিকাশ' },
                  { id: 'nagad', label: 'নগদ' },
                ].map((gw) => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setGatewayFilter(gw.id as typeof gatewayFilter)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      gatewayFilter === gw.id
                        ? 'bg-[#132922] text-[#F0FDF4] border border-emerald-500/30'
                        : 'text-[#94A3B8] hover:text-[#F0FDF4]'
                    }`}
                  >
                    {gw.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="TrxID বা নম্বর খুঁজুন..."
                  aria-label="লেনদেন খুঁজুন"
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#0D1D18] border border-emerald-500/15 text-xs text-[#F0FDF4] placeholder-[#64748B] focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#0D1D18] border border-emerald-500/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-emerald-500/15 text-[12px] text-[#94A3B8] bg-[#07110E]/50">
                    <th className="py-3.5 px-4 font-medium whitespace-nowrap">তারিখ ও বিবরণ</th>
                    <th className="py-3.5 px-4 font-medium whitespace-nowrap">মাধ্যম</th>
                    <th className="py-3.5 px-4 font-medium whitespace-nowrap">নম্বর / উৎস</th>
                    <th className="py-3.5 px-4 font-medium whitespace-nowrap">TrxID</th>
                    <th className="py-3.5 px-4 font-medium text-right whitespace-nowrap">
                      পরিমাণ (৳)
                    </th>
                    <th className="py-3.5 px-4 font-medium whitespace-nowrap">অবস্থা</th>
                    <th className="py-3.5 px-4 font-medium text-right whitespace-nowrap">
                      রসিদ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10 text-xs sm:text-sm">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 px-6 text-center text-[#94A3B8]">
                        এখনও কোনো ডেমো উত্তোলন বা লেনদেন হিস্ট্রি নেই।
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isPositive =
                        tx.type === 'deposit' ||
                        tx.type === 'profit' ||
                        tx.type === 'maturity';

                      return (
                        <tr key={tx.id} className="hover:bg-[#132922]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#F0FDF4]">
                              {getTransactionTypeLabelBn(tx.type)}
                            </div>
                            <div className="text-xs text-[#94A3B8] mt-0.5 max-w-xs truncate">
                              {tx.createdAt} · {tx.noteBn}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <GatewayEmblem gateway={tx.gateway} className="w-5 h-5 shrink-0" />
                              <span className="text-xs font-medium text-[#F0FDF4]">
                                {getGatewayLabelBn(tx.gateway)}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-[#94A3B8] tabular-nums">
                            {useBengaliDigits ? toBengaliDigits(tx.mobileNumber) : tx.mobileNumber}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#F0FDF4]">
                              <span>{tx.trxId}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyRowTrx(tx.trxId)}
                                className="p-1 text-[#94A3B8] hover:text-[#10B981] transition-colors cursor-pointer"
                                title="TrxID কপি করুন"
                              >
                                {copiedTrxRow === tx.trxId ? (
                                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold tabular-nums">
                            <span
                              className={
                                isPositive
                                  ? 'text-[#10B981]'
                                  : tx.type === 'withdraw'
                                  ? 'text-[#D4AF37]'
                                  : 'text-[#F0FDF4]'
                              }
                            >
                              {isPositive ? '+' : '-'}
                              {formatBDT(tx.amount, useBengaliDigits)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {tx.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#10B981]">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>সম্পন্ন (ডেমো)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#F59E0B]">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>অপেক্ষমাণ</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setAuditModalTxId(tx.id)}
                              className="inline-flex items-center gap-1 py-1 px-2.5 rounded bg-[#132922] hover:bg-emerald-500/20 text-[#F0FDF4] border border-emerald-500/25 text-xs font-medium transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>রসিদ</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-emerald-500/15 mt-12 py-6 px-4 sm:px-8 text-xs text-[#94A3B8]">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            অর্থধারা (OrthoDhara) — শিক্ষামূলক ডেমো বিনিয়োগ সিমুলেটর। এখানে কোনো আসল অর্থ লেনদেন হয় না।
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setGatewayModal({ isOpen: true, mode: 'deposit', gateway: 'bkash' })
              }
              className="hover:text-[#F0FDF4] transition-colors cursor-pointer"
            >
              ডেমো ডিপোজিট
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() =>
                setGatewayModal({ isOpen: true, mode: 'withdraw', gateway: 'bkash' })
              }
              className="hover:text-[#F0FDF4] transition-colors cursor-pointer"
            >
              ডেমো উত্তোলন
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleLogout}
              className="hover:text-[#F0FDF4] transition-colors cursor-pointer"
            >
              লগআউট
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DepositWithdrawModal
        isOpen={gatewayModal.isOpen}
        initialMode={gatewayModal.mode}
        initialGateway={gatewayModal.gateway}
        walletBalance={walletBalance}
        useBengaliDigits={useBengaliDigits}
        onClose={() => setGatewayModal((prev) => ({ ...prev, isOpen: false }))}
        onRequestDemoDeposit={handleRequestDemoDeposit}
        onSubmitWithdraw={handleWithdrawSubmit}
      />

      <PlanActivateModal
        plan={selectedPlanForModal.plan}
        initialAmount={selectedPlanForModal.amount}
        walletBalance={walletBalance}
        useBengaliDigits={useBengaliDigits}
        onClose={() => setSelectedPlanForModal({ plan: null, amount: 0 })}
        onConfirmActivate={handleConfirmActivatePlan}
        onOpenDeposit={() =>
          setGatewayModal({ isOpen: true, mode: 'deposit', gateway: 'bkash' })
        }
      />

      <TransactionAuditModal
        transaction={activeAuditTransaction}
        useBengaliDigits={useBengaliDigits}
        onClose={() => setAuditModalTxId(null)}
        onApprovePending={handleAdminApproveTransaction}
      />
    </div>
  );
}
