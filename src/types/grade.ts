export const GRADES = [
  { value: 0, label: "No retinopathy" },
  { value: 1, label: "Mild" },
  { value: 2, label: "Moderate" },
  { value: 3, label: "Severe" },
  { value: 4, label: "Proliferative DR" },
] as const;

export type GradeValue = (typeof GRADES)[number]["value"];

export const NO_RETINOPATHY_GRADE: GradeValue = 0;
