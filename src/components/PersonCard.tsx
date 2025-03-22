
import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface Person {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  department?: string;
  roomId?: string;
  roomName?: string;
}

interface PersonCardProps {
  person: Person;
  onEdit?: (person: Person) => void;
  onDelete?: (personId: string) => void;
  onAssign?: (person: Person) => void;
  onClick?: (person: Person) => void;
}

const PersonCard = ({ person, onEdit, onDelete, onAssign, onClick }: PersonCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const isAssigned = !!person.roomId;
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out item-transition",
        "bg-card/80 backdrop-blur-md border-blue-300/40 shadow-sm",
        "hover:shadow-md hover:border-blue-400/40 group",
        isHovered && "ring-1 ring-blue-500/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(person)}
    >
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        isMobile ? "p-4" : "p-6"
      )}>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Avatar className={cn("border transition-all duration-500 ease-in-out group-hover:border-blue-500", 
            isMobile ? "h-10 w-10" : "h-12 w-12")}>
            <AvatarImage src={person.avatar} />
            <AvatarFallback className="bg-blue-200 text-blue-800">{getInitials(person.name)}</AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium text-sm sm:text-base transition-colors duration-500 ease-in-out group-hover:text-blue-700">{person.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{person.email}</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="ios-card">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(person); }}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete?.(person.id); }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className={cn(
        "pb-4 pt-0",
        isMobile ? "px-4" : "px-6"
      )}>
        {person.department && (
          <Badge variant="secondary" className="mb-3 ios-badge text-xs bg-orange-100 text-orange-800 ring-orange-300/50">
            {person.department}
          </Badge>
        )}
        
        {isAssigned ? (
          <div className="flex items-center text-xs sm:text-sm mt-2">
            <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600" />
            <span>Assigned to <span className="font-medium text-blue-700">{person.roomName}</span></span>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Not assigned to any room</p>
        )}
      </CardContent>
      
      <CardFooter className={cn(
        "bg-blue-50/50 backdrop-blur-sm flex justify-end border-t border-blue-200/30",
        isMobile ? "px-4 py-3" : "px-6 py-4"
      )}>
        <Button 
          size={isMobile ? "sm" : "default"}
          variant={!isAssigned ? "default" : "outline"}
          className="transition-all duration-500 ease-in-out rounded-full ios-button text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
          onClick={(e) => { e.stopPropagation(); onAssign?.(person); }}
        >
          {!isAssigned ? 'Assign Room' : 'Reassign'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonCard;
