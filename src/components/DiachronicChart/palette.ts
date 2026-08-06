/**
 * Validated categorical palette for the Diachronic Drift chart.
 *
 * Source: the dataviz skill's reference palette (light mode). Verified with the
 * skill's `scripts/validate_palette.js`:
 *   - lightness band, chroma floor, and CVD separation all PASS
 *     (worst adjacent ΔE 24.2, well above the ≥12 target).
 *   - contrast-vs-surface WARNs on aqua/yellow/magenta (sub-3:1). The relief is
 *     the always-present on-chart term labels, so identity is never
 *     colour-only.
 *
 * Slot ordering is the CVD-safety mechanism, not cosmetic — do not reorder.
 */

// Neighbour dots/labels/lines: each term gets its own colour from this fixed,
// CVD-safe cycle (blue…orange), so terms are distinguishable at rest without
// hovering. Cycled in order; with more neighbours than steps the hues repeat.
// Do not reorder.
export const SERIES_COLORS = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e87ba4", // magenta
  "#eb6834", // orange
];

// The queried expression: the single friendly-blue focal line, identical in the
// unpinned (typicality) and pinned (drift) views so the two read as one chart.
// It reads apart from the neighbours by depth (deep blue) + stroke weight, not
// just hue — it's deliberately close in family to SERIES_COLORS' own blue.
export const QUERY_COLOR = "#1f5c9e";

// Chart chrome / ink (light-surface tokens from the reference palette).
export const INK = {
  grid: "#e1e0d9", // hairline gridline
  axis: "#c3c2b7", // baseline / axis line
  tick: "#6b7280", // tick labels
  title: "#374151", // axis titles
  surface: "#fff", // what the chart sits on -- the term labels' halo
};
