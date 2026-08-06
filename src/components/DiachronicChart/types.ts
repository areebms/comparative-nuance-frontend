import type {
  BookResponse,
  BookLocalMeanSimilarity,
  TermData,
} from "../../types/api";

/* -------------------------------------------------------------------------- *
 * The series model
 * -------------------------------------------------------------------------- */

export interface SeriesPoint {
  id: number;
  label: string;
  year: number;
  similarity: number;
  similarity_ci: [number, number] | null;
  measurement: BookLocalMeanSimilarity | null;
}

export type GapCause = "absent" | "too_few_anchors" | "unscored";

/** A roster book this line did not measure. */
export interface SeriesGap {
  id: number;
  label: string;
  year: number;
  unavailable: true;
  similarity: null;
  similarity_ci: null;
  cause: GapCause;
  missingTerms: string[];
}

type TermStats = Omit<TermData, "term" | "books">;

export interface Series {
  term: string;
  isQuery: boolean;
  color: string;
  rank: number;
  stats: TermStats | null;
  points: SeriesPoint[];
  gaps: SeriesGap[];
}

export interface DiachronicSeries {
  series: Series[];
  roster: BookResponse[];
}

/* -------------------------------------------------------------------------- *
 * The chart model: the same series, projected into what Recharts draws.
 * -------------------------------------------------------------------------- */

interface TermValue {
  value: number;
  band?: [number, number];
  ci?: [number, number];
}

export interface ChartRow {
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
  yTicks: number[];
}

/* -------------------------------------------------------------------------- *
 * Label layout
 * -------------------------------------------------------------------------- */

/** One term label's desired position, as handed to `stackLabels` in `layout.ts`. */
export interface LabelAnchor {
  y: number;
  height: number;
  rank: number;
}
