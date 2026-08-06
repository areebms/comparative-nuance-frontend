import { SERIES_COLORS, QUERY_COLOR } from "./palette";
import { LOCAL_ANCHOR_FLOOR } from "../../types/api";
import type {
  BookResponse,
  BookSummary,
  SemanticDriftResponse,
} from "../../types/api";
import type {
  ChartModel,
  ChartRow,
  DiachronicSeries,
  GapCause,
  Series,
  SeriesGap,
  SeriesPoint,
} from "./types";

export function buildDiachronicSeries(
  payload: SemanticDriftResponse | null,
  allBooks: BookResponse[],
  pinnedBook: BookResponse | null = null,
): DiachronicSeries {
  if (!payload?.books.length || !allBooks.length) {
    return { series: [], roster: [] };
  }
  const bookMap = new Map(allBooks.map((b) => [b.id, b]));
  const summaryById = new Map(payload.books.map((s) => [s.id, s]));

  const roster = payload.books
    .filter((summary) => bookMap.has(summary.id))
    .map((summary) => bookMap.get(summary.id)!)
    .sort(byPublishedYear);

  const lines = [
    ...payload.nearest_terms.map(({ term, books, ...stats }, i) => ({
      term,
      isQuery: false,
      rank: i + 1,
      terms: [term],
      stats,
      rows: books,
    })),
    {
      term: payload.expr.expr,
      isQuery: true,
      rank: 0,
      terms: payload.expr.terms,
      stats: null,
      rows: payload.expr.books,
    },
  ];

  const built: Series[] = [];
  let colorIndex = 0;

  for (const line of lines) {
    const measured = new Map(line.rows.map((r) => [r.book_id, r]));
    const points: SeriesPoint[] = [];
    const gaps: SeriesGap[] = [];

    // Walk the ROSTER, not the measurements: that is what makes a book's
    // absence from this line visible instead of silently skipped.
    for (const book of roster) {
      const base = {
        id: book.id,
        label: book.label,
        year: book.published_year,
      };
      const raw = measured.get(book.id);
      if (raw) {
        points.push({
          ...base,
          similarity: raw.similarity,
          similarity_ci: raw.similarity_ci, // absolute [lo, hi]
          measurement: raw,
        });
      } else {
        const summary = summaryById.get(book.id);
        const missingTerms = line.terms.filter((t) =>
          summary?.missing_terms.includes(t),
        );
        gaps.push({
          ...base,
          unavailable: true,
          similarity: null,
          similarity_ci: null,
          cause: gapCause(missingTerms, summary),
          missingTerms,
        });
      }
    }

    points.sort(byYear);
    gaps.sort(byYear);

    if (!points.length) {
      continue;
    }

    built.push({
      term: line.term,
      isQuery: line.isQuery,
      color: line.isQuery
        ? QUERY_COLOR
        : SERIES_COLORS[colorIndex++ % SERIES_COLORS.length],
      rank: line.rank,
      stats: line.stats,
      points,
      gaps,
    });
  }

  if (pinnedBook) {
    for (const s of built) {
      if (s.points.some((p) => p.id === pinnedBook.id)) continue;
      s.points = [
        ...s.points,
        {
          id: pinnedBook.id,
          label: pinnedBook.label,
          year: pinnedBook.published_year,
          similarity: 1,
          similarity_ci: null,
          measurement: null,
        },
      ].sort(byYear);
    }

    if (!roster.some((b) => b.id === pinnedBook.id)) {
      roster.push(pinnedBook);
      roster.sort(byPublishedYear);
    }
  }

  return { series: built, roster };
}

function gapCause(missingTerms: string[], summary: BookSummary | undefined): GapCause {
  if (missingTerms.length) return "absent";
  if (summary && summary.n_shared_terms < LOCAL_ANCHOR_FLOOR) return "too_few_anchors";
  return "unscored";
}

const byYear = (a: { year: number; label: string }, b: { year: number; label: string }) =>
  a.year - b.year || a.label.localeCompare(b.label);

const byPublishedYear = (a: BookResponse, b: BookResponse) =>
  a.published_year - b.published_year || a.label.localeCompare(b.label);

