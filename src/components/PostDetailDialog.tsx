import { useState } from 'react';
import { Post, Comment } from '@/lib/types';
import { mockComments } from '@/lib/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CategoryBadge } from '@/components/CategoryBadge';
import { UpvoteButton } from '@/components/UpvoteButton';
import { Eye, EyeOff, Clock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PostDetailDialogProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpvote: (postId: string) => void;
  userName: string;
}

export function PostDetailDialog({
  post,
  open,
  onOpenChange,
  onUpvote,
  userName,
}: PostDetailDialogProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) return null;

  const postComments = comments.filter((c) => c.postId === post.id);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const comment: Comment = {
      id: String(Date.now()),
      postId: post.id,
      authorId: 'current-user',
      authorName: userName,
      content: newComment.trim(),
      createdAt: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment('');
    setIsSubmitting(false);
    toast.success('Comment added!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <UpvoteButton
                count={post.upvotes}
                hasUpvoted={post.hasUpvoted}
                onUpvote={() => onUpvote(post.id)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <CategoryBadge category={post.category} />
                {post.visibility === 'private' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <EyeOff className="h-3 w-3" />
                    Anonymous
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {post.authorName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                </span>
              </div>
              <DialogTitle className="text-left">{post.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-muted-foreground">{post.description}</p>
        </div>

        <Separator className="my-4" />

        <div className="flex-1 min-h-0">
          <h4 className="font-semibold mb-3">
            Comments ({postComments.length})
          </h4>
          
          <ScrollArea className="h-[200px] pr-4">
            {postComments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {postComments.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="mt-4 flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim()}
            size="icon"
            className="h-auto"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
