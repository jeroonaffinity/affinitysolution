import usePullToRefresh from "@/hooks/usePullToRefresh";
import { Loader2, ArrowDown } from "lucide-react";

export default function PullToRefreshWrapper({ onRefresh, children, className = "" }) {
  const { containerRef, isPulling, pullProgress, refreshing } = usePullToRefresh(onRefresh);

  return (
    <div ref={containerRef} className={`overflow-y-auto ${className}`}>
      {/* Indicator */}
      <div
        className="flex justify-center items-center transition-all overflow-hidden"
        style={{ height: isPulling ? `${pullProgress * 48}px` : refreshing ? "48px" : "0px" }}>
        {refreshing
          ? <Loader2 className="w-5 h-5 animate-spin text-primary" />
          : <ArrowDown className="w-5 h-5 text-primary transition-transform"
              style={{ transform: `rotate(${pullProgress * 180}deg)`, opacity: pullProgress }} />
        }
      </div>
      {children}
    </div>
  );
}