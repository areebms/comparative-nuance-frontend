export const labels = {
  contextScore: {
    label: "Context score",
    technical: "Cosine similarity",
    tooltip:
      "Cosine similarity between your query vector and a term vector. Higher values mean the terms are used in more similar contexts.",
  },

  consensus: {
    label: "Consensus",
    technical: "Mean cosine similarity",
    tooltip:
      "Average context score across selected books. Higher values mean the term is strongly associated with your query across the selected texts.",
  },

  divergence: {
    label: "Divergence",
    technical: "Standard deviation",
    tooltip:
      "How much the association varies across books. High values show divergence. If the pattern also follows chronology, it may suggest semantic drift.",
  },

  relativeEmphasis: {
    label: "Relative emphasis",
    technical: "z-score",
    tooltip:
      "How much more emphasis the selected book places on this term relative to the average across selected books.",
  },

  confidenceRange: {
    label: "Confidence range",
    technical: "95% CI",
    tooltip:
      "How consistently this relationship appears across independently trained models. Tight ranges are more stable; wide ranges should be interpreted cautiously.",
  },

  chartOverview:
    "Each row is a term used in similar contexts to your query. Dots farther right have a higher context score. Different colors show different books. Black dots show the average across books. Wider confidence ranges mean the result is less stable across model runs.",
};
