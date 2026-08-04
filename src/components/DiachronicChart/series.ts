import { SERIES_COLORS, QUERY_COLOR } from "./palette";
import { LOCAL_ANCHOR_FLOOR } from "../../types/api";
import type {
  Book,
  BookLocalMeanSimilarity,
  BookSummary,
  SemanticDriftResponse,
  TermData,
} from "../../types/api";
import type { YearColor } from "../../utils/scales";

/**
 * A book on a line, with that line's measurement of it. The term is NOT on the
 * point: it belongs to the enclosing Series, and restating it here would read
 * as though the two could disagree.
 */
export interface SeriesPoint {
  id: number;
  label: string;
  year: number;
  yearColor: YearColor;
  similarity: number;
  /**
   * Absolute [lo, hi]. Non-null for everything that came off the wire --
   * BookLocalMeanSimilarity requires it -- and null ONLY on the synthetic
   * pinned self-agreement point below, which has no interval to draw.
   */
  similarity_ci: [number, number] | null;
  /**
   * The wire row this point was built from, carried whole rather than copied
   * field by field. Null on the synthetic self-agreement point, which was
   * measured by nobody.
   */
  measurement: BookLocalMeanSimilarity | null;
}

/**
 * Why a roster book has no number on a line. The server states absence by
 * omission, so the reason has to be reconstructed -- and the three are not
 * interchangeable to a reader:
 *
 *   absent          -- the book's vocabulary lacks a word this line needs.
 *   too_few_anchors -- it has every word, but shares less than the floor's
 *                      worth of vocabulary with anything it could be read
 *                      against, so no comparison could be made.
 *   unscored        -- neither. `n_shared_terms` is a BEST case over peers and
 *                      is counted before the expression's leaves are excluded,
 *                      so clearing the floor does not promise any individual
 *                      comparison cleared it. Rare, and honest about it.
 */
export type GapCause = "absent" | "too_few_anchors" | "unscored";

/** A roster book this line did not measure. */
export interface SeriesGap {
  id: number;
  label: string;
  year: number;
  yearColor: YearColor;
  unavailable: true;
  similarity: null;
  similarity_ci: null;
  cause: GapCause;
  /** Which of THIS line's terms the book lacks -- the missing subset only, in
   * the expression's own order. Empty unless `cause` is "absent". */
  missingTerms: string[];
}

/**
 * What made the server pick a neighbour, minus the parts the Series already
 * says. Null on the query line, which was not picked by anything.
 */
export type TermStats = Omit<TermData, "term" | "books">;

export interface Series {
  term: string;
  isQuery: boolean;
  color: string;
  stats: TermStats | null;
  points: SeriesPoint[];
  gaps: SeriesGap[];
}

export interface DiachronicSeries {
  series: Series[];
  roster: Book[];
  missingEverywhere: string[];
}

/**
 * Turn a SemanticDriftResponse into the per-TERM series the chart draws.
 *
 * The response is already term-oriented, which is why there is no pivot here:
 *   expr          — the query's own line ({ expr, terms, books })
 *   nearest_terms — one neighbour line each ({ term, books })
 *   books         — the ROSTER: every book the request named, measured or not
 *
 * Mind the key collision: `payload.books` is the roster (keyed `id`), while
 * `payload.expr.books` and `payload.nearest_terms[].books` are measurements
 * (keyed `book_id`). Same word, two depths, different types.
 *
 * Absence is expressed by omission — there is no `unavailable` flag on the
 * wire. A book is on a line only if that line measured it, so a line's gaps are
 * exactly the roster books missing from its own `books` list. We still emit
 * `unavailable: true` on those, because that is the shape the chart already
 * reads.
 *
 * Deriving gaps this way rather than reading the roster's own `missing_terms`
 * is deliberate, and strictly more correct: a book drops off a line whenever
 * the server could not score it, which includes sharing too few local anchor
 * terms with any peer (NUM_LOCAL_NEAREST_TERMS, 75) even though it carries every
 * word of the query. `missing_terms` only ever describes vocabulary -- the
 * roster's `n_shared_terms` is the field that speaks to this second cause.
 *
 * `pinnedBook` (optional): the reference book is never among the targets — its
 * agreement with itself is a constant 1.0 (see queries.ts). When a caller passes
 * it back in, that 1.0 point is re-added to every surviving line so the
 * reference appears as a marker at its own year.
 *
 * Colours: the query term gets the deep-blue focal ink (QUERY_COLOR); each
 * neighbour cycles through the categorical SERIES_COLORS palette, so every
 * term (dot, on-chart label, and connecting line) is its own distinct colour.
 */
