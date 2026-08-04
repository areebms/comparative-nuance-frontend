import { LOCAL_ANCHOR_FLOOR } from "../types/api";
import type { DriftSort } from "../types/api";

export const labels = {
  typicality: {
    label: "Definition Genericness",
    short: "Genericness",
    pinned: (bookLabel: string) => `Neighbourhood agreement with ${bookLabel}`,
  },

  nearestTerms: {
    label: "Nearest terms",
    sorts: {
      mean_similarity: "Most similar",
      slope: "Most changed",
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
    occurrences: {
      short: "Uses",
      help:
        "How often the term's own words appear in this book -- every word of " +
        "a compound expression counted together. The volume of text the score " +
        "rests on, not its confidence.",
    },
    trend: {
      short: "Trend",
      help:
        "Least-squares fit of this term's similarity to the query against " +
        "publication year, shown per century, with r² for how cleanly the " +
        'books follow it. Ranking by "Most drift" sorts on the two combined.',
    },
  },
};
