import { Box, Typography } from "@mui/material";

function LegendItem({ visual, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      {visual}
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function BookDots() {
  return (
    <svg width={24} height={14} style={{ display: "block" }}>
      <circle cx={5} cy={7} r={5} fill="hsl(30, 65%, 42%)" />
      <circle cx={19} cy={7} r={5} fill="hsl(220, 65%, 42%)" />
    </svg>
  );
}

function BlackDot() {
  return (
    <svg width={24} height={14} style={{ display: "block" }}>
      <circle cx={12} cy={7} r={5} fill="#111827" />
    </svg>
  );
}

function Whisker() {
  return (
    <svg width={24} height={14}>
      <line x1={2} y1={7} x2={22} y2={7} stroke="#888" strokeWidth={1.5} opacity={0.5} />
    </svg>
  );
}

export default function ChartLegend() {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 56,
        right: 28,
        zIndex: 1,
        bgcolor: "rgba(255, 255, 255, 0.92)",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        px: 1.5,
        py: 1,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: "block" }}>
        Legend
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <LegendItem visual={<BookDots />} label="Book score" />
        <LegendItem visual={<BlackDot />} label="Average across books" />
        <LegendItem visual={<Whisker />} label="Confidence range" />
      </Box>
    </Box>
  );
}
