import { Stack, Typography } from "@mui/material";
import BookChip from "./BookChip";


export default function CompareBar({
  bookData,
  missingBookIds,
  selectedBookId,
  setSelectedBookId,
}) {
  return (
    <Stack
      spacing={1}
      sx={{ flexShrink: 0, width: { xs: "100%", md: "auto" }, minWidth: { md: 160 } }}
    >
      <Typography variant="body2" color="text.secondary">
        Click to compare:
      </Typography>
      <Stack
        direction={{ xs: "row", md: "column" }}
        spacing={1}
        sx={{ overflowX: { xs: "auto", md: "visible" }, pb: { xs: 0.5, md: 0 } }}
      >
        {bookData.map((book) => {
          const selected = selectedBookId === book.id;
          const active = !missingBookIds.has(book.id);
          return (
            <BookChip
              key={book.id}
              label={book.label}
              selected={selected}
              active={active}
              clickable={selected || (active && bookData.length > 1)}
              onSelect={() => setSelectedBookId(selected ? null : book.id)}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
