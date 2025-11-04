/** Knowledge search component */

import { useState } from "react";
import { api } from "../services/api";

export default function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState("https://docs.sei.io");
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await api.searchKnowledge({ query: query.trim(), limit: 5 });
      setResults(data.results || []);
    } catch (error) {
      alert(`Error searching: ${String(error)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCrawl = async () => {
    if (!crawlUrl.trim()) return;

    setIsCrawling(true);
    setCrawlStatus(null);
    try {
      const data = await api.crawlDocs({
        url: crawlUrl.trim(),
        max_pages: 10,
      });
      setCrawlStatus(
        `Crawled ${data.pages_crawled} pages, created ${data.chunks_created} chunks`
      );
      // Optionally index chunks after crawling
      // await api.indexChunks([...]);
    } catch (error) {
      setCrawlStatus(`Error: ${String(error)}`);
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Crawl Section */}
      <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-[#23272f]">
        <h3 className="text-lg font-bold mb-3">Crawl Sei Documentation</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={crawlUrl}
            onChange={(e) => setCrawlUrl(e.target.value)}
            placeholder="https://docs.sei.io/..."
            className="flex-1 px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded"
          />
          <button
            onClick={handleCrawl}
            disabled={isCrawling}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCrawling ? "Crawling..." : "Crawl"}
          </button>
        </div>
        {crawlStatus && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{crawlStatus}</div>
        )}
      </div>

      {/* Search Section */}
      <div className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-[#23272f]">
        <h3 className="text-lg font-bold mb-3">Search Knowledge Base</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ask a question about Sei..."
            className="flex-1 px-3 py-2 border dark:border-gray-700 bg-white dark:bg-[#1e2633] text-[var(--text)] rounded"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="font-medium">Results:</h4>
            {results.map((result, idx) => (
              <div
                key={idx}
                className="border dark:border-gray-700 rounded p-3 bg-gray-50 dark:bg-[#2b3342] hover:bg-gray-100 dark:hover:bg-[#2f394b]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-gray-500 dark:text-gray-300">
                    Score: {(result.score * 100).toFixed(1)}%
                  </div>
                  {result.metadata?.url && (
                    <a
                      href={result.metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Source
                    </a>
                  )}
                </div>
                <div className="text-sm">{result.content}</div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !isSearching && query && (
          <div className="text-gray-500 dark:text-gray-300 text-sm mt-4">
            No results found. Try crawling documentation first.
          </div>
        )}
      </div>
    </div>
  );
}

