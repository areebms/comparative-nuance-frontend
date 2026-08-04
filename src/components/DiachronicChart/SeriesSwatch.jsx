import { Box } from "@mui/material";

/**
 * The little line-swatch that identifies a drift series by colour, drawn at the
 * same relative weights the chart uses -- the query line thicker than its
 * neighbours -- so a DriftTable row reads as the line above it. It lives beside
 * the chart, not beside the table, because those weights are the chart's.
 */
export default function SeriesSwatch({ color, isQuery }) {
  return (
    <Box
      sx={{
        width: 14,
        height: isQuery ? 3 : 2,
        bgcolor: color,
        borderRadius: 1,
        flex: "0 0 auto",
      }}
    />
  );
}
