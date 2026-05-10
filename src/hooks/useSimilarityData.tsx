import { useMemo } from "react";
import { mean, standardDeviation, zScore } from "simple-statistics";

interface TooltipData {
  total: number,
  removed: number,
  shown: number
}

interface CacheItem {
  term: string;
  similarity: number;
  count: number;
  similarity_ci: [number, number];
}

interface SimilarityDataProps {
  bookSimilarityData: Record<number, CacheItem[]>,
  selectedBookIds: number[],
  selectedBookId: number,
  sort: string,
  topN: number,
}


export default function useSimilarityData({
  bookSimilarityData,
  selectedBookIds,
  selectedBookId,
  sort,
  topN,
}: SimilarityDataProps) {
  return useMemo(() => {
    const empty = { tableData: [], bookCalculationStats: {}, termCount: 0, sharedTerms: [] };

    if (!selectedBookIds?.length) return empty;

    const validBookIds = selectedBookIds.filter(bookId => bookSimilarityData[bookId]);

    // 1. Aggregate cache data into rows keyed by term
    const termDataMap = new Map();

    for (const bookId of validBookIds) {
      for (const item of bookSimilarityData[bookId]) {
        if (!termDataMap.has(item.term)) {
          termDataMap.set(item.term, { term: item.term, byBook: {} });
        }
        termDataMap.get(item.term).byBook[bookId] = {
          similarity: Number(item.similarity),
          zScore: null,
          n: Number(item.count),
          similarity_ci: item.similarity_ci as [number, number],
        };
      }
    }

    // 2. Filter to rows present in all books with minimum count, then compute stats
    const validRows = [];

    for (const row of termDataMap.values()) {
      const isValid = validBookIds.every(
        (id) => row.byBook[id] && row.byBook[id].n >= 10,
      );
      if (!isValid) continue;

      // Mean/std across books, excluding the pinned book if any
      const similarities = validBookIds
        .filter((id) => String(id) !== String(selectedBookId))
        .map((id) => row.byBook[id].similarity);

      row.mean = mean(similarities);
      row.std = standardDeviation(similarities);

      for (const id of validBookIds) {
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
    for (const id of validBookIds) {
      const total = bookSimilarityData[id].length;
      stats[id] = { total, removed: total - validRows.length, shown: topN };
    }

    return {
      tableData: validRows.slice(0, topN),
      bookCalculationStats: stats,
      termCount: validRows.length,
    };
  }, [bookSimilarityData, selectedBookIds, selectedBookId, sort, topN]);
}
