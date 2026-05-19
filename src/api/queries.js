import { useQuery, useQueries, useMutation } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// ── Fetch helpers ──────────────────────────────────────────────

async function fetchJson(path, options) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

function fetchBooks() {
  return fetchJson("/books");
}

function fetchTerms() {
  return fetchJson("/terms");
}

async function fetchSimilarity(bookId, expression) {
  const res = await fetch(`${API_URL}/similarity/${bookId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expression),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`/similarity/${bookId}: ${res.status}`);
  return res.json();
}

export async function parseDescribeQuery(message) {
  const res = await fetch(`${API_URL}/parse-describe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail =
      body?.detail && typeof body.detail === "object"
        ? body.detail.message
        : body?.detail || `parse-describe: ${res.status}`;
    throw new Error(detail);
  }
  return res.json();
}

// ── Query hooks ────────────────────────────────────────────────

export function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
    staleTime: Infinity,
    select: (books) => {
      const sorted = [...books].sort(
        (a, b) => (a.published_year ?? 0) - (b.published_year ?? 0),
      );
      const years = sorted.map((b) => b.published_year ?? 0);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      return sorted.map((book, i) => ({
        ...book,
        position: i,
        yearColor: yearToColor(book.published_year ?? minYear, minYear, maxYear),
      }));
    },
  });
}

export function useTerms() {
  return useQuery({
    queryKey: ["terms"],
    queryFn: fetchTerms,
    staleTime: Infinity,
    select: (data) =>
      [...data].sort((a, b) => b.books.length - a.books.length),
  });
}

export function useSimilarityQueries(bookIds, expression) {
  const expressionKey = JSON.stringify(expression);
  const enabled = expression !== null && bookIds.length > 0;

  const queries = useQueries({
    queries: bookIds.map((id) => ({
      queryKey: ["similarity", id, expressionKey],
      queryFn: () => fetchSimilarity(id, {tree: expression}),
      enabled,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const cache = {};
  const allDone = queries.every((q) => q.isSuccess);
  const anyLoading = queries.some((q) => q.isLoading || q.isFetching);
  const error = queries.find((q) => q.isError)?.error ?? null;

  if (allDone) {
    bookIds.forEach((id, i) => {
      if (queries[i].data !== null) {
        cache[id] = queries[i].data;
      }
    });
  }

  return { cache, isLoading: anyLoading, isReady: allDone, error };
}

export function useParseDescribeQuery() {
  return useMutation({
    mutationFn: (message) => parseDescribeQuery(message),
  });
}

// ── Helpers ────────────────────────────────────────────────────

function yearToColor(year, minYear, maxYear) {
  const t = (year - minYear) / (maxYear - minYear);
  const hue = 30 + t * 190;
  return {
    fill: `hsl(${hue}, 55%, 93%)`,
    border: `hsl(${hue}, 65%, 42%)`,
    text: `hsl(${hue}, 55%, 25%)`,
  };
}