/**
 * Shared chart helpers used by both TermSimilarityChart and DiachronicChart.
 *
 * - getLayoutConfig: responsive design table. Given a container width,
 *   returns the values (margins, font sizes, dot radii, label position)
 *   the charts should use.
 * - positionFromEvent: convert a mouse event into container-relative
 *   coordinates for tooltip positioning.
 */

const TOOLTIP_X_OFFSET = 12;
const TOOLTIP_Y_OFFSET = -8;

// Responsive breakpoints. Each table is the full layout config for one
// width tier. The container width drives which tier applies, so charts
// react to their own container size (which may be narrower than the
// viewport if there's a sidebar or grid layout).
const MOBILE = {
  marginLeft: 24,
  marginRight: 16,
  marginTop: 8,
  marginBottom: 36,
  rowHeight: 28,
  dotRadius: 4,
  pinnedDotRadius: 6,
  meanDotRadius: 6,
  diachronicDotRadius: 5,
  diachronicHighlightRadius: 7,
  termLabelPosition: "above",
  axisLabelFontSize: 11,
  tickLabelFontSize: 9,
  minHeight: 320,
  maxHeight: 720,
};

const TABLET = {
  marginLeft: 100,
  marginRight: 20,
  marginTop: 12,
  marginBottom: 42,
  rowHeight: 25,
  dotRadius: 3.5,
  pinnedDotRadius: 5,
  meanDotRadius: 6,
  diachronicDotRadius: 5,
  diachronicHighlightRadius: 7,
  termLabelPosition: "left",
  axisLabelFontSize: 12,
  tickLabelFontSize: 10,
  minHeight: 360,
  maxHeight: 720,
};

const DESKTOP = {
  marginLeft: 120,
  marginRight: 24,
  marginTop: 12,
  marginBottom: 42,
  rowHeight: 25,
  dotRadius: 3.5,
  pinnedDotRadius: 5,
  meanDotRadius: 6,
  diachronicDotRadius: 4,
  diachronicHighlightRadius: 6,
  termLabelPosition: "left",
  axisLabelFontSize: 13,
  tickLabelFontSize: 11,
  minHeight: 400,
  maxHeight: 720,
};

/**
 * Resolve the layout config for a container width.
 * Breakpoints: mobile < 500, tablet 500-899, desktop >= 900.
 */
export function getLayoutConfig(containerWidth) {
  if (containerWidth < 500) return MOBILE;
  if (containerWidth < 900) return TABLET;
  return DESKTOP;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert a mouse event's clientX/Y into coordinates relative to a
 * container ref, with fixed offsets so a tooltip floats next to the
 * cursor rather than under it.
 *
 * @returns {x, y} relative to container's top-left corner
 */
export function positionFromEvent(event, containerRef) {
  const rect = containerRef.current?.getBoundingClientRect();
  return {
    x: event.clientX - (rect?.left ?? 0) + TOOLTIP_X_OFFSET,
    y: event.clientY - (rect?.top ?? 0) + TOOLTIP_Y_OFFSET,
  };
}
