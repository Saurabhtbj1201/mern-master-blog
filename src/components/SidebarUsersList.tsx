import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  isFollowing: boolean;
}

export const SidebarUsersList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .limit(5);

      if (error) throw error;

      if (profiles) {
        // Filter out current user and check following status
        const filteredProfiles = profiles.filter(p => p.id !== user?.id);
        
        if (user) {
          const { data: following } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', user.id);

          const followingIds = following?.map(f => f.following_id) || [];
          
          const usersWithStatus = filteredProfiles.map(profile => ({
            ...profile,
            isFollowing: followingIds.includes(profile.id),
          }));
          setUsers(usersWithStatus);
        } else {
          setUsers(filteredProfiles.map(p => ({ ...p, isFollowing: false })));
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string, isFollowing: boolean) => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        toast.success('Unfollowed user');
      } else {
        await supabase
          .from('followers')
          .insert({ follower_id: user.id, following_id: targetUserId });
        toast.success('Following user');
      }
      
      setUsers(prev => prev.map(u => 
        u.id === targetUserId ? { ...u, isFollowing: !isFollowing } : u
      ));
    } catch (error) {
      toast.error('Failed to update follow status');
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

  if (users.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl font-semibold">Who to Follow</h2>
      </div>
      <div className="space-y-4">
        {users.map((profile) => (
          <div key={profile.id} className="flex items-center gap-3">
            <Link to={`/profile/${profile.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${profile.id}`} className="font-medium hover:text-primary line-clamp-1">
                {profile.username}
              </Link>
              {profile.bio && (
                <p className="text-xs text-muted-foreground line-clamp-1">{profile.bio}</p>
              )}
            </div>
            {user && (
              <Button
                size="sm"
                variant={profile.isFollowing ? 'outline' : 'default'}
                onClick={() => handleFollow(profile.id, profile.isFollowing)}
                className="shrink-0"
              >
                {profile.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
