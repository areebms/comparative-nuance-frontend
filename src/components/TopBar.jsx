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
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import PushPinIcon from "@mui/icons-material/PushPin";


const BookChip = ({
  id,
  label,
  selected,
  active,
  yearColor,
  onSelect,
  onClick,
}) => {
  const borderColor = active ? yearColor.border : "grey";
  const bgColor = active ? yearColor.fill : "lightgrey";
  const textColor = active ? yearColor.text : "grey";

  return (
    <Chip
      key={id}
      label={label}
      size="medium"
      variant="outlined"
      clickable
      onClick={onClick}
      onDelete={onSelect}
      deleteIcon={selected ? <PushPinIcon /> : <CheckBoxOutlineBlankIcon />}
      sx={{
        bgcolor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        fontWeight: 600,
        "& .MuiChip-deleteIcon": {
          color: textColor,
          "&:hover": { color: textColor },
          pointerEvents: active ? "auto" : "none",
          cursor: active ? "pointer" : "default",
          opacity: active ? 1 : 0.5,
        },
        "& .MuiChip-label": {
          px: 2,
        },
      }}
    />
  );
};

const Legend = ({
  bookData,
  handleToggleBook,
  selectedBooks,
  selectedBookId,
  setSelectedBookId,
}) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "nowrap",
      gap: 1,
      overflowX: "auto",
      minWidth: 0,
    }}
  >
    {bookData.map((book) => (
      <BookChip
        id={book.id}
        label={book.label}
        yearColor={book.yearColor ?? { fill: "lightgrey", border: "grey", text: "grey" }}
        selected={selectedBookId === String(book.id)}
        active={book.displayed}
        onClick={() => handleToggleBook(book.id)}
        onSelect={() =>
          selectedBookId === String(book.id)
            ? setSelectedBookId(null)
            : selectedBooks.length > 1 && setSelectedBookId(String(book.id))
        }
      />
    ))}
  </Box>
);

export default function TopBar({
  terms,
  onTermsChange,
  sharedTerms,
  bookData,
  setBookData,
  selectedBooks = [],
  selectedBookId,
  setSelectedBookId,
  sort,
  onSortChange,
}) {
  const [draftTerms, setDraftTerms] = useState(terms);
  useEffect(() => {
    setDraftTerms(terms);
  }, [terms]);

  const handleToggleBook = (bookId) => {
    setBookData((prevBookData) => {
      selectedBookId === String(bookId) && setSelectedBookId(null);
      return prevBookData.map((book) =>
        book.id === bookId ? { ...book, displayed: !book.displayed } : book,
      );
    });
  };

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
      <Toolbar
        sx={{ gap: 2, alignItems: "center", width: "100%", flexWrap: "wrap" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minWidth: 0,
            flexShrink: 0,
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
              onChange={(_, newValue) => {
                if (newValue.length <= 2) {
                  setDraftTerms(newValue);
                  if (newValue.length >= 1) onTermsChange(newValue);
                }
              }}
              onBlur={() => {
                if (draftTerms.length === 0) setDraftTerms(terms);
              }}
              getOptionDisabled={() => draftTerms.length >= 2}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
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
                  placeholder={draftTerms.length === 0 ? "Select a term" : draftTerms.length === 1 ? "Add second term" : ""}
                  label="Reference Terms"
                  size="small"
                />
              )}
            />

            <FormControl size="small" sx={{ minWidth: 190, flexShrink: 0 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                disabled={selectedBookId}
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
              handleToggleBook={handleToggleBook}
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
