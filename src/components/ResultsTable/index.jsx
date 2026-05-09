import { Table, TableBody, TableRow, TableCell, TableContainer, Typography } from "@mui/material";
import Header from "./Header";
import PinnedMetaRows from "./PinnedMetaRows";
import TermRow from "./TermRow";

function HiddenTermsRow({ count, colSpan }) {
  if (!count || count <= 0) return null;
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ color: "text.disabled", borderBottom: "none", py: 1.5 }}>
        <Typography variant="caption" color="text.disabled">
          {count.toLocaleString()} shared terms not shown
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export default function ResultsTable({ rows, selectedBooks, calcStats, onClick, selectedBookId, hiddenCount }) {
  const colSpan = 3 + (selectedBookId ? 1 : 0) + selectedBooks.length;
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} size="small">
        <Header selectedBooks={selectedBooks} selectedBookId={selectedBookId} />
        <TableBody>
          <PinnedMetaRows selectedBooks={selectedBooks} calcStats={calcStats} selectedBookId={selectedBookId} />
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
          <HiddenTermsRow count={hiddenCount} colSpan={colSpan} />
        </TableBody>
      </Table>
    </TableContainer>
  );
}
