type IconProps = { className?: string; size?: number };

/* The mark: a viewfinder that has found its subject. Two brackets, one disc of light. */
export function Mark({ className, size }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M3 13V8a5 5 0 0 1 5-5h5M29 19v5a5 5 0 0 1-5 5h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="8" fill="#FFCB1F" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}

export function IconInstagram({ className, size }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" fill="none" stroke="#D62976" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#D62976" strokeWidth="2.2" />
      <circle cx="17.3" cy="6.7" r="1.3" fill="#D62976" />
    </svg>
  );
}

export function IconLinkedIn({ className, size }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
      <rect x="6" y="9.6" width="2.6" height="8" fill="#fff" />
      <circle cx="7.3" cy="6.7" r="1.55" fill="#fff" />
      <path
        d="M11 9.6h2.5v1.2c.5-.9 1.5-1.45 2.7-1.45 2 0 2.8 1.3 2.8 3.4v4.85h-2.6v-4.3c0-1.05-.35-1.7-1.25-1.7-1 0-1.55.7-1.55 1.9v4.1H11z"
        fill="#fff"
      />
    </svg>
  );
}

export function IconX({ className, size }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#000"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

export function IconMic({ className, size }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="#14211F" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" fill="none" stroke="#14211F" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck({ className, size }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#FFCB1F" />
      <path d="M7 12.5l3.4 3.4L17 8.8" fill="none" stroke="#14211F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlay({ className, size = 14, fill = "currentColor" }: IconProps & { fill?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2.5 1.2v11.6L12.5 7z" fill={fill} />
    </svg>
  );
}
