export function generateYearTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = span > 200 ? 50 : span > 100 ? 25 : span > 50 ? 10 : 5;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max; t += step) ticks.push(t);
  return ticks;
}

export interface YearColor {
  fill: string;
  border: string;
  text: string;
}

export function yearToColor(
  year: number,
  minYear: number,
  maxYear: number,
): YearColor {
  const t = maxYear === minYear ? 0 : (year - minYear) / (maxYear - minYear);
  const hue = 30 + t * 190;
  return {
    fill: `hsl(${hue}, 55%, 93%)`,
    border: `hsl(${hue}, 65%, 42%)`,
    text: `hsl(${hue}, 55%, 25%)`,
  };
}
