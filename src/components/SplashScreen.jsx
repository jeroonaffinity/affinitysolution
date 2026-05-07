import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GRID_COLS = 12;
const GRID_ROWS = 7;

export default function SplashScreen({ children }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const cells = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Stagger delay based on distance from center
      const cx = GRID_COLS / 2;
      const cy = GRID_ROWS / 2;
      const dist = Math.sqrt(Math.pow(col - cx, 2) + Math.pow(row - cy, 2));
      const delay = dist * 0.18 + Math.random() * 0.4;

      cells.push({ row, col, delay });
    }
  }

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] overflow-hidden"
            style={{ backgroundColor: "#000000" }}
          >
            {/* Grid of bolt cells */}
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              }}
            >
              {cells.map(({ row, col, delay }) => (
                <motion.div
                  key={`${row}-${col}`}
                  style={{
                    backgroundImage: "url(https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/35ca695d6_logofill.png)",
                    backgroundSize: "380px",
                    backgroundPosition: `${-col * (380 / GRID_COLS)}px ${-row * (380 / GRID_ROWS)}px`,
                    backgroundRepeat: "repeat",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.85, 0.3, 0.85, 0] }}
                  transition={{
                    duration: 3.0,
                    delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Soft vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.75) 100%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}