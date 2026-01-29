import { useState } from 'react';
import { RealPost, Comment } from '@/lib/types';
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

const API_BASE = "http://localhost:3000/api";

interface PostDetailDialogProps {
  post: RealPost | null;
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
  const [comments, setComments] = useState<Comment[]>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) return null;

  //const postComments = comments.filter((c) => c.postId === post._id);

  const postComments = post.comments;
  const postCommentLength = postComments.length;

  console.log("postComments", postComments);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    console.log("Sending comment name: ", JSON.parse(localStorage.getItem('campusVoice-user')).name);

    try{

        setIsSubmitting(true);

        const res = await fetch(`${API_BASE}/${post._id}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                postID: post._id,
                comment: newComment,
                name: JSON.parse(localStorage.getItem('campusVoice-user')).name
            })
        });

        const data = await res.json();

        if(!res.ok){
            toast.error(data.message || "Internal server error");
            throw new Error(data.message || "Internal server error");
        }

        toast.success('Comment added!');

    } catch(err: any){
        throw new Error(err.message || "Internal server Error");
    } finally{
        setIsSubmitting(false);
        setNewComment('');
    }
    
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
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
            Comments ({postCommentLength})
          </h4>
          
          <ScrollArea className="h-[200px] pr-4">
            {postCommentLength === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {postComments.map((comment) => (
                  <div key={comment._id} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {comment.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
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