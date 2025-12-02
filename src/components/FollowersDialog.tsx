import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

interface UserItem {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  isFollowing?: boolean;
}

interface FollowersDialogProps {
  userId: string;
  type: "followers" | "following";
  count: number;
  children: React.ReactNode;
}

const FollowersDialog = ({ userId, type, count, children }: FollowersDialogProps) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let userIds: string[] = [];

      if (type === "followers") {
        const { data } = await supabase
          .from("followers")
          .select("follower_id")
          .eq("following_id", userId);
        userIds = data?.map((f) => f.follower_id) || [];
      } else {
        const { data } = await supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", userId);
        userIds = data?.map((f) => f.following_id) || [];
      }

      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio")
        .in("id", userIds);

      // Check which users the current user is following
      let followingSet = new Set<string>();
      if (user) {
        const { data: followingData } = await supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", user.id)
          .in("following_id", userIds);
        followingSet = new Set(followingData?.map((f) => f.following_id) || []);
      }

      setUsers(
        profiles?.map((p) => ({
          ...p,
          isFollowing: followingSet.has(p.id),
        })) || []
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, userId, type]);

  const handleFollow = async (targetUserId: string, isFollowing: boolean) => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }

    if (user.id === targetUserId) {
      toast.error("You cannot follow yourself");
      return;
    }

    setFollowLoading(targetUserId);
    try {
      if (isFollowing) {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);
        toast.success("Unfollowed successfully");
      } else {
        await supabase
          .from("followers")
          .insert({ follower_id: user.id, following_id: targetUserId });
        toast.success("Following successfully");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUserId ? { ...u, isFollowing: !isFollowing } : u
        )
      );
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "followers" ? "Followers" : "Following"} ({count})
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No {type} yet
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((userItem) => (
                <div
                  key={userItem.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userItem.avatar_url || ""} />
                    <AvatarFallback>
                      {userItem.avatar_url ? (
                        userItem.username.charAt(0).toUpperCase()
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{userItem.username}</p>
                    {userItem.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {userItem.bio}
                      </p>
                    )}
                  </div>
                  {user && user.id !== userItem.id && (
                    <Button
                      size="sm"
                      variant={userItem.isFollowing ? "outline" : "default"}
                      onClick={() => handleFollow(userItem.id, userItem.isFollowing!)}
                      disabled={followLoading === userItem.id}
                    >
                      {followLoading === userItem.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : userItem.isFollowing ? (
                        "Unfollow"
                      ) : (
                        "Follow"
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersDialog;
