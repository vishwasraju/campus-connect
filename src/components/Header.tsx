import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, LayoutDashboard, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: { name: string; role: 'student' | 'admin' } | null;
  onLogout?: () => void;
  onCreatePost?: () => void;
}

export function Header({ user, onLogout, onCreatePost }: HeaderProps) {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            CV
          </div>
          <span className="hidden font-semibold text-lg sm:inline-block">
            CampusVoice
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === 'student' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className={cn(
                      location.pathname === '/feed' && 'bg-secondary'
                    )}
                  >
                    <Link to="/feed">Feed</Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={onCreatePost}
                    className="gap-1.5"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Post</span>
                  </Button>
                </>
              )}
              {user.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    location.pathname === '/admin' && 'bg-secondary'
                  )}
                >
                  <Link to="/admin" className="gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user.name}
                </span>
                <Button variant="ghost" size="icon" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Student Login</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin-login">Admin Login</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
