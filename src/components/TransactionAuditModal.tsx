import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCheck2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { TransactionRecord } from '../types/investment';
import {
  formatBDT,
  getGatewayLabelBn,
  getStatusLabelBn,
  getTransactionTypeLabelBn,
  toBengaliDigits,
} from '../utils/formatters';
import { GatewayEmblem } from './PaymentLogos';

interface TransactionAuditModalProps {
  transaction: TransactionRecord | null;
  useBengaliDigits: boolean;
  onClose: () => void;
  onApprovePending: (txId: string) => void;
}

export const TransactionAuditModal: React.FC<TransactionAuditModalProps> = ({
  transaction,
  useBengaliDigits,
  onClose,
  onApprovePending,
}) => {
  const [copiedTrx, setCopiedTrx] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!transaction) return null;

  const isPositive =
    transaction.type === 'deposit' ||
    transaction.type === 'profit' ||
    transaction.type === 'maturity';

  const handleCopyTrx = () => {
    navigator.clipboard.writeText(transaction.trxId);
    setCopiedTrx(true);
    setTimeout(() => setCopiedTrx(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(transaction.securityHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadReceipt = () => {
    const content = [
      '====================================================',
      '        অর্থধারা (ORTHODHARA) — ডিজিটাল লেনদেন রসিদ        ',
      '====================================================',
      `ট্রানজেকশন আইডি (TrxID): ${transaction.trxId}`,
      `লেনদেনের ধরন         : ${getTransactionTypeLabelBn(transaction.type)}`,
      `পেমেন্ট গেটওয়ে        : ${getGatewayLabelBn(transaction.gateway)}`,
      `মোবাইল / রেফারেন্স     : ${transaction.mobileNumber}`,
      `টাকার পরিমাণ         : ${formatBDT(transaction.amount, false)} (${formatBDT(transaction.amount, true)})`,
      `বর্তমান অবস্থা        : ${getStatusLabelBn(transaction.status)}`,
      `তারিখ ও সময়         : ${transaction.createdAt}`,
      `যাচাইকরণের সময়       : ${transaction.verifiedAt || 'অপেক্ষমাণ'}`,
      `পরবর্তী ওয়ালেট ব্যালেন্স : ${formatBDT(transaction.balanceAfter, false)}`,
      `সিকিউরিটি লেজার হ্যাশ   : ${transaction.securityHash}`,
      `বিবরণ              : ${transaction.noteBn}`,
      '====================================================',
      'স্বয়ংক্রিয়ভাবে যাচাইকৃত · অর্থধারা সিকিউর লেজার সিস্টেম ২০২৬',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OrthoDhara_Receipt_${transaction.trxId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-xl bg-[#0D1D18] border border-emerald-500/25 shadow-2xl overflow-hidden my-8">
        <div className="h-1.5 w-full bg-[#10B981]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/15">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            <div>
              <h2 id="audit-modal-title" className="text-lg font-bold text-[#F0FDF4]">
                নিরাপদ লেনদেন ট্র্যাকিং ও ডিজিটাল রসিদ
              </h2>
              <p className="text-xs text-[#94A3B8]">
                ক্রিপ্টোগ্রাফিক লেজার অডিট ও গেটওয়ে যাচাইকরণ তথ্য
              </p>
            </div>
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

        <div className="p-6 space-y-5">
          {/* Primary Amount & Status Header */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#07110E] border border-emerald-500/15">
            <div className="flex items-center gap-3">
              <GatewayEmblem gateway={transaction.gateway} className="w-10 h-10 shrink-0" />
              <div>
                <div className="text-xs text-[#94A3B8]">
                  {getTransactionTypeLabelBn(transaction.type)} · {getGatewayLabelBn(transaction.gateway)}
                </div>
                <div
                  className={`text-2xl font-bold tabular-nums mt-0.5 ${
                    isPositive ? 'text-[#10B981]' : 'text-[#F0FDF4]'
                  }`}
                >
                  {isPositive ? '+' : '-'}
                  {formatBDT(transaction.amount, useBengaliDigits)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                {transaction.status === 'completed' ? (
                  <span className="inline-flex items-center gap-1 text-[#10B981]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{getStatusLabelBn(transaction.status)}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#F59E0B]">
                    <Clock className="w-4 h-4" />
                    <span>{getStatusLabelBn(transaction.status)}</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">{transaction.createdAt}</div>
            </div>
          </div>

          {/* 3-Step Verification Audit Trail */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-[#94A3B8]">
              লেনদেন নিরাপত্তা ট্র্যাকিং ধাপসমূহ
            </div>
            <div className="p-4 rounded-lg bg-[#07110E] border border-emerald-500/15 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#F0FDF4]">
                    ১. লেনদেন অনুরোধ নিবন্ধন ও এনক্রিপশন
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    সময়কাল: {transaction.createdAt} · প্রেরক/প্রাপক: {transaction.mobileNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {transaction.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#F0FDF4]">
                    ২. {getGatewayLabelBn(transaction.gateway)} গেটওয়ে TrxID যাচাইকরণ
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    {transaction.status === 'completed'
                      ? `রেফারেন্স ${transaction.trxId} সফলভাবে যাচাইকৃত (${transaction.verifiedAt || transaction.createdAt})`
                      : `রেফারেন্স ${transaction.trxId} যাচাইকরণের অপেক্ষায় রয়েছে`}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {transaction.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#F0FDF4]">
                    ৩. ওয়ালেট ব্যালেন্স সমন্বয় ও অপরিবর্তনীয় লেজার রেকর্ড
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    {transaction.status === 'completed'
                      ? `লেনদেন পরবর্তী ব্যালেন্স: ${formatBDT(transaction.balanceAfter, useBengaliDigits)}`
                      : 'অনুমোদনের পর ওয়ালেট ব্যালেন্সে স্বয়ংক্রিয়ভাবে যুক্ত হবে'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Ledger Attributes */}
          <div className="space-y-2 text-xs border-t border-b border-emerald-500/15 py-3.5">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#94A3B8]">ট্রানজেকশন আইডি (TrxID)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-[#F0FDF4]">{transaction.trxId}</span>
                <button
                  type="button"
                  onClick={handleCopyTrx}
                  className="text-[#10B981] hover:underline inline-flex items-center gap-1"
                >
                  {copiedTrx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTrx ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#94A3B8]">মোবাইল নম্বর / উৎস</span>
              <span className="font-mono text-[#F0FDF4]">
                {useBengaliDigits ? toBengaliDigits(transaction.mobileNumber) : transaction.mobileNumber}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#94A3B8]">সার্ভিস চার্জ / ফি</span>
              <span className="font-mono text-[#10B981]">৳০ (ফ্রি)</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#94A3B8]">বিবরণ</span>
              <span className="text-[#F0FDF4] text-right max-w-xs">{transaction.noteBn}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#94A3B8]">সিকিউরিটি হ্যাশ</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#94A3B8]">{transaction.securityHash}</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-[#10B981] hover:underline"
                  title="হ্যাশ কপি করুন"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Pending Action or Download Action */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {transaction.status === 'pending' && (
              <button
                type="button"
                onClick={() => onApprovePending(transaction.id)}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#042F2E] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>ডেমো ভেরিফাই ও অনুমোদন করুন</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#132922] hover:bg-emerald-500/20 text-[#F0FDF4] border border-emerald-500/25 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#10B981]" />
              <span>অফিসিয়াল রসিদ ডাউনলোড (.txt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
