import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Eye, 
  Flame, 
  Heart, 
  BookOpen, 
  Star, 
  Target,
  TrendingUp,
  Award,
  Zap,
  Crown,
  Medal,
  Rocket,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface UserStats {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  followerCount: number;
  followingCount: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  currentProgress: number;
  category: 'publishing' | 'views' | 'engagement' | 'streak';
  unlocked: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface Milestone {
  id: string;
  title: string;
  icon: React.ReactNode;
  current: number;
  target: number;
  unit: string;
}

const getTierColor = (tier: Achievement['tier']) => {
  switch (tier) {
    case 'bronze': return 'bg-amber-700/20 text-amber-700 border-amber-700/30';
    case 'silver': return 'bg-slate-400/20 text-slate-500 border-slate-400/30';
    case 'gold': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    case 'platinum': return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
  }
};

const getTierBadgeColor = (tier: Achievement['tier']) => {
  switch (tier) {
    case 'bronze': return 'bg-amber-700 hover:bg-amber-800';
    case 'silver': return 'bg-slate-400 hover:bg-slate-500';
    case 'gold': return 'bg-yellow-500 hover:bg-yellow-600';
    case 'platinum': return 'bg-purple-500 hover:bg-purple-600';
  }
};

export default function Achievements() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchUserStats();
    }
  }, [user, authLoading, navigate]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch articles stats
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('id, status, views')
        .eq('author_id', user.id);

      if (articlesError) throw articlesError;

      const publishedArticles = articles?.filter(a => a.status === 'published') || [];
      const totalViews = publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0);

      // Fetch follower count
      const { data: followerData } = await supabase
        .rpc('get_follower_count', { user_id: user.id });

      // Fetch following count
      const { data: followingData } = await supabase
        .rpc('get_following_count', { user_id: user.id });

      setStats({
        totalArticles: articles?.length || 0,
        publishedArticles: publishedArticles.length,
        totalViews,
        followerCount: Number(followerData) || 0,
        followingCount: Number(followingData) || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const getAchievements = (): Achievement[] => {
    if (!stats) return [];

    return [
      // Publishing achievements
      {
        id: 'first-post',
        title: 'First Steps',
        description: 'Published your first blog post',
        icon: <Rocket className="h-6 w-6" />,
        requirement: 1,
        currentProgress: stats.publishedArticles,
        category: 'publishing',
        unlocked: stats.publishedArticles >= 1,
        tier: 'bronze',
      },
      {
        id: 'prolific-writer',
        title: 'Prolific Writer',
        description: 'Published 5 blog posts',
        icon: <BookOpen className="h-6 w-6" />,
        requirement: 5,
        currentProgress: stats.publishedArticles,
        category: 'publishing',
        unlocked: stats.publishedArticles >= 5,
        tier: 'silver',
      },
      {
        id: 'content-creator',
        title: 'Content Creator',
        description: 'Published 10 blog posts',
        icon: <Award className="h-6 w-6" />,
        requirement: 10,
        currentProgress: stats.publishedArticles,
        category: 'publishing',
        unlocked: stats.publishedArticles >= 10,
        tier: 'gold',
      },
      {
        id: 'master-blogger',
        title: 'Master Blogger',
        description: 'Published 25 blog posts',
        icon: <Crown className="h-6 w-6" />,
        requirement: 25,
        currentProgress: stats.publishedArticles,
        category: 'publishing',
        unlocked: stats.publishedArticles >= 25,
        tier: 'platinum',
      },
      // Views achievements
      {
        id: 'getting-noticed',
        title: 'Getting Noticed',
        description: 'Posts crossed 100 total views',
        icon: <Eye className="h-6 w-6" />,
        requirement: 100,
        currentProgress: stats.totalViews,
        category: 'views',
        unlocked: stats.totalViews >= 100,
        tier: 'bronze',
      },
      {
        id: 'rising-star',
        title: 'Rising Star',
        description: 'Posts crossed 500 total views',
        icon: <Star className="h-6 w-6" />,
        requirement: 500,
        currentProgress: stats.totalViews,
        category: 'views',
        unlocked: stats.totalViews >= 500,
        tier: 'silver',
      },
      {
        id: 'viral-sensation',
        title: 'Viral Sensation',
        description: 'Posts crossed 1,000 total views',
        icon: <Zap className="h-6 w-6" />,
        requirement: 1000,
        currentProgress: stats.totalViews,
        category: 'views',
        unlocked: stats.totalViews >= 1000,
        tier: 'gold',
      },
      {
        id: 'internet-famous',
        title: 'Internet Famous',
        description: 'Posts crossed 10,000 total views',
        icon: <Globe className="h-6 w-6" />,
        requirement: 10000,
        currentProgress: stats.totalViews,
        category: 'views',
        unlocked: stats.totalViews >= 10000,
        tier: 'platinum',
      },
      // Engagement achievements
      {
        id: 'first-follower',
        title: 'First Follower',
        description: 'Gained your first follower',
        icon: <Heart className="h-6 w-6" />,
        requirement: 1,
        currentProgress: stats.followerCount,
        category: 'engagement',
        unlocked: stats.followerCount >= 1,
        tier: 'bronze',
      },
      {
        id: 'building-community',
        title: 'Building Community',
        description: 'Gained 10 followers',
        icon: <TrendingUp className="h-6 w-6" />,
        requirement: 10,
        currentProgress: stats.followerCount,
        category: 'engagement',
        unlocked: stats.followerCount >= 10,
        tier: 'silver',
      },
      {
        id: 'influencer',
        title: 'Influencer',
        description: 'Gained 50 followers',
        icon: <Medal className="h-6 w-6" />,
        requirement: 50,
        currentProgress: stats.followerCount,
        category: 'engagement',
        unlocked: stats.followerCount >= 50,
        tier: 'gold',
      },
      {
        id: 'thought-leader',
        title: 'Thought Leader',
        description: 'Gained 100 followers',
        icon: <Trophy className="h-6 w-6" />,
        requirement: 100,
        currentProgress: stats.followerCount,
        category: 'engagement',
        unlocked: stats.followerCount >= 100,
        tier: 'platinum',
      },
    ];
  };

  const getMilestones = (): Milestone[] => {
    if (!stats) return [];

    return [
      {
        id: 'blogs-published',
        title: 'Blogs Published',
        icon: <BookOpen className="h-5 w-5 text-primary" />,
        current: stats.publishedArticles,
        target: stats.publishedArticles < 5 ? 5 : stats.publishedArticles < 10 ? 10 : stats.publishedArticles < 25 ? 25 : 50,
        unit: 'posts',
      },
      {
        id: 'total-views',
        title: 'Total Views',
        icon: <Eye className="h-5 w-5 text-primary" />,
        current: stats.totalViews,
        target: stats.totalViews < 100 ? 100 : stats.totalViews < 500 ? 500 : stats.totalViews < 1000 ? 1000 : 10000,
        unit: 'views',
      },
      {
        id: 'followers',
        title: 'Followers',
        icon: <Heart className="h-5 w-5 text-primary" />,
        current: stats.followerCount,
        target: stats.followerCount < 10 ? 10 : stats.followerCount < 50 ? 50 : stats.followerCount < 100 ? 100 : 500,
        unit: 'followers',
      },
      {
        id: 'global-reach',
        title: 'Global Reach',
        icon: <Globe className="h-5 w-5 text-primary" />,
        current: stats.followerCount + stats.totalViews,
        target: (stats.followerCount + stats.totalViews) < 100 ? 100 : (stats.followerCount + stats.totalViews) < 500 ? 500 : 1000,
        unit: 'interactions',
      },
    ];
  };

  const achievements = getAchievements();
  const milestones = getMilestones();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
            </div>
            <p className="text-muted-foreground">
              Track your progress and unlock badges as you grow
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {unlockedCount} / {achievements.length} Unlocked
              </Badge>
            </div>
          </div>

          {/* Milestones & Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Milestones & Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {milestones.map((milestone) => {
                  const progress = Math.min((milestone.current / milestone.target) * 100, 100);
                  return (
                    <div key={milestone.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {milestone.icon}
                          <span className="font-medium text-foreground">{milestone.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {milestone.current.toLocaleString()} / {milestone.target.toLocaleString()} {milestone.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats?.publishedArticles || 0}</div>
                <div className="text-sm text-muted-foreground">Published</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Eye className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats?.totalViews.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Heart className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats?.followerCount || 0}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Trophy className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{unlockedCount}</div>
                <div className="text-sm text-muted-foreground">Badges</div>
              </CardContent>
            </Card>
          </div>

          {/* Badges & Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Badges & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const progress = Math.min((achievement.currentProgress / achievement.requirement) * 100, 100);
                  return (
                    <div
                      key={achievement.id}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        achievement.unlocked
                          ? getTierColor(achievement.tier)
                          : 'bg-muted/30 border-muted text-muted-foreground opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${
                          achievement.unlocked 
                            ? getTierBadgeColor(achievement.tier) + ' text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            {achievement.unlocked && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {achievement.tier}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm opacity-80 mt-1">{achievement.description}</p>
                          {!achievement.unlocked && (
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{achievement.currentProgress} / {achievement.requirement}</span>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                        {achievement.unlocked && (
                          <div className="absolute top-2 right-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
