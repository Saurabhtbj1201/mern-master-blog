import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Eye, User, Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

interface ArticleCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  authorName: string;
  topicName?: string;
  tags: string[];
  views: number;
  publishedAt: string;
}

export const ArticleCard = ({
  id,
  title,
  description,
  thumbnailUrl,
  authorName,
  topicName,
  tags,
  views,
  publishedAt,
}: ArticleCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const articleUrl = `${window.location.origin}/article/${id}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank');
  };

  return (
    <Card className="group h-full overflow-hidden transition-all hover:shadow-lg relative">
      <Link to={`/article/${id}`} className="block">
        {thumbnailUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {topicName && (
              <Badge variant="secondary" className="font-medium">
                {topicName}
              </Badge>
            )}
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="line-clamp-2 font-serif text-xl font-bold leading-tight group-hover:text-primary">
            {title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{views}</span>
            </div>
          </div>
        </CardFooter>
      </Link>
      
      {/* Share Button - Outside the Link */}
      <div className="absolute bottom-3 right-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
              onClick={(e) => e.preventDefault()}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleShare(e as any, shareLinks.twitter)}>
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleShare(e as any, shareLinks.facebook)}>
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleShare(e as any, shareLinks.linkedin)}>
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <LinkIcon className="mr-2 h-4 w-4" />}
              Copy Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
