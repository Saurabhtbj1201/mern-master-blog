import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";

interface AuthorProfile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
}

interface AuthorHoverCardProps {
  authorId: string;
  authorName: string;
  children: React.ReactNode;
}

const AuthorHoverCard = ({ authorId, authorName, children }: AuthorHoverCardProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchAuthorData = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, bio, avatar_url, twitter_url, github_url, linkedin_url, website_url")
        .eq("id", authorId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Get follower count
      const { count } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", authorId);

      setFollowerCount(count || 0);

      // Check if current user is following
      if (user) {
        const { data: followData } = await supabase
          .from("followers")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", authorId)
          .maybeSingle();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error("Failed to fetch author data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow authors");
      return;
    }

    if (user.id === authorId) {
      toast.error("You cannot follow yourself");
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", authorId);

        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
        toast.success("Unfollowed successfully");
      } else {
        await supabase
          .from("followers")
          .insert({ follower_id: user.id, following_id: authorId });

        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
        toast.success("Following successfully");
      }
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const socialLinks = profile
    ? [
        { name: "Twitter", url: profile.twitter_url },
        { name: "GitHub", url: profile.github_url },
        { name: "LinkedIn", url: profile.linkedin_url },
        { name: "Website", url: profile.website_url },
      ].filter((link) => link.url)
    : [];

  return (
    <HoverCard onOpenChange={(open) => open && fetchAuthorData()}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : profile ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
                <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{profile.username}</h4>
                <p className="text-sm text-muted-foreground">{followerCount} followers</p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
            )}

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.name}
                  </a>
                ))}
              </div>
            )}

            {user && user.id !== authorId && (
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                className="w-full"
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Author not found</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default AuthorHoverCard;