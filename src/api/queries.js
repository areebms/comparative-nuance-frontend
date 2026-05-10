import { useQuery, useQueries } from "@tanstack/react-query";

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

async function fetchSimilarity(bookId, terms) {
  const res = await fetch(`${API_URL}/similarity/${bookId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      primary_term: terms[0],
      ...(terms[1] ? { secondary_term: terms[1] } : {}),
    }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`/similarity/${bookId}: ${res.status}`);
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

export function useSimilarityQueries(bookIds, terms) {
  const termsKey = terms.join("\x00");
  const enabled = terms.length > 0 && !!terms[0] && bookIds.length > 0;

  const queries = useQueries({
    queries: bookIds.map((id) => ({
      queryKey: ["similarity", id, termsKey],
      queryFn: () => fetchSimilarity(id, terms),
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