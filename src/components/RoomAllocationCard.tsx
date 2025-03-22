
import { useState } from 'react';
import { Building, User, Trash2, CalendarIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { RoomWithOccupants } from './AllocationsList';
import { Person } from './PersonCard';

interface RoomAllocationCardProps {
  roomAllocation: RoomWithOccupants;
  onRemoveOccupant?: (roomId: string, personId: string) => void;
  onClick?: (roomAllocation: RoomWithOccupants) => void;
}

const RoomAllocationCard = ({ roomAllocation, onRemoveOccupant, onClick }: RoomAllocationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { room, occupants } = roomAllocation;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formattedDate = new Date().toLocaleDateString('en-US', {
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
      onClick={() => onClick?.(roomAllocation)}
    >
      <CardHeader className="p-6 pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-bold">{room.name}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border transition-all duration-500 ease-in-out group-hover:border-primary">
            <Building className="h-4 w-4 text-primary" />
          </div>
        </CardTitle>
        <div className="text-sm text-muted-foreground flex items-center mt-1">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Last updated on {formattedDate}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Room Details:</div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Type:</span>
            <span className="font-medium">{room.type || 'Chalet'}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Capacity:</span>
            <span className="font-medium">{room.occupied}/{room.capacity} Occupied</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Occupants:</div>
          {occupants.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No occupants assigned yet</div>
          ) : (
            <div className="space-y-3">
              {occupants.map((person) => (
                <div key={person.id} className="flex items-center justify-between group/item bg-muted/30 p-2 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.department || 'No department'}</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover/item:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-300 ease-in-out h-8 w-8 p-0"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onRemoveOccupant?.(room.id, person.id); 
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">{occupants.length}</span> of {room.capacity} spaces filled
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomAllocationCard;
