import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, TrendingUp, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { OilSpillDetection, NewsArticle } from '../../types/oilSpill';
import { newsService } from '../../services/newsService';

interface NewsCorrelationPanelProps {
  detection: OilSpillDetection | null;
  onClose: () => void;
}

interface ArticleCardProps {
  article: NewsArticle;
  index: number;
}

const RelevanceBadge: React.FC<{ score: number }> = ({ score }) => {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? 'bg-green-100 text-green-700' :
    pct >= 65 ? 'bg-yellow-100 text-yellow-700' :
    'bg-gray-100 text-gray-600';

  return (
    <span
      data-testid="relevance-badge"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      <TrendingUp className="w-3 h-3" />
      {pct}% match
    </span>
  );
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-testid={`news-article-${index}`}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4
            data-testid="article-title"
            className="text-sm font-semibold text-gray-800 leading-snug flex-1"
          >
            {article.title}
          </h4>
          {article.relevance_score != null && (
            <RelevanceBadge score={article.relevance_score} />
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="font-medium text-gray-700">{article.source}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(article.published_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {article.description && (
          <>
            <p className={`text-xs text-gray-600 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {article.description}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
              aria-label={expanded ? 'Show less' : 'Show more'}
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Show less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Show more</>
              )}
            </button>
          </>
        )}
      </div>

      <div className="px-4 pb-3">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="article-link"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Read full article <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

const SkeletonArticle: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-full" />
        <div className="h-3.5 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="h-5 w-20 bg-gray-200 rounded-full flex-shrink-0" />
    </div>
    <div className="flex gap-3 mb-3">
      <div className="h-3 bg-gray-200 rounded w-24" />
      <div className="h-3 bg-gray-200 rounded w-28" />
    </div>
    <div className="space-y-1.5">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  </div>
);

const NewsCorrelationPanel: React.FC<NewsCorrelationPanelProps> = ({ detection, onClose }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [regionName, setRegionName] = useState('');

  useEffect(() => {
    if (!detection || detection.status !== 'Oil spill') {
      setArticles([]);
      return;
    }

    setLoading(true);
    const region = newsService.getRegionName(detection.latitude, detection.longitude);
    setRegionName(region);

    const timer = setTimeout(() => {
      const results = newsService.getArticlesForDetection(
        detection.latitude,
        detection.longitude,
        detection.detected_at,
        detection.id,
      );
      setArticles(results);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [detection]);

  if (!detection) return null;

  const isOilSpill = detection.status === 'Oil spill';

  return (
    <div
      data-testid="news-correlation-panel"
      className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-50 border-l border-gray-200 shadow-2xl z-[1800] flex flex-col animate-slide-in-right"
    >
      <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-semibold text-gray-800">News Correlation</h2>
            {regionName && (
              <p className="text-xs text-gray-500">{regionName}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          data-testid="news-panel-close"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Close news panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isOilSpill ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isOilSpill ? 'bg-red-500' : 'bg-green-500'}`} />
          {detection.status}
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          Detected {new Date(detection.detected_at).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
          })} — {detection.latitude.toFixed(4)}, {detection.longitude.toFixed(4)}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {!isOilSpill ? (
          <div
            data-testid="no-news-message"
            className="text-center py-12"
          >
            <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No news correlation</p>
            <p className="text-xs text-gray-400 mt-1">
              News correlation is only shown for confirmed oil spill events.
            </p>
          </div>
        ) : loading ? (
          <>
            <SkeletonArticle />
            <SkeletonArticle />
            <SkeletonArticle />
          </>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No correlated articles found</p>
          </div>
        ) : (
          <>
            <p
              data-testid="articles-count"
              className="text-xs text-gray-500 font-medium"
            >
              {articles.length} correlated article{articles.length !== 1 ? 's' : ''} found
            </p>
            {articles.map((article, i) => (
              <ArticleCard key={i} article={article} index={i} />
            ))}
          </>
        )}
      </div>

      <div className="px-5 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <p className="text-xs text-gray-400 text-center">
          Correlations are generated from regional maritime news patterns. Always verify with official sources.
        </p>
      </div>
    </div>
  );
};

export default NewsCorrelationPanel;
