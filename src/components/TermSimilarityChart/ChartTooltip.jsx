import { Box } from "@mui/material";

const tooltipSx = {
  position: "absolute",
  background: "rgba(17,24,39,0.92)",
  color: "#fff",
  borderRadius: 1,
  px: 1.5,
  py: 1,
  pointerEvents: "none",
  fontSize: 12,
  lineHeight: 1.6,
  whiteSpace: "nowrap",
  zIndex: 10,
};

export default function ChartTooltip({ x, y, children }) {
  if (x == null || y == null) return null;
  return (
    <Box sx={{ ...tooltipSx, left: x, top: y }}>
      {children}
    </Box>
  );
}

// Shared dark-tooltip props for MUI <Tooltip> (used in ResultsTable)
