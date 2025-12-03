import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArticleCard } from '@/components/ArticleCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  views: number;
  published_at: string;
  author_username?: string;
  topic_name?: string;
}

const ARTICLES_PER_PAGE = 6;

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTopics();
    fetchTags();
  }, []);

  useEffect(() => {
    setArticles([]);
    setPage(0);
    setHasMore(true);
  }, [searchQuery, selectedTopic, selectedTag]);

  useEffect(() => {
    fetchArticles();
  }, [page, searchQuery, selectedTopic, selectedTag]);

  const fetchArticles = async () => {
    if (page === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(page * ARTICLES_PER_PAGE, (page + 1) * ARTICLES_PER_PAGE - 1);

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (selectedTopic) {
      query = query.eq('topic_id', selectedTopic);
    }

    const { data, error } = await query;

    if (!error && data) {
      if (data.length < ARTICLES_PER_PAGE) {
        setHasMore(false);
      }

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
            .single();
          
          return {
            ...article,
            author_username: profile?.username || 'Anonymous',
            topic_name: topic?.name,
          };
        })
      );

      let filteredArticles = articlesWithDetails;

      if (selectedTag) {
        const { data: articleTags } = await supabase
          .from('article_tags')
          .select('article_id')
          .eq('tag_id', selectedTag);
        
        const articleIds = articleTags?.map(at => at.article_id) || [];
        filteredArticles = articlesWithDetails.filter(article => articleIds.includes(article.id));
      }

      if (page === 0) {
        setArticles(filteredArticles);
      } else {
        setArticles(prev => [...prev, ...filteredArticles]);
      }
    }
    setLoading(false);
    setLoadingMore(false);
  };

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading && !loadingMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading, loadingMore]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleObserver]);

  const fetchTopics = async () => {
    const { data } = await supabase.from('topics').select('*').order('name');
    if (data) setTopics(data);
  };

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('name');
    if (data) setTags(data);
  };

  const getTrendingArticles = () => {
    return [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 font-serif text-4xl font-bold md:text-5xl">
              Welcome to NotePath
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Discover amazing stories from talented writers on topics you love
            </p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <div>
            {/* Topics Filter */}
            <div className="mb-6">
              <h2 className="mb-3 font-serif text-xl font-semibold">Topics</h2>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedTopic === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTopic(null)}
                >
                  All
                </Badge>
                {topics.map((topic) => (
                  <Badge
                    key={topic.id}
                    variant={selectedTopic === topic.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    {topic.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="mb-8">
              <h2 className="mb-3 font-serif text-xl font-semibold">Tags</h2>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedTag === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(null)}
                >
                  All
                </Badge>
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTag === tag.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No articles found</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      id={article.id}
                      title={article.title}
                      description={article.description || ''}
                      thumbnailUrl={article.thumbnail_url || undefined}
                      authorName={article.author_username || 'Anonymous'}
                      topicName={article.topic_name}
                      tags={[]}
                      views={article.views}
                      publishedAt={article.published_at}
                    />
                  ))}
                </div>
                
                {/* Load More Trigger */}
                <div ref={loadMoreRef} className="py-8 flex justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading more articles...</span>
                    </div>
                  )}
                  {!hasMore && articles.length > 0 && (
                    <p className="text-muted-foreground">No more articles to load</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Trending Articles */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold">Trending</h2>
              </div>
              <div className="space-y-4">
                {getTrendingArticles().map((article, index) => (
                  <a
                    key={article.id}
                    href={`/article/${article.id}`}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="line-clamp-2 font-medium group-hover:text-primary">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {article.views} views
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;
