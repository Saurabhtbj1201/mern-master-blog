import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';

interface SuggestedArticle {
  id: string;
  title: string;
  author_username: string;
  thumbnail_url: string | null;
}

export const SuggestedArticlesSidebar = () => {
  const [articles, setArticles] = useState<SuggestedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestedArticles();
  }, []);

  const fetchSuggestedArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, thumbnail_url, author_id')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const articlesWithAuthors = await Promise.all(
        (data || []).map(async (article) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', article.author_id)
            .single();

          return {
            id: article.id,
            title: article.title,
            thumbnail_url: article.thumbnail_url,
            author_username: profile?.username || 'Anonymous',
          };
        })
      );

      setArticles(articlesWithAuthors);
    } catch (error) {
      console.error('Error fetching suggested articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl font-semibold">Suggested for You</h2>
      </div>
      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/article/${article.id}`}
            className="flex gap-3 group"
          >
            {article.thumbnail_url && (
              <img 
                src={article.thumbnail_url} 
                alt="" 
                className="w-16 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                by {article.author_username}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};