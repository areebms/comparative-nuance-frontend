import { useMemo } from "react";
import { mean, standardDeviation, zScore } from "simple-statistics";

interface TooltipData {
  total : number,
  removed : number,
  shown : number
}

interface CacheItem {
  term: string;
  similarity: number;
  count: number;
  coherence: number;
}

interface SimilarityDataProps {
  similarityCache : Record<number, CacheItem[]>,
  selectedBookIds : number[],
  selectedBookId : number,
  sort : string,
  topN : number,
}


export default function useSimilarityData({
  similarityCache,
  selectedBookIds,
  selectedBookId,
  sort,
  topN,
} : SimilarityDataProps) {
  return useMemo(() => {
    const empty = { displayRows: [], bookCalculationStats: {} };

    if (!selectedBookIds?.length) return empty;
    if (!selectedBookIds.every((id) => similarityCache[id])) return empty;

    // 1. Aggregate cache data into rows keyed by term
    const termDataMap = new Map();

    for (const bookId of selectedBookIds) {
      for (const item of similarityCache[bookId]) {
        if (!termDataMap.has(item.term)) {
          termDataMap.set(item.term, { term: item.term, byBook: {} });
        }
        termDataMap.get(item.term).byBook[bookId] = {
          similarity: Number(item.similarity),
          zScore: null,
          n: Number(item.count),
          coherence: Number(item.coherence) * 100,
        };
      }
    }

    // 2. Filter to rows present in all books with minimum count, then compute stats
    const validRows = [];

    for (const row of termDataMap.values()) {
      const isValid = selectedBookIds.every(
        (id) => row.byBook[id] && row.byBook[id].n >= 10,
      );
      if (!isValid) continue;

      // Mean/std across books, excluding the pinned book if any
      const similarities = selectedBookIds
        .filter((id) => String(id) !== String(selectedBookId))
        .map((id) => row.byBook[id].similarity);

      row.mean = mean(similarities);
      row.std = standardDeviation(similarities);

      for (const id of selectedBookIds) {
        row.byBook[id].zScore =
          row.std > 0
            ? zScore(row.byBook[id].similarity, row.mean, row.std)
            : 0;
      }

      row.sortable = selectedBookId
        ? row.byBook[selectedBookId]?.zScore
        : sort === "mean"
          ? row.mean
          : (row.std ?? 0);

      validRows.push(row);
    }

    validRows.sort((a, b) => b.sortable - a.sortable);

    // 3. Compute stats (how many terms were filtered out per book)
    const stats: Record<number, TooltipData> = {};
    for (const id of selectedBookIds) {
      const total = similarityCache[id].length;
      stats[id] = { total, removed: total - validRows.length, shown: topN };
    }

    return {
      displayRows: validRows.slice(0, topN),
      bookCalculationStats: stats,
    };
  }, [similarityCache, selectedBookIds, selectedBookId, sort, topN]);
}
