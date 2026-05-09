import { Chip } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import PushPinIcon from "@mui/icons-material/PushPin";

export default function BookChip({ id, label, active, selected, yearColor, onToggle, onSelect }) {
  const borderColor = active ? yearColor.border : "grey";
  const bgColor = active ? yearColor.fill : "lightgrey";
  const textColor = active ? yearColor.text : "grey";

  return (
    <Chip
      key={id}
      label={label}
      size="medium"
      variant="outlined"
      clickable
      onClick={onToggle}
      onDelete={onSelect}
      deleteIcon={selected ? <PushPinIcon /> : <CheckBoxOutlineBlankIcon />}
      sx={{
        bgcolor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        fontWeight: 600,
        "& .MuiChip-deleteIcon": {
          color: textColor,
          "&:hover": { color: textColor },
          pointerEvents: active ? "auto" : "none",
          cursor: active ? "pointer" : "default",
          opacity: active ? 1 : 0.5,
        },
        "& .MuiChip-label": { px: 2 },
      }}
    />
  );
}
