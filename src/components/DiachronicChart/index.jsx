import { useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ErrorBar,
  ReferenceDot,
  Tooltip,
  Label,
} from "recharts";

import CenteredMessage from "../CenteredMessage";
import { INK } from "./palette";
import { buildDiachronicSeries } from "./series";
import { buildChartModel } from "./chartModel";
import { SeriesDot, SeriesLabel, DotTooltip } from "./marks";
import { labels } from "../../content/labels";
import {
  CHART_HEIGHT,
  CHART_MARGIN,
  Y_AXIS_WIDTH,
  AXIS_LABEL_SIZE,
  TICK_LABEL_SIZE,
  QUERY_DOT_R,
  NEIGHBOUR_DOT_R,
} from "./layout";

/**
 * Diachronic chart: how an expression and its nearest neighbours shift across
 * books, relative to a pinned reference book.
 *
 * The y-value is NOT a cosine between two books' vectors. Word2Vec places each
 * book in an arbitrary coordinate frame, so that quantity is meaningless, and
 * Procrustes alignment does not rescue it (measured held-out fit 0.11, against
 * 0.91 for two seeds of the SAME book). The backend uses Global Anchors /
 * second-order embeddings instead: describe the expression by its similarity to
 * every shared term, inside each book's own frame, then compare those two
 * lists. Rotation invariant by construction.
 *
 *   1.0 = the term sits in the same relational position in both books.
 *   Lower = it has moved; it keeps different company.
 *
 * Both states -- unpinned (typicality) and pinned (drift) -- render identically,
 * as focus+context: the query is the thick focal line, its neighbours are thin
 * lines that only connect on hover, so at rest the chart is one line plus dots,
 * each named by an on-chart label rather than a legend.
 *
 * The pinned reference book is excluded from the request, not from the chart --
 * its agreement with itself is a constant 1.0, which the API refuses to compute.
 * `buildDiachronicSeries` re-adds it when the chart passes `refBook` back in.
 *
 * A neighbour of the query may simply not occur in another book. The line BREAKS
 * there rather than interpolating across. "Ricardo never uses 'unproductive'" is
 * a result about the text; hiding it would present absence-of-evidence as
 * absence.
 *
 * `buildDiachronicSeries` turns the payload into one series per term;
 * `buildChartModel` turns those series into Recharts rows. See both for details.
 */

// Both axis titles; the y-axis adds `angle` on top of this.
const AXIS_TITLE_STYLE = {
  textAnchor: "middle",
  fill: INK.title,
  fontWeight: 600,
  fontSize: AXIS_LABEL_SIZE,
};

