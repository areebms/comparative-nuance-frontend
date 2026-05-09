import { useState, useMemo, useRef, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { linearScale, generateTicks } from "../utils/scales";
import ChartTooltip from "./ChartTooltip";

const MARGIN = { top: 12, right: 24, bottom: 42, left: 120 };
const ROW_HEIGHT = 25;
const MIN_HEIGHT = 400;

function computeXRange(rows, selectedBooks) {
  const values = [];
  rows.forEach((row) => {
    selectedBooks.forEach((book) => {
      const d = row.byBook[book.id];
      if (d) {
        values.push(d.similarity);
        if (d.similarity_ci) {
          values.push(d.similarity_ci[0], d.similarity_ci[1]);
        }
      }
    });
  });
  if (values.length === 0) return { min: 0, max: 1 };
  let min = Math.min(...values);
  let max = Math.max(...values);
  const padding = (max - min) * 0.05 || 0.05;
  return {
    min: Math.max(-1, min - padding),
    max: Math.min(1, max + padding),
  };
}

export default function SimilarityScatterChart({
  rows,
  selectedBooks,
  selectedBookId,
  isLoading,
}) {
  const [hoveredTerm, setHoveredTerm] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [containerWidth, setContainerWidth] = useState(900);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const svgHeight = Math.max(MIN_HEIGHT, MARGIN.top + rows.length * ROW_HEIGHT + MARGIN.bottom);
  const plotW = containerWidth - MARGIN.left - MARGIN.right;
  const plotH = rows.length * ROW_HEIGHT;

  const xRange = useMemo(() => computeXRange(rows, selectedBooks), [rows, selectedBooks]);
  const xScale = useMemo(() => linearScale([xRange.min, xRange.max], [0, plotW]), [xRange, plotW]);
  const ticks = useMemo(() => generateTicks(xRange.min, xRange.max), [xRange]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <Typography variant="body1" color="text.secondary">
          No data to display. Select books and enter a search term.
        </Typography>
      </Box>
    );
  }

  const handleDotHover = (e, row, book, d) => {
    const rect = containerRef.current?.getBoundingClientRect();
    setTooltip({
      x: e.clientX - (rect?.left ?? 0) + 12,
      y: e.clientY - (rect?.top ?? 0) - 8,
      type: "book",
      term: row.term,
      bookLabel: book.label,
      similarity: d.similarity,
      similarity_ci: d.similarity_ci,
      zScore: d.zScore,
      count: d.n,
    });
  };

  const handleMeanHover = (e, row) => {
    const rect = containerRef.current?.getBoundingClientRect();
    setTooltip({
      x: e.clientX - (rect?.left ?? 0) + 12,
      y: e.clientY - (rect?.top ?? 0) - 8,
      type: "mean",
      term: row.term,
      mean: row.mean,
      std: row.std,
    });
  };

  return (
    <Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
      <svg width={containerWidth} height={svgHeight} style={{ display: "block" }}>
        {/* X-axis grid lines and ticks */}
        {ticks.map((tick) => {
          const tx = MARGIN.left + xScale(tick);
          return (
            <g key={tick}>
              <line
                x1={tx} y1={MARGIN.top}
                x2={tx} y2={MARGIN.top + plotH}
                stroke="#e5e7eb" strokeDasharray="4 4"
              />
              <text x={tx} y={MARGIN.top + plotH + 16} textAnchor="middle" fontSize={11} fill="#6b7280">
                {tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* X-axis label */}
        <text
          x={MARGIN.left + plotW / 2} y={svgHeight - 4}
          textAnchor="middle" fontSize={13} fontWeight={600} fill="#374151"
        >
          Cosine Similarity
        </text>

        {/* Rows */}
        {rows.map((row, index) => {
          const rowY = MARGIN.top + index * ROW_HEIGHT + ROW_HEIGHT / 2;
          const faded = hoveredTerm !== null && hoveredTerm !== row.term;

          return (
            <g
              key={row.term}
              onMouseEnter={() => setHoveredTerm(row.term)}
              onMouseLeave={() => { setHoveredTerm(null); setTooltip(null); }}
              style={{ opacity: faded ? 0.2 : 1, transition: "opacity 0.15s" }}
            >
              {/* Row guideline */}
              <line x1={MARGIN.left} y1={rowY} x2={MARGIN.left + plotW} y2={rowY} stroke="#edebe6" strokeWidth={0.75} />

              {/* Range connector */}
              {(() => {
                const sims = selectedBooks
                  .map((book) => row.byBook[book.id]?.similarity)
                  .filter((v) => typeof v === "number");
                if (sims.length < 2) return null;
                return (
                  <line
                    x1={MARGIN.left + xScale(Math.min(...sims))} y1={rowY}
                    x2={MARGIN.left + xScale(Math.max(...sims))} y2={rowY}
                    stroke="#bbb" strokeWidth={1} strokeDasharray="3 3"
                  />
                );
              })()}

              {/* CI whiskers */}
              {selectedBooks.map((book) => {
                const d = row.byBook[book.id];
                if (!d?.similarity_ci) return null;
                return (
                  <line
                    key={`ci-${book.id}`}
                    x1={MARGIN.left + xScale(d.similarity_ci[0])} y1={rowY}
                    x2={MARGIN.left + xScale(d.similarity_ci[1])} y2={rowY}
                    stroke={book.yearColor?.border ?? "#888"} strokeWidth={1.5} opacity={0.35}
                  />
                );
              })}

              {/* Y-axis label */}
              <text x={MARGIN.left - 8} y={rowY} textAnchor="end" dominantBaseline="central" fontSize={12} fill="#374151">
                {row.term}
              </text>

              {/* Per-book dots */}
              {selectedBooks.map((book) => {
                const d = row.byBook[book.id];
                if (!d) return null;
                const isPinned = selectedBookId === String(book.id);
                return (
                  <circle
                    key={book.id}
                    cx={MARGIN.left + xScale(d.similarity)} cy={rowY}
                    r={isPinned ? 5 : 3.5}
                    fill={book.yearColor?.border ?? "#888"}
                    onMouseEnter={(e) => handleDotHover(e, row, book, d)}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: "default" }}
                  />
                );
              })}

              {/* Mean dot */}
              {typeof row.mean === "number" && (
                <circle
                  cx={MARGIN.left + xScale(row.mean)} cy={rowY}
                  r={6} fill="#111827" stroke="white" strokeWidth={2}
                  onMouseEnter={(e) => handleMeanHover(e, row)}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: "default" }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <ChartTooltip x={tooltip.x} y={tooltip.y}>
          {tooltip.type === "book" ? (
            <>
              <div style={{ fontWeight: 700 }}>{tooltip.term} -- {tooltip.bookLabel}</div>
              <div>Similarity: {tooltip.similarity.toFixed(3)}</div>
              {tooltip.similarity_ci && (
                <div>95% CI: [{tooltip.similarity_ci[0].toFixed(3)}, {tooltip.similarity_ci[1].toFixed(3)}]</div>
              )}
              <div>z-Score: {tooltip.zScore?.toFixed(3) ?? "N/A"}</div>
              <div>Occurrences: {tooltip.count}</div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 700 }}>{tooltip.term}</div>
              <div>Mean Similarity: {tooltip.mean.toFixed(3)}</div>
              <div>Std Dev: {tooltip.std.toFixed(3)}</div>
            </>
          )}
        </ChartTooltip>
      )}
    </Box>
  );
}
