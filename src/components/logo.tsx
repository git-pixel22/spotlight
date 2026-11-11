/** The Spotlight mark: a viewfinder that has found its subject. */
export function LogoMark({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path
        d="M3 13V8a5 5 0 0 1 5-5h5M29 19v5a5 5 0 0 1-5 5h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="8" fill="var(--accent)" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}

export function Logo({ className = "", onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${onDark ? "text-white" : "text-ink"} ${className}`}>
      <LogoMark />
      <span className="font-heading text-xl">Spotlight</span>
    </span>
  );
}
