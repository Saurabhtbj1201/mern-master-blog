import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    if (user) {
      fetchFollowing();
    }
  }, [user]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio')
      .order('username');
    if (data) setUsers(data);
    setLoading(false);
  };

  const fetchFollowing = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id);
    if (data) setFollowing(data.map(f => f.following_id));
  };

  const handleFollow = async (userId: string) => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }

    const isFollowing = following.includes(userId);

    if (isFollowing) {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      
      if (!error) {
        setFollowing(prev => prev.filter(id => id !== userId));
        toast.success('Unfollowed');
      }
    } else {
      const { error } = await supabase
        .from('followers')
        .insert({ follower_id: user.id, following_id: userId });
      
      if (!error) {
        setFollowing(prev => [...prev, userId]);
        toast.success('Following');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 font-serif text-3xl font-bold">All Users</h1>
      
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((profile) => (
            <div 
              key={profile.id} 
              className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card"
            >
              <Link to={`/user/${profile.id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/user/${profile.id}`}
                  className="font-medium hover:text-primary truncate block"
                >
                  {profile.username}
                </Link>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground truncate">
                    {profile.bio}
                  </p>
                )}
              </div>
              {user && user.id !== profile.id && (
                <Button
                  variant={following.includes(profile.id) ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleFollow(profile.id)}
                >
                  {following.includes(profile.id) ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
