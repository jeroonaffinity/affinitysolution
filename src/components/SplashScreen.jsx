import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOLT_COUNT = 55;

export default function SplashScreen({ children }) {
  const [visible, setVisible] = useState(true);

  const bolts = useMemo(() => {
    return Array.from({ length: BOLT_COUNT }, (_, i) => ({
      id: i,
      top: Math.random() * 96,
      left: Math.random() * 96,
      size: 28 + Math.random() * 28,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 3,
      repeatDelay: 0.8 + Math.random() * 2,
      rotation: (Math.random() - 0.5) * 30,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] overflow-hidden"
            style={{ backgroundColor: "#000000" }}
          >
            {bolts.map((bolt) => (
              <motion.svg
                key={bolt.id}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3730d4"
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
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{
                  duration: bolt.duration,
                  delay: bolt.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: bolt.repeatDelay,
                }}
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </motion.svg>
            ))}

            {/* Soft vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.82) 100%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}