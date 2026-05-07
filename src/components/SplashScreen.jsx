import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOLT_COUNT = 60;

export default function SplashScreen({ children }) {
  const [phase, setPhase] = useState("bolts"); // bolts → logo → exit

  const bolts = useMemo(() => {
    return Array.from({ length: BOLT_COUNT }, (_, i) => ({
      id: i,
      top: Math.random() * 96,
      left: Math.random() * 96,
      size: 20 + Math.random() * 32,
      delay: Math.random() * 1.8,
      duration: 2.5 + Math.random() * 2,
      rotation: (Math.random() - 0.5) * 40,
    }));
  }, []);

  useEffect(() => {
    // Phase 1: bolts appear (0–2s)
    // Phase 2: logo slams in (2s)
    // Phase 3: everything exits (3.8s)
    const t1 = setTimeout(() => setPhase("logo"), 2000);
    const t2 = setTimeout(() => setPhase("exit"), 3800);
    const t3 = setTimeout(() => setPhase("done"), 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "done") return <>{children}</>;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "#000000" }}
        animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        {/* ── Scattered bolts ── */}
        {bolts.map((bolt) => (
          <motion.svg
            key={bolt.id}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2D2B8F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              top: `${bolt.top}%`,
              left: `${bolt.left}%`,
              width: bolt.size,
              height: bolt.size,
              rotate: `${bolt.rotation}deg`,
              pointerEvents: "none",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              phase === "logo"
                ? { opacity: 0, scale: 0.4, transition: { duration: 0.6, ease: "easeIn" } }
                : { opacity: [0, 0.75, 0.3, 0.75], scale: 1 }
            }
            transition={
              phase === "bolts"
                ? { duration: bolt.duration, delay: bolt.delay, ease: "easeInOut" }
                : {}
            }
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </motion.svg>
        ))}

        {/* ── Radial pulse ring on logo enter ── */}
        <AnimatePresence>
          {phase === "logo" && (
            <>
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    border: "1px solid rgba(45,43,143,0.5)",
                    width: 80,
                    height: 80,
                  }}
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 8, opacity: 0 }}
                  transition={{ duration: 1.4, delay, ease: "easeOut" }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* ── Logo slam ── */}
        <AnimatePresence>
          {phase === "logo" && (
            <motion.div
              className="relative flex flex-col items-center gap-4 z-10"
              initial={{ scale: 2.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png"
                alt="AffinitySolution"
                className="w-64 md:w-80"
                style={{ filter: "drop-shadow(0 0 40px rgba(45,43,143,0.8))" }}
              />
              {/* Tagline fade-up */}
              <motion.p
                className="text-xs tracking-[0.35em] uppercase text-white/40 font-light"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Managed IT Solutions
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scanline overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          }}
        />

        {/* ── Vignette ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.88) 100%)",
          }}
        />
      </motion.div>

      {children}
    </>
  );
}