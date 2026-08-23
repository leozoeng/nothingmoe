"use client";

import { GRADES, GRADE_META, gradeToStars, starsToGrade, type Grade } from "@/lib/grades";

export function GradeDisplay({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const grade = starsToGrade(value);
  const meta = GRADE_META[grade];
  const sizeClass =
    size === "sm" ? "grade-badge-sm" : size === "lg" ? "grade-badge-lg" : "grade-badge-md";

  return (
    <span className={`grade-badge ${meta.className} ${sizeClass}`} aria-label={meta.description}>
      {meta.label}
    </span>
  );
}

export function GradePicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (stars: number) => void;
}) {
  const selected = value > 0 ? starsToGrade(value) : null;

  return (
    <div className="grade-picker-field">
      <div className="grade-picker-label-row">
        <span className="grade-picker-label">rank</span>
        <span className="grade-picker-value">
          {selected ? `${selected} rank` : "pick a rank"}
        </span>
      </div>
      <div className="grade-picker" role="group" aria-label="Site rank">
        {GRADES.map((grade) => {
          const meta = GRADE_META[grade];
          const active = selected === grade;

          return (
            <button
              key={grade}
              type="button"
              onClick={() => onChange(gradeToStars(grade))}
              className={`grade-picker-btn ${meta.className} ${active ? "is-active" : ""}`}
              aria-label={`${grade} rank`}
              aria-pressed={active}
            >
              {grade}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function GradeBadge({ grade, size = "md" }: { grade: Grade; size?: "sm" | "md" | "lg" }) {
  const meta = GRADE_META[grade];
  const sizeClass =
    size === "sm" ? "grade-badge-sm" : size === "lg" ? "grade-badge-lg" : "grade-badge-md";

  return (
    <span className={`grade-badge ${meta.className} ${sizeClass}`} aria-label={meta.description}>
      {meta.label}
    </span>
  );
}
