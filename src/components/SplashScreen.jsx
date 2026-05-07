import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ children }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
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
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6" style={{ backgroundColor: '#000000' }}
          >
              {/* Pattern background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url(https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/f4238b822_logofill.png)",
                backgroundSize: "400px",
                backgroundRepeat: "repeat",
                opacity: 0.6,
              }}
            />

            {/* Sweeping brightness wave */}
            <motion.div
              className="absolute inset-y-0 w-[40%]"
              style={{
                left: 0,
                background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
              }}
              animate={{ x: ["-100%", "350%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
            />

            {/* Logo centred on top */}
            <motion.img
              src="https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/674ec2824_AbstractTechnologyProfileLinkedInBanner2.png"
              alt="AffinitySolution"
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ width: 220, height: "auto" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}