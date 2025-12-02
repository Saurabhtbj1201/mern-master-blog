import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Eye, ArrowLeft, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import AuthorHoverCard from '@/components/AuthorHoverCard';

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnail_url: string | null;
  views: number;
  published_at: string;
  author_id: string;
  author_username?: string;
  author_avatar_url?: string | null;
  topic_name?: string;
}

const ArticleDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdminPreview = searchParams.get('preview') === 'true' && isAdmin;

  useEffect(() => {
    if (id) {
      fetchArticle();
      // Only increment views for published articles (not admin previews)
      if (!isAdminPreview) {
        incrementViews();
      }
    }
  }, [id, isAdminPreview]);

  const fetchArticle = async () => {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('id', id);
    
    // Only filter by published status if not admin preview
    if (!isAdminPreview) {
      query = query.eq('status', 'published');
    }
    
    const { data: articleData, error } = await query.single();

    if (!error && articleData) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', articleData.author_id)
        .single();
      
      const { data: topic } = await supabase
        .from('topics')
        .select('name')
        .eq('id', articleData.topic_id)
        .maybeSingle();
      
      setArticle({
        ...articleData,
        author_id: articleData.author_id,
        author_username: profile?.username || 'Anonymous',
        author_avatar_url: profile?.avatar_url,
        topic_name: topic?.name,
      });
      
      const { data: tagData } = await supabase
        .from('article_tags')
        .select('tags(id, name)')
        .eq('article_id', id);
      
      if (tagData) {
        setTags(tagData.map(t => t.tags).filter(Boolean));
      }
    }
    setLoading(false);
  };

  const incrementViews = async () => {
    await supabase.rpc('increment_article_views', { article_id: id });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="mb-4 font-serif text-3xl font-bold">Article Not Found</h1>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-8">
          {/* Sidebar with image */}
          {article.thumbnail_url && (
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-8">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <img
                    src={article.thumbnail_url}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <header className="mb-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {article.topic_name && (
                  <Badge variant="secondary">{article.topic_name}</Badge>
                )}
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <h1 className="mb-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
                {article.title}
              </h1>

              {article.description && (
                <p className="mb-6 text-xl text-muted-foreground">
                  {article.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <AuthorHoverCard authorId={article.author_id} authorName={article.author_username || 'Anonymous'}>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={article.author_avatar_url || ""} />
                      <AvatarFallback>
                        {article.author_avatar_url ? article.author_username?.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {article.author_username || 'Anonymous'}
                    </span>
                  </div>
                </AuthorHoverCard>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>{article.views} views</span>
                </div>
              </div>
            </header>

            {/* Mobile Thumbnail */}
            {article.thumbnail_url && (
              <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg lg:hidden">
                <img
                  src={article.thumbnail_url}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-img:rounded-lg prose-img:my-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleDetail;
