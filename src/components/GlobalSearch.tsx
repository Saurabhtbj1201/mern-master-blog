import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, FileText, User, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'articles' | 'users';

interface SearchResult {
  type: 'article' | 'user';
  id: string;
  title?: string;
  description?: string;
  username?: string;
  avatar_url?: string | null;
  topic_name?: string;
}

export const GlobalSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filter]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search articles
      if (filter === 'all' || filter === 'articles') {
        const { data: articles } = await supabase
          .from('articles')
          .select('id, title, description, topic_id')
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(5);

        if (articles) {
          for (const article of articles) {
            let topicName: string | undefined;
            if (article.topic_id) {
              const { data: topic } = await supabase
                .from('topics')
                .select('name')
                .eq('id', article.topic_id)
                .single();
              topicName = topic?.name;
            }
            searchResults.push({
              type: 'article',
              id: article.id,
              title: article.title,
              description: article.description || undefined,
              topic_name: topicName,
            });
          }
        }
      }

      // Search users
      if (filter === 'all' || filter === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .ilike('username', `%${query}%`)
          .limit(5);

        if (users) {
          searchResults.push(
            ...users.map((user) => ({
              type: 'user' as const,
              id: user.id,
              username: user.username,
              avatar_url: user.avatar_url,
            }))
          );
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'article') {
      navigate(`/article/${result.id}`);
    } else {
      navigate(`/profile/${result.id}`);
    }
    setOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <Popover open={open && (query.length > 0 || loading)} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search articles, users..."
              className="w-[200px] pl-9 pr-8 sm:w-[300px] lg:w-[400px]"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) setOpen(true);
              }}
              onFocus={() => query && setOpen(true)}
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger className="w-[100px] sm:w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="articles">Articles</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0 sm:w-[400px] lg:w-[500px]" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="flex w-full items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  {result.type === 'article' ? (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{result.title}</p>
                        {result.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {result.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Article
                          </Badge>
                          {result.topic_name && (
                            <Badge variant="outline" className="text-xs">
                              {result.topic_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={result.avatar_url || undefined} />
                        <AvatarFallback>
                          {result.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{result.username}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          User
                        </Badge>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
