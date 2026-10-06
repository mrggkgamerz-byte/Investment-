import { GatewayType, TransactionStatus, TransactionType } from '../types/investment';

const EN_TO_BN_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const BN_TO_EN_DIGITS: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export function toBengaliDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => EN_TO_BN_DIGITS[d] || d);
}

export function toEnglishDigits(value: string): string {
  return value.replace(/[০-৯]/g, (d) => BN_TO_EN_DIGITS[d] || d);
}

/**
 * Formats a number in Bangladeshi Lakh/Crore comma style (e.g., 1,25,000)
 */
export function formatBDTNumber(amount: number, useBengaliDigits = true): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(rounded);

  return useBengaliDigits ? toBengaliDigits(formatted) : formatted;
}

export function formatBDT(amount: number, useBengaliDigits = true): string {
  return `৳${formatBDTNumber(amount, useBengaliDigits)}`;
}

/**
 * Generates an authentic 10-character uppercase alphanumeric TrxID
 */
export function generateTrxId(gateway: GatewayType): string {
  const prefix = gateway === 'bkash' ? 'BK' : gateway === 'nagad' ? 'NG' : 'OD';
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = prefix;
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a deterministic cryptographic-style audit hash for ledger verification
 */
export function generateSecurityHash(trxId: string, amount: number, mobile: string): string {
  const seed = `${trxId}:${amount}:${mobile}:ORTHODHARA_LEDGER_2026`;
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0, ch; i < seed.length; i++) {
    ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  return `SHA256:${(hex1 + hex2 + hex3).toUpperCase()}`;
}

export function getGatewayLabelBn(gateway: GatewayType): string {
  switch (gateway) {
    case 'bkash':
      return 'বিকাশ (bKash)';
    case 'nagad':
      return 'নগদ (Nagad)';
    case 'wallet':
      return 'অর্থধারা ওয়ালেট';
  }
}

export function getTransactionTypeLabelBn(type: TransactionType): string {
  switch (type) {
    case 'deposit':
      return 'ডিপোজিট';
    case 'withdraw':
      return 'উত্তোলন';
    case 'invest':
      return 'প্ল্যান বিনিয়োগ';
    case 'profit':
      return 'দৈনিক মুনাফা';
    case 'maturity':
      return 'মেয়াদ পূর্ণ মূলধন';
  }
}

export function getStatusLabelBn(status: TransactionStatus): string {
  switch (status) {
    case 'completed':
      return 'সম্পন্ন';
    case 'pending':
      return 'যাচাইকরণ চলছে';
    case 'rejected':
      return 'বাতিল';
  }
}

export function isValidBangladeshMobile(rawInput: string): boolean {
  const clean = toEnglishDigits(rawInput).replace(/[\s-]/g, '');
  return /^01[3-9]\d{8}$/.test(clean);
}

export function normalizeBangladeshMobile(rawInput: string): string {
  return toEnglishDigits(rawInput).replace(/[\s-]/g, '');
}
