import { useMemo } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import { buildDiachronicSeries, isDrawn } from "./DiachronicChart/series";
import { QUERY_STROKE_W, NEIGHBOUR_STROKE_W } from "./DiachronicChart/layout";
import { labels } from "../content/labels";

export default function DriftTable({ payload, allBooks, sort }) {
  const { series, roster } = useMemo(
    () => buildDiachronicSeries(payload, allBooks, null, sort),
    [payload, allBooks, sort],
  );

  if (!series.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
        No drift data to tabulate yet.
      </Typography>
    );
  }

  const rows = series.filter(isDrawn).sort((a, b) => a.rank - b.rank);

  return (
    <TableContainer>
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell rowSpan={2} sx={{ ...HEAD, ...CELL }}>
              Expression
            </TableCell>
            <TableCell rowSpan={2} align="right" sx={{ ...HEAD, ...CELL }}>
              <HelpLabel {...labels.columns.stability} />
            </TableCell>
            <TableCell rowSpan={2} align="right" sx={{ ...HEAD, ...CELL }}>
              <HelpLabel {...labels.columns.instability} />
            </TableCell>
            <TableCell
              colSpan={roster.length}
              align="center"
              sx={{ ...HEAD, ...CELL }}
            >
              {labels.columns.booksGroup}
            </TableCell>
          </TableRow>
          <TableRow>
            {roster.map((b) => (
              <TableCell key={b.id} align="right" sx={{ ...HEAD, ...CELL }}>
                {b.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((s) => {
            const byBook = new Map(s.points.map((p) => [p.id, p]));
            const gapByBook = new Map(s.gaps.map((g) => [g.id, g]));
            return (
              <TableRow key={s.term} hover>
                <TableCell sx={CELL}>
                  <TermCell series={s} />
                </TableCell>
                <TableCell align="right" sx={CELL}>
                  <RankStatCell stats={s.stats} stat="stability" />
                </TableCell>
                <TableCell align="right" sx={CELL}>
                  <RankStatCell stats={s.stats} stat="instability" />
                </TableCell>
                {roster.map((b) => {
                  const p = byBook.get(b.id);
                  const gap = gapByBook.get(b.id);
                  return (
                    <TableCell key={b.id} align="right" sx={CELL}>
                      {p ? (
                        <MeasurementValue point={p} />
                      ) : gap ? (
                        <GapText
                          cause={gap.cause}
                          missingTerms={gap.missingTerms}
                          compact
                        />
                      ) : (
                        <Dash />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const SWATCH_MIN_H = 2;

function SeriesSwatch({ color, isQuery }) {
  return (
    <Box
      sx={{
        width: 14,
        height: Math.max(
          SWATCH_MIN_H,
          isQuery ? QUERY_STROKE_W : NEIGHBOUR_STROKE_W,
        ),
        bgcolor: color,
        borderRadius: 1,
        flex: "0 0 auto",
      }}
    />
  );
}

function TermCell({ series }) {
  const term = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <SeriesSwatch color={series.color} isQuery={series.isQuery} />
      <Typography
        variant="body2"
        sx={{ fontWeight: series.isQuery ? 700 : 500 }}
      >
        {series.term}
      </Typography>
    </Box>
  );

  if (!series.stats) return term;

  const { n_books_in, stability, instability } = series.stats;
  return (
    <Tooltip
      title={
        `Stability ${stability.toFixed(3)}, Instability ` +
        `${instability.toFixed(3)}, across the ${n_books_in} ` +
        `book${n_books_in === 1 ? "" : "s"} that use it.`
      }
    >
      <Box sx={{ cursor: "help", display: "inline-block" }}>{term}</Box>
    </Tooltip>
  );
}

function RankStatCell({ stats, stat }) {
  if (!stats) return <Dash />;
  return (
    <Typography variant="body2" sx={NUM}>
      {stats[stat].toFixed(3)}
    </Typography>
  );
}

function MeasurementValue({ point }) {
  const value = (
    <Typography variant="body2" sx={NUM}>
      {point.similarity.toFixed(3)}
    </Typography>
  );
  if (!point.measurement) return value;

  const { similarity_ci, count, n_seeds } = point.measurement;
  return (
    <Tooltip
      title={
        <Box sx={{ fontVariantNumeric: "tabular-nums" }}>
          <div>
            95% CI [{similarity_ci[0].toFixed(3)}, {similarity_ci[1].toFixed(3)}
            ]
          </div>
          <div>
            {count.toLocaleString()} uses · {n_seeds} seed
            {n_seeds === 1 ? "" : "s"}
          </div>
        </Box>
      }
    >
      <Box sx={{ cursor: "help", display: "inline-block" }}>{value}</Box>
    </Tooltip>
  );
}

function GapText({ cause, missingTerms, compact = false }) {
  const copy = labels.gaps[cause];
  return (
    <Tooltip title={copy.detail(missingTerms)}>
      <Typography variant="body2" color="text.disabled" sx={{ cursor: "help" }}>
        {compact ? "--" : copy.short}
      </Typography>
    </Tooltip>
  );
}

function HelpLabel({ short, help }) {
  return (
    <Tooltip title={help}>
      <Box
        component="span"
        sx={{ cursor: "help", borderBottom: "1px dotted currentColor" }}
      >
        {short}
      </Box>
    </Tooltip>
  );
}

const Dash = () => (
  <Typography variant="body2" color="text.disabled">
    --
  </Typography>
);

const HEAD = { fontWeight: 700 };
const NUM = { fontVariantNumeric: "tabular-nums" };
const CELL = { py: 0.5 };
