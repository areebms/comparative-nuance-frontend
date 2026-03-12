import { useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineController,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { Box, CircularProgress, Typography } from "@mui/material";
import { getColorForBook } from "../utils/bookColors";

ChartJS.register(
  LinearScale,
  PointElement,
  LineController,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function createChartDatasets(rows, selectedBooks, selectedBookId) {
  return selectedBooks.map((book) => {
    const dataPoints = rows
      .map((row, rowIndex) => {
        const bookData = row.byBook[book.id];
        if (!bookData) return null;

        return {
          x: bookData.similarity,
          y: rowIndex,
          label: `${row.term} - ${book.label}`,
          bookId: book.id,
          zScore: bookData.zScore,
          n: bookData.n,
          coherence: bookData.coherence,
        };
      })
      .filter(Boolean);

    const color = getColorForBook(book.position);

    return {
      label: `${book.id} - ${book.label}`,
      data: dataPoints,
      backgroundColor: color,
      borderColor: color,
      pointRadius: String(book.id) === selectedBookId ? 6 : 4,
      pointHoverRadius: 8,
      pointBackgroundColor: color,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      order: 1,
    };
  });
}

function createRangeDatasets(rows, selectedBooks) {
  return rows
    .map((row, rowIndex) => {
      const similarities = selectedBooks
        .map((book) => row.byBook[book.id]?.similarity)
        .filter((value) => typeof value === "number");

      if (similarities.length === 0) return null;

      const min = Math.min(...similarities);
      const max = Math.max(...similarities);

      return {
        label: `range-${rowIndex}`,
        type: "line",
        data: [
          { x: min, y: rowIndex },
          { x: max, y: rowIndex },
        ],
        borderColor: "#000",
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        showLine: true,
        fill: false,
        order: 0,
      };
    })
    .filter(Boolean);
}

function createMeanDataset(rows) {
  const meanPoints = rows
    .map((row, rowIndex) => {
      if (typeof row.mean !== "number") return null;

      return {
        x: row.mean,
        y: rowIndex,
        term: row.term,
        std: row.std,
        isMean: true,
      };
    })
    .filter(Boolean);

  return {
    label: "Mean",
    data: meanPoints,
    backgroundColor: "#111827",
    borderColor: "#111827",
    pointRadius: 6,
    pointHoverRadius: 8,
    pointBackgroundColor: "#111827",
    pointBorderColor: "#fff",
    pointBorderWidth: 2,
    order: 2,
  };
}

function computeSimilarityRange(rows, selectedBooks) {
  const values = [];
  rows.forEach((row) => {
    selectedBooks.forEach((book) => {
      const value = row.byBook[book.id]?.similarity;
      if (typeof value === "number") values.push(value);
    });
  });

  if (values.length === 0) return { min: 0, max: 1 };

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) {
    const padding = min === 0 ? 0.05 : Math.abs(min) * 0.05;
    min -= padding;
    max += padding;
  }

  const padding = (max - min) * 0.05;
  return {
    min: Math.max(-1, min - padding),
    max: Math.min(1, max + padding),
  };
}

function createChartOptions(rows, selectedBooks) {
  const xRange = computeSimilarityRange(rows, selectedBooks);
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        filter: (element) => {
          return element.dataset.label?.startsWith("range-") !== true;
        },
        callbacks: {
          label: (context) => {
            const point = context.raw;
            if (point.isMean) {
              return [
                `${point.term} - Overall`,
                `Mean Similarity: ${point.x.toFixed(3)}`,
                `Standard Deviation: ${point.std.toFixed(3)}`,
              ];
            }
            return [
              `${point.label}`,
              `Similarity: ${point.x.toFixed(3)}`,
              `zScore: ${point.zScore?.toFixed(3) ?? "N/A"}`,
              `Occurrence: ${point.n}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: xRange.min,
        max: xRange.max,
        title: {
          display: true,
          text: "Cosine Similarity",
          font: { size: 14, weight: 600 },
        },
        grid: { color: "#e5e7eb" },
      },
      y: {
        type: "linear",
        reverse: true,
        min: 0,
        max: Math.max(0, rows.length - 1),
        ticks: {
          autoSkip: false,
          stepSize: 1,
          precision: 0,
          maxRotation: 0,
          minRotation: 0,
          callback: (value) => {
            const rowIndex = Math.round(value);
            if (rowIndex >= 0 && rowIndex < rows.length) {
              return rows[rowIndex].term;
            }
            return "";
          },
          font: { size: 12 },
        },
        grid: { color: "#f1f5f9" },
      },
    },
  };
}

export default function SimilarityScatterChart({
  rows,
  selectedBooks,
  selectedBookId,
  isLoading,
}) {
  const chartData = useMemo(() => {
    const rangeDatasets = createRangeDatasets(rows, selectedBooks);
    const meanDataset = createMeanDataset(rows);
    const datasets = createChartDatasets(rows, selectedBooks, selectedBookId);
    return {
      datasets: [...rangeDatasets, meanDataset, ...datasets],
    };
  }, [rows, selectedBooks, selectedBookId]);

  const chartOptions = useMemo(
    () => createChartOptions(rows, selectedBooks),
    [rows, selectedBooks],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No data to display. Select books and enter a search term.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: Math.max(400, rows.length * 12 + 80) }}>
      <Scatter data={chartData} options={chartOptions} />
    </Box>
  );
}