/* -------------------------------------------------------------------------- *
 * The chart model: the same series, projected into what Recharts draws.
 *
 * The second half of one pipeline -- `buildDiachronicSeries` above answers what
 * the lines ARE, this answers where they sit. Only the chart calls it; the
 * DriftTable stops at the series.
 * -------------------------------------------------------------------------- */

const MIN_Y_SPAN = 0.04;

export function buildChartModel(
  series: Series[],
  roster: BookResponse[],
): ChartModel {
  const allPoints = series.flatMap((s) => s.points);
  if (!allPoints.length || !roster.length) return EMPTY_MODEL;

  const chartData: ChartRow[] = roster.map((book) => ({
    year: book.published_year,
    bookId: book.id,
    book: book.label,
    values: {},
  }));

  const sims = allPoints.map((d) => d.similarity);
  const years = chartData.map((r) => r.year);
  const yearMin = Math.min(...years);
  const yearMax = Math.max(...years);
  const simMin = Math.min(...sims);
  const simMax = Math.max(...sims);

  let [yMin, yMax] = [Math.max(-1, simMin), Math.min(1, simMax)];
  if (yMax - yMin < MIN_Y_SPAN) {
    const mid = (yMin + yMax) / 2;
    [yMin, yMax] = [Math.max(-1, mid - MIN_Y_SPAN / 2), Math.min(1, mid + MIN_Y_SPAN / 2)];
  }

  const rowByBookId = new Map(chartData.map((row) => [row.bookId, row]));
  const clamp = (v: number) => Math.min(yMax, Math.max(yMin, v));

  for (const s of series) {
    for (const p of s.points) {
      const row = rowByBookId.get(p.id);
      if (!row) continue;

      const bounds = p.similarity_ci
        ? ([clamp(p.similarity_ci[0]), clamp(p.similarity_ci[1])] as [number, number])
        : undefined;
      row.values[s.term] = {
        value: p.similarity,
        band: bounds,
        ci: bounds ? [p.similarity - bounds[0], bounds[1] - p.similarity] : undefined,
      };
    }
  }

  return {
    chartData,
    xDomain: [yearMin, yearMax],
    yMin,
    yMax,
    xTicks: generateYearTicks(yearMin, yearMax),
    yTicks: generateLinearTicks(yMin, yMax),
  };
}

const EMPTY_MODEL: ChartModel = {
  chartData: [],
  xDomain: [0, 1],
  yMin: 0,
  yMax: 1,
  xTicks: [],
  yTicks: [],
};

function generateYearTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = span > 200 ? 50 : span > 100 ? 25 : span > 50 ? 10 : 5;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max; t += step) ticks.push(t);
  return ticks;
}

/**
 * Ticks at a round step (1, 2 or 5 x 10^k) lying INSIDE [min, max].
 *
 * Recharts' own `tickCount` would pick a step too, but it then widens the domain
 * out to the outermost tick it chose (combineAxisDomainWithNiceTicks), which
 * silently undoes a domain fitted to the data -- the axis ends up showing empty
 * space below the smallest value and above the largest. Choosing the ticks here
 * and passing them as `ticks` leaves the domain alone, which is also how the
 * x-axis already works.
 */
const TARGET_TICKS = 6;

function generateLinearTicks(min: number, max: number): number[] {
  const span = max - min;
  if (!(span > 0)) return [min];

  const rough = span / (TARGET_TICKS - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  // Snap to the NEAREST round step, splitting at the geometric midpoints
  // (sqrt 2, sqrt 10, sqrt 50). Rounding up instead would take a span that wants
  // a 0.1 step to 0.2 and halve the gridlines -- 1.06 is far nearer 1 than 2.
  const step =
    (normalised >= 7.07 ? 10 : normalised >= 3.16 ? 5 : normalised >= 1.41 ? 2 : 1) * magnitude;

  const ticks: number[] = [];
  // Epsilon so a tick landing exactly on `max` survives binary float error.
  for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-9; t += step) {
    // Repeated addition drifts (0.1 + 0.2 = 0.30000000000000004); snap to the grid.
    ticks.push(Math.round(t / step) * step);
  }
  return ticks;
}
