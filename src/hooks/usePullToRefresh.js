import { useEffect, useRef, useState } from "react";

/**
 * usePullToRefresh — calls `onRefresh` when the user pulls down on a touch device.
 * Returns { containerRef, isPulling, pullProgress (0-1) }
 */
export default function usePullToRefresh(onRefresh, threshold = 72) {
  const containerRef = useRef(null);
  const startY = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && el.scrollTop === 0) {
        e.preventDefault();
        setPullDistance(Math.min(delta, threshold * 1.5));
      }
    };

    const onTouchEnd = async () => {
      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true);
        setPullDistance(0);
        await onRefresh();
        setRefreshing(false);
      } else {
        setPullDistance(0);
      }
      startY.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pullDistance, refreshing, threshold]);

  return {
    containerRef,
    isPulling: pullDistance > 0,
    pullProgress: Math.min(pullDistance / threshold, 1),
    refreshing,
  };
}