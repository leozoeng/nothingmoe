"use client";

export function StarDisplay({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "star-display-sm" : "star-display-md";

  return (
    <span className={`star-display ${sizeClass}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(value) ? "star-gold" : "star-empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (stars: number) => void;
}) {
  return (
    <div className="star-picker" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`star-picker-btn ${star <= value ? "star-gold is-active" : "star-empty"}`}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          aria-pressed={star <= value}
        >
          ★
        </button>
      ))}
    </div>
  );
}
