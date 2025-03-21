
import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Person {
  id: string;
  name: string;
  email: string;
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
        "overflow-hidden transition-all duration-300 item-transition",
        "bg-card/60 backdrop-blur-md border-border/30 shadow-sm",
        "hover:shadow-md hover:border-primary/20 group",
        isHovered && "ring-1 ring-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(person)}
    >
      <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border transition-all group-hover:border-primary">
            <AvatarImage src={person.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(person.name)}</AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium text-base transition-colors group-hover:text-primary">{person.name}</h3>
            <p className="text-sm text-muted-foreground">{person.email}</p>
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
      
      <CardContent className="px-6 pb-6 pt-0">
        {person.department && (
          <Badge variant="outline" className="mb-4 ios-badge">
            {person.department}
          </Badge>
        )}
        
        {isAssigned ? (
          <div className="flex items-center text-sm mt-2">
            <Home className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Assigned to <span className="font-medium">{person.roomName}</span></span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">Not assigned to any room</p>
        )}
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-muted/30 backdrop-blur-sm flex justify-end border-t border-border/20">
        <Button 
          size="sm" 
          variant={!isAssigned ? "default" : "outline"}
          className="transition-all duration-300 rounded-full ios-button"
          onClick={(e) => { e.stopPropagation(); onAssign?.(person); }}
        >
          {!isAssigned ? 'Assign Room' : 'Reassign'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonCard;
