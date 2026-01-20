import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Hash } from 'lucide-react';

interface TopicWithCount {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

interface PopularTopicsSidebarProps {
  onTopicSelect?: (topicId: string | null) => void;
  selectedTopic?: string | null;
}

export const PopularTopicsSidebar = ({ onTopicSelect, selectedTopic }: PopularTopicsSidebarProps) => {
  const [topics, setTopics] = useState<TopicWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularTopics();
  }, []);

  const fetchPopularTopics = async () => {
    try {
      const { data: allTopics, error: topicsError } = await supabase
        .from('topics')
        .select('*');

      if (topicsError) throw topicsError;

      const topicsWithCount = await Promise.all(
        (allTopics || []).map(async (topic) => {
          const { count } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id)
            .eq('status', 'published');

          return {
            ...topic,
            articleCount: count || 0,
          };
        })
      );

      // Sort by article count and take top 8
      const sortedTopics = topicsWithCount
        .sort((a, b) => b.articleCount - a.articleCount)
        .slice(0, 8);

      setTopics(sortedTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-20 bg-muted rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (topics.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Hash className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl font-semibold">Popular Topics</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Badge
            key={topic.id}
            variant={selectedTopic === topic.id ? 'default' : 'secondary'}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onTopicSelect?.(selectedTopic === topic.id ? null : topic.id)}
          >
            {topic.name}
            <span className="ml-1 text-xs opacity-70">({topic.articleCount})</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};