
import React from 'react';
import { Moon, Sun } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center gap-1">
          <div className={`w-5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></div>
          <div className={`w-5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
          <div className={`w-5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></div>
        </div>
      </Button>
      <div className="flex items-center gap-2">
        <img 
          src="/lovable-uploads/4f847240-5664-46f4-879f-80afcc2a9a0f.png" 
          alt="Roomify Logo" 
          className={`w-7 h-7 ${theme === 'dark' ? 'brightness-200' : ''}`}
        />
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
