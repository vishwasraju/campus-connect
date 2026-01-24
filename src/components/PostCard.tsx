import { RealPost } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CategoryBadge } from '@/components/CategoryBadge';
import { UpvoteButton } from '@/components/UpvoteButton';
import { MessageCircle, Eye, EyeOff, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: RealPost;
  onUpvote: (postId: string) => void;
  onClick?: (post: RealPost) => void;
}

export function PostCard({ post, onUpvote, onClick }: PostCardProps) {
  return (
    <Card 
      className={cn(
        'group transition-all duration-200 hover:shadow-md cursor-pointer',
        'border-border/50 hover:border-primary/20'
      )}
      onClick={() => onClick?.(post)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            <UpvoteButton
              count={Number(post.upVotes)}
              hasUpvoted={post.hasUpvoted}
              onUpvote={() => onUpvote(post._id)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <CategoryBadge category={post.category} />
              {post.postVisibility === 'Anonymous' ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <EyeOff className="h-3 w-3" />
                  Anonymous
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {post.name}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="pl-[calc(3rem+1rem)]">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {post.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.commentsCount} comments
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
