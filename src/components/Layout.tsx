
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building, ChevronLeft, Home, Menu, Moon, Sun, UserRound, Users } from 'lucide-react';
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
              "relative flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 group",
              active 
                ? "text-primary font-medium bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            onClick={onClick}
          >
            <div className="flex-shrink-0 w-5 h-5">{icon}</div>
            <span className="transition-all duration-300">{label}</span>
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
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
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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
        "fixed inset-y-0 left-0 z-20 w-64 bg-card border-r border-border transition-all duration-300 transform",
        navOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0 sm:w-20"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <h2 className={cn(
              "font-bold text-xl transition-opacity duration-300",
              navOpen ? "opacity-100" : "opacity-0 sm:hidden"
            )}>
              Roomify
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex" 
              onClick={toggleNav}
            >
              <ChevronLeft className={cn(
                "h-5 w-5 transition-transform duration-300",
                !navOpen && "rotate-180"
              )} />
            </Button>
          </div>
          
          <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
                onClick={() => setNavOpen(false)}
              />
            ))}
          </nav>
          
          <div className="p-4 border-t border-border flex justify-between items-center">
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
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden" 
              onClick={toggleNav}
            >
              <ChevronLeft className={cn(
                "h-5 w-5 transition-transform duration-300",
                !navOpen && "rotate-180"
              )} />
            </Button>
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
        <h2 className="font-bold text-xl">Roomify</h2>
        <div className="w-10" />
      </div>
      
      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        navOpen ? "ml-0 sm:ml-64" : "ml-0 sm:ml-20",
        "mt-16 sm:mt-0"
      )}>
        <div className="min-h-screen pt-6 pb-12 px-4 sm:px-6 page-transition">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
