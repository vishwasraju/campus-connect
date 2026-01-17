import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, Category, PostVisibility } from '@/lib/types';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: Category;
    visibility: PostVisibility;
  }) => void;
}

export function CreatePostDialog({ open, onOpenChange, onSubmit }: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.length > 150) newErrors.title = 'Title must be less than 150 characters';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (description.length > 1000) newErrors.description = 'Description must be less than 1000 characters';
    if (!category) newErrors.category = 'Please select a category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !category) return;
    
    onSubmit({ title, description, category, visibility });
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('');
    setVisibility('public');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your complaint or suggestion with the college community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief summary of your issue or suggestion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about your complaint or suggestion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? 'border-destructive' : ''}
              rows={4}
            />
            {errors.description && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/1000
            </p>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.category}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Post Visibility</Label>
            <RadioGroup 
              value={visibility} 
              onValueChange={(v) => setVisibility(v as PostVisibility)}
              className="grid grid-cols-2 gap-3"
            >
              <Label 
                htmlFor="public" 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  visibility === 'public' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="public" id="public" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Eye className="h-4 w-4" />
                    Public
                  </div>
                  <p className="text-xs text-muted-foreground">Your name will be visible</p>
                </div>
              </Label>
              <Label 
                htmlFor="private" 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  visibility === 'private' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="private" id="private" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <EyeOff className="h-4 w-4" />
                    Anonymous
                  </div>
                  <p className="text-xs text-muted-foreground">Post without your name</p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Post</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
