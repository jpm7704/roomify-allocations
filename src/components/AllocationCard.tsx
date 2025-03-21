
import { useState } from 'react';
import { Building, User, Trash2, ArrowRight, CalendarIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Room } from './RoomCard';
import { Person } from './PersonCard';

export interface Allocation {
  id: string;
  personId: string;
  roomId: string;
  person: Person;
  room: Room;
  dateAssigned: string;
  notes?: string;
}

interface AllocationCardProps {
  allocation: Allocation;
  onRemove?: (allocationId: string) => void;
  onClick?: (allocation: Allocation) => void;
}

const AllocationCard = ({ allocation, onRemove, onClick }: AllocationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formattedDate = new Date(allocation.dateAssigned).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out item-transition",
        "bg-card/60 backdrop-blur-md border-border/30 shadow-sm",
        "hover:shadow-md hover:border-primary/20 group",
        isHovered && "ring-1 ring-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(allocation)}
    >
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Assigned on {formattedDate}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border transition-all duration-500 ease-in-out group-hover:border-primary">
              <AvatarImage src={allocation.person.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(allocation.person.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{allocation.person.name}</p>
              <p className="text-xs text-muted-foreground">{allocation.person.department || 'No department'}</p>
            </div>
          </div>
          
          <div className="w-8 h-8 flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-500 ease-in-out group-hover:translate-x-1" />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border transition-all duration-500 ease-in-out group-hover:border-primary">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{allocation.room.name}</p>
              <p className="text-xs text-muted-foreground">
                {allocation.room.building || 'No building'}{allocation.room.floor ? `, Floor ${allocation.room.floor}` : ''}
              </p>
            </div>
          </div>
        </div>
        
        {allocation.notes && (
          <div className="mb-4 p-3 bg-muted/30 backdrop-blur-sm rounded-xl text-sm flex items-start">
            <FileText className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <p className="text-muted-foreground">{allocation.notes}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{allocation.room.occupied}</span>/{allocation.room.capacity} Occupied
            </span>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-500 ease-in-out"
            onClick={(e) => { e.stopPropagation(); onRemove?.(allocation.id); }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllocationCard;
