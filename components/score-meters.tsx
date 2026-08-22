import type { Scores } from "@/lib/scores";
import { SCORE_LABELS } from "@/lib/scores";

export function ScoreMeters({
  scores,
  active = true,
  label = "community census",
  wide = false,
}: {
  scores: Scores;
  active?: boolean;
  label?: string;
  wide?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <p className="font-sans text-[9px] tracking-[0.24em] text-faint uppercase">{label}</p>
      <div
        className={
          wide
            ? "grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4 lg:gap-x-5"
            : "grid grid-cols-2 gap-x-4 gap-y-2"
        }
      >
        {SCORE_LABELS.map(({ key, label: itemLabel }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`font-sans tracking-[0.12em] text-muted uppercase ${
                  wide ? "text-[11px]" : "text-[10px]"
                }`}
              >
                {itemLabel}
              </span>
              <span
                className={`font-sans tabular-nums text-chrome/55 ${
                  wide ? "text-[12px] font-medium" : "text-[10px]"
                }`}
              >
                {scores[key]}
              </span>
            </div>
            <div
              className={`overflow-hidden rounded-full bg-white/[0.06] ${
                wide ? "h-[4px]" : "h-[3px]"
              }`}
            >
              <div
                className="vibe-fill h-full rounded-full bg-gradient-to-r from-white/25 to-white/70"
                style={{ width: active ? `${scores[key]}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
