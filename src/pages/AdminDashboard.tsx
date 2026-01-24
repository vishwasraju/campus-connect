import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockPosts } from '@/lib/mockData';
import { Category, CATEGORIES, RealPost } from '@/lib/types';
import { 
  Search, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Eye, 
  EyeOff, 
  Trash2,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { isAuthenticated } from './auth';

const API_BASE = "https://campus-connect-phi-lime.vercel.app/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; studentId: string, role: 'student' | 'admin' } | null>(null);
  const [posts, setPosts] = useState<RealPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'Public' | 'Anonymous'>('all');

  useEffect(() => {

    const role = "admin";
    
    if (isAuthenticated(role)) {
      const stored = localStorage.getItem('campusVoice-user');
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'admin') {
        navigate('/admin-login');
        return;
      }
      setUser(parsed);
    } else {
      navigate('/admin-login');
    }
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem('campusVoice-user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleDeletePost = async (postId: string) => {


    try{

      const res = await fetch(`${API_BASE}/post/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type":"Application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();

      if(!res.ok){
        toast.error(`${data.message}` || "Server Error, post cannot be deleted")
      }

      toast.success('Post deleted');
      fetchPosts();

    } catch(err: any){
      throw new Error(err.message || "Internal server error");
    }
  };

  useEffect(() => {
      fetchPosts();
    }, []);

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
      const matchesVisibility = visibilityFilter === 'all' || post.postVisibility === visibilityFilter;
      return matchesSearch && matchesCategory && matchesVisibility;
    })
    .sort((a, b) => Number(b.upVotes) - Number(a.upVotes));

  const stats = {
    totalPosts: posts.length,
    totalUpvotes: posts.reduce((sum, p) => sum + Number(p.upVotes), 0),
    totalComments: posts.reduce((sum, p) => sum + Number(p.commentsCount), 0),
    anonymousPosts: posts.filter(p => p.postVisibility === 'Anonymous').length,
  };

  const categoryStats = CATEGORIES.map(cat => ({
    ...cat,
    count: posts.filter(p => p.category === cat.value).length,
  }));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage student feedback</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Posts
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Upvotes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUpvotes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comments
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Anonymous
              </CardTitle>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.anonymousPosts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Category breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Posts by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {categoryStats.map((cat) => (
                <div 
                  key={cat.value}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50"
                >
                  <CategoryBadge category={cat.value} />
                  <span className="font-semibold">{cat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as 'all' | 'Public' | 'Anonymous')}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Anonymous</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posts Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Votes</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Author</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No posts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <ChevronUp className="h-4 w-4 text-upvote" />
                          {post.upVotes}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {post.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <CategoryBadge category={post.category} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-sm">
                          {post.postVisibility === 'Anonymous' ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Anonymous</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              {post.name}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
