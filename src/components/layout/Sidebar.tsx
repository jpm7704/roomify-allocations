
import React from 'react';
import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import NavItem from './NavItem';
import { useLocation } from 'react-router-dom';

interface SidebarProps {
  navOpen: boolean;
  toggleNav: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  navItems: Array<{
    to: string;
    icon: React.ReactNode;
    label: string;
  }>;
}

const Sidebar = ({ navOpen, toggleNav, theme, toggleTheme, navItems }: SidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-20 bg-card border-r border-border transition-all duration-300 transform",
      navOpen ? "w-64" : "w-16",
      "sm:translate-x-0"
    )}>
      <div className="h-full flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-border">
          {navOpen ? (
            <div className="font-bold text-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/4f847240-5664-46f4-879f-80afcc2a9a0f.png" 
                  alt="Roomify Logo" 
                  className={`w-6 h-6 ${theme === 'dark' ? 'brightness-200' : 'brightness-0'}`}
                />
              </div>
              <span className="text-foreground">Roomify</span>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-md bg-primary/10 flex items-center justify-center">
              <img 
                src="/lovable-uploads/4f847240-5664-46f4-879f-80afcc2a9a0f.png" 
                alt="Roomify Logo" 
                className={`w-6 h-6 ${theme === 'dark' ? 'brightness-200' : 'brightness-0'}`}
              />
            </div>
          )}
          {navOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-primary/10" 
              onClick={toggleNav}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {!navOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full mx-auto mt-2 hover:bg-primary/10" 
            onClick={toggleNav}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
              collapsed={!navOpen}
              onClick={() => {
                // Close sidebar on mobile when navigating
                if (window.innerWidth < 640) {
                  toggleNav();
                }
              }}
            />
          ))}
        </nav>
        
        <div className={cn(
          "p-4 border-t border-border",
          navOpen ? "flex justify-between items-center" : "flex flex-col items-center gap-4"
        )}>
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
          
          {navOpen && (
            <div className="text-sm text-muted-foreground">
              v1.0.0
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
