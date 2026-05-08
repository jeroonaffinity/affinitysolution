import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

const BOLT_COUNT = 40;

export default function SplashScreen({ children }) {
  const [phase, setPhase] = useState("in"); // in → hold → out → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 2200);
    const t2 = setTimeout(() => setPhase("out"), 5200);
    const t3 = setTimeout(() => setPhase("done"), 6100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  const bolts = useMemo(() =>
    Array.from({ length: BOLT_COUNT }, (_, i) => {
      const angle = (i / BOLT_COUNT) * Math.PI * 2;
      const radius = 30 + Math.random() * 42;
      return {
        id: i,
        startX: 50 + Math.cos(angle) * radius * 1.6,
        startY: 50 + Math.sin(angle) * radius * 0.9,
        size: 16 + Math.random() * 26,
        rotation: (Math.random() - 0.5) * 60,
        delay: (i / BOLT_COUNT) * 0.9,
        opacity: 0.25 + Math.random() * 0.55,
      };
    }), []);

  return (
    <>
      {/* Always render children underneath; overlay sits on top */}
      <div style={{ visibility: phase === "done" ? "visible" : "hidden" }}>
        {children}
      </div>

      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#000" }}
          animate={phase === "out" ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          {/* ── Bolts ── */}
          {bolts.map((bolt) => {
            const isIn = phase === "in";
            const isHold = phase === "hold";

            return (
              <motion.svg
                key={bolt.id}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2D2B8F"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: "absolute",
                  top: `${bolt.startY}%`,
                  left: `${bolt.startX}%`,
                  width: bolt.size,
                  height: bolt.size,
                  rotate: `${bolt.rotation}deg`,
                  pointerEvents: "none",
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={
                  isIn
                    ? {
                        opacity: bolt.opacity,
                        scale: 1,
                        transition: { duration: 0.7, delay: bolt.delay, ease: "easeOut" },
                      }
                    : isHold
                    ? {
                        opacity: [bolt.opacity, bolt.opacity * 0.4, bolt.opacity],
                        scale: [1, 0.95, 1],
                        transition: { duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
                      }
                    : {
                        x: `${(50 - bolt.startX) * 3}px`,
                        y: `${(50 - bolt.startY) * 3}px`,
                        scale: 0,
                        opacity: 0,
                        transition: { duration: 0.55, delay: bolt.delay * 0.25, ease: [0.4, 0, 1, 1] },
                      }
                }
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </motion.svg>
            );
          })}

          {/* ── Logo ── */}
          <motion.div
            className="absolute flex flex-col items-center z-10 pointer-events-none"
            animate={
              phase === "in"
                ? { opacity: 0, scale: 0.94 }
                : phase === "hold"
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 1.03 }
            }
            transition={
              phase === "hold"
                ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                : { duration: 0.6, ease: "easeIn" }
            }
          >
            {/* Logo lockup: bolt + wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Bolt */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  width: "clamp(36px, 8vw, 56px)",
                  height: "clamp(36px, 8vw, 56px)",
                  flexShrink: 0,
                  filter: "drop-shadow(0 0 10px rgba(45,43,143,0.9))",
                }}
              >
                <polygon
                  points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                  fill="none"
                  stroke="#2D2B8F"
                  strokeWidth="1.6"
                />
              </svg>

              {/* Text */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1 }}>
                  <span
                    style={{
                      fontSize: "clamp(26px, 6vw, 46px)",
                      fontWeight: 800,
                      color: "#ffffff",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Affinity
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(26px, 6vw, 46px)",
                      fontWeight: 800,
                      color: "#1e40af",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Solution
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "clamp(11px, 2vw, 15px)",
                    color: "rgba(255,255,255,0.45)",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    marginTop: 4,
                  }}
                >
                  Your IT, Fully Managed.
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Vignette ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.92) 100%)",
            }}
          />
        </motion.div>
      )}
    </>
  );
}