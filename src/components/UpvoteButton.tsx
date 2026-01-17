import { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UpvoteButtonProps {
  count: number;
  hasUpvoted: boolean;
  onUpvote: () => void;
  size?: 'sm' | 'default';
}

export function UpvoteButton({ count, hasUpvoted, onUpvote, size = 'default' }: UpvoteButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onUpvote();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant="outline"
      size={size === 'sm' ? 'sm' : 'default'}
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center gap-0.5 transition-all duration-200',
        size === 'sm' ? 'h-auto px-2 py-1.5' : 'h-auto px-3 py-2',
        hasUpvoted 
          ? 'bg-upvote-active/10 border-upvote-active text-upvote-active hover:bg-upvote-active/20' 
          : 'hover:border-upvote hover:text-upvote',
        isAnimating && 'scale-110'
      )}
    >
      <ChevronUp 
        className={cn(
          'transition-transform duration-200',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          isAnimating && '-translate-y-0.5'
        )} 
      />
      <span className={cn(
        'font-semibold',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        {count}
      </span>
    </Button>
  );
}