export default function DiachronicChart({
  payload,
  refBook,
  term,
  isLoading,
  hasError,
  allBooks,
}) {
  // The hovered term (or null). Hovering any of a term's dots connects that
  // term's line and dims every other series.
  const [activeTerm, setActiveTerm] = useState(null);

  // Shared selector, so the DriftTable below tabulates exactly what this chart
  // plots. Pass refBook so the pinned reference is re-added as a self-agreement
  // (1.0) marker on every line, and joins the roster the x-axis is built from.
  const { series, roster, missingEverywhere } = useMemo(
    () => buildDiachronicSeries(payload, allBooks, refBook),
    [payload, allBooks, refBook],
  );

  const { chartData, xDomain, yMin, yMax, xTicks } = useMemo(
    () => buildChartModel(series, roster),
    [series, roster],
  );

  if (isLoading) {
    return (
      <CenteredMessage height={CHART_HEIGHT}>
        <CircularProgress />
      </CenteredMessage>
    );
  }

  if (!series.length) {
    return (
      <CenteredMessage height={CHART_HEIGHT}>
        <Typography variant="body1" color="text.secondary" align="center">
          {emptyStateMessage({ term, hasError, payload, missingEverywhere })}
        </Typography>
      </CenteredMessage>
    );
  }

  const yTitle = refBook
    ? labels.typicality.pinned(refBook.label)
    : labels.typicality.label;
  const isDimmed = (t) => activeTerm !== null && activeTerm !== t;
  const querySeries = series.find((s) => s.isQuery);
  const activeSeries = series.find((s) => s.term === activeTerm);

  return (
    <Box sx={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ComposedChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid vertical={false} stroke={INK.grid} strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="year"
            domain={xDomain}
            ticks={xTicks}
            allowDecimals={false}
            height={38}
            tick={{ fontSize: TICK_LABEL_SIZE, fill: INK.tick }}
            axisLine={{ stroke: INK.axis }}
            tickLine={{ stroke: INK.axis }}
          >
            <Label
              value="Publication year"
              position="insideBottom"
              offset={-2}
              style={AXIS_TITLE_STYLE}
            />
          </XAxis>
          <YAxis
            type="number"
            domain={[yMin, yMax]}
            tickCount={6}
            tickFormatter={(v) => v.toFixed(2)}
            width={Y_AXIS_WIDTH}
            tick={{ fontSize: TICK_LABEL_SIZE, fill: INK.tick, fontVariantNumeric: "tabular-nums" }}
            axisLine={{ stroke: INK.axis }}
            tickLine={{ stroke: INK.axis }}
          >
            <Label
              value={yTitle}
              angle={-90}
              position="insideLeft"
              style={AXIS_TITLE_STYLE}
            />
          </YAxis>

          {/* Recharts positions the box; DotTooltip decides what goes in it, and
              shows nothing unless a dot is hovered. `cursor={false}` drops the
              vertical line Recharts draws by default -- it marks which book the
              numbers belong to, which the heading already says. */}
          <Tooltip
            cursor={false}
            isAnimationActive={false}
            content={<DotTooltip activeTerm={activeTerm} color={activeSeries?.color} />}
          />

          {/* Query CI as a shaded band behind everything, rather than whiskers --
              a continuous ribbon reads better for the one line that's always on
              screen. Neighbours keep whisker ErrorBars, shown only once revealed. */}
          {querySeries && (
            <Area
              type="linear"
              dataKey={(row) => row.values[querySeries.term]?.band}
              stroke="none"
              fill={querySeries.color}
              fillOpacity={isDimmed(querySeries.term) ? 0.06 : 0.15}
              connectNulls={false}
              isAnimationActive={false}
              activeDot={false}
              tooltipType="none"
            />
          )}

          {series.map((s) => {
            const dim = isDimmed(s.term);
            // Neighbour lines only connect their dots once their term is
            // hovered; the query line is always connected (the focal reference).
            const revealed = s.isQuery || activeTerm === s.term;
            return (
              <Line
                key={s.term}
                type="linear"
                dataKey={(row) => row.values[s.term]?.value}
                name={s.term}
                stroke={s.color}
                strokeWidth={s.isQuery ? 3.25 : 1}
                strokeOpacity={s.isQuery ? (dim ? 0.15 : 1) : revealed ? 1 : 0}
                connectNulls={false}
                isAnimationActive={false}
                // Recharts' own hover dot would otherwise draw on top of ours and
                // swallow the pointer event at the dot's dead centre.
                activeDot={false}
                dot={(props) => (
                  <SeriesDot
                    {...props}
                    color={s.color}
                    r={s.isQuery ? QUERY_DOT_R : NEIGHBOUR_DOT_R}
                    dim={dim}
                    onEnter={() => setActiveTerm(s.term)}
                    onLeave={() => setActiveTerm(null)}
                  />
                )}
              >
                {!s.isQuery && revealed && (
                  <ErrorBar
                    dataKey={(row) => row.values[s.term]?.ci}
                    direction="y"
                    width={4}
                    strokeWidth={1}
                    stroke={s.color}
                    strokeOpacity={0.45}
                  />
                )}
              </Line>
            );
          })}

          {/* Term labels, anchored at each series' earliest point. Points are
              already sorted ascending by year, and the selector drops any series
              with no points, so [0] is always safe.

              A second pass over `series` rather than part of the one above:
              Recharts reads its children by type to lay the chart out, so a
              ReferenceDot has to be a direct child of the chart. Returning it
              alongside a Line from one map -- in an array or a fragment -- hides
              it from that pass and it never renders. */}
          {series.map((s) => (
            <ReferenceDot
              key={`label-${s.term}`}
              x={s.points[0].year}
              y={s.points[0].similarity}
              // r=0 is load-bearing, not redundant with the null shape: the
              // label anchors off `viewBox`, which Recharts derives as
              // (cx - r, cy - r). Recharts' default r=10 would shift every term
              // label 10px up and to the left.
              r={0}
              isFront
              shape={() => null}
              label={(props) => (
                <SeriesLabel {...props} term={s.term} color={s.color} isQuery={s.isQuery} dim={isDimmed(s.term)} />
              )}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {missingEverywhere.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, display: "block" }}>
          Not shown: {missingEverywhere.join(", ")} (absent from every other book).
        </Typography>
      )}
    </Box>
  );
}

/**
 * Why there is nothing to draw. The causes look identical to a reader otherwise,
 * and "the term is missing" is a claim about the TEXT -- do not make it when the
 * real reason is that no book was pinned or nothing was ever fetched.
 */
function emptyStateMessage({ term, hasError, payload, missingEverywhere }) {
  if (!term) return "Select a term to plot drift.";
  // An Alert above already says exactly what went wrong. Guessing a second,
  // different reason underneath it would contradict it.
  if (hasError) return "Nothing to plot — see the message above.";
  if (!payload?.books?.length) return "No other books to compare.";
  if (missingEverywhere.length) {
    return `No other book contains ${missingEverywhere.map((t) => `'${t}'`).join(", ")}.`;
  }
  return `'${term}' could not be compared across books.`;
}
