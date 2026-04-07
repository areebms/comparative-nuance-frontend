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

const darkTooltipProps = {
  tooltip: {
    sx: {
      bgcolor: "rgba(17,24,39,0.92)",
      color: "#fff",
      borderRadius: 1,
      fontSize: 12,
      lineHeight: 1.6,
      px: 1.5,
      py: 1,
      maxWidth: 300,
      "& .MuiTooltip-arrow": { color: "rgba(17,24,39,0.92)" },
    },
  },
};

const BOOK_DESCRIPTIONS = {
  // keyed by book.id — fall back gracefully if id not matched
  60411: {
    title: "An Inquiry into the Principles of Political Economy",
    body: "The first systematic treatment of political economy in English. Steuart advanced a mercantilist framework in which the state actively regulates trade, population, and money supply, with distinctive attention to monetary circulation and effective demand.",
  },
  3300: {
    title: "The Wealth of Nations",
    body: "A foundational text of classical economics. Smith argued that the division of labour, capital accumulation, and the price mechanism coordinate economic activity without central direction, establishing the terms of economic debate for the century that followed.",
  },
  33310: {
    title: "Principles of Political Economy and Taxation",
    body: "A rigorous deductive treatment of value, distribution, and trade. Ricardo developed the labour theory of value, formalized comparative advantage, and introduced differential rent. His framework became the dominant mode of classical economic reasoning.",
  },
  30107: {
    title: "Principles of Political Economy",
    body: "A synthesis of classical theory with questions of social organization. Mill distinguished between the laws of production, treated as objective constraints, and those of distribution, which he argued are shaped by institutions and open to reform.",
  },
  45002: {
    title: "Economic Harmonies",
    body: "A theoretical defense of market liberalism. Bastiat argued that the free exchange of services constitutes the fundamental economic relation and that unimpeded markets tend naturally toward the harmonization of individual and social interests.",
  },
};

// no hardcoded fontSize — Typography variant="caption" inherits the theme font
const pinnedBase = { bgcolor: "action.hover", py: 0.25, borderBottom: "none" };
const pinnedDivider = { ...pinnedBase, borderBottom: "2px solid", borderColor: "divider" };

const labelSx = {
  fontWeight: 700,
  //  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "text.disabled",
};

function BookTooltipContent({ book }) {
  const desc = BOOK_DESCRIPTIONS[book.id];
  return (
    <Box>
      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{desc.title}</Box>
      <Box sx={{ mb: 1, lineHeight: 1.6 }}>{desc.body}</Box>
    </Box>
  );
}

