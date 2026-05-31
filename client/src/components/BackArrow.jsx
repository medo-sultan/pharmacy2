import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function BackArrow({
  onNavigate,
  to = "dashboard",
  label = "رجوع",
}) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onNavigate(to)}
      className="flex items-center gap-2 text-white/30 hover:text-cyan-400 transition-colors group mb-4"
      style={{
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <motion.div
        whileHover={{ x: 3 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <ArrowRight size={15} strokeWidth={1.8} />
      </motion.div>
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  );
}
