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
import { buildDiachronicSeries } from "./DiachronicChart/series";
import { QUERY_STROKE_W, NEIGHBOUR_STROKE_W } from "./DiachronicChart/layout";
import { labels } from "../content/labels";

export default function DriftTable({ payload, allBooks, sort }) {
  const { series, roster } = useMemo(
    () => buildDiachronicSeries(payload, allBooks),
    [payload, allBooks],
  );

  if (!series.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
        No drift data to tabulate yet.
      </Typography>
    );
  }

  const rows = [...series].sort(
    (a, b) => Number(b.isQuery) - Number(a.isQuery),
  );
  const bySimilarity = sort === "mean_similarity";

  return (
    <TableContainer>
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={HEAD}>Term</TableCell>
            <TableCell align="right" sx={HEAD}>
              <HelpLabel
                {...(bySimilarity ? labels.columns.similarity : labels.columns.trend)}
              />
            </TableCell>
            {roster.map((b) => (
              <TableCell key={b.id} align="right" sx={HEAD}>
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
                <TableCell>
                  <TermCell series={s} />
                </TableCell>
                <TableCell align="right">
                  {bySimilarity ? (
                    <SimilarityCell stats={s.stats} />
                  ) : (
                    <TrendCell stats={s.stats} />
                  )}
                </TableCell>
                {roster.map((b) => {
                  const p = byBook.get(b.id);
                  const gap = gapByBook.get(b.id);
                  return (
                    <TableCell key={b.id} align="right">
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
  const tags = series.stats?.tags ?? [];
  const term = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <SeriesSwatch color={series.color} isQuery={series.isQuery} />
      <Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: series.isQuery ? 700 : 500 }}
        >
          {series.term}
        </Typography>
        {tags.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            {tags.map((t) => POS_NAMES[t] ?? t).join(" · ")}
          </Typography>
        )}
      </Box>
    </Box>
  );

  if (!series.stats) return term;

  const { mean_similarity, n_books_with_term } = series.stats;
  return (
    <Tooltip
      title={
        `Similarity to the query: ${mean_similarity.toFixed(3)}, averaged over ` +
        `the ${n_books_with_term} book${n_books_with_term === 1 ? "" : "s"} that use it.`
      }
    >
      <Box sx={{ cursor: "help", display: "inline-block" }}>{term}</Box>
    </Tooltip>
  );
}

function TrendCell({ stats }) {
  if (!stats) return <Dash />;
  if (stats.slope === 0 && stats.r_squared === 0) {
    return (
      <Typography variant="body2" color="text.disabled">
        no fit
      </Typography>
    );
  }
  const perCentury = stats.slope * 100;
  return (
    <>
      <Typography variant="body2" sx={NUM}>
        {perCentury > 0 ? "+" : "−"}
        {Math.abs(perCentury).toFixed(3)}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ ...NUM, display: "block" }}
      >
        r² {stats.r_squared.toFixed(2)}
      </Typography>
    </>
  );
}

function SimilarityCell({ stats }) {
  if (!stats) return <Dash />;
  return (
    <>
      <Typography variant="body2" sx={NUM}>
        {stats.mean_similarity.toFixed(3)}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ ...NUM, display: "block" }}
      >
        {stats.n_books_with_term} book{stats.n_books_with_term === 1 ? "" : "s"}
      </Typography>
    </>
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

const POS_NAMES = { N: "noun", V: "verb", J: "adjective", R: "adverb" };

const HEAD = { fontWeight: 700 };
const NUM = { fontVariantNumeric: "tabular-nums" };
