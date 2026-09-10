export const ANNOTATION_COLORS = [
  "#00a6c7",
  "#2563eb",
  "#7c3aed",
  "#65a30d",
  "#db2777",
] as const;

export function getAnnotationColor(index: number) {
  return ANNOTATION_COLORS[index % ANNOTATION_COLORS.length];
}
