import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  return (
    <Link to={`/article/${id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
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
        <CardFooter className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
        </CardFooter>
      </Card>
    </Link>
  );
};
