import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Twitter, Linkedin, Github, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ArticleAuthorBoxProps {
  authorId: string;
}

interface AuthorProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
}

const ArticleAuthorBox = ({ authorId }: ArticleAuthorBoxProps) => {
  const { user } = useAuth();
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);

  useEffect(() => {
    fetchAuthorDetails();
  }, [authorId]);

  useEffect(() => {
    if (user && authorId) {
      checkFollowStatus();
    }
  }, [user, authorId]);

  const fetchAuthorDetails = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, twitter_url, linkedin_url, github_url, website_url')
      .eq('id', authorId)
      .single();

    if (profile) {
      setAuthor(profile);
    }

    const { count } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', authorId);

    setFollowerCount(count || 0);

    const { count: articles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', authorId)
      .eq('status', 'published');

    setArticleCount(articles || 0);
  };

  const checkFollowStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', authorId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow');
      return;
    }

    if (isFollowing) {
      await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', authorId);
      setIsFollowing(false);
      setFollowerCount((prev) => prev - 1);
      toast.success('Unfollowed');
    } else {
      await supabase.from('followers').insert({
        follower_id: user.id,
        following_id: authorId,
      });
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
      toast.success('Following');
    }
  };

  if (!author) return null;

  return (
    <Card className="mt-12">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarImage src={author.avatar_url || ""} />
            <AvatarFallback>
              {author.avatar_url ? author.username?.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
              <div>
                <h3 className="font-serif text-xl font-bold">{author.username}</h3>
                <p className="text-sm text-muted-foreground">
                  {followerCount} followers · {articleCount} articles
                </p>
              </div>
              {user?.id !== authorId && (
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
            
            {author.bio && (
              <p className="text-muted-foreground mb-4">{author.bio}</p>
            )}
            
            <div className="flex gap-3">
              {author.twitter_url && (
                <a href={author.twitter_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {author.linkedin_url && (
                <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {author.github_url && (
                <a href={author.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Github className="h-5 w-5" />
                </a>
              )}
              {author.website_url && (
                <a href={author.website_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleAuthorBox;
