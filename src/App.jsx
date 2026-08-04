import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Alert,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
  CircularProgress,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import TopBar from "./components/TopBar";
import HighlightBar from "./components/HighlightBar";
import CenteredMessage from "./components/CenteredMessage";
import {
  useBooks,
  useSemanticDrift,
  useParseDescribeQuery,
  MAX_DRIFT_BOOKS,
} from "./api/queries";
import { describeDriftError } from "./api/errors";
import useUrlState from "./hooks/useUrlState";
import { parseExpression } from "./utils/vectorExpressionParser";
import { CHART_HEIGHT } from "./components/DiachronicChart/layout";

const DiachronicChart = lazy(() => import("./components/DiachronicChart"));

const GuideModal = lazy(() => import("./components/GuideModal"));

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
  const {
    expression,
    setExpression,
    sort,
    setSort,
    selectedBookId,
    setSelectedBookId,
  } = useUrlState();
  const parsedExpression = useMemo(
    () => parseExpression(expression),
    [expression],
  );
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideMounted, setGuideMounted] = useState(false);

  // Data fetching
  const { data: allBooks = [], isSuccess: booksLoaded } = useBooks();

  const describeMutation = useParseDescribeQuery();

  const handleDescribeSubmit = async (message) => {
    const result = await describeMutation.mutateAsync(message);
    setExpression(result.expression);
    return result;
  };

  const displayedBooks = useMemo(
    () => allBooks.slice(0, MAX_DRIFT_BOOKS),
    [allBooks],
  );
  const displayedBookIds = useMemo(
    () => displayedBooks.map((b) => b.id),
    [displayedBooks],
  );

  const refBook = useMemo(
    () => allBooks.find((b) => String(b.id) === selectedBookId) ?? null,
    [allBooks, selectedBookId],
  );
  const pinnedBookId = refBook?.id ?? null;

  useEffect(() => {
    if (booksLoaded && selectedBookId && !refBook) setSelectedBookId(null);
  }, [booksLoaded, selectedBookId, refBook, setSelectedBookId]);

  const {
    payload: driftPayload,
    isLoading: driftLoading,
    error: driftError,
    queryLabel: driftQueryLabel,
  } = useSemanticDrift(displayedBookIds, parsedExpression, pinnedBookId, sort);

  const missingBookIds = useMemo(() => {
    if (!driftPayload) return new Set();
    const measured = new Set(driftPayload.expr.books.map((b) => b.book_id));
    return new Set(
      displayedBookIds.filter((id) => !measured.has(id) && id !== pinnedBookId),
    );
  }, [displayedBookIds, driftPayload, pinnedBookId]);

  const driftAlert = useMemo(
    () =>
      driftError
        ? describeDriftError(driftError, {
            books: allBooks,
            refBook,
            queryLabel: driftQueryLabel,
          })
        : null,
    [driftError, allBooks, refBook, driftQueryLabel],
  );

  const expressionLabel = driftQueryLabel || "...";
  const heading = refBook
    ? `Comparing to the definition of '${expressionLabel}' in ${refBook.label}`
    : `How generic is each author's definition of '${expressionLabel}'?`;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <GitHubLink />
        <TopBar
          expression={expression}
          onExpressionChange={setExpression}
          sort={sort}
          onSortChange={setSort}
          onDescribeSubmit={handleDescribeSubmit}
          describeSubmitting={describeMutation.isPending}
          onHelpClick={() => {
            setGuideMounted(true);
            setGuideOpen(true);
          }}
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {driftAlert && (
            <Alert severity={driftAlert.severity} sx={{ mb: 2 }}>
              {driftAlert.message}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {heading}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <HighlightBar
              bookData={displayedBooks}
              missingBookIds={missingBookIds}
              selectedBookId={pinnedBookId}
              setSelectedBookId={setSelectedBookId}
            />

            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 3 }}>
              <Box sx={{ p: 3 }}>
                <Suspense
                  fallback={
                    <CenteredMessage height={CHART_HEIGHT}>
                      <CircularProgress />
                    </CenteredMessage>
                  }
                >
                  <DiachronicChart
                    payload={driftPayload}
                    refBook={refBook}
                    term={expression.trim()}
                    isLoading={driftLoading}
                    hasError={Boolean(driftAlert)}
                    allBooks={allBooks}
                  />
                </Suspense>
              </Box>
            </Paper>
          </Box>
        </Container>

        {guideMounted && (
          <Suspense fallback={null}>
            <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
          </Suspense>
        )}
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
