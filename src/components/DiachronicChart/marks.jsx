import { Box } from "@mui/material";

/**
 * The chart's hand-drawn pieces: the dots, the on-chart term labels, and the
 * tooltip's contents. Recharts has no native form for any of them.
 */

/**
 * Custom Recharts dot: filled with its series colour, white-ringed, and the hover
 * target for its whole series -- entering one connects that term's line and dims
 * the rest (see index.jsx). Dots stay visible at all times, unlike neighbour
 * lines, which connect only on hover.
 *
 * `value == null` is what makes a book the term is absent from draw nothing:
 * Recharts still calls this for the missing row, and returning null leaves the
 * gap the broken line already shows.
 */
export function SeriesDot({ cx, cy, value, color, r, dim, onEnter, onLeave }) {
  if (cx == null || cy == null || value == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color}
      stroke="#fff"
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
 * On-chart term label, anchored at a series' earliest point via a zero-radius
 * ReferenceDot -- this is what replaces a separate legend, so a line is named
 * where it starts rather than in a key the eye has to travel to. Bold + focal
 * colour for the query, lighter for neighbours; dims in step with the rest of
 * its series when another term is hovered.
 */
export function SeriesLabel({ viewBox, term, color, isQuery, dim }) {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <text
      x={x + 8}
      y={y}
      dy={4}
      fontSize={11}
      fontWeight={isQuery ? 700 : 500}
      fill={color}
      opacity={dim ? 0.25 : 1}
      style={{ pointerEvents: "none" }}
    >
      {term}
    </text>
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
        <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>
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
