import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, FileText } from 'lucide-react';

interface ProfileData {
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export const SidebarSelfProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState({ articles: 0, followers: 0, following: 0 });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio')
      .eq('id', user.id)
      .single();

    if (data) setProfile(data);
  };

  const fetchStats = async () => {
    if (!user) return;

    const [articlesRes, followersRes, followingRes] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'published'),
      supabase.rpc('get_follower_count', { user_id: user.id }),
      supabase.rpc('get_following_count', { user_id: user.id }),
    ]);

    setStats({
      articles: articlesRes.count || 0,
      followers: followersRes.data || 0,
      following: followingRes.data || 0,
    });
  };

  if (!user || !profile) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl font-semibold">Your Profile</h2>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium line-clamp-1">{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-lg font-bold">{stats.articles}</p>
          <p className="text-xs text-muted-foreground">Articles</p>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-lg font-bold">{stats.followers}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-lg font-bold">{stats.following}</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to="/profile">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1">
          <Link to="/dashboard">
            <FileText className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};
