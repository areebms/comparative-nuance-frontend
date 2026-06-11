import { useMemo, useState } from "react";
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
  IconButton,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import TopBar from "./components/TopBar";
import SimilarityScatterChart from "./components/TermSimilarityChart";
import ResultsTable from "./components/ResultsTable";
import GuideModal from "./components/GuideModal";
import { useBooks, useTerms, useSimilarityQueries, useParseDescribeQuery } from "./api/queries";
import useSimilarityData from "./hooks/useSimilarityData";
import { parseExpression, extractTerms } from "./utils/vectorExpressionParser";

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

export default function App() {
  const [expression, setExpression] = useState("market");
  const parsedExpression = useMemo(() => parseExpression(expression), [expression]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [sort, setSort] = useState("mean");
  const [topN, setTopN] = useState(25);
  const [hiddenBookIds, setHiddenBookIds] = useState(new Set());
  const [guideOpen, setGuideOpen] = useState(false);

  // Data fetching
  const { data: allBooks = [] } = useBooks();
  const { data: allTerms = [] } = useTerms();

  const describeMutation = useParseDescribeQuery();

  const handleDescribeSubmit = async (message) => {
    const result = await describeMutation.mutateAsync(message);
    setExpression(result.expression);
    return result;
  };

  const [displayedBooks, displayedBookIds] = useMemo(() => {
    const books = allBooks.filter((b) => !hiddenBookIds.has(b.id));
    return [books, books.map((b) => b.id)];
  }, [allBooks, hiddenBookIds]);

  const {
    cache: bookSimilarityData,
    isLoading,
    error: rowsError,
  } = useSimilarityQueries(displayedBookIds, parsedExpression);

  const missingBookIds = useMemo(
    () => new Set(displayedBookIds.filter((id) => !(id in bookSimilarityData))),
    [displayedBookIds, bookSimilarityData],
  );

  const { tableData, bookCalculationStats, termCount } = useSimilarityData({
    bookSimilarityData,
    selectedBookIds: displayedBookIds,
    selectedBookId,
    sort,
    topN,
  });

  // Book visibility toggle
  const handleToggleBook = (bookId) => {
    if (selectedBookId === String(bookId)) setSelectedBookId(null);
    setHiddenBookIds((prev) => {
      const next = new Set(prev);
      next.has(bookId) ? next.delete(bookId) : next.add(bookId);
      return next;
    });
  };

  // Heading text
  const expressionLabel = expression.trim() || "...";
  const heading = selectedBookId
    ? `Terms with highest relative emphasis for '${expressionLabel}' in ${displayedBooks.find((b) => String(b.id) === selectedBookId)?.label}`
    : `Terms used in similar contexts to '${expressionLabel}'`;


  const usedTerms = extractTerms(parsedExpression);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <GitHubLink />
        <TopBar
          expression={expression}
          onExpressionChange={setExpression}
          onDescribeSubmit={handleDescribeSubmit}
          describeSubmitting={describeMutation.isPending}
          allTerms={allTerms}
          bookData={allBooks}
          hiddenBookIds={hiddenBookIds}
          missingBookIds={missingBookIds}
          onToggleBook={handleToggleBook}
          selectedBooks={displayedBooks}
          selectedBookId={selectedBookId}
          setSelectedBookId={setSelectedBookId}
          sort={sort}
          onSortChange={setSort}
          onHelpClick={() => setGuideOpen(true)}
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {rowsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load similarity data.
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {heading}
              </Typography>
              <Typography
                component="a"
                href="#results-table"
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("results-table")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Table &rarr;
              </Typography>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ mb: 2, p: 3, borderRadius: 3 }}>
            {tableData.length ? (
              <SimilarityScatterChart
                rows={tableData.filter((row) => usedTerms.length > 1 || !usedTerms.includes(row.term))}
                selectedBooks={displayedBooks}
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

          <Paper
            id="results-table"
            elevation={0}
            sx={{ p: 3, borderRadius: 3 }}
          >
            <ResultsTable
              rows={tableData.filter((row) => usedTerms.length > 1 || !usedTerms.includes(row.term))}
              selectedBooks={displayedBooks}
              selectedBookId={selectedBookId}
              calcStats={bookCalculationStats}
              onClick={(t) => setExpression(t)}
              hiddenCount={termCount - tableData.length}
            />
          </Paper>
        </Container>

        <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      </Box>
    </ThemeProvider>
  );
}

function GitHubLink() {
  return (
    <IconButton
      component="a"
      href="https://github.com/areebms/embedding-analytics"
      target="_blank"
      rel="noopener noreferrer"
      size="small"
      sx={{
        position: "fixed",
        bottom: 10,
        right: 10,
        color: "black",
        "& svg": { fontSize: 50 },
        zIndex: 1300,
      }}
    >
      <GitHubIcon />
    </IconButton>
  );
}
