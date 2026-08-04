/**
 * Chart geometry, in its own module so App can read it without importing the
 * chart itself -- and with it recharts, which is deliberately lazy-loaded.
 *
 * CHART_HEIGHT is shared with App's Suspense fallback so the loading spinner
 * sits exactly where the one inside the chart will, and swapping between them
 * doesn't jump the page.
 */
export const CHART_HEIGHT = 400;
export const CHART_MARGIN = { top: 12, right: 24, left: 8, bottom: 8 };
export const Y_AXIS_WIDTH = 55;
export const AXIS_LABEL_SIZE = 13;
export const TICK_LABEL_SIZE = 11;
export const QUERY_DOT_R = 7.5;
export const NEIGHBOUR_DOT_R = 6;
