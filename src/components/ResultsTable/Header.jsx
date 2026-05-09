import { TableHead, TableRow, TableCell, Box, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { darkTooltipProps } from "../ChartTooltip";
import BOOK_DESCRIPTIONS from "../../utils/bookDescriptions";

function BookTooltipContent({ book }) {
  const desc = BOOK_DESCRIPTIONS[book.id];
  if (!desc) return null;
  return (
    <Box>
      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{desc.title}</Box>
      <Box sx={{ mb: 1, lineHeight: 1.6 }}>{desc.body}</Box>
    </Box>
  );
}

export default function Header({ selectedBooks, selectedBookId }) {
  return (
    <TableHead>
      <TableRow>
        <TableCell width={50} align="right" sx={{ fontWeight: 700 }}>#</TableCell>
        <TableCell width={220} sx={{ fontWeight: 700 }}>Term</TableCell>
        {selectedBookId && (
          <TableCell width={140} align="right" sx={{ fontWeight: 700 }}>zScore</TableCell>
        )}
        <TableCell width={150} align="right" sx={{ fontWeight: 700 }}>Consensus (Mean Similarity)</TableCell>
        <TableCell width={100} align="right" sx={{ fontWeight: 700 }}>Divergence (SD)</TableCell>
        {selectedBooks.map((book) => (
          <TableCell
            key={book.id}
            align="right"
            sx={{ fontWeight: 700, bgcolor: book.yearColor?.fill, color: book.yearColor?.text }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
              <span>{book.label}</span>
              {BOOK_DESCRIPTIONS[book.id] && (
                <Tooltip title={<BookTooltipContent book={book} />} arrow componentsProps={darkTooltipProps}>
                  <IconButton
                    size="small"
                    aria-label={`About ${book.label}`}
                    sx={{ color: book.yearColor?.text ?? "text.secondary" }}
                  >
                    <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
