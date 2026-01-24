import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Eye, ArrowLeft, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import AuthorHoverCard from '@/components/AuthorHoverCard';
import ArticleAuthorBox from '@/components/ArticleAuthorBox';
import SuggestedArticles from '@/components/SuggestedArticles';
import ShareButton from '@/components/ShareButton';
import { ArticleAd } from '@/components/AdSense';

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
  topic_id?: string | null;
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
        topic_id: articleData.topic_id,
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

  const articleUrl = `/article/${article.id}`;

  return (
    <>
      <Helmet>
        <title>{article.title} - NotePath</title>
        <meta name="description" content={article.description || article.title} />
        <meta name="keywords" content={`${article.topic_name || ''}, ${tags.map(t => t.name).join(', ')}, NotePath, blog, article`} />
        <meta name="author" content={article.author_username || 'NotePath'} />
        <link rel="canonical" href={`${window.location.origin}${articleUrl}`} />
        <meta property="og:title" content={`${article.title} - NotePath`} />
        <meta property="og:description" content={article.description || article.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}${articleUrl}`} />
        <meta property="og:site_name" content="NotePath" />
        <meta property="article:published_time" content={article.published_at} />
        <meta property="article:author" content={article.author_username || 'NotePath'} />
        {article.topic_name && <meta property="article:section" content={article.topic_name} />}
        {tags.map(tag => <meta key={tag.id} property="article:tag" content={tag.name} />)}
        {article.thumbnail_url && <meta property="og:image" content={article.thumbnail_url} />}
        {article.thumbnail_url && <meta property="og:image:alt" content={article.title} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@NotePath" />
        <meta name="twitter:title" content={`${article.title} - NotePath`} />
        <meta name="twitter:description" content={article.description || article.title} />
        {article.thumbnail_url && <meta name="twitter:image" content={article.thumbnail_url} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.description || article.title,
            "image": article.thumbnail_url || undefined,
            "datePublished": article.published_at,
            "author": {
              "@type": "Person",
              "name": article.author_username || "Anonymous",
              "url": `${window.location.origin}/profile/${article.author_id}`
            },
            "publisher": {
              "@type": "Organization",
              "name": "NotePath",
              "url": window.location.origin
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${window.location.origin}${articleUrl}`
            }
          })}
        </script>
      </Helmet>

      <article className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <ShareButton title={article.title} url={articleUrl} />
          </div>

          <div className="mx-auto max-w-4xl">
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
                  <Link 
                    to={`/profile/${article.author_id}`}
                    className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={article.author_avatar_url || ""} />
                      <AvatarFallback>
                        {article.author_avatar_url ? article.author_username?.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {article.author_username || 'Anonymous'}
                    </span>
                  </Link>
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

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-img:rounded-lg prose-img:my-4"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content, {
                ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 's', 'mark', 'blockquote', 'pre', 'code', 'ul', 'ol', 'li', 'a', 'img', 'hr', 'span', 'div'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'],
                ALLOW_DATA_ATTR: false,
              }) }}
            />

            {/* In-Article Advertisement */}
            <ArticleAd />

            {/* Author Box */}
            <ArticleAuthorBox authorId={article.author_id} />

            {/* Suggested Articles */}
            <SuggestedArticles currentArticleId={article.id} topicId={article.topic_id} />
          </div>
        </div>
      </article>
    </>
  );
};

export default ArticleDetail;
