import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { DRIFT_SORTS } from "../../types/api";
import type { DriftSort } from "../../types/api";
import { labels } from "../../content/labels";

const LABEL_ID = "comparative-terms-sort-label";

export default function ComparativeTermsSort({ sort, onSortChange }: {
  sort: DriftSort;
  onSortChange: (sort: DriftSort) => void;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel id={LABEL_ID}>{labels.comparativeTerms.label}</InputLabel>
      <Select labelId={LABEL_ID} value={sort} label={labels.comparativeTerms.label}
        onChange={(e) => onSortChange(e.target.value as DriftSort)}
        sx={{ bgcolor: "background.paper" }}>
        {DRIFT_SORTS.map((value) => (
          <MenuItem key={value} value={value}>{labels.comparativeTerms.sorts[value]}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
