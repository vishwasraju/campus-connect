import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPosts } from '@/lib/mockData';
import { Category, CATEGORIES, RealPost } from '@/lib/types';
import { Search, TrendingUp, Clock, Filter, Store } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { isAuthenticated } from './auth';
import { PostDetailDialog } from '@/components/PostDetailDialog';

const API_BASE = "http://localhost:3000/api";

type SortOption = 'trending' | 'latest';

export default function StudentFeed() {

  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; studentId: string; role: 'student' | 'admin' } | null>(null);
  const [posts, setPosts] = useState<RealPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<RealPost[]>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated('student')) {
      const stored = localStorage.getItem('campusVoice-user');
      console.log("This is the stored: ", stored);
      setUser(JSON.parse(stored));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchPosts();
  }, []);

  console.log("This is the user: ", user);

  const handleLogout = () => {
    localStorage.removeItem('campusVoice-user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleUpvote = async (postId: string) => {
  setPosts(prevPosts =>
    prevPosts.map(post => {
      if (post._id === postId) {
        const hasUpvoted = post.hasUpvoted;

        return {
          ...post,
          upVotes: hasUpvoted
            ? Number(post.upVotes) - 1
            : Number(post.upVotes) + 1,
          hasUpvoted: !hasUpvoted,
          hasPendingVote: true
        };
      }
      return post;
    })
  );

  try{

    const res = await fetch(`${API_BASE}/post/${postId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
         Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await res.json();

    if(!res.ok){
      throw new Error(data.message || "Internal server Error");
    }

    setPosts(prev =>
      prev.map(post => 
        post._id === postId 
        ? {...post, hasPendingVote: false}
        : post
      )
    );

  } catch(err){
    
    setPosts(prev =>
      prev.map(post =>
        post._id === postId
          ? {
              ...post,
              upVotes: post.hasUpvoted ? post.upVotes - 1 : post.upVotes + 1,
              hasUpvoted: !post.hasUpvoted,
              hasPendingVote: false
            }
          : post
      )
    );
    
  }

};

useEffect(() => {
  console.log("The new Data: ", posts);
}, [posts]);


  const fetchPosts = async () => {
    try{

      const res = await fetch(`${API_BASE}/posts`, {
        method: "GET",
        headers: {
          "Content-Type": "Application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await res.json();

       if(!res.ok){
        throw new Error(data.message || "Internal server Error");
      }

      console.log("Mock data: ", mockPosts);

      setPosts(data);

      console.log("Posts data received from server: ", data);

    } catch(err){
      throw new Error(err.message);
    } finally{
      //console.log("Posts receiveed from server: ", data);
    }
  };

  const handleCreatePost = async (data: {
    title: string;
    description: string;
    category: Category;
    visibility: 'Public' | 'Anonymous';
  }) => {

    try{
      setIsLoading(true);


      const res = await fetch(`${API_BASE}/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          category: data.category, 
          title: data.title, 
          description: data.description, 
          postVisibility: data.visibility,
          name: data.visibility === "Public" ? JSON.parse(localStorage.getItem("campusVoice-user")).name : undefined,
          studentID: data.visibility === "Public" ? JSON.parse(localStorage.getItem("campusVoice-user")).studentID : undefined
        })
    });

      const serverdata = await res.json();

      if(!res.ok){
        throw new Error(serverdata.message || "Something went wrong");
      }

      console.log("Post created sucessfully");

      // setPosts([newPost, ...posts]);
      toast.success('Post created successfully!');


    } catch(err: any){
      throw new Error(err.message);
    } finally{
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(post.category);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if(a.hasPendingVote|| b.hasPendingVote){
        return 0;
      }
      if (sortBy === 'trending') {
        return Number(b.upVotes) - Number(a.upVotes);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handlePostCardClick = (post) => {

    setSelectedPost(post);

    toast.info(`Opening post: ${post.title}`);
    
    

  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onLogout={handleLogout}
        onCreatePost={() => setCreateDialogOpen(true)}
      />
      
      <main className="container py-6">
        <div className="max-w-3xl mx-auto">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <TabsList>
                  <TabsTrigger value="trending" className="gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Trending</span>
                  </TabsTrigger>
                  <TabsTrigger value="latest" className="gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Latest</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Filter className="h-4 w-4" />
                    {selectedCategories.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {selectedCategories.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {CATEGORIES.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.value}
                      checked={selectedCategories.includes(category.value)}
                      onCheckedChange={() => toggleCategory(category.value)}
                    >
                      {category.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
             <AnimatePresence>{
              filteredPosts.map((post) => (
                <motion.div
                  key = {post._id}
                  layout
                  transition={{ duration: 0.25 }}
                >
                <PostCard
                  key={post._id}
                  post={post}
                  onUpvote={handleUpvote}
                  onClick={(post) => handlePostCardClick(post)}
                />
                </motion.div>
              ))
             }</AnimatePresence>
            )}
          </div>
        </div>
      </main>

      <CreatePostDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreatePost}
        setLoading={isLoading}
      />

      <PostDetailDialog
        post={selectedPost}
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
        onUpvote={handleUpvote}
        userName={user?.name || 'Student'}
      />
    </div>
  );
}
