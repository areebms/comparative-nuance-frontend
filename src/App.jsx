import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Alert,
  Skeleton,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import TopBar from "./components/TopBar";
import SimilarityScatterChart from "./components/SimilarityScatterChart";
import ResultsTable from "./components/ResultsTable";
import useSimilarityData from "./hooks/useSimilarityData";

const theme = createTheme({
  palette: {
    primary: { main: "#4e79a7" },
    secondary: { main: "#e15759" },
    background: { default: "#f6f7fb", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 12 },
});

const VITE_API_URL = import.meta.env.VITE_API_URL;

function yearToColor(year, minYear, maxYear) {
  const t = (year - minYear) / (maxYear - minYear);
  const hue = 30 + t * 190;
  return {
    fill: `hsl(${hue}, 55%, 93%)`,
    border: `hsl(${hue}, 65%, 42%)`,
    text: `hsl(${hue}, 55%, 25%)`,
  };
}

export default function App() {
  const [terms, setTerms] = useState(["market"]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [sort, setSort] = useState("mean");
  const [topN, setTopN] = useState(25);

  const termsKey = terms.join("\x00");

  const [bookData, setBookData] = useState([]);
  const [rowsError, setRowsError] = useState(null);
  const [similarityCache, setSimilarityCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`${VITE_API_URL}/books`)
      .then((res) => res.json())
      .then((books) => {
        books.sort((a, b) => (a.published_year ?? 0) - (b.published_year ?? 0));
        const years = books.map((b) => b.published_year ?? 0);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        setBookData(
          books.map((book, i) => ({
            ...book,
            position: i,
            displayed: true,
            yearColor: yearToColor(book.published_year ?? minYear, minYear, maxYear),
          })),
        );
      })
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  useEffect(() => {
    setSimilarityCache({});
    setBookData((prev) => prev.map((book) => ({ ...book, displayed: true })));
  }, [termsKey]);

  useEffect(() => {
    const pending = bookData.filter(
      (b) => b.displayed && !similarityCache[b.id],
    );
    if (!terms.length || !terms[0] || pending.length === 0) return;

    let cancelled = false;
    setIsLoading(true);
    setRowsError(null);

    Promise.all(
      pending.map(async (book) => {
        const res = await fetch(`${VITE_API_URL}/similarity/${book.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            primary_term: terms[0],
            ...(terms[1] ? { secondary_term: terms[1] } : {}),
          }),
        });
        if (!res.ok)
          throw new Error(`Fetch failed (${book.id}): ${res.status}`);
        return { bookId: book.id, items: await res.json() };
      }),
    )
      .then((results) => {
        if (cancelled) return;
        setSimilarityCache((prev) => {
          const next = { ...prev };
          for (const { bookId, items } of results) next[bookId] = items;
          return next;
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching similarity data:", err);
        setRowsError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookData, termsKey]);

  const selectedBooks = useMemo(
    () => bookData.filter((book) => book.displayed),
    [bookData],
  );

  const selectedBookIds = useMemo(
    () => selectedBooks.map((book) => book.id),
    [selectedBooks],
  );

  const { displayRows, bookCalculationStats, totalSharedTerms, sharedTerms } = useSimilarityData({
    similarityCache,
    selectedBookIds,
    selectedBookId,
    sort,
    topN,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <TopBar
          terms={terms}
          onTermsChange={setTerms}
          sharedTerms={sharedTerms}
          bookData={bookData}
          setBookData={setBookData}
          selectedBooks={selectedBooks}
          selectedBookId={selectedBookId}
          setSelectedBookId={setSelectedBookId}
          sort={sort}
          onSortChange={setSort}
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {rowsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load similarity data.
            </Alert>
          )}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selectedBookId
                  ? `Terms with most distinctive proximity to '${terms.join("' & '")}' in ${selectedBooks.find((b) => String(b.id) === selectedBookId)?.label}`
                  : sort === "mean"
                    ? `Terms with greatest conceptual proximity to '${terms.join("' & '")}'`
                    : `Terms with most drift in conceptual proximity to '${terms.join("' & '")}'`
                }
              </Typography>
              <Typography
                component="a"
                href="#results-table"
                sx={{ fontSize: 13, color: "text.secondary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("results-table")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Table →
              </Typography>
            </Box>
          </Box>
          <Paper elevation={0} sx={{ mb: 2, p: 3, borderRadius: 3 }}>
            {displayRows.length ? (
              <SimilarityScatterChart
                rows={displayRows.filter((row) => terms.length == 2 || !terms.includes(row.term))}
                selectedBooks={selectedBooks}
                selectedBookId={selectedBookId}
                isLoading={isLoading}
              />
            ) : (
              <Skeleton
                variant="rectangular"
                sx={{ height: 420, width: "100%", borderRadius: 2 }}
              />
            )}
          </Paper>

          <Paper id="results-table" elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <ResultsTable
              rows={displayRows.filter((row) => terms.length == 2 || !terms.includes(row.term))}
              selectedBooks={selectedBooks}
              selectedBookId={selectedBookId}
              calcStats={bookCalculationStats}
              onClick={(t) => setTerms([t])}
              hiddenCount={totalSharedTerms - displayRows.length}
            />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
