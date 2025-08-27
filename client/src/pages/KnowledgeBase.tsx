import { useEffect, useState } from 'react';
import { Search, BookOpen, Clock } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  category: string;
  readTime: string;
}

export function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/knowledge-base')
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch articles:', err);
        setLoading(false);
      });
  }, []);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['All', 'Strategy', 'Research', 'Decision', 'Planning'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-600 mt-2">
          Strategic frameworks, best practices, and organizational knowledge
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-athena-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className="btn-secondary text-sm"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div key={article.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start mb-3">
                <BookOpen className="h-5 w-5 text-athena-500 mt-0.5" />
                <div className="ml-3 flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                      {article.category}
                    </span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredArticles.length === 0 && !loading && (
        <div className="card text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No articles found matching your search criteria</p>
        </div>
      )}
    </div>
  );
}