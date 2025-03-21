
import { useState } from 'react';
import { Building, Bed, Users, DotsHorizontal, Edit, Trash2, PlusCircle, MapPin, Hotel, Home, Tent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  floor?: string;
  building?: string;
  description?: string;
  type?: string;
}

interface RoomCardProps {
  room: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (roomId: string) => void;
  onClick?: (room: Room) => void;
  onAssign?: (room: Room) => void;
}

const RoomCard = ({ room, onEdit, onDelete, onClick, onAssign }: RoomCardProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  
  const occupancyPercentage = Math.round((room.occupied / room.capacity) * 100);
  const isAvailable = room.occupied < room.capacity;
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirmingDelete) {
      onDelete?.(room.id);
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(room);
  };
  
  const handleAssignClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAvailable) {
      onAssign?.(room);
    }
  };
  
  const handleCardClick = () => {
    onClick?.(room);
  };

  const getRoomTypeIcon = () => {
    switch (room.type?.toLowerCase()) {
      case 'hotel':
        return <Hotel className="h-4 w-4" />;
      case 'chalet':
        return <Home className="h-4 w-4" />;
      case 'personal tent':
        return <Tent className="h-4 w-4" />;
      default:
        return <Bed className="h-4 w-4" />;
    }
  };
  
  return (
    <Card 
      className="relative border-muted transition-all hover:border-muted-foreground/30 hover:shadow cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <div 
        className={`absolute top-0 left-0 h-1 w-full ${
          occupancyPercentage === 100 
            ? "bg-destructive/90" 
            : occupancyPercentage > 75 
              ? "bg-amber-500/90"
              : "bg-primary/90"
        }`}
      />
      
      <CardHeader className="flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-xl">{room.name}</CardTitle>
          <CardDescription className="mt-1">
            {room.building && room.floor 
              ? `${room.building}, Floor ${room.floor}` 
              : room.building || 'No location specified'}
          </CardDescription>
          
          {room.type && (
            <Badge variant="outline" className="mt-2">
              {getRoomTypeIcon()}
              <span className="ml-1">{room.type}</span>
            </Badge>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <DotsHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {onEdit && (
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Room
              </DropdownMenuItem>
            )}
            
            {onAssign && (
              <DropdownMenuItem 
                onClick={handleAssignClick}
                disabled={!isAvailable}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Assign Attendee
              </DropdownMenuItem>
            )}
            
            {onDelete && (
              <DropdownMenuItem 
                onClick={handleDeleteClick}
                className={confirmingDelete ? 'text-destructive' : ''}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {confirmingDelete ? 'Confirm Delete' : 'Delete Room'}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{room.capacity} {room.capacity === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{room.occupied} Occupied</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Occupancy</span>
              <span>{occupancyPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  occupancyPercentage === 100 
                    ? "bg-destructive/90" 
                    : occupancyPercentage > 75 
                      ? "bg-amber-500/90"
                      : "bg-primary/90"
                }`}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Badge variant={isAvailable ? "outline" : "secondary"}>
          {isAvailable ? 'Available' : 'Full'}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
