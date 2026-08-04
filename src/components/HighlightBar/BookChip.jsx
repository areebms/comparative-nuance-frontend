import { Chip } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";

/**
 * A single book tag. Clicking the tag pins the book as the reference for
 * comparison (clicking the pinned tag unpins).
 *
 * `active` and `clickable` are separate on purpose: `active` is about the DATA
 * (a book with nothing measured renders greyed), `clickable` about whether this
 * particular click would do anything. The rail decides both -- see HighlightBar.
 */
export default function BookChip({ label, active, selected, yearColor, onSelect, clickable }) {
  const borderColor = active ? yearColor.border : "grey";
  const textColor = active ? yearColor.text : "grey";

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
        bgcolor: selected ? yearColor.fill : "transparent",
        color: textColor,
        border: `1px solid ${borderColor}`,
        fontWeight: selected ? 700 : 600,
        opacity: active ? 1 : 0.5,
        "& .MuiChip-icon": { color: textColor },
        "& .MuiChip-label": { px: 1.5 },
      }}
    />
  );
}
