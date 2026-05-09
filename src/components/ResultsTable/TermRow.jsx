import { TableRow, TableCell, Typography, Box, Tooltip } from "@mui/material";
import { darkTooltipProps } from "../ChartTooltip";

function BookCell({ cellData, term, bookLabel }) {
  if (!cellData) {
    return (
      <TableCell align="right">
        <Typography variant="body2" color="text.disabled">--</Typography>
      </TableCell>
    );
  }

  const tooltipContent = (
    <Box>
      <Box sx={{ fontWeight: 700, mb: 0.25 }}>{term} -- {bookLabel}</Box>
      <Box>Similarity: {cellData.similarity.toFixed(3)}</Box>
      <Box>95% CI: [{cellData.similarity_ci[0].toFixed(3)}, {cellData.similarity_ci[1].toFixed(3)}]</Box>
      <Box>z-Score: {cellData.zScore?.toFixed(3) ?? "N/A"}</Box>
      <Box>Occurrences: {cellData.n.toLocaleString()}</Box>
    </Box>
  );

  return (
    <TableCell align="right">
      <Tooltip title={tooltipContent} placement="bottom" enterDelay={250} enterNextDelay={250} arrow componentsProps={darkTooltipProps}>
        <Typography variant="body2" sx={{ cursor: "help", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>
          {cellData.similarity.toFixed(3)}
        </Typography>
      </Tooltip>
    </TableCell>
  );
}

export default function TermRow({ row, index, selectedBooks, onClick, selectedBookId }) {
  return (
    <TableRow hover onClick={() => onClick(row.term)} sx={{ cursor: "pointer" }}>
      <TableCell align="right">{index + 1}</TableCell>
      <TableCell>
        <Typography fontWeight={700} color="primary">{row.term}</Typography>
      </TableCell>
      {selectedBookId && (
        <TableCell align="right">
          {row.byBook[selectedBookId]?.zScore?.toFixed(3) ?? "--"}
        </TableCell>
      )}
      <TableCell align="right">
        <Typography variant="body2">{row.mean.toFixed(3)}</Typography>
      </TableCell>
      <TableCell align="right">{row.std.toFixed(3)}</TableCell>
      {selectedBooks.map((book) => (
        <BookCell key={book.id} cellData={row.byBook[book.id]} term={row.term} bookLabel={book.label} />
      ))}
    </TableRow>
  );
}
