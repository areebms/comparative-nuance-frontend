import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { TERM_RANKINGS } from "../../types/api";
import type { TermRanking } from "../../types/api";
import { labels } from "../../content/labels";

const LABEL_ID = "comparative-terms-ranking-label";

export default function ComparativeTermsRanking({ ranking, onRankingChange }: {
  ranking: TermRanking;
  onRankingChange: (ranking: TermRanking) => void;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel id={LABEL_ID}>{labels.comparativeTerms.label}</InputLabel>
      <Select labelId={LABEL_ID} value={ranking} label={labels.comparativeTerms.label}
        onChange={(e) => onRankingChange(e.target.value as TermRanking)}
        sx={{ bgcolor: "background.paper" }}>
        {TERM_RANKINGS.map((value) => (
          <MenuItem key={value} value={value}>{labels.comparativeTerms.rankings[value]}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