export function buildDiachronicSeries(
  payload: SemanticDriftResponse | null,
  allBooks: Book[],
  pinnedBook: Book | null = null,
): DiachronicSeries {
  if (!payload?.books.length || !allBooks.length) {
    return { series: [], roster: [], missingEverywhere: [] };
  }
  const bookMap = new Map(allBooks.map((b) => [b.id, b]));
  // The roster keyed for lookup: `missing_terms` and `n_shared_terms` are what
  // turn a book's omission from a line into a stated reason (see gapCause).
  const summaryById = new Map(payload.books.map((s) => [s.id, s]));

  // The roster is the x-axis universe. Books the corpus no longer knows about
  // are dropped rather than plotted as anonymous ids. Sorted here once, so
  // every consumer (points, gaps, chart rows) reads the same chronology —
  // including the label tiebreak, so two books published in the same year
  // have a stable order rather than one that depends on which term happened
  // to mention them first.
  const roster = payload.books
    .filter((summary) => bookMap.has(summary.id))
    .map((summary) => bookMap.get(summary.id)!)
    .sort(byPublishedYear);

  // Query last so its line and dots render on top of the neighbours. Built in
  // that order directly, rather than sorted afterwards, so the neighbour colour
  // cycle follows the server's nearest-term ranking.
  //
  // `terms` is the line's own vocabulary -- the expression's leaves for the
  // query, the single word for a neighbour. Intersected with a book's
  // `missing_terms` (which spans EVERY line at once) it says what THIS line
  // needed and that book lacked.
  const lines = [
    ...payload.nearest_terms.map(({ term, books, ...stats }) => ({
      term,
      isQuery: false,
      terms: [term],
      stats,
      rows: books,
    })),
    {
      term: payload.expr.expr,
      isQuery: true,
      terms: payload.expr.terms,
      stats: null,
      rows: payload.expr.books,
    },
  ];

  const built: Series[] = [];
  const dead: string[] = [];
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
        yearColor: book.yearColor,
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
      dead.push(line.term);
      continue;
    }

    built.push({
      term: line.term,
      isQuery: line.isQuery,
      color: line.isQuery
        ? QUERY_COLOR
        : SERIES_COLORS[colorIndex++ % SERIES_COLORS.length],
      stats: line.stats,
      points,
      gaps,
    });
  }

  // Re-add the pinned reference book (never among the targets) as a self-
  // agreement marker on every line: a point at its own year, value 1.0, with no
  // CI (self-agreement is exact — no whisker). Guarded so it never duplicates a
  // book already present, and only lines that already have real points get it —
  // a term found ONLY in the pinned book stays dropped rather than showing a
  // lone dot floating at 1.0.
  if (pinnedBook) {
    for (const s of built) {
      if (s.points.some((p) => p.id === pinnedBook.id)) continue;
      s.points = [
        ...s.points,
        {
          id: pinnedBook.id,
          label: pinnedBook.label,
          year: pinnedBook.published_year,
          yearColor: pinnedBook.yearColor,
          similarity: 1,
          similarity_ci: null,
          measurement: null,
        },
      ].sort(byYear);
    }

    // The pinned book is excluded from the request (see queries.ts), so it is
    // absent from `payload.books` and therefore from the roster built above —
    // yet it now carries a point on every line and needs a place on the x-axis.
    // Added HERE, after the per-line walk, and never before it: a roster that
    // already contained the pinned book would have made it a `gap` on every
    // line, drawing it as a hollow "absent from this text" marker at the same
    // time as the 1.0 point above.
    if (!roster.some((b) => b.id === pinnedBook.id)) {
      roster.push(pinnedBook);
      roster.sort(byPublishedYear);
    }
  }

  return { series: built, roster, missingEverywhere: dead };
}

/**
 * Rank the two causes in the order the evidence settles them: a book that
 * lacks one of the line's words was never a candidate for measurement, so that
 * is the whole story regardless of how much vocabulary it shares. Only once it
 * has every word does the anchor floor become the thing that stopped it.
 */
function gapCause(missingTerms: string[], summary: BookSummary | undefined): GapCause {
  if (missingTerms.length) return "absent";
  if (summary && summary.n_shared_terms < LOCAL_ANCHOR_FLOOR) return "too_few_anchors";
  return "unscored";
}

// Points/gaps carry a flat `year`; roster entries are raw books with
// `published_year`. Both tiebreak on label so same-year books never swap
// order in the chart's rows.
const byYear = (a: { year: number; label: string }, b: { year: number; label: string }) =>
  a.year - b.year || a.label.localeCompare(b.label);

const byPublishedYear = (a: Book, b: Book) =>
  a.published_year - b.published_year || a.label.localeCompare(b.label);
