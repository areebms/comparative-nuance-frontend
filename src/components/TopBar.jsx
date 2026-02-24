import { useState } from "react";
import {
  AppBar,
  Toolbar,
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import BookPicker from "./BookPicker";
import { getColorForBook } from "../utils/bookColors";

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
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const selectedCount = selectedBooks.length;
  const totalCount = bookData.length;

  const handleTermChange = (event) => {
    onTermChange(event.target.value);
  };

  const togglePicker = () => {
    setIsPickerOpen((isOpen) => !isOpen);
  };

  const closePicker = () => {
    setIsPickerOpen(false);
  };

  const renderLegend = () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {selectedBooks.map((book) => (
        <Chip
          key={book.id}
          label={book.label}
          size="small"
          clickable
          onClick={() =>
            selectedBookId == String(book.id)
              ? setSelectedBookId(null)
              : selectedBooks.length > 1 && setSelectedBookId(String(book.id))
          }
          sx={{
            bgcolor:
              selectedBookId === String(book.id)
                ? getColorForBook(book.position)
                : "transparent",
            color:
              selectedBookId === String(book.id)
                ? "#fff"
                : getColorForBook(book.position),
            border: `1px solid ${getColorForBook(book.position)}`,
            fontWeight: 600,
            "& .MuiChip-label": {
              px: 2,
            },
          }}
        />
      ))}
    </Box>
  );

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

          <Box sx={{ position: "relative" }}>
            <Button
              variant="outlined"
              onClick={togglePicker}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Select Books: {selectedCount} / {totalCount}
            </Button>

            {isPickerOpen && (
              <BookPicker
                bookData={bookData}
                setBookData={setBookData}
                onClose={closePicker}
              />
            )}
          </Box>

          {renderLegend()}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            marginLeft: "auto",
          }}
        >
          <TextField
            value={term}
            onChange={handleTermChange}
            placeholder="Term (e.g. market)"
            size="small"
            sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
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
          <IconButton aria-label="Settings">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
