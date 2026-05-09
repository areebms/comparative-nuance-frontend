import { Box } from "@mui/material";
import BookChip from "./BookChip";

export default function Legend({ bookData, hiddenBookIds, onToggleBook, selectedBooks, selectedBookId, setSelectedBookId }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "nowrap", gap: 1, overflowX: "auto", minWidth: 0 }}>
      {bookData.map((book) => (
        <BookChip
          key={book.id}
          id={book.id}
          label={book.label}
          yearColor={book.yearColor ?? { fill: "lightgrey", border: "grey", text: "grey" }}
          selected={selectedBookId === String(book.id)}
          active={!hiddenBookIds.has(book.id)}
          onToggle={() => onToggleBook(book.id)}
          onSelect={() =>
            selectedBookId === String(book.id)
              ? setSelectedBookId(null)
              : selectedBooks.length > 1 && setSelectedBookId(String(book.id))
          }
        />
      ))}
    </Box>
  );
}
