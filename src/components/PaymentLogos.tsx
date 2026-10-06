import React from 'react';
import { GatewayType } from '../types/investment';

interface LogoProps {
  className?: string;
}

export const BkashMark: React.FC<LogoProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="36" height="36" rx="8" fill="#E2136E" />
    {/* Stylized origami bird wing inspired by bKash geometry */}
    <path
      d="M16.5 8.5L25.5 14.2L19.8 21.5L16.5 8.5Z"
      fill="#FFFFFF"
      fillOpacity="0.95"
    />
    <path
      d="M10.2 15.5L18.4 13.8L19.8 21.5L11.5 24.8L10.2 15.5Z"
      fill="#F9A8D4"
    />
    <path
      d="M19.8 21.5L27.2 18.8L22.6 27.5L15.4 24.2L19.8 21.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const NagadMark: React.FC<LogoProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="36" height="36" rx="8" fill="#F7941D" />
    {/* Dynamic flame/crest ring inspired by Nagad */}
    <circle cx="18" cy="18.5" r="8.5" stroke="#FFFFFF" strokeWidth="2.5" />
    <path
      d="M15.2 14.5C16.8 11.8 19.8 11.8 21.2 14.5C22.4 16.8 20.5 20.5 18 22.8C15.5 20.5 13.6 16.8 15.2 14.5Z"
      fill="#EA580C"
    />
    <path
      d="M18 11.5L20.4 16.5L18 21.5L15.6 16.5L18 11.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const WalletMark: React.FC<LogoProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="36" height="36" rx="8" fill="#10B981" fillOpacity="0.16" />
    <rect
      x="0.75"
      y="0.75"
      width="34.5"
      height="34.5"
      rx="7.25"
      stroke="#10B981"
      strokeOpacity="0.4"
      strokeWidth="1.5"
    />
    <path
      d="M11 13.5C11 12.1193 12.1193 11 13.5 11H23.5C24.3284 11 25 11.6716 25 12.5C25 13.3284 24.3284 14 23.5 14H13C12.4477 14 12 14.4477 12 15V23C12 23.5523 12.4477 24 13 24H24C24.5523 24 25 23.5523 25 23V16.5C25 15.9477 24.5523 15.5 24 15.5H14.5"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="21.5" cy="19.5" r="1.5" fill="#D4AF37" />
  </svg>
);

export const TelegramMark: React.FC<LogoProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="36" height="36" rx="10" fill="#229ED9" />
    <path
      d="M26.65 10.65L8.95 17.48C7.74 17.96 7.75 18.64 8.73 18.94L13.27 20.36L23.78 13.73C24.28 13.43 24.74 13.59 24.36 13.93L15.84 21.62H15.83L15.84 21.63L15.53 26.32C15.99 26.32 16.19 26.11 16.45 25.86L18.66 23.71L23.26 27.11C24.11 27.58 24.72 27.34 24.93 26.33L27.95 12.11C28.26 10.87 27.48 10.31 26.65 10.65Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const GatewayEmblem: React.FC<{ gateway: GatewayType; className?: string }> = ({
  gateway,
  className = 'w-6 h-6',
}) => {
  if (gateway === 'bkash') return <BkashMark className={className} />;
  if (gateway === 'nagad') return <NagadMark className={className} />;
  return <WalletMark className={className} />;
};
