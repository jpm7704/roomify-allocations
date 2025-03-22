
import React from 'react';
import { Building, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  openMobileMenu: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const MobileHeader = ({ openMobileMenu, theme, toggleTheme }: MobileHeaderProps) => {
  return (
    <div className="sm:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-20 flex items-center justify-between px-4">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={openMobileMenu}
        className="h-10 w-10 rounded-full"
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
        className="h-10 w-10 rounded-full"
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default MobileHeader;
