import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import Legend from "./Legend";
import VectorExpressionInput from "./VectorExpressionInput";

const LogoBox = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      minWidth: 0,
    }}
  >
    <Box
      component="span"
      sx={{
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 0.3,
        color: "text.primary",
        whiteSpace: "nowrap",
      }}
    >
      Embedding Analytics
    </Box>

    <Divider
      orientation="vertical"
      flexItem
      sx={{ display: { xs: "none", lg: "block" } }}
    />
  </Box>
);

const SortSelect = ({ selectedBookId, sort, onSortChange }) => (
  <FormControl size="small" sx={{ width: "100%" }}>
    <InputLabel>Sort</InputLabel>
    <Select
      disabled={!!selectedBookId}
      value={selectedBookId ? "elasticity" : sort}
      label="Sort"
      onChange={(e) => onSortChange(e.target.value)}
    >
      <MenuItem value="mean">Consensus (Mean)</MenuItem>
      <MenuItem value="elasticity">Divergence (SD)</MenuItem>
    </Select>
  </FormControl>
);

export default function TopBar({
  expression,
  onExpressionChange,
  onDescribeSubmit,
  describeSubmitting,
  allTerms,
  bookData,
  hiddenBookIds,
  missingBookIds,
  onToggleBook,
  selectedBooks = [],
  selectedBookId,
  setSelectedBookId,
  sort,
  onSortChange,
  onHelpClick,
}) {
  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          width: "100%",
          py: 1,
        }}
      >
        {/* ── lg: single horizontal row ── */}
        <Box
          sx={{
            display: { xs: "none", lg: "grid" },
            gridTemplateColumns: "auto minmax(0, 1fr) auto",
            gap: 2,
            alignItems: "center",
            width: "100%",
          }}
        >
          <LogoBox />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(260px, 1fr) minmax(320px, 1fr)",
              gap: 2,
              alignItems: "center",
              minWidth: 0,
              width: "100%",
            }}
          >
            <Legend
              bookData={bookData}
              hiddenBookIds={hiddenBookIds}
              missingBookIds={missingBookIds}
              onToggleBook={onToggleBook}
              selectedBooks={selectedBooks}
              selectedBookId={selectedBookId}
              setSelectedBookId={setSelectedBookId}
            />
            <VectorExpressionInput
              allTerms={allTerms}
              expression={expression}
              onExpressionChange={onExpressionChange}
              onDescribeSubmit={onDescribeSubmit}
              describeSubmitting={describeSubmitting}
            />
          </Box>
          <IconButton onClick={onHelpClick} sx={{ color: "primary.main" }}>
            <HelpCenterIcon fontSize="large" />
          </IconButton>
        </Box>

        {/* ── xs: stacked rows ── */}
        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
          }}
        >
          {/* Row 1: Logo + Help icon */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <LogoBox />
            <IconButton onClick={onHelpClick} >
              <HelpCenterIcon fontSize="large" sx={{ color: "primary.main" }} />
            </IconButton>
          </Box>

          {/* Row 2: Input */}
          <VectorExpressionInput
            allTerms={allTerms}
            expression={expression}
            onExpressionChange={onExpressionChange}
            onDescribeSubmit={onDescribeSubmit}
            describeSubmitting={describeSubmitting}
          />

          {/* Row 3: Legend */}
          <Legend
            bookData={bookData}
            hiddenBookIds={hiddenBookIds}
            missingBookIds={missingBookIds}
            onToggleBook={onToggleBook}
            selectedBooks={selectedBooks}
            selectedBookId={selectedBookId}
            setSelectedBookId={setSelectedBookId}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
