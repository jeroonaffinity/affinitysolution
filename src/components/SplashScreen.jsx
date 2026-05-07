import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOLT_COUNT = 70;

function useSeed(count) {
  return useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 14 + Math.random() * 30,
    delay: Math.random() * 1.6,
    duration: 2 + Math.random() * 1.5,
    rotation: (Math.random() - 0.5) * 50,
    opacity: 0.3 + Math.random() * 0.5,
  })), []);
}

// Shockwave ring
function Ring({ delay, size }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        border: "1px solid rgba(45,43,143,0.6)",
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      initial={{ scale: 0, opacity: 0.9 }}
      animate={{ scale: 6, opacity: 0 }}
      transition={{ duration: 1.6, delay, ease: [0.2, 0.8, 0.4, 1] }}
    />
  );
}

export default function SplashScreen({ children }) {
  // phases: scatter → converge → shockwave → logo → hold → exit → done
  const [phase, setPhase] = useState("scatter");
  const bolts = useSeed(BOLT_COUNT);

  useEffect(() => {
    const seq = [
      [1800, "converge"],
      [2600, "shockwave"],
      [2700, "logo"],
      [4200, "exit"],
      [5100, "done"],
    ];
    const timers = seq.map(([ms, p]) => setTimeout(() => setPhase(p), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === "done") return <>{children}</>;

  const boltVariants = {
    scatter: (b) => ({
      opacity: b.opacity,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: b.duration, delay: b.delay, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
    }),
    converge: (b) => {
      const cx = b.left - 50;
      const cy = b.top - 50;
      return {
        x: `${-cx * 0.85}vw`,
        y: `${-cy * 0.85}vh`,
        scale: 0.3,
        opacity: 0.9,
        transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1] },
      };
    },
    shockwave: () => ({ opacity: 0, scale: 0, transition: { duration: 0.25 } }),
    logo: () => ({ opacity: 0, scale: 0, transition: { duration: 0 } }),
    exit: () => ({ opacity: 0, transition: { duration: 0 } }),
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "#000" }}
      >
        {/* ── Ambient glow behind everything ── */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(45,43,143,0.18) 0%, transparent 70%)",
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={
            phase === "shockwave" || phase === "logo" || phase === "hold"
              ? { scale: 1.8, opacity: 1 }
              : phase === "exit"
              ? { scale: 2.5, opacity: 0 }
              : { scale: 0.5, opacity: 0 }
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* ── Scattered breathing bolts ── */}
        {(phase === "scatter" || phase === "converge") &&
          bolts.map((bolt) => (
            <motion.svg
              key={bolt.id}
              custom={bolt}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2D2B8F"
              strokeWidth="1.4"
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
              initial={{ opacity: 0 }}
              animate={
                phase === "converge"
                  ? {
                      x: `${-(bolt.left - 50) * 0.9}vw`,
                      y: `${-(bolt.top - 50) * 0.9}vh`,
                      scale: 0.2,
                      opacity: 1,
                    }
                  : {
                      opacity: [0, bolt.opacity, bolt.opacity * 0.4, bolt.opacity],
                    }
              }
              transition={
                phase === "converge"
                  ? { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
                  : {
                      duration: bolt.duration,
                      delay: bolt.delay,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "mirror",
                    }
              }
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </motion.svg>
          ))}

        {/* ── Shockwave rings ── */}
        <AnimatePresence>
          {(phase === "shockwave" || phase === "logo" || phase === "hold") && (
            <>
              <Ring delay={0} size={60} />
              <Ring delay={0.12} size={60} />
              <Ring delay={0.26} size={60} />
            </>
          )}
        </AnimatePresence>

        {/* ── Logo materialise ── */}
        <AnimatePresence>
          {(phase === "logo" || phase === "hold") && (
            <motion.div
              className="absolute flex flex-col items-center gap-5 z-10"
              initial={{ opacity: 0, scale: 0.88, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Logo */}
              <motion.img
                src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png"
                alt="AffinitySolution"
                style={{
                  width: "min(340px, 72vw)",
                  filter: "drop-shadow(0 0 32px rgba(45,43,143,0.7)) drop-shadow(0 0 80px rgba(45,43,143,0.3))",
                }}
              />

              {/* Divider line */}
              <motion.div
                className="h-px bg-white/10"
                initial={{ width: 0 }}
                animate={{ width: "min(220px, 50vw)" }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              />

              {/* Tagline */}
              <motion.p
                className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/35 font-light"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Managed IT Solutions
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Exit flash ── */}
        <AnimatePresence>
          {phase === "exit" && (
            <motion.div
              className="absolute inset-0 bg-black pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* ── Scanlines ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
          }}
        />

        {/* ── Vignette ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.9) 100%)",
          }}
        />
      </div>

      {children}
    </>
  );
}