import { generateYearTicks } from "../../utils/scales";
import type { Series } from "./series";
import type { Book } from "../../types/api";

/** One term's numbers for one book. */
interface TermValue {
  value: number;
  /** Absolute [lo, hi] -- what <Area> draws. */
  band?: [number, number];
  /** Distances from the point -- what <ErrorBar> wants. */
  ci?: [number, number];
}

/** A chart row: one roster book, plus every term's numbers for it. */
interface ChartRow {
  year: number;
  bookId: number;
  book: string;
  values: Record<string, TermValue>;
}

export interface ChartModel {
  chartData: ChartRow[];
  xDomain: [number, number];
  yMin: number;
  yMax: number;
  xTicks: number[];
}

/**
 * Turn the per-term series into the rows Recharts plots.
 *
 * One row per ROSTER book, keyed by book id rather than by year, so two books
 * published in the same year are two rows sharing an x position -- not one row
 * where the later book overwrites the earlier one and vanishes from the chart
 * while still appearing in the rail and the drift table.
 *
 * Each term's numbers live under `values`, one level down from the row's own
 * fields, because a term is arbitrary corpus text: written flat onto the row, a
 * neighbour called "year" (plausible near "rent" or "wages") would overwrite the
 * x-axis value. The chart reads them with `row.values[term]?.value`, and a term
 * absent from a book has no entry, so that returns undefined and
 * `connectNulls={false}` breaks the line there.
 *
 * y is bounded to [-1.05, 1.05] and deliberately NOT clamped at 0 -- negative
 * agreement is a real result, not an error. x is padded 8%.
 */
export function buildChartModel(series: Series[], roster: Book[]): ChartModel {
  const allPoints = series.flatMap((s) => s.points);
  if (!allPoints.length || !roster.length) return EMPTY_MODEL;

  const chartData: ChartRow[] = roster.map((book) => ({
    year: book.published_year,
    bookId: book.id,
    book: book.label,
    values: {},
  }));

  const rowByBookId = new Map(chartData.map((row) => [row.bookId, row]));

  for (const s of series) {
    for (const p of s.points) {
      const row = rowByBookId.get(p.id);
      if (!row) continue;
      row.values[s.term] = {
        value: p.similarity,
        // Same interval, two shapes: the Area band takes absolute bounds, the
        // ErrorBar takes distances from the point.
        //
        // `similarity_ci` is null only on the synthetic pinned self-agreement
        // point (see series.ts) -- everything off the wire always carries one.
        band: p.similarity_ci ?? undefined,
        ci: p.similarity_ci
          ? [p.similarity - p.similarity_ci[0], p.similarity_ci[1] - p.similarity]
          : undefined,
      };
    }
  }

  // Bounds span the whiskers, not just the points, so a CI never clips.
  const sims = allPoints.flatMap((d) => [
    d.similarity_ci?.[0] ?? d.similarity,
    d.similarity_ci?.[1] ?? d.similarity,
  ]);
  const years = chartData.map((r) => r.year);
  const yearMin = Math.min(...years);
  const yearMax = Math.max(...years);
  const simMin = Math.min(...sims);
  const simMax = Math.max(...sims);

  const pad = Math.max((simMax - simMin) * 0.15, 0.02);
  const xPad = yearMax === yearMin ? 1 : (yearMax - yearMin) * 0.08;

  return {
    chartData,
    xDomain: [Math.floor(yearMin - xPad), Math.ceil(yearMax + xPad)],
    yMin: Math.max(-1.05, simMin - pad),
    yMax: Math.min(1.05, simMax + pad),
    xTicks: generateYearTicks(yearMin, yearMax),
  };
}

// Shared rather than rebuilt per call: nothing mutates it, and the chart is
// unmounted behind an empty-state message whenever it is returned.
const EMPTY_MODEL: ChartModel = {
  chartData: [],
  xDomain: [0, 1],
  yMin: 0,
  yMax: 1,
  xTicks: [],
};