function ResultsTableHeader({ selectedBooks, selectedBookId }) {
  return (
    <TableHead>
      <TableRow>
        <TableCell width={50} align="right" sx={{ fontWeight: 700 }}>
          #
        </TableCell>
        <TableCell width={220} sx={{ fontWeight: 700 }}>
          Term
        </TableCell>
        {selectedBookId && (
          <TableCell width={140} align="right" sx={{ fontWeight: 700 }}>
            zScore
          </TableCell>
        )}
        <TableCell width={150} align="right" sx={{ fontWeight: 700 }}>
          Consensus (Mean Similarity)
        </TableCell>
        <TableCell width={100} align="right" sx={{ fontWeight: 700 }}>
          Divergence (SD)
        </TableCell>
        {selectedBooks.map((book) => (
          <TableCell
            key={book.id}
            align="right"
            sx={{ fontWeight: 700, bgcolor: book.yearColor?.fill, color: book.yearColor?.text }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
              <span>{book.label}</span>
              <Tooltip
                title={<BookTooltipContent book={book} />}
                arrow
                componentsProps={darkTooltipProps}
              >
                <IconButton
                  size="small"
                  aria-label={`About ${book.label}`}
                  sx={{ color: book.yearColor?.text ?? "text.secondary" }}
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

function PinnedMetaRows({ selectedBooks, calcStats, selectedBookId, hiddenCount }) {
  return (
    <>
      {/* row 1 — total terms per book */}
      <TableRow>
        <TableCell sx={pinnedBase} />
        <TableCell sx={pinnedBase}>
          <Typography variant="caption" sx={labelSx}>total terms</Typography>
        </TableCell>
        {selectedBookId && (
          <TableCell sx={pinnedBase} align="right">
            <Typography variant="caption" color="text.disabled">—</Typography>
          </TableCell>
        )}
        <TableCell sx={pinnedBase} align="right">
          <Typography variant="caption" color="text.disabled">—</Typography>
        </TableCell>
        <TableCell sx={pinnedBase} align="right">
          <Typography variant="caption" color="text.disabled">—</Typography>
        </TableCell>
        {selectedBooks.map((book) => (
          <TableCell
            key={book.id}
            align="right"
            sx={{ ...pinnedBase, bgcolor: book.yearColor?.fill ?? "action.hover" }}
          >
            <Typography variant="caption" sx={{ color: book.yearColor?.text ?? "text.secondary" }}>
              {calcStats?.[book.id]?.total.toLocaleString() ?? "—"}
            </Typography>
          </TableCell>
        ))}
      </TableRow>

      {/* row 2 — excluded per book, heavier border separates from data */}
      <TableRow>
        <TableCell sx={pinnedDivider} />
        <TableCell sx={pinnedDivider}>
          <Typography variant="caption" sx={labelSx}>excluded</Typography>
        </TableCell>
        {selectedBookId && (
          <TableCell sx={pinnedDivider} align="right">
            <Typography variant="caption" color="text.disabled">—</Typography>
          </TableCell>
        )}
        <TableCell sx={pinnedDivider} align="right">
          <Typography variant="caption" color="text.disabled">—</Typography>
        </TableCell>
        <TableCell sx={pinnedDivider} align="right">
          <Typography variant="caption" color="text.disabled">—</Typography>
        </TableCell>
        {selectedBooks.map((book) => (
          <TableCell
            key={book.id}
            align="right"
            sx={{ ...pinnedDivider, bgcolor: book.yearColor?.fill ?? "action.hover" }}
          >
            {calcStats?.[book.id] ? (
              <Typography variant="caption" sx={{ color: "warning.main", fontWeight: 500 }}>
                -{calcStats[book.id].removed.toLocaleString()}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.disabled">—</Typography>
            )}
          </TableCell>
        ))}
      </TableRow>
    </>
  );
}

function BookCell({ cellData, term, bookLabel }) {
  if (!cellData) {
    return (
      <TableCell align="right">
        <Typography variant="body2" color="text.disabled">—</Typography>
      </TableCell>
    );
  }

  const tooltipContent = (
    <Box>
      <Box sx={{ fontWeight: 700, mb: 0.25 }}>{term} — {bookLabel}</Box>
      <Box>Similarity: {cellData.similarity.toFixed(3)}</Box>
      <Box>95% CI: [{cellData.similarity_ci[0].toFixed(3)}, {cellData.similarity_ci[1].toFixed(3)}]</Box>
      <Box>z-Score: {cellData.zScore?.toFixed(3) ?? "N/A"}</Box>
      <Box>Occurrences: {cellData.n.toLocaleString()}</Box>
    </Box>
  );

  return (
    <TableCell align="right">
      <Tooltip
        title={tooltipContent}
        placement="bottom"
        enterDelay={250}
        enterNextDelay={250}
        arrow
        componentsProps={darkTooltipProps}
      >
        <Typography
          variant="body2"
          sx={{ cursor: "help", textDecoration: "underline dotted", textUnderlineOffset: 3 }}
        >
          {cellData.similarity.toFixed(3)}
        </Typography>
      </Tooltip>
    </TableCell>
  );
}

function TermRow({ row, index, selectedBooks, onClick, selectedBookId }) {
  return (
    <TableRow hover onClick={() => onClick(row.term)} sx={{ cursor: "pointer" }}>
      <TableCell align="right">{index + 1}</TableCell>
      <TableCell>
        <Typography fontWeight={700} color="primary">{row.term}</Typography>
      </TableCell>
      {selectedBookId && (
        <TableCell align="right">
          {row.byBook[selectedBookId]?.zScore?.toFixed(3) ?? "—"}
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

function HiddenTermsRow({ count, colSpan }) {
  if (!count || count <= 0) return null;
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        align="center"
        sx={{ color: "text.disabled", borderBottom: "none", py: 1.5 }}
      >
        <Typography variant="caption" color="text.disabled">
          {count.toLocaleString()} shared terms not shown
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export default function ResultsTable({
  rows,
  selectedBooks,
  calcStats,
  onClick,
  selectedBookId,
  hiddenCount,
}) {
  // total column count for the footer colspan
  const colSpan = 3 + (selectedBookId ? 1 : 0) + selectedBooks.length;
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} size="small">
        <ResultsTableHeader
          selectedBooks={selectedBooks}
          selectedBookId={selectedBookId}
          calcStats={calcStats}
        />
        <TableBody>
          <PinnedMetaRows
            selectedBooks={selectedBooks}
            calcStats={calcStats}
            selectedBookId={selectedBookId}
          />
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
