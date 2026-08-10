import { useMemo } from "react";
import { Box } from "@mui/material";
import { Text, usePlotArea, useYAxisScale } from "recharts";

import { INK } from "./palette";
import {
  LABEL_LINE_H,
  LABEL_FONT_SIZE,
  labelLines,
  stackLabels,
  termWeight,
} from "./layout";

export function SeriesDot({ cx, cy, value, color, r, dim, onEnter, onLeave }) {
  if (cx == null || cy == null || value == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color}
      stroke={INK.surface}
      strokeWidth={1}
      opacity={dim ? 0.15 : 1}
      // The dot is filled, so it would catch the pointer anyway; saying so keeps
      // the hover from depending on that.
      style={{ pointerEvents: "all" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    />
  );
}

/**
 * What the tooltip shows: the one dot under the pointer, not every term at that
 * book. `activeTerm` is set by SeriesDot, so between dots there is nothing to
 * show and this renders nothing -- the tooltip appears on dots only, in step
 * with the line reveal. Recharts still owns where the box goes.
 *
 * The numbers come off the row Recharts hands us, which is the one nearest the
 * pointer's x. Two books published in the same year share an x, so that row can
 * be the neighbouring book's -- the heading names whichever book the numbers
 * belong to, so the box is always self-consistent.
 */
export function DotTooltip({ active, payload, activeTerm, color }) {
  const row = payload?.[0]?.payload;
  const point = active && activeTerm ? row?.values?.[activeTerm] : null;
  if (!point) return null;
  const [lo, hi] = point.band ?? [];
  return (
    <Box
      sx={{
        background: "rgba(17,24,39,0.94)",
        color: "#fff",
        borderRadius: 1,
        px: 1.5,
        py: 1,
        fontSize: 12,
        lineHeight: 1.55,
        pointerEvents: "none",
        boxShadow: 3,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{row.book}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            flex: "0 0 auto",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
        <span>{activeTerm}</span>
        <span
          style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}
        >
          {point.value.toFixed(3)}
          {lo != null && (
            <span style={{ color: "#9ca3af" }}>
              {" "}
              [{lo.toFixed(3)}, {hi.toFixed(3)}]
            </span>
          )}
        </span>
      </div>
    </Box>
  );
}

export function SeriesLabels({ series, width, activeTerm, onHover }) {
  const plot = usePlotArea();
  const yScale = useYAxisScale();

  const placed = useMemo(
    () => (plot && yScale ? place(series, width, plot, yScale) : null),
    [series, width, plot, yScale],
  );

  if (!placed) return null;
  const { labelled, tops, right } = placed;

  return (
    <g className="diachronic-series-labels">
      {labelled.map(({ series: s, height }, i) =>
        tops[i] == null ? null : (
          <g
            key={s.term}
            onMouseEnter={() => onHover(s.term)}
            onMouseLeave={() => onHover(null)}
          >
            <rect
              x={right - width}
              y={tops[i]}
              width={width}
              height={height}
              fill="transparent"
              pointerEvents="all"
            />
            <Text
              x={right}
              y={tops[i]}
              textAnchor="end"
              verticalAnchor="start"
              width={width}
              fontSize={LABEL_FONT_SIZE}
              fontWeight={termWeight(s.isQuery)}
              fill={s.color}
              opacity={activeTerm !== null && activeTerm !== s.term ? 0.25 : 1}
              stroke={INK.surface}
              strokeWidth={3}
              strokeLinejoin="round"
              paintOrder="stroke"
              pointerEvents="none"
            >
              {s.term}
            </Text>
          </g>
        ),
      )}
    </g>
  );
}

function place(series, width, plot, yScale) {
  const labelled = [];
  for (const s of series) {
    const y = yScale(s.points[0].similarity);
    if (typeof y !== "number" || Number.isNaN(y)) continue;
    const height = labelLines(s.term, s.isQuery, width) * LABEL_LINE_H;
    labelled.push({
      series: s,
      height,
      anchor: { y: y - height / 2, height, rank: s.rank },
    });
  }

  return {
    labelled,
    tops: stackLabels(
      labelled.map((l) => l.anchor),
      { top: plot.y, bottom: plot.y + plot.height },
    ),
    right: plot.x + width,
  };
}
