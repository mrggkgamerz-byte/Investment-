import { ActivePosition, OptionPlan, PlatformDemoStats, TransactionRecord } from '../types/investment';

export const GATEWAY_CONFIG = {
  bkash: {
    id: 'bkash' as const,
    nameBn: 'বিকাশ (ডেমো)',
    nameEn: 'bKash Demo',
    colorHex: '#E2136E',
    minDeposit: 500,
    maxDeposit: 200000,
    minWithdraw: 500,
    maxWithdraw: 150000,
    withdrawFeePercent: 0,
  },
  nagad: {
    id: 'nagad' as const,
    nameBn: 'নগদ (ডেমো)',
    nameEn: 'Nagad Demo',
    colorHex: '#F7941D',
    minDeposit: 500,
    maxDeposit: 200000,
    minWithdraw: 500,
    maxWithdraw: 150000,
    withdrawFeePercent: 0,
  },
};

export const INITIAL_PLATFORM_STATS: PlatformDemoStats = {
  totalDemoIncome: 125000,
  totalDemoMembers: 240,
  noticeBn: 'শিক্ষামূলক ডেমো সিমুলেটর সংস্করণ — এখানে প্রদর্শিত সকল ব্যালেন্স ও লেনদেন সম্পূর্ণ ভার্চুয়াল (ডেমো)।',
};

export const OPTION_PLANS: OptionPlan[] = [
  {
    id: 'starter-7d',
    nameBn: 'প্রারম্ভিক ডেমো প্ল্যান',
    subtitleBn: '৭ দিনের ভার্চুয়াল রিটার্ন সিমুলেশন',
    audienceBn: 'স্বল্পমেয়াদী ডেমো প্ল্যান',
    durationDays: 7,
    dailyRoiPercent: 7.14,
    totalRoiPercent: 50,
    minAmount: 500,
    maxAmount: 10000,
    defaultCalcAmount: 3000,
    payoutScheduleBn: 'প্রতি ২৪ ঘণ্টায় ভার্চুয়াল মুনাফা জমা',
    capitalReturnBn: '৭ দিন শেষে ডেমো মূলধন ও মুনাফা ওয়ালেটে ফেরত',
    featured: false,
  },
  {
    id: 'growth-15d',
    nameBn: 'প্রবৃদ্ধি ডেমো প্ল্যান',
    subtitleBn: '১৫ দিনের ভার্চুয়াল রিটার্ন সিমুলেশন',
    audienceBn: 'মধ্যম-মেয়াদী ডেমো প্ল্যান',
    durationDays: 15,
    dailyRoiPercent: 5.0,
    totalRoiPercent: 75,
    minAmount: 5000,
    maxAmount: 50000,
    defaultCalcAmount: 15000,
    payoutScheduleBn: 'প্রতি ২৪ ঘণ্টায় ভার্চুয়াল মুনাফা জমা',
    capitalReturnBn: '১৫ দিন শেষে ডেমো মূলধন ও মুনাফা ওয়ালেটে ফেরত',
    featured: true,
  },
  {
    id: 'sovereign-30d',
    nameBn: 'প্রিমিয়াম ডেমো প্ল্যান',
    subtitleBn: '৩০ দিনের ভার্চুয়াল রিটার্ন সিমুলেশন',
    audienceBn: 'দীর্ঘমেয়াদী ডেমো প্ল্যান',
    durationDays: 30,
    dailyRoiPercent: 3.33,
    totalRoiPercent: 100,
    minAmount: 25000,
    maxAmount: 200000,
    defaultCalcAmount: 50000,
    payoutScheduleBn: 'প্রতি ২৪ ঘণ্টায় ভার্চুয়াল মুনাফা জমা',
    capitalReturnBn: '৩০ দিন শেষে ডেমো মূলধন ও মুনাফা ওয়ালেটে ফেরত',
    featured: false,
  },
];

export const INITIAL_WALLET_BALANCE = 0;

export const INITIAL_ACTIVE_POSITIONS: ActivePosition[] = [];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [];
