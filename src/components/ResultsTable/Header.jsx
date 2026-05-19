import { TableHead, TableRow, TableCell, Box, Typography } from "@mui/material";
import InfoTooltip from "./InfoTooltip";
import { labels } from "../../content/labels";
import BOOK_DESCRIPTIONS from "../../content/bookDescriptions";

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

function HeaderLabel({ label, technical, tooltip }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <InfoTooltip title={tooltip}>
        {label}
      </InfoTooltip>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
        {technical}
      </Typography>
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
          <TableCell width={200} align="right" sx={{ fontWeight: 700 }}>
            <HeaderLabel
              label={labels.relativeEmphasis.label}
              technical={labels.relativeEmphasis.technical}
              tooltip={labels.relativeEmphasis.tooltip}
            />
          </TableCell>
        )}
        <TableCell width={150} align="right" sx={{ fontWeight: 700 }}>
          <HeaderLabel
            label={labels.consensus.label}
            technical={labels.consensus.technical}
            tooltip={labels.consensus.tooltip}
          />
        </TableCell>
        <TableCell width={140} align="right" sx={{ fontWeight: 700 }}>
          <HeaderLabel
            label={labels.divergence.label}
            technical={labels.divergence.technical}
            tooltip={labels.divergence.tooltip}
          />
        </TableCell>
        {selectedBooks.map((book) => (
          <TableCell
            key={book.id}
            align="right"
            sx={{ fontWeight: 700, bgcolor: book.yearColor?.fill, color: book.yearColor?.text }}
          >
            {BOOK_DESCRIPTIONS[book.id] ? (
              <InfoTooltip title={<BookTooltipContent book={book} />}>
                {book.label}
              </InfoTooltip>
            ) : (
              book.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
