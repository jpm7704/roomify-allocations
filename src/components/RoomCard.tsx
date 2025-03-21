import { useState } from 'react';
import { Bed, User, MoreVertical, Pencil, Trash2, Home, Tent, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  description?: string;
  floor?: string;
  building?: string;
  type?: string;
}

interface RoomCardProps {
  room: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (roomId: string) => void;
  onClick?: (room: Room) => void;
  onAssign?: (room: Room) => void;
}

const RoomCard = ({ 
  room, 
  onEdit, 
  onDelete, 
  onClick, 
  onAssign 
}: RoomCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const occupancyPercentage = Math.round((room.occupied / room.capacity) * 100);
  const isAvailable = room.occupied < room.capacity;
  
  const getRoomTypeIcon = () => {
    if (!room.type) return <Hotel className="h-4 w-4 mr-2" />;
    
    switch (room.type) {
      case 'Chalet':
        return <Home className="h-4 w-4 mr-2" />;
      case 'Personal tent':
        return <Tent className="h-4 w-4 mr-2" />;
      case 'Hotel':
      default:
        return <Hotel className="h-4 w-4 mr-2" />;
    }
  };
  
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
      onClick={() => onClick?.(room)}
    >
      <CardHeader className="p-6 pb-0 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-xl font-semibold transition-colors duration-500 ease-in-out group-hover:text-primary">
            <div className="flex items-center">
              {getRoomTypeIcon()}
              {room.name}
            </div>
          </CardTitle>
          {(room.floor || room.building) && (
            <p className="text-sm text-muted-foreground mt-1">
              {[room.floor && `Floor ${room.floor}`, room.building].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="ios-card">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(room); }}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete?.(room.id); }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="p-6">
        {room.description && (
          <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <Bed className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium">
              {room.capacity} {room.capacity === 1 ? 'Bed' : 'Beds'}
            </span>
          </div>
          
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium">
              {room.occupied} Occupied
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Occupancy</span>
            <span>{occupancyPercentage}%</span>
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
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <Badge variant={isAvailable ? "outline" : "secondary"} className="ios-badge">
          {isAvailable ? 'Available' : 'Full'}
        </Badge>
        
        <Button 
          size="sm" 
          variant={isAvailable ? "default" : "outline"}
          className="transition-all duration-500 ease-in-out rounded-full ios-button"
          disabled={!isAvailable}
          onClick={(e) => { 
            e.stopPropagation(); 
            if (onAssign) {
              onAssign(room);
            } else {
              onClick?.(room);
            }
          }}
        >
          {isAvailable ? 'Assign' : 'Full'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
