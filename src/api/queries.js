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

async function fetchQuickSimilarity(bookId, tree) {
  const res = await fetch(`${API_URL}/similar-terms/quick/${bookId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tree }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`/similar-terms/quick/${bookId}: ${res.status}`);
  return res.json();
}

async function fetchDetailedSimilarity(bookId, terms, queryVectors) {
  const res = await fetch(`${API_URL}/similar-terms/detailed/${bookId}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ terms, query_vectors: queryVectors }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`/similar-terms/detailed/${bookId}/: ${res.status}`);
  return res.json();
}

async function fetchDiachronicSimilarity(bookId, tree, refBookIds) {
  const res = await fetch(`${API_URL}/diachronic-similarity/${bookId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tree, ref_book_ids: refBookIds }),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`/diachronic-similarity/${bookId}: ${res.status}`);
  }
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

  // Phase 1: Quick similarity for all books in parallel
  const quickQueries = useQueries({
    queries: bookIds.map((id) => ({
      queryKey: ["similarity-quick", id, expressionKey],
      queryFn: () => fetchQuickSimilarity(id, expression),
      enabled,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const allQuickDone = quickQueries.every((q) => q.isSuccess);

  // Phase 2: Detailed confidence intervals for all books in parallel
  // Only fires once every quick query has succeeded
  const detailedQueries = useQueries({
    queries: bookIds.map((id, i) => {
      const quickData = quickQueries[i]?.data;
      const hasResults = allQuickDone && quickData?.results?.length > 0;
      return {
        queryKey: ["similarity-detailed", id, expressionKey],
        queryFn: () =>
          fetchDetailedSimilarity(
            id,
            quickData.results.map((r) => r.term),
            quickData.query_vectors,
          ),
        enabled: hasResults,
        staleTime: 5 * 60 * 1000,
      };
    }),
  });

  const allDetailedDone = detailedQueries.every(
    (q) => q.isSuccess || q.fetchStatus === "idle",
  );
  const anyLoading =
    quickQueries.some((q) => q.isLoading || q.isFetching) ||
    detailedQueries.some((q) => q.isLoading || q.isFetching);
  const error =
    quickQueries.find((q) => q.isError)?.error ??
    detailedQueries.find((q) => q.isError)?.error ??
    null;

  // Merge quick + detailed into the shape downstream expects:
  // [{ term, similarity, count, similarity_ci }]
  const cache = {};
  if (allQuickDone && allDetailedDone) {
    bookIds.forEach((id, i) => {
      const quickData = quickQueries[i].data;
      if (!quickData?.results) return;

      const detailedData = detailedQueries[i].data;
      const ciMap = new Map(
        (detailedData ?? []).map((d) => [d.term, d]),
      );

      cache[id] = quickData.results.map((r) => {
        const detailed = ciMap.get(r.term);
        return {
          term: r.term,
          count: r.count,
          similarity: detailed?.similarity ?? r.similarity,
          similarity_ci: detailed?.similarity_ci ?? null,
        };
      });
    });
  }

  return { cache, isLoading: anyLoading, isReady: allQuickDone && allDetailedDone, error };
}

/**
 * Fans out per-book diachronic queries for the given expression tree and
 * reference book ids. Wraps the result in the `{ book_data: [...] }` shape
 * that DiachronicChart expects.
 *
 * Pass `enabled=false` to skip fetching (e.g. when the user is on a
 * different tab or no book is pinned).
 */
export function useDiachronicQueries(bookIds, tree, refBookIds, enabled = true) {
  const treeKey = JSON.stringify(tree);
  const refKey = JSON.stringify([...refBookIds].sort());
  const isEnabled =
    enabled && tree !== null && bookIds.length > 0 && refBookIds.length > 0;

  const queries = useQueries({
    queries: bookIds.map((id) => ({
      queryKey: ["diachronic", id, treeKey, refKey],
      queryFn: () => fetchDiachronicSimilarity(id, tree, refBookIds),
      enabled: isEnabled,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading || q.isFetching);
  const error = queries.find((q) => q.isError)?.error ?? null;
  const collected = queries
    .map((q) => q.data)
    .filter((d) => d !== null && d !== undefined);

  const payload = collected.length ? { book_data: collected } : null;
  return { payload, isLoading, error };
}

export function useParseDescribeQuery() {
  return useMutation({
    mutationFn: (message) => parseDescribeQuery(message),
  });
}

// ── Helpers ────────────────────────────────────────────────────

function yearToColor(year, minYear, maxYear) {
  const t = maxYear === minYear ? 0 : (year - minYear) / (maxYear - minYear);
  const hue = 30 + t * 190;
  return {
    fill: `hsl(${hue}, 55%, 93%)`,
    border: `hsl(${hue}, 65%, 42%)`,
    text: `hsl(${hue}, 55%, 25%)`,
  };
}
