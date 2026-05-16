import {
  AppBar,
  Toolbar,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
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
  onChatSubmit,
  chatSubmitting,
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
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "auto minmax(0, 1fr)",
          },
          gap: { xs: 1.5, lg: 2 },
          alignItems: "center",
          width: "100%",
          py: 1,
        }}
      >
        <LogoBox />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "minmax(0, 1fr)",
              lg: "minmax(260px, 1fr) minmax(320px, 1fr)",
            },
            gap: 2,
            alignItems: "center",
            minWidth: 0,
            width: "100%",
          }}
        >
          <Box
            sx={{
              gridColumn: { xs: "1 / -1", lg: "auto" },
              minWidth: 0,
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
          </Box>

          <Box
            sx={{
              gridColumn: { xs: "1 / -1", sm: "1 / 2", lg: "auto" },
              minWidth: 0,
            }}
          >
            <VectorExpressionInput
              allTerms={allTerms}
              expression={expression}
              onExpressionChange={onExpressionChange}
              onChatSubmit={onChatSubmit}
              chatSubmitting={chatSubmitting}
            />
          </Box>

          {/* <Box
            sx={{
              gridColumn: { xs: "1 / -1", sm: "2 / 3", lg: "auto" },
              minWidth: 0,
              width: "100%",
            }}
          >
            <SortSelect
              sort={sort}
              selectedBookId={selectedBookId}
              onSortChange={onSortChange}
            />
          </Box> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
