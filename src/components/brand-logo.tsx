import type { HTMLAttributes } from "react";

type BrandLogoProps = {
  compact?: boolean;
} & HTMLAttributes<HTMLSpanElement>;

export function BrandLogo({ compact = false, className = "", ...props }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()} {...props}>
      <svg
        aria-hidden
        viewBox="0 0 36 36"
        className="h-7 w-7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="32" height="32" rx="9" fill="#E6F3F8" />
        <path d="M9 20.6L15.1 12.8L21 20.6L27 12.8" stroke="#0369A1" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="9" cy="20.6" r="1.8" fill="#0369A1" />
        <circle cx="15.1" cy="12.8" r="1.8" fill="#0369A1" />
        <circle cx="21" cy="20.6" r="1.8" fill="#0369A1" />
        <circle cx="27" cy="12.8" r="1.8" fill="#0369A1" />
      </svg>
      {compact ? null : (
        <span className="leading-tight">
          <span className="block text-base font-semibold tracking-tight text-sky-700">Summa Reu</span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Entitats socials</span>
        </span>
      )}
    </span>
  );
}
