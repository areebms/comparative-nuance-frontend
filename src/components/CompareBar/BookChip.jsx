import { Chip } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import { QUERY_COLOR } from "../DiachronicChart/palette";

export default function BookChip({ label, active, selected, onSelect, clickable }) {
  return (
    <Chip
      label={label}
      size="medium"
      variant={selected ? "filled" : "outlined"}
      clickable={clickable}
      onClick={clickable ? onSelect : undefined}
      icon={selected ? <PushPinIcon /> : undefined}
      sx={{
        width: "100%",
        justifyContent: "flex-start",
        bgcolor: selected ? QUERY_COLOR : "transparent",
        color: selected ? "#fff" : active ? "text.primary" : "grey",
        border: "1px solid",
        borderColor: selected ? QUERY_COLOR : active ? "divider" : "grey",
        fontWeight: selected ? 700 : 600,
        opacity: active ? 1 : 0.5,
        // The pin icon only renders when selected, so it is always on the fill.
        "& .MuiChip-icon": { color: "#fff" },
        "& .MuiChip-label": { px: 1.5 },
      }}
    />
  );
}
