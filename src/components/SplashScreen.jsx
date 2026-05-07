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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ opacity: { duration: 0.3 }, rotate: { duration: 2.5, repeat: Infinity, ease: "linear" } }}
              style={{
                width: 180,
                height: 180,
                backgroundImage: "url(https://media.base44.com/images/public/69aa02e6ea92c996cd4d16f3/533958f84_AbstractTechnologyProfileLinkedInBanner3.png)",
                backgroundSize: "1100%",
                backgroundPosition: "51% 50%",
                backgroundRepeat: "no-repeat",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}