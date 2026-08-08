import type { OperationTree } from "./vectorExpression";

export interface BookResponse {
  id: number;
  label: string;
  author: string;
  title: string;
  published_year: number;
}

export interface TermResponse {
  term: string;
  books: number[];
}

export const LOCAL_ANCHOR_FLOOR = 75;

export const MIN_BOOKS_FOR_COMPARISON = 4;

export interface SemanticDriftRequestBody {
  tree: OperationTree;
  book_ids: number[];
}

export interface BookLocalMeanSimilarity {
  book_id: number;
  mean_similarity: number;
  similarity_ci: [number, number];
  count: number;
  n_seeds: number;
  n_books: number;
}

export interface ExprData {
  expr: string;
  terms: string[];
  books: BookLocalMeanSimilarity[];
}

export interface TermData {
  term: string;
  stability: number;
  instability: number;
  n_books_in: number;
  n_books_as_top50: number;
  n_books_as_top100: number;
  books: BookLocalMeanSimilarity[];
}

// Client-side ranking only -- both fields are present on every TermData the
// backend returns, so which one sorts/draws the chart is a display choice,
// not a request parameter.
export const DRIFT_SORTS = ["stability", "instability"] as const;
export type DriftSort = (typeof DRIFT_SORTS)[number];
export const DEFAULT_DRIFT_SORT: DriftSort = "stability";

export interface BookSummary {
  id: number;
  n_shared_terms: number;
  missing_terms?: string[];
}

export interface SemanticDriftResponse {
  expr: ExprData;
  comparative_terms: TermData[];
  books: BookSummary[];
}

export interface SubstitutionResponse {
  original: string;
  resolved: string;
}

export interface ParseDescribeResponse {
  expression: string;
  terms: string[];
  substitutions: SubstitutionResponse[];
}

export interface ExpressionAbsentResponse {
  reason: "expression_absent";
  book_id: number;
  terms: string[];
}

export interface QueryInTooFewBooksResponse {
  reason: "query_in_too_few_books";
  book_id?: number | null;
}

export interface TermResolutionResponse {
  reason: "term_resolution";
  message: string;
  term: string;
  candidates: string[];
}

export type ReasonBody =
  | ExpressionAbsentResponse
  | QueryInTooFewBooksResponse
  | TermResolutionResponse;

export type Reason = ReasonBody["reason"];
