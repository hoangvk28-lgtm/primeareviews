// Primea Score: 0-100 editorial score. Thresholds drive the label and ring colour.
export function scoreLabel(score: number) {
  if (score >= 92) return "Outstanding";
  if (score >= 85) return "Excellent";
  if (score >= 78) return "Very Good";
  return "Good";
}

export function scoreTone(score: number) {
  if (score >= 90) return "text-pine";
  if (score >= 82) return "text-gold-dark";
  return "text-ink-soft";
}

// Primea weights (fixed, see CLAUDE.md section 7).
export const SCORE_WEIGHTS = [
  { key: "performance", label: "Performance", weight: 30 },
  { key: "build", label: "Build & Materials", weight: 20 },
  { key: "usability", label: "Everyday Usability", weight: 20 },
  { key: "value", label: "Value", weight: 20 },
  { key: "owner", label: "Owner Satisfaction", weight: 10 },
] as const;
