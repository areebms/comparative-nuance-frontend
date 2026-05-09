import { TableRow, TableCell, Typography } from "@mui/material";

const pinnedBase = { bgcolor: "action.hover", py: 0.25, borderBottom: "none" };
const pinnedDivider = { ...pinnedBase, borderBottom: "2px solid", borderColor: "divider" };
const labelSx = { fontWeight: 700, letterSpacing: "0.06em", color: "text.disabled" };

export default function PinnedMetaRows({ selectedBooks, calcStats, selectedBookId }) {
  const placeholderCells = (sx) => (
    <>
      {selectedBookId && (
        <TableCell sx={sx} align="right">
          <Typography variant="caption" color="text.disabled">--</Typography>
        </TableCell>
      )}
      <TableCell sx={sx} align="right">
        <Typography variant="caption" color="text.disabled">--</Typography>
      </TableCell>
      <TableCell sx={sx} align="right">
        <Typography variant="caption" color="text.disabled">--</Typography>
      </TableCell>
    </>
  );

  return (
    <>
      <TableRow>
        <TableCell sx={pinnedBase} />
        <TableCell sx={pinnedBase}>
          <Typography variant="caption" sx={labelSx}>total terms</Typography>
        </TableCell>
        {placeholderCells(pinnedBase)}
        {selectedBooks.map((book) => (
          <TableCell key={book.id} align="right" sx={{ ...pinnedBase, bgcolor: book.yearColor?.fill ?? "action.hover" }}>
            <Typography variant="caption" sx={{ color: book.yearColor?.text ?? "text.secondary" }}>
              {calcStats?.[book.id]?.total.toLocaleString() ?? "--"}
            </Typography>
          </TableCell>
        ))}
      </TableRow>

      <TableRow>
        <TableCell sx={pinnedDivider} />
        <TableCell sx={pinnedDivider}>
          <Typography variant="caption" sx={labelSx}>excluded</Typography>
        </TableCell>
        {placeholderCells(pinnedDivider)}
        {selectedBooks.map((book) => (
          <TableCell key={book.id} align="right" sx={{ ...pinnedDivider, bgcolor: book.yearColor?.fill ?? "action.hover" }}>
            {calcStats?.[book.id] ? (
              <Typography variant="caption" sx={{ color: "warning.main", fontWeight: 500 }}>
                -{calcStats[book.id].removed.toLocaleString()}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.disabled">--</Typography>
            )}
          </TableCell>
        ))}
      </TableRow>
    </>
  );
}
