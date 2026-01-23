import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingBadgeProps {
  title?: string;
  subtitle?: string;
  rating?: number;
  className?: string;
}

const RatingStars = ({ rating = 5 }: { rating?: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3.5 w-3.5",
          i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"
        )}
      />
    ))}
  </div>
);

const Wreath = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 60"
    className={cn("h-8 w-14 text-primary", className)}
    fill="none"
  >
    {/* Left wreath */}
    <path
      d="M25 50 C5 40, 10 15, 25 10 C20 20, 15 30, 25 45"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M30 48 C12 38, 15 18, 28 12 C24 22, 20 32, 30 44"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="15" cy="25" r="3" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="35" r="2.5" fill="currentColor" opacity="0.6" />
    <circle cx="18" cy="45" r="2" fill="currentColor" opacity="0.6" />
    
    {/* Right wreath */}
    <path
      d="M75 50 C95 40, 90 15, 75 10 C80 20, 85 30, 75 45"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M70 48 C88 38, 85 18, 72 12 C76 22, 80 32, 70 44"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="85" cy="25" r="3" fill="currentColor" opacity="0.6" />
    <circle cx="80" cy="35" r="2.5" fill="currentColor" opacity="0.6" />
    <circle cx="82" cy="45" r="2" fill="currentColor" opacity="0.6" />
  </svg>
);

export const RatingBadge = ({ 
  title = "Best Platform", 
  subtitle = "2,000+ reviews", 
  rating = 5,
  className 
}: RatingBadgeProps) => {
  return (
    <div 
      className={cn(
        "relative flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md",
        className
      )}
    >
      <Wreath className="absolute -left-2 top-1/2 h-full w-auto -translate-y-1/2 opacity-20" />
      
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Star className="h-5 w-5 fill-primary text-primary" />
        </div>
        
        <div className="flex flex-col">
          <RatingStars rating={rating} />
          <span className="mt-0.5 text-sm font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default RatingBadge;
