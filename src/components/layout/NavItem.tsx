
import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

const NavItem = ({ to, icon, label, active, collapsed, onClick, disabled = false }: NavItemProps) => {
  const itemContent = (
    <>
      <div className="flex-shrink-0 w-5 h-5">{icon}</div>
      {!collapsed && (
        <span className="transition-all duration-500 ease-in-out font-medium whitespace-nowrap overflow-hidden">{label}</span>
      )}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
      )}
    </>
  );

  const itemClasses = cn(
    "relative flex items-center justify-center sm:justify-start gap-3 px-3 py-3 rounded-lg transition-all duration-500 ease-in-out group w-full",
    active 
      ? "text-primary font-medium bg-primary/10" 
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
    disabled && "opacity-50 cursor-not-allowed pointer-events-none"
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {disabled ? (
            <div className={itemClasses}>
              {itemContent}
            </div>
          ) : (
            <Link 
              to={to} 
              className={itemClasses}
              onClick={onClick}
            >
              {itemContent}
            </Link>
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="z-50">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NavItem;
