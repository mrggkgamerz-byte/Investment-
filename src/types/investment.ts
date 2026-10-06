export type GatewayType = 'bkash' | 'nagad' | 'wallet';

export type TransactionType = 'deposit' | 'withdraw' | 'invest' | 'profit' | 'maturity';

export type TransactionStatus = 'completed' | 'pending' | 'rejected';

export interface OptionPlan {
  id: string;
  nameBn: string;
  subtitleBn: string;
  audienceBn: string;
  durationDays: number;
  dailyRoiPercent: number;
  totalRoiPercent: number;
  minAmount: number;
  maxAmount: number;
  defaultCalcAmount: number;
  payoutScheduleBn: string;
  capitalReturnBn: string;
  featured?: boolean;
}

export interface ActivePosition {
  id: string;
  userId: string;
  username: string;
  planId: string;
  planNameBn: string;
  investedAmount: number;
  dailyProfit: number;
  totalExpectedProfit: number;
  durationDays: number;
  daysElapsed: number;
  accruedProfit: number;
  startedAt: string;
  status: 'active' | 'matured';
  lastPayoutAt: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  username: string;
  trxId: string;
  type: TransactionType;
  gateway: GatewayType;
  amount: number;
  fee: number;
  netAmount: number;
  mobileNumber: string;
  accountType?: 'personal' | 'agent' | 'merchant' | 'internal';
  status: TransactionStatus;
  createdAt: string;
  verifiedAt?: string;
  noteBn: string;
  balanceAfter: number;
  securityHash: string;
  relatedPlanNameBn?: string;
}

export interface DemoUser {
  id: string;
  username: string;
  password: string;
  balance: number;
  createdAt: string;
  role: 'user' | 'admin';
}

export interface PlatformDemoStats {
  totalDemoIncome: number;
  totalDemoMembers: number;
  noticeBn: string;
}
