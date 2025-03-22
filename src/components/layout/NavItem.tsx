
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
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, active, collapsed, onClick }: NavItemProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to={to} 
            className={cn(
              "relative flex items-center justify-center sm:justify-start gap-3 px-3 py-3.5 rounded-lg transition-all duration-500 ease-in-out group w-full",
              active 
                ? "text-primary font-medium bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            onClick={onClick}
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">{icon}</div>
            {!collapsed && (
              <span className="transition-all duration-500 ease-in-out font-medium whitespace-nowrap overflow-hidden">{label}</span>
            )}
            {active && (
              <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 bg-primary rounded-full",
                collapsed ? "h-12" : "h-10"
              )} />
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

export default NavItem;
