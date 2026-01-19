import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { User, Calendar, ExternalLink, Users, Loader2 } from 'lucide-react';
import FollowersDialog from '@/components/FollowersDialog';
import { ArticleCard } from '@/components/ArticleCard';

interface PublicProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  medium_url: string | null;
  custom_link_url: string | null;
  custom_link_label: string | null;
  created_at: string;
}

interface Article {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  views: number;
  published_at: string;
  topic_name?: string;
  tags: string[];
}

const PublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchFollowCounts();
      fetchArticles();
      if (user) {
        checkFollowStatus();
      }
    }
  }, [id, user]);

  const fetchProfile = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_public_profile', { profile_id: id });

      if (error) throw error;
      if (data && data.length > 0) {
        setProfile(data[0] as PublicProfileData);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowCounts = async () => {
    if (!id) return;

    try {
      const { data: followerData } = await supabase
        .rpc('get_follower_count', { user_id: id });
      
      const { data: followingData } = await supabase
        .rpc('get_following_count', { user_id: id });

      setFollowerCount(followerData || 0);
      setFollowingCount(followingData || 0);
    } catch (error) {
      console.error('Failed to fetch follow counts:', error);
    }
  };

  const fetchArticles = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          views,
          published_at,
          topic_id,
          topics(name)
        `)
        .eq('author_id', id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Fetch tags for each article
      const articlesWithTags = await Promise.all(
        (data || []).map(async (article) => {
          const { data: tagData } = await supabase
            .from('article_tags')
            .select('tags(name)')
            .eq('article_id', article.id);

          return {
            ...article,
            topic_name: (article.topics as any)?.name,
            tags: tagData?.map((t: any) => t.tags?.name).filter(Boolean) || [],
          };
        })
      );

      setArticles(articlesWithTags);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !id) return;

    const { data } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', id)
      .single();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (!id) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', id);
        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
        toast.success('Unfollowed successfully');
      } else {
        await supabase.from('followers').insert({
          follower_id: user.id,
          following_id: id,
        });
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
        toast.success('Following!');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const getSocialLinks = () => {
    if (!profile) return [];
    const links = [];
    if (profile.facebook_url) links.push({ name: 'Facebook', url: profile.facebook_url });
    if (profile.instagram_url) links.push({ name: 'Instagram', url: profile.instagram_url });
    if (profile.youtube_url) links.push({ name: 'YouTube', url: profile.youtube_url });
    if (profile.twitter_url) links.push({ name: 'Twitter / X', url: profile.twitter_url });
    if (profile.linkedin_url) links.push({ name: 'LinkedIn', url: profile.linkedin_url });
    if (profile.website_url) links.push({ name: 'Website', url: profile.website_url });
    if (profile.github_url) links.push({ name: 'GitHub', url: profile.github_url });
    if (profile.medium_url) links.push({ name: 'Medium', url: profile.medium_url });
    if (profile.custom_link_url) links.push({ name: profile.custom_link_label || 'Link', url: profile.custom_link_url });
    return links;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground mt-2">This profile doesn't exist or has been removed.</p>
        <Link to="/">
          <Button className="mt-4">Go Home</Button>
        </Link>
      </div>
    );
  }

  const socialLinks = getSocialLinks();
  const isOwnProfile = user?.id === id;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
                <AvatarFallback className="text-3xl">
                  {profile.avatar_url ? profile.username.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{profile.username}</h1>
                </div>
                {isOwnProfile ? (
                  <Link to="/profile">
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={handleFollow} 
                    disabled={followLoading}
                    variant={isFollowing ? 'outline' : 'default'}
                  >
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      'Unfollow'
                    ) : (
                      'Follow'
                    )}
                  </Button>
                )}
              </div>

              {/* Follower/Following counts */}
              <div className="flex gap-6">
                <FollowersDialog userId={id!} type="followers" count={followerCount}>
                  <button className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{followerCount}</span>
                    <span className="text-muted-foreground">Followers</span>
                  </button>
                </FollowersDialog>
                <FollowersDialog userId={id!} type="following" count={followingCount}>
                  <button className="flex items-center gap-2 hover:text-primary transition-colors">
                    <span className="font-semibold">{followingCount}</span>
                    <span className="text-muted-foreground">Following</span>
                  </button>
                </FollowersDialog>
              </div>

              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User's Articles */}
      <div>
        <h2 className="text-xl font-bold mb-4">Articles by {profile.username}</h2>
        {articlesLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                description={article.description || ''}
                thumbnailUrl={article.thumbnail_url || undefined}
                authorName={profile.username}
                topicName={article.topic_name}
                tags={article.tags}
                views={article.views || 0}
                publishedAt={article.published_at || ''}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No published articles yet.</p>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
