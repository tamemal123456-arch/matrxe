// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Loader2 } from "lucide-react";

interface DeepSearchButtonProps {
  onClick: () => void;
  isSearching?: boolean;
  disabled?: boolean;
}

const DeepSearchButton = ({
  onClick,
  isSearching = false,
  disabled = false,
}: DeepSearchButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || isSearching}
      className="relative group flex items-center gap-2 px-4 py-2 rounded-xl 
        bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10 
        border border-primary/30 hover:border-accent/50 
        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="w-4 h-4 text-accent animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Search className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
        بحث عميق
      </span>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
    </motion.button>
  );
};

export default DeepSearchButton;
