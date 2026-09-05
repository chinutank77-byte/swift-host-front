export default function UsageBar({ label, current, max, className = "" }) {
  const pct = max === "Unlimited" ? 0 : Math.min(100, Math.round((current / max) * 100));
  const isNearLimit = pct >= 80;

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-text">{label}</span>
        <span className="font-mono text-muted">{current} / {max}</span>
      </div>
      <div className="h-3 rounded-full nm-concave overflow-hidden p-[1px]">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? "bg-danger" : "bg-accent"}`}
          style={{ width: max === "Unlimited" ? "4px" : `${pct}%` }}
        />
      </div>
    </div>
  );
}
