import { Box, CircularProgress } from "@mui/material";

import { CHART_HEIGHT } from "./layout";

export function ChartSpinner() {
  return (
    <ChartMessage height={CHART_HEIGHT}>
      <CircularProgress />
    </ChartMessage>
  );
}

export default function ChartMessage({ children, height }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height,
        width: "100%",
      }}
    >
      {children}
    </Box>
  );
}
