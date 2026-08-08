import { LOCAL_ANCHOR_FLOOR } from "../types/api";
import type { DriftSort } from "../types/api";

export const labels = {
  typicality: {
    label: "Definition Genericness",
    pinned: (bookLabel: string) => `Neighbourhood agreement with ${bookLabel}`,
  },

  comparativeTerms: {
    label: "Comparative Terms",
    sorts: {
      stability: "Stable",
      instability: "Unstable",
    } satisfies Record<DriftSort, string>,
  },

  gaps: {
    absent: {
      short: "not in text",
      detail: (terms: string[]) =>
        `This book never uses ${terms.map((t) => `"${t}"`).join(" or ")}.`,
    },
    too_few_anchors: {
      short: "too few shared words",
      detail: () =>
        `This book uses every word of the term, but shares fewer than ` +
        `${LOCAL_ANCHOR_FLOOR} other words with any book it could be read ` +
        `against -- too little common ground to place them.`,
    },
    unscored: {
      short: "not measured",
      detail: () =>
        "This book has the vocabulary, but no comparison against it produced " +
        "a score.",
    },
  },

  columns: {
    stability: {
      short: "Stability",
      help:
        "How consistently this term stays near the query across the whole " +
        "corpus. Measured corpus-wide, so it is not an average of the values " +
        "in this row.",
    },
    instability: {
      short: "Instability",
      help:
        "How much this term's closeness to the query varies across the whole " +
        "corpus. Measured corpus-wide, so it is not an average of the values " +
        "in this row.",
    },
    booksGroup: "Definitional Genericness within Corpus",
  },
};
