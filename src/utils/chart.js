/**
 * Shared chart helpers used by both TermSimilarityChart and DiachronicChart.
 *
 * - getLayoutConfig: responsive design table. Given a container width,
 *   returns the values (margins, font sizes, dot radii, label position)
 *   the charts should use.
 * - positionFromEvent: convert a mouse event into container-relative
 *   coordinates for tooltip positioning.
 */

// Responsive breakpoints. Each table is the full layout config for one
// width tier. The container width drives which tier applies, so charts
// react to their own container size (which may be narrower than the
// viewport if there's a sidebar or grid layout).
const MOBILE = {
  marginRight: 16,
  diachronicDotRadius: 5,
  axisLabelFontSize: 11,
  tickLabelFontSize: 9,
  minHeight: 320,
};

const TABLET = {
  marginRight: 20,
  diachronicDotRadius: 5,
  axisLabelFontSize: 12,
  tickLabelFontSize: 10,
  minHeight: 360,
};

const DESKTOP = {
  marginRight: 24,
  diachronicDotRadius: 4,
  axisLabelFontSize: 13,
  tickLabelFontSize: 11,
  minHeight: 400,
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
