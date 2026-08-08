const SERIES_COLOR = [255, 74, 3];

const OPACITY_MAX = 1;
const OPACITY_MIN = 0.05;

export function seriesColor(rank: number, total: number): string {
  const [r, g, b] = SERIES_COLOR;
  const t = total > 1 ? Math.min(rank - 1, total - 1) / (total - 1) : 0;
  const opacity = OPACITY_MAX * (OPACITY_MIN / OPACITY_MAX) ** t;
  return `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`;
}

export const QUERY_COLOR = "#1f5c9e";

export const INK = {
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  tick: "#6b7280",
  title: "#374151",
  surface: "#fff",
};
