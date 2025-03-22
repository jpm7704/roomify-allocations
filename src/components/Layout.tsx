
import React, { useState, useEffect } from 'react';
import { Home, Moon, Sun, UserRound, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Sidebar from './layout/Sidebar';
import MobileHeader from './layout/MobileHeader';
import { Drawer, DrawerContent } from './ui/drawer';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
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

  const closeMobileNav = () => {
    setIsMobileDrawerOpen(false);
  };
  
  const navItems = [
    { to: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { to: '/rooms', icon: <div className={`flex items-center justify-center rounded-full w-5 h-5 ${theme === 'light' ? 'bg-primary/20' : ''}`}>
      <img 
        src="/lovable-uploads/4f847240-5664-46f4-879f-80afcc2a9a0f.png" 
        alt="Rooms" 
        className={`w-4 h-4 ${theme === 'dark' ? 'brightness-200' : 'brightness-0'}`} 
      />
    </div>, label: 'Rooms' },
    { to: '/people', icon: <UserRound className="w-5 h-5" />, label: 'People' },
    { to: '/allocations', icon: <Users className="w-5 h-5" />, label: 'Allocations' },
  ];

  return (
    <div className="min-h-screen flex w-full relative z-10">
      <div className="hidden sm:block">
        <Sidebar 
          navOpen={navOpen} 
          toggleNav={toggleNav} 
          theme={theme} 
          toggleTheme={toggleTheme} 
          navItems={navItems} 
        />
      </div>
      
      <div className="sm:hidden">
        <Drawer open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
          <DrawerContent className="h-[85vh] rounded-t-[24px] px-0 pb-0 pt-4">
            <div className="flex justify-between items-center px-4 mb-2">
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
              <button 
                onClick={closeMobileNav}
                className="rounded-full p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-3 overflow-y-auto h-[calc(100%-60px)]">
              <nav className="flex-1 py-4 space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.to}
                    href={item.to}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
              </nav>
              <div className="pt-4 pb-8 px-4 border-t border-border mt-4">
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
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      
      <MobileHeader 
        openMobileMenu={() => setIsMobileDrawerOpen(true)} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
      
      <main className={cn(
        "flex-1 transition-all duration-500 ease-in-out relative z-10",
        navOpen ? "sm:ml-64" : "sm:ml-16",
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
