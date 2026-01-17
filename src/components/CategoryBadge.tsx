import { Category, getCategoryInfo } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

const categoryStyles: Record<Category, string> = {
  academic: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20',
  infrastructure: 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/20',
  hostel: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
  food: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20',
  other: 'bg-category-other/10 text-category-other hover:bg-category-other/20 border-category-other/20',
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const info = getCategoryInfo(category);
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        categoryStyles[category],
        className
      )}
    >
      {info.label}
    </Badge>
  );
}
