import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ children }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2800);
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
          >
            {/* Tiled bolt pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url(https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/35ca695d6_logofill.png)",
                backgroundSize: "380px",
                backgroundRepeat: "repeat",
              }}
            />

            {/* Dark vignette overlay — edges stay dark */}
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
              }}
            />

            {/* Slow diagonal brightness wave sweeping across */}
            <motion.div
              className="absolute inset-y-0"
              style={{
                left: 0,
                width: "50%",
                background: "linear-gradient(110deg, transparent 0%, rgba(80,80,255,0.12) 40%, rgba(255,255,255,0.08) 50%, rgba(80,80,255,0.12) 60%, transparent 100%)",
              }}
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
            />

            {/* Second subtler wave offset */}
            <motion.div
              className="absolute inset-y-0"
              style={{
                left: 0,
                width: "30%",
                background: "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
              }}
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6, delay: 1.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}