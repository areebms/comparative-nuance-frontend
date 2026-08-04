import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { DRIFT_SORTS } from "../../types/api";
import type { DriftSort } from "../../types/api";
import { labels } from "../../content/labels";

const LABEL_ID = "nearest-terms-sort-label";

export default function NearestTermsSort({
  sort,
  onSortChange,
}: {
  sort: DriftSort;
  onSortChange: (sort: DriftSort) => void;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel id={LABEL_ID}>{labels.nearestTerms.label}</InputLabel>
      <Select
        labelId={LABEL_ID}
        value={sort}
        label={labels.nearestTerms.label}
        onChange={(e) => onSortChange(e.target.value as DriftSort)}
        sx={{ bgcolor: "background.paper" }}
      >
        {/* Driven by the wire contract's own list, so a sort the API gains
            cannot be missing from the control that selects it. */}
        {DRIFT_SORTS.map((value) => (
          <MenuItem key={value} value={value}>
            {labels.nearestTerms.sorts[value]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
