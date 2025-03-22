
import { useState } from 'react';
import { Home, User, MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Room } from '@/components/RoomCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ChaletCardProps {
  chaletName: string;
  rooms: Room[];
  onEdit?: (chaletName: string, rooms: Room[]) => void;
  onDelete?: (chaletName: string, roomIds: string[]) => void;
  onClick?: (room: Room) => void;
  onAssign?: (room: Room) => void;
}

const ChaletCard = ({ 
  chaletName, 
  rooms, 
  onEdit, 
  onDelete, 
  onClick, 
  onAssign 
}: ChaletCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate total capacity and occupancy for the chalet
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalOccupied = rooms.reduce((sum, room) => sum + room.occupied, 0);
  
  const occupancyPercentage = Math.round((totalOccupied / totalCapacity) * 100);
  const isAvailable = totalOccupied < totalCapacity;
  
  // Get room IDs for delete operation
  const roomIds = rooms.map(room => room.id);
  
  // Get bed information display
  const getBedInfo = (room: Room) => {
    if (!room.bedType) return null;
    
    const bedTypeDisplay = {
      'single': 'Single bed',
      'double': 'Double bed',
      'twin': 'Twin beds'
    }[room.bedType] || room.bedType;
    
    const count = room.bedCount || 1;
    
    return `${count} ${count === 1 ? bedTypeDisplay : bedTypeDisplay + 's'}`;
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out item-transition",
        "bg-card/60 backdrop-blur-md border-border/30 shadow-sm",
        "hover:shadow-md hover:border-primary/20 group border-l-4 border-l-primary/50",
        isHovered && "ring-1 ring-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-6 pb-4 flex flex-row items-start justify-between space-y-0">
        <div className="flex-1">
          <CardTitle className="text-xl font-semibold transition-colors duration-500 ease-in-out group-hover:text-primary">
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              {chaletName}
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="ios-card">
              <DropdownMenuItem onClick={() => onEdit?.(chaletName, rooms)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete?.(chaletName, roomIds)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">
                {totalOccupied}/{totalCapacity} Occupied
              </span>
            </div>
            <Badge variant={isAvailable ? "outline" : "secondary"} className="ios-badge">
              {isAvailable ? 'Available' : 'Full'}
            </Badge>
          </div>
          
          <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-750 ease-in-out",
                occupancyPercentage === 100 
                  ? "bg-destructive/90" 
                  : occupancyPercentage > 75 
                    ? "bg-amber-500/90"
                    : "bg-primary/90"
              )}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="mt-4 space-y-3">
            {rooms.map((room) => (
              <div 
                key={room.id} 
                className="p-3 border rounded-md cursor-pointer hover:bg-muted/50"
                onClick={() => onClick?.(room)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{room.name.replace(chaletName + ' - ', '')}</h4>
                  {room.occupied < room.capacity && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 rounded-full"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onAssign?.(room);
                      }}
                    >
                      Assign
                    </Button>
                  )}
                </div>
                
                <div className="flex justify-between text-sm mt-1">
                  <div>{getBedInfo(room)}</div>
                  <div>{room.occupied}/{room.capacity} Occupied</div>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      
      {isAvailable && (
        <CardFooter className="p-6 pt-0 flex justify-end">
          <Button 
            size="sm" 
            variant="default"
            className="transition-all duration-500 ease-in-out rounded-full ios-button"
          >
            Assign to Chalet
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ChaletCard;
