import { useState, useEffect } from "react";
import {
  AppBar,
  Autocomplete,
  Toolbar,
  TextField,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import Legend from "./Legend";

export default function TopBar({
  terms,
  onTermsChange,
  sharedTerms,
  bookData,
  hiddenBookIds,
  onToggleBook,
  selectedBooks = [],
  selectedBookId,
  setSelectedBookId,
  sort,
  onSortChange,
}) {
  const [draftTerms, setDraftTerms] = useState([]);

  useEffect(() => {
    setDraftTerms(
      terms.map((t) => sharedTerms.find((o) => o.term === t)).filter(Boolean),
    );
  }, [terms, sharedTerms]);

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 2, alignItems: "center", width: "100%", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0, flexShrink: 0 }}>
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
          <Divider orientation="vertical" flexItem />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: 2,
            marginLeft: { xs: 0, md: "auto" },
            minWidth: 0,
            flexBasis: { xs: "100%", md: "auto" },
            width: { xs: "100%", md: "auto" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "nowrap",
              order: { xs: 1, md: 2 },
              width: { xs: "100%", md: "auto" },
              minWidth: 0,
              flexShrink: 0,
            }}
          >
            <Autocomplete
              multiple
              options={sharedTerms}
              value={draftTerms}
              getOptionLabel={(opt) => `${opt.term} (${opt.books.length})`}
              isOptionEqualToValue={(opt, val) => opt.term === val.term}
              onChange={(_, newValue) => {
                if (newValue.length <= 2) {
                  setDraftTerms(newValue);
                  if (newValue.length >= 1) onTermsChange(newValue.map((o) => o.term));
                }
              }}
              onBlur={() => {
                if (draftTerms.length === 0)
                  setDraftTerms(
                    terms.map((t) => sharedTerms.find((o) => o.term === t)).filter(Boolean),
                  );
              }}
              getOptionDisabled={() => draftTerms.length >= 2}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.term}
                    size="small"
                    {...getTagProps({ index })}
                    key={option.term}
                  />
                ))
              }
              sx={{
                flex: { xs: 1, md: "0 0 300px" },
                width: { xs: "100%", md: 300 },
                minWidth: { xs: 0, md: 300 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                  flexWrap: "nowrap",
                  overflow: "hidden",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    draftTerms.length === 0
                      ? "Select a term"
                      : draftTerms.length === 1
                        ? "Add second term"
                        : ""
                  }
                  label="Reference Terms"
                  size="small"
                />
              )}
            />

            <FormControl size="small" sx={{ minWidth: 190, flexShrink: 0 }}>
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
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "auto" },
              minWidth: 0,
              order: { xs: 2, md: 1 },
              flex: { xs: "0 0 100%", md: 1 },
            }}
          >
            <Legend
              bookData={bookData}
              hiddenBookIds={hiddenBookIds}
              onToggleBook={onToggleBook}
              selectedBooks={selectedBooks}
              selectedBookId={selectedBookId}
              setSelectedBookId={setSelectedBookId}
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
