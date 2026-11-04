/** Floating tab overlay metrics — bottom gap is added on top of Safe Area. */
export const TAB_BAR_HEIGHT = 60;
export const TAB_BAR_SIDE_INSET = 16;
export const TAB_BAR_TOP_GAP = 6;
/** Extra float space above the home-indicator / bottom safe area. */
export const TAB_BAR_BOTTOM_GAP = 12;
/** Width of the vertical side rail used on wide-and-short (Duo/landscape) displays. */
export const TAB_RAIL_WIDTH = 78;

/** Space the side rail occupies on the leading edge, including the left safe area. */
export function tabBarRailInset(leftInset: number) {
  return TAB_RAIL_WIDTH + Math.max(leftInset, 8);
}

export function tabBarBottomPadding(bottomInset: number) {
  return bottomInset + TAB_BAR_BOTTOM_GAP;
}

export function tabBarOverlayHeight(bottomInset: number) {
  return TAB_BAR_HEIGHT + tabBarBottomPadding(bottomInset) + TAB_BAR_TOP_GAP;
}
