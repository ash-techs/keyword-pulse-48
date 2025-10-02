import { motion } from "framer-motion";
import { X } from "lucide-react";

interface KeywordChipProps {
  keyword: string;
  onRemove: () => void;
  delay?: number;
}

export const KeywordChip = ({ keyword, onRemove, delay = 0 }: KeywordChipProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.3, delay }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
    >
      <span className="font-medium">{keyword}</span>
      <button
        onClick={onRemove}
        className="hover:bg-white/20 rounded-full p-1 transition-colors"
        aria-label={`Remove ${keyword}`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
