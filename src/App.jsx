import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Alert,
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

export default function App() {
  const [term, setTerm] = useState("market");
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [sort, setSort] = useState("mean");
  const [topN, setTopN] = useState(25);

  const [bookData, setBookData] = useState([]);
  const [rowsError, setRowsError] = useState(null);
  const [similarityCache, setSimilarityCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`${VITE_API_URL}/books`)
      .then((res) => res.json())
      .then((books) => {
        books.sort((a, b) => a.id - b.id);
        setBookData(
          books.map((book, i) => ({ ...book, position: i, displayed: true })),
        );
      })
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  useEffect(() => {
    setSimilarityCache({});
    setBookData((prev) => prev.map((book) => ({ ...book, displayed: true })));
  }, [term]);

  useEffect(() => {
    const pending = bookData.filter(
      (b) => b.displayed && !similarityCache[b.id],
    );
    if (!term || pending.length === 0) return;

    let cancelled = false;
    setIsLoading(true);
    setRowsError(null);

    Promise.all(
      pending.map(async (book) => {
        const res = await fetch(
          `${VITE_API_URL}/similarity/${book.id}/${encodeURIComponent(term)}`,
        );
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
  }, [bookData, term]);

  const selectedBooks = useMemo(
    () => bookData.filter((book) => book.displayed),
    [bookData],
  );

  const selectedBookIds = useMemo(
    () => selectedBooks.map((book) => book.id),
    [selectedBooks],
  );

  const { displayRows, bookCalculationStats } = useSimilarityData({
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
          term={term}
          onTermChange={setTerm}
          bookData={bookData}
          setBookData={setBookData}
          selectedBooks={selectedBooks}
          selectedBookId={selectedBookId}
          setSelectedBookId={setSelectedBookId}
          topN={topN}
          onTopNChange={setTopN}
          sort={sort}
          onSortChange={setSort}
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {rowsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load similarity data.
            </Alert>
          )}
          <Paper elevation={0} sx={{ mb: 2, p: 3, borderRadius: 3 }}>
            <SimilarityScatterChart
              rows={displayRows.filter((row) => row.term !== term)}
              selectedBooks={selectedBooks}
              selectedBookId={selectedBookId}
              isLoading={isLoading}
            />
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <ResultsTable
              rows={displayRows}
              selectedBooks={selectedBooks}
              selectedBookId={selectedBookId}
              calcStats={bookCalculationStats}
              onClick={setTerm}
            />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
