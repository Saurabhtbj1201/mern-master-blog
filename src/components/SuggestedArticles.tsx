import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface SuggestedArticle {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  views: number;
  published_at: string;
  author_username?: string;
  topic_name?: string;
}

interface SuggestedArticlesProps {
  currentArticleId: string;
  topicId?: string | null;
}

const SuggestedArticles = ({ currentArticleId, topicId }: SuggestedArticlesProps) => {
  const [articles, setArticles] = useState<SuggestedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestedArticles();
  }, [currentArticleId, topicId]);

  const fetchSuggestedArticles = async () => {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .neq('id', currentArticleId)
      .order('views', { ascending: false })
      .limit(4);

    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      const articlesWithDetails = await Promise.all(
        data.map(async (article) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', article.author_id)
            .single();

          const { data: topic } = await supabase
            .from('topics')
            .select('name')
            .eq('id', article.topic_id)
            .maybeSingle();

          return {
            ...article,
            author_username: profile?.username || 'Anonymous',
            topic_name: topic?.name,
          };
        })
      );
      setArticles(articlesWithDetails);
    } else {
      // Fallback to any articles if none in same topic
      const { data: fallbackData } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .neq('id', currentArticleId)
        .order('views', { ascending: false })
        .limit(4);

      if (fallbackData) {
        const articlesWithDetails = await Promise.all(
          fallbackData.map(async (article) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', article.author_id)
              .single();

            const { data: topic } = await supabase
              .from('topics')
              .select('name')
              .eq('id', article.topic_id)
              .maybeSingle();

            return {
              ...article,
              author_username: profile?.username || 'Anonymous',
              topic_name: topic?.name,
            };
          })
        );
        setArticles(articlesWithDetails);
      }
    }
    setLoading(false);
  };

  if (loading || articles.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="mb-6 font-serif text-2xl font-bold">Suggested Articles</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <Link key={article.id} to={`/article/${article.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {article.thumbnail_url && (
                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="h-20 w-20 rounded object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {article.topic_name && (
                      <Badge variant="secondary" className="mb-1 text-xs">
                        {article.topic_name}
                      </Badge>
                    )}
                    <h3 className="font-medium line-clamp-2">{article.title}</h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{article.author_username}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SuggestedArticles;
