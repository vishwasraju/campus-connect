export type Category = 
  | 'academic'
  | 'infrastructure'
  | 'hostel'
  | 'food'
  | 'other';

export type PostVisibility = 'public' | 'private';

export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface Post {
  id: string;
  title: string;
  description: string;
  category: Category;
  visibility: PostVisibility;
  authorId: string;
  authorName: string;
  upvotes: number;
  hasUpvoted: boolean;
  commentsCount: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'academic', label: 'Academic', color: 'bg-category-academic' },
  { value: 'infrastructure', label: 'Infrastructure', color: 'bg-category-infrastructure' },
  { value: 'hostel', label: 'Hostel', color: 'bg-category-hostel' },
  { value: 'food', label: 'Food & Canteen', color: 'bg-category-food' },
  { value: 'other', label: 'Other', color: 'bg-category-other' },
];

export const getCategoryInfo = (category: Category) => 
  CATEGORIES.find(c => c.value === category) || CATEGORIES[4];
