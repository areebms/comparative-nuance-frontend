// src/hooks/useSimilarityData.js
import { useMemo } from "react";

import { mean, standardDeviation, zScore } from 'simple-statistics'


export default function useSimilarityData({
  similarityCache,
  selectedBookIds,
  selectedBookId,
  topN,
}) {
  return useMemo(() => {
    // 1. Bail early if we are missing data
    if (!selectedBookIds || !selectedBookIds.length) {
      return { displayRows: [], calcStats: {} };
    }

    const hasAllSimilarityData = selectedBookIds.every(
      (id) => similarityCache[id],
    );
    if (!hasAllSimilarityData) {
      return { displayRows: [], calcStats: {} };
    }

    const termDataMap = new Map();
    const stats = {};

    // Initialize stats
    selectedBookIds.forEach((id) => {
      stats[id] = {
        total: similarityCache[id]?.length ?? 0,
        removed: 0,
        shown: topN,
      };
    });

    // 2. Aggregate raw cache data into unified rows
    for (const bookId of selectedBookIds) {
      for (const item of similarityCache[bookId] || []) {
        if (!termDataMap.has(item.term)) {
          termDataMap.set(item.term, {
            term: item.term,
            byBook: {},
            mean: 0,
            sortable: 0,
          });
        }

        const row = termDataMap.get(item.term);
        row.byBook[bookId] = {
          similarity: Number(item.similarity),
          n: Number(item.count),
          coherence: Number(item.coherence) * 100,
        };
      }
    }

    const validRows = [];

    // 3. Filter, calculate means, and determine sort weights
    for (const row of termDataMap.values()) {
      const hasAllBooks = selectedBookIds.every((id) => row.byBook[id]);
      const meetsMinCount = selectedBookIds.every(
        (id) => (row.byBook[id]?.n ?? 0) >= 10,
      );

      if (!hasAllBooks || !meetsMinCount) {
        selectedBookIds.forEach((id) => {
          if (row.byBook[id]) stats[id].removed += 1;
        });
        continue;
      }

      const similarities = Object.entries(row.byBook)
        .filter(([id]) => String(id) !== String(selectedBookId))
        .map(([, data]) => data.similarity);

      row.mean = mean(similarities);
      row.std = standardDeviation(similarities);


      row.sortable = !selectedBookId
        ? row.mean
        : zScore(row.byBook[selectedBookId]?.similarity, row.mean, row.std);

      validRows.push(row);
    }

    // 4. Sort and slice
    validRows.sort((a, b) => b.sortable - a.sortable);

    return {
      displayRows: validRows.slice(0, topN),
      calcStats: stats,
    };
  }, [similarityCache, selectedBookIds, selectedBookId, topN]);
}
