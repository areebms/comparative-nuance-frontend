import { useMemo } from "react";

import { mean, standardDeviation, zScore } from "simple-statistics";

export default function useSimilarityData({
  similarityCache,
  selectedBookIds,
  selectedBookId,
  sort,
  topN,
}) {
  return useMemo(() => {
    const empty = { displayRows: [], bookCalculationStats: {} };

    if (!selectedBookIds || !selectedBookIds.length) {
      return empty;
    }

    const hasAllSimilarityData = selectedBookIds.every(
      (id) => similarityCache[id],
    );
    if (!hasAllSimilarityData) {
      return empty;
    }

    const termDataMap = new Map();
    const stats = {};

    selectedBookIds.forEach((id) => {
      stats[id] = {
        total: similarityCache[id]?.length ?? 0,
        removed: 0,
        shown: topN,
      };
    });

    // Aggregate raw cache data into unified rows
    for (const bookId of selectedBookIds) {
      for (const item of similarityCache[bookId] || []) {
        if (!termDataMap.has(item.term)) {
          termDataMap.set(item.term, {
            term: item.term,
            byBook: {},
            mean: null,
            std: null,
          });
        }

        const row = termDataMap.get(item.term);
        row.byBook[bookId] = {
          similarity: Number(item.similarity),
          zScore: null,
          n: Number(item.count),
          coherence: Number(item.coherence) * 100,
        };
      }
    }

    const validRows = [];

    // Filter, calculate means, and determine sort weights
    for (const row of termDataMap.values()) {
      const hasAllBooks = selectedBookIds.every((id) => row.byBook[id]);
      const meetsMinCount = selectedBookIds.every(
        (id) => (row.byBook[id]?.n ?? 0) >= 10,
      );

      if (!hasAllBooks || !meetsMinCount) {
        selectedBookIds.forEach((id) => {
          if (row.byBook[id]) {
            stats[id].removed += 1;
          }
        });
        continue;
      }

      const similarities = Object.entries(row.byBook)
        .filter(([id]) => String(id) !== String(selectedBookId))
        .map(([, data]) => data.similarity);

      row.mean = mean(similarities);
      row.std = standardDeviation(similarities);

      selectedBookIds.forEach((id) => {
        row.byBook[id].zScore =
          row.std > 0
            ? zScore(row.byBook[id].similarity, row.mean, row.std)
            : 0;
      });

      row.sortable = selectedBookId
        ? row.byBook[selectedBookId]?.zScore
        : sort === "mean"
          ? row.mean
          : (row.std ?? 0);

      validRows.push(row);
    }

    validRows.sort((a, b) => b.sortable - a.sortable);

    return {
      displayRows: validRows.slice(0, topN),
      bookCalculationStats: stats,
    };
  }, [similarityCache, selectedBookIds, selectedBookId, sort, topN]);
}
