import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function BookTooltipContent({ bookId, stats }) {
  if (!stats) {
    return `Book ID: ${bookId}`;
  }

  return (
    <Box>
      <Typography variant="caption" color="inherit">
        {stats.removed} terms were missing from other books.
      </Typography>
    </Box>
  );
}

function ResultsTableHeader({ selectedBooks, selectedBookId, calcStats }) {
  return (
    <TableHead>
      <TableRow>
        <TableCell width={50} sx={{ fontWeight: 700 }}>
          #
        </TableCell>
        <TableCell width={220} sx={{ fontWeight: 700 }}>
          Term
        </TableCell>
        {selectedBookId && (
          <TableCell width={140} sx={{ fontWeight: 700 }}>
            zScore
          </TableCell>
        )}

        <TableCell width={150} sx={{ fontWeight: 700 }}>
          Consensus (Mean Similarity)
        </TableCell>
        <TableCell width={100} sx={{ fontWeight: 700 }}>
          Elasticity (SD)
        </TableCell>

        {selectedBooks.map((book) => (
          <TableCell key={book.id} sx={{ fontWeight: 700 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <span>{book.label}</span>
              <Tooltip
                title={
                  <BookTooltipContent
                    bookId={book.id}
                    stats={calcStats?.[book.id]}
                  />
                }
                arrow
              >
                <IconButton
                  size="small"
                  aria-label={`Book ID ${book.id}`}
                  sx={{ color: "text.secondary" }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function BookCell({ cellData }) {
  if (!cellData) {
    return (
      <TableCell>
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <Box>
        <Typography fontWeight={700} variant="body2">
          {cellData.similarity.toFixed(3)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {cellData.coherence.toFixed(1)}% (n={cellData.n})
        </Typography>
      </Box>
    </TableCell>
  );
}

function TermRow({ row, index, selectedBooks, onClick, selectedBookId }) {
  return (
    <TableRow
      hover
      sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
    >
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Typography
          fontWeight={700}
          color="primary"
          onClick={() => onClick(row.term)}
        >
          {row.term}
        </Typography>
      </TableCell>
      {selectedBookId && (
        <TableCell>{row.byBook[selectedBookId].zScore.toFixed(3)}</TableCell>
      )}

      <TableCell>
        <Typography fontWeight={700} variant="body2">
          {row.mean.toFixed(3)}
        </Typography>
      </TableCell>
      <TableCell>{row.std.toFixed(3)}</TableCell>
      {selectedBooks.map((book) => (
        <BookCell key={book.id} cellData={row.byBook[book.id]} />
      ))}
    </TableRow>
  );
}

export default function ResultsTable({
  rows,
  selectedBooks,
  calcStats,
  onClick,
  selectedBookId,
}) {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} size="small">
        <ResultsTableHeader
          selectedBooks={selectedBooks}
          selectedBookId={selectedBookId}
          calcStats={calcStats}
        />
        <TableBody>
          {rows.map((row, index) => (
            <TermRow
              key={row.term}
              row={row}
              index={index}
              selectedBooks={selectedBooks}
              onClick={onClick}
              selectedBookId={selectedBookId}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
