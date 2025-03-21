
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building, ChevronLeft, ChevronRight, Home, Menu, Moon, Sun, UserRound, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, active, onClick }: NavItemProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to={to} 
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
              active 
                ? "text-primary font-medium bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            onClick={onClick}
          >
            <div className="flex-shrink-0 w-5 h-5">{icon}</div>
            <span className="transition-all duration-300 font-medium">{label}</span>
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="z-50">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [navOpen, setNavOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const location = useLocation();
  
  // Load theme preference from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };
  
  const toggleNav = () => {
    setNavOpen(!navOpen);
  };
  
  const navItems = [
    { to: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { to: '/rooms', icon: <Building className="w-5 h-5" />, label: 'Rooms' },
    { to: '/people', icon: <UserRound className="w-5 h-5" />, label: 'People' },
    { to: '/allocations', icon: <Users className="w-5 h-5" />, label: 'Allocations' },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar/Navigation */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-20 bg-card border-r border-border transition-all duration-300 transform",
        navOpen ? "w-64" : "w-20",
        "sm:translate-x-0"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-border">
            <div className={cn(
              "font-bold text-xl transition-opacity duration-300 flex items-center gap-3",
              navOpen ? "opacity-100" : "opacity-0 sm:hidden"
            )}>
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <span className="text-foreground">Roomify</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-primary/10" 
              onClick={toggleNav}
            >
              {navOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
                onClick={() => {
                  // Close sidebar on mobile when navigating
                  if (window.innerWidth < 640) {
                    setNavOpen(false);
                  }
                }}
              />
            ))}
          </nav>
          
          <div className="p-5 border-t border-border flex justify-between items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            <div className={cn(
              "text-sm text-muted-foreground transition-opacity duration-300",
              navOpen ? "opacity-100" : "opacity-0 hidden"
            )}>
              v1.0.0
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {navOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 sm:hidden" 
          onClick={() => setNavOpen(false)}
        />
      )}
      
      {/* Mobile header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-10 flex items-center justify-between px-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-xl">Roomify</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        navOpen ? "sm:ml-64" : "sm:ml-20",
        "pt-16 sm:pt-0"
      )}>
        <div className="min-h-screen pt-6 pb-12 px-4 sm:px-6 page-transition">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
