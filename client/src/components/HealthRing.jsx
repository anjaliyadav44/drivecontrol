export default function HealthRing({ score = 0, size = 92, label = "Health" }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  const tone = score >= 80 ? "var(--ok)" : score >= 65 ? "var(--copper)" : score >= 40 ? "var(--warn)" : "var(--danger)";
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(14,42,34,0.08)" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="7"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className="ring-label">
        <strong>{score}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
