import { motion } from "framer-motion";
import { ExternalLink, Twitter, Globe } from "lucide-react";
import { Facebook } from "lucide-react";

interface ResultCardProps {
  title: string;
  snippet: string;
  link: string;
  source: string;
  date?: string;
  author?: string;
  delay?: number;
}

export const ResultCard = ({ title, snippet, link, source, date, author, delay = 0 }: ResultCardProps) => {
  const getIcon = () => {
    switch (source) {
      case "Twitter":
        return <Twitter className="w-5 h-5 text-primary" />;
      case "Facebook":
        return <Facebook className="w-5 h-5 text-primary" />;
      case "Google News":
        return <Globe className="w-5 h-5 text-secondary" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="block p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getIcon()}
            <span className="text-sm font-medium text-primary">{source}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {snippet}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {author && <span>By {author}</span>}
            {date && <span>{new Date(date).toLocaleDateString()}</span>}
          </div>
        </div>
        
        <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </motion.a>
  );
};
