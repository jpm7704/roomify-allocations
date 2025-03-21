
import React, { useState, useEffect } from 'react';
import { Building, Home, UserRound, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Sidebar from './layout/Sidebar';
import MobileHeader from './layout/MobileHeader';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [navOpen, setNavOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
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
      {/* Sidebar */}
      <Sidebar 
        navOpen={navOpen} 
        toggleNav={toggleNav} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        navItems={navItems} 
      />
      
      {/* Mobile overlay */}
      {navOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 sm:hidden" 
          onClick={() => setNavOpen(false)}
        />
      )}
      
      {/* Mobile header */}
      <MobileHeader 
        setNavOpen={setNavOpen} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
      
      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
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
