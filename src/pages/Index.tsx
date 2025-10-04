import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { KeywordChip } from "@/components/KeywordChip";
import { ResultCard } from "@/components/ResultCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// TODO: Replace with your actual Node.js backend URL
const API_BASE_URL = "https://your-nodejs-backend.com/api";

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  source: string;
  date?: string;
  author?: string;
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
  "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "will", "with",
]);

const extractKeywords = (text: string): string[] => {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOPWORDS.has(word));
  
  return [...new Set(words)].slice(0, 5);
};

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twitterResults, setTwitterResults] = useState<SearchResult[]>([]);
  const [facebookResults, setFacebookResults] = useState<SearchResult[]>([]);
  const [googleResults, setGoogleResults] = useState<SearchResult[]>([]);

  const handleExtractAndSearch = async () => {
    const extractedKeywords = extractKeywords(inputText);
    setKeywords(extractedKeywords);
    setError(null);
    
    if (extractedKeywords.length === 0) {
      setError("No keywords found. Please enter more meaningful text.");
      return;
    }

    setLoading(true);
    setTwitterResults([]);
    setFacebookResults([]);
    setGoogleResults([]);

    try {
      const searchQuery = extractedKeywords.join(" ");

      // Call your external Node.js API endpoints
      const [twitterRes, facebookRes, googleRes] = await Promise.all([
        fetch(`${API_BASE_URL}/search/twitter?keyword=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add your API key if needed
            // 'Authorization': 'Bearer YOUR_API_KEY',
          },
        }),
        fetch(`${API_BASE_URL}/search/facebook?keyword=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer YOUR_API_KEY',
          },
        }),
        fetch(`${API_BASE_URL}/search/google-news?keyword=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer YOUR_API_KEY',
          },
        }),
      ]);

      // Check for errors
      if (!twitterRes.ok) {
        console.error('Twitter API error:', await twitterRes.text());
      }
      if (!facebookRes.ok) {
        console.error('Facebook API error:', await facebookRes.text());
      }
      if (!googleRes.ok) {
        console.error('Google API error:', await googleRes.text());
      }

      const [twitterData, facebookData, googleData] = await Promise.all([
        twitterRes.ok ? twitterRes.json() : { results: [] },
        facebookRes.ok ? facebookRes.json() : { results: [] },
        googleRes.ok ? googleRes.json() : { results: [] },
      ]);

      setTwitterResults(twitterData.results || []);
      setFacebookResults(facebookData.results || []);
      setGoogleResults(googleData.results || []);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  return (
    <div className="min-h-screen bg-gradient-bg relative overflow-hidden">
      <ThemeToggle />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-48 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-48 -left-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Social Insights Explorer
          </h1>
          <p className="text-lg text-muted-foreground">
            Extract keywords and discover insights across Twitter, Facebook, and Google News
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here to extract keywords..."
              className="min-h-[150px] mb-4 bg-white/50 dark:bg-black/20 border-white/30 resize-none"
            />
            
            <Button
              onClick={handleExtractAndSearch}
              disabled={!inputText.trim() || loading}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting & Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Extract Keywords & Search
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Keywords Display */}
        {keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Extracted Keywords</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <AnimatePresence>
                {keywords.map((keyword, index) => (
                  <KeywordChip
                    key={keyword}
                    keyword={keyword}
                    onRemove={() => removeKeyword(keyword)}
                    delay={index * 0.1}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <Alert variant="destructive" className="backdrop-blur-md bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Results Sections */}
        {(twitterResults.length > 0 || facebookResults.length > 0 || googleResults.length > 0) && (
          <div className="space-y-12">
            {/* Twitter Results */}
            {twitterResults.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-center">Twitter Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {twitterResults.map((result, index) => (
                    <ResultCard key={index} {...result} delay={index * 0.1} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Facebook Results */}
            {facebookResults.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-center">Facebook Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facebookResults.map((result, index) => (
                    <ResultCard key={index} {...result} delay={index * 0.1} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Google News Results */}
            {googleResults.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-center">Google News Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {googleResults.map((result, index) => (
                    <ResultCard key={index} {...result} delay={index * 0.1} />
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
