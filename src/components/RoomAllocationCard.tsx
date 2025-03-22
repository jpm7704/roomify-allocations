
import { useState } from 'react';
import { Building, User, Trash2, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RoomWithOccupants } from './AllocationsList';
import { useIsMobile } from '@/hooks/use-mobile';

interface RoomAllocationCardProps {
  roomAllocation: RoomWithOccupants;
  onRemoveOccupant?: (roomId: string, personId: string) => void;
  onClick?: (roomAllocation: RoomWithOccupants) => void;
}

const RoomAllocationCard = ({ roomAllocation, onRemoveOccupant, onClick }: RoomAllocationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
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
        "overflow-hidden transition-all duration-300 ease-in-out item-transition",
        "bg-card/60 backdrop-blur-md border-border/30 ios-shadow",
        "hover:bg-card/80 hover:shadow-md hover:border-primary/20 group",
        isHovered && "ring-1 ring-primary/20",
        isMobile ? "scale-100" : isHovered && "scale-[1.01]"
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={() => onClick?.(roomAllocation)}
    >
      <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight group-hover:text-primary transition-colors duration-300">{room.name}</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border transition-all duration-300 ease-in-out group-hover:border-primary">
            <Building className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground flex items-center mt-1">
          <CalendarIcon className="h-3 w-3 mr-1.5" />
          Updated {formattedDate}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-background/40 text-xs font-normal">
              {room.type || 'Chalet'}
            </Badge>
            <Badge variant={room.occupied === room.capacity ? "peach" : "maroon"} className="text-xs">
              {room.occupied}/{room.capacity} Occupied
            </Badge>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="text-xs font-medium mb-2 flex items-center text-muted-foreground">
            <User className="h-3 w-3 mr-1.5" />
            Occupants
          </div>
          
          {occupants.length === 0 ? (
            <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded-lg text-center">No occupants assigned</div>
          ) : (
            <div className="space-y-2">
              {occupants.map((person) => (
                <div key={person.id} className="flex items-center justify-between group/item bg-muted/30 p-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-7 w-7 border border-border/50">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-xs">{person.name}</p>
                      {person.department && (
                        <p className="text-[10px] text-muted-foreground">{person.department}</p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      isMobile ? "opacity-100" : "opacity-0 group-hover/item:opacity-100", 
                      "text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-300 ease-in-out h-6 w-6 p-0"
                    )}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onRemoveOccupant?.(room.id, person.id); 
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/40">
          <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-in-out",
                room.occupied === 0 ? "w-0 bg-muted-foreground/30" :
                room.occupied < room.capacity / 2 ? "bg-maroon-400" :
                room.occupied === room.capacity ? "bg-peach-500" : "bg-maroon-500"
              )}
              style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {room.capacity - room.occupied} spaces left
            </span>
            <span className="text-xs font-medium">
              {Math.round((room.occupied / room.capacity) * 100)}% full
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomAllocationCard;
