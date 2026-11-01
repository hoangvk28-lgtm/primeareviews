export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill={inverse ? "#c9a24b" : "#123d33"} />
        <path
          d="M11 23V9h6.2a4.6 4.6 0 0 1 0 9.2H11"
          fill="none"
          stroke={inverse ? "#123d33" : "#c9a24b"}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-display text-xl font-semibold tracking-tight ${inverse ? "text-white" : "text-pine"}`}>
        Primea<span className="text-gold"> Reviews</span>
      </span>
    </span>
  );
}
