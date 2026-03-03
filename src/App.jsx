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
    primary: {
      main: "#4e79a7",
    },
    secondary: {
      main: "#e15759",
    },
    background: {
      default: "#f6f7fb",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});


const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  // Search and filtering state
  const [term, setTerm] = useState("market");
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [topN, setTopN] = useState(25);

  // Data state
  const [bookData, setBookData] = useState([]);
  const [rowsError, setRowsError] = useState(null);
  const [similarityCache, setSimilarityCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all available books on component mount
   */
  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    setSimilarityCache({});
    setBookData((prevBookData) =>
      prevBookData.map((book) => ({
        ...book,
        displayed: true,
      })),
    );
  }, [term]);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/books`);
      if (!response.ok) {
        throw new Error(`Books fetch failed: ${response.status}`);
      }
      const books = await response.json();
      books.sort((a, b) => a.id - b.id);
      books.forEach((book, index) => {
        book.position = index;
        book.displayed = true;
      });

      setBookData(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBookData([]);
    }
  };

  /**
   * Fetch similarity data for displayed books when selection changes
   */
  useEffect(() => {
    let cancelled = false;

    const loadSimilarityData = async () => {
      try {
        setRowsError(null);

        const pendingBookIds = bookData
          .filter((data) => !similarityCache[data.id] && data.displayed)
          .map((data) => data.id);

        if (pendingBookIds.length === 0) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        fetchSimilarityData(pendingBookIds, cancelled);
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading similarity data:", error);
          setRowsError(error);
          setIsLoading(false);
        }
      }
    };

    if (bookData.filter((data) => data.displayed).length && term) {
      loadSimilarityData();
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [bookData, similarityCache, term]);

  const fetchSimilarityData = async (pendingBookIds, cancelled) => {
    try {
      const fetchPromises = pendingBookIds.map(async (bookId) => {
        const url = `${VITE_API_URL}/similarity/${bookId}/${encodeURIComponent(term)}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Similarity fetch failed (${bookId}): ${response.status}`,
          );
        }

        const items = await response.json();
        return { bookId, items };
      });

      const fetchedData = await Promise.all(fetchPromises);

      if (!cancelled) {
        setSimilarityCache((previousCache) => {
          const updatedCache = { ...previousCache };
          for (const { bookId, items } of fetchedData) {
            updatedCache[bookId] = items;
          }
          setIsLoading(false);
          return updatedCache;
        });
      }
    } catch (error) {
      if (!cancelled) {
        console.error("Error fetching missing similarity data:", error);
        setRowsError(error);
        setIsLoading(false);
      }
    }
  };

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
      topN
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
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {rowsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load similarity data.
            </Alert>
          )}
          <Paper elevation={0} sx={{ mb: 2, p: 3, borderRadius: 3 }}>
            <SimilarityScatterChart
              rows={displayRows.slice(1)}
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
