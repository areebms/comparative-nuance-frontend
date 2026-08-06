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
  books: string[];
}

export const DRIFT_SORTS = ["mean_similarity", "slope"] as const;
export type DriftSort = (typeof DRIFT_SORTS)[number];

export const DEFAULT_DRIFT_SORT: DriftSort = "mean_similarity";

export const LOCAL_ANCHOR_FLOOR = 75;

export interface SemanticDriftRequestBody {
  tree: OperationTree;
  book_ids: number[];
  sort?: DriftSort;
}

export interface BookLocalMeanSimilarity {
  book_id: number;
  similarity: number;
  similarity_ci: [number, number];
  similarity_sd: number;
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
  mean_similarity: number;
  n_books_with_term: number;
  slope: number;
  r_squared: number;
  tags: string[];
  books: BookLocalMeanSimilarity[];
}

export interface BookSummary {
  id: number;
  n_shared_terms: number;
  missing_terms: string[];
}

export interface SemanticDriftResponse {
  expr: ExprData;
  nearest_terms: TermData[];
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
  book_id: number | null;
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
