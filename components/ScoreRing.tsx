import { scoreLabel } from "@/lib/score";

export function ScoreRing({ score, size = 76 }: { score: number; size?: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="flex shrink-0 flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 72 72" width={size} height={size} role="img" aria-label={`Primea Score ${score} out of 100`}>
        <circle cx="36" cy="36" r={r} fill="#fff" stroke="#e7e0d2" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={score >= 90 ? "#123d33" : "#c9a24b"}
          strokeWidth="6"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="42" textAnchor="middle" fontSize="21" fontWeight="700" fill="#1b1a17" fontFamily="Georgia, serif">
          {score}
        </text>
      </svg>
      <span className="mt-1 text-center text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
        {scoreLabel(score)}
      </span>
    </div>
  );
}
