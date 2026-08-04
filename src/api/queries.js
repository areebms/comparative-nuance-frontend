import { useQuery, useMutation } from "@tanstack/react-query";

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
