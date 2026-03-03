import {
  AppBar,
  Autocomplete,
  Toolbar,
  TextField,
  Box,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import PushPinIcon from "@mui/icons-material/PushPin";

import { getColorForBook } from "../utils/bookColors";

const BookChip = ({
  id,
  label,
  selected,
  active,
  color,
  onSelect,
  onClick,
}) => {
  const primaryColor = active ? color : "grey";
  const backgroundColor = active ? "transparent" : "lightgrey";

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
        bgcolor: backgroundColor,
        color: primaryColor,
        border: `1px solid ${primaryColor}`,
        fontWeight: 600,
        "& .MuiChip-deleteIcon": {
          color: primaryColor,
          "&:hover": { color: primaryColor },
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
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
    {bookData.map((book) => (
      <BookChip
        id={book.id}
        label={book.label}
        color={getColorForBook(book.position)}
        selected={selectedBookId == String(book.id)}
        active={book.displayed}
        onClick={() => handleToggleBook(book.id)}
        onSelect={() =>
          selectedBookId == String(book.id)
            ? setSelectedBookId(null)
            : selectedBooks.length > 1 && setSelectedBookId(String(book.id))
        }
      />
    ))}
  </Box>
);

export default function TopBar({
  term,
  onTermChange,
  bookData,
  setBookData,
  selectedBooks = [],
  selectedBookId,
  setSelectedBookId,
  topN,
  onTopNChange,
}) {
  const handleToggleBook = (bookId) => {
    setBookData((prevBookData) => {
      selectedBookId == String(bookId) && setSelectedBookId(null);
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
      <Toolbar sx={{ gap: 2, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          <Legend
            bookData={bookData}
            handleToggleBook={handleToggleBook}
            selectedBooks={selectedBooks}
            selectedBookId={selectedBookId}
            setSelectedBookId={setSelectedBookId}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            marginLeft: "auto",
          }}
        >
          <Autocomplete
            options={[]}
            value={term}
            onChange={(_, value) => onTermChange(value ?? "")}
            sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Term (e.g. market)"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <FormControl size="small" sx={{ minWidth: 85 }}>
            <InputLabel>Show top</InputLabel>
            <Select
              value={topN}
              label="Showing top"
              onChange={(e) => onTopNChange(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
