export const GRADES = ["S", "A", "B", "C", "D"] as const;

export type Grade = (typeof GRADES)[number];

const GRADE_TO_STARS: Record<Grade, number> = {
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  D: 1,
};

const STARS_TO_GRADE: Record<number, Grade> = {
  5: "S",
  4: "A",
  3: "B",
  2: "C",
  1: "D",
};

export function gradeToStars(grade: Grade): number {
  return GRADE_TO_STARS[grade];
}

export function starsToGrade(stars: number): Grade {
  const rounded = Math.min(5, Math.max(1, Math.round(stars)));
  return STARS_TO_GRADE[rounded] ?? "C";
}

export function avgStarsToGrade(avg: number | null): Grade | null {
  if (avg === null || Number.isNaN(avg)) return null;
  return starsToGrade(avg);
}

export function gradeLabel(grade: Grade | null) {
  if (!grade) return "—";
  return grade;
}

export const GRADE_META: Record<
  Grade,
  { label: string; description: string; className: string }
> = {
  S: { label: "S", description: "S rank", className: "grade-s" },
  A: { label: "A", description: "A rank", className: "grade-a" },
  B: { label: "B", description: "B rank", className: "grade-b" },
  C: { label: "C", description: "C rank", className: "grade-c" },
  D: { label: "D", description: "D rank", className: "grade-d" },
};
