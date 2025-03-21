
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bed, Building, Users, MapPin, Info } from 'lucide-react';
import { Room } from '@/components/RoomCard';
import { Badge } from '@/components/ui/badge';

interface RoomDetailsDialogProps {
  room: Room | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (room: Room) => void;
}

const RoomDetailsDialog = ({ 
  room, 
  isOpen, 
  onOpenChange,
  onAssign
}: RoomDetailsDialogProps) => {
  if (!room) return null;
  
  const occupancyPercentage = Math.round((room.occupied / room.capacity) * 100);
  const isAvailable = room.occupied < room.capacity;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {room.name}
          </DialogTitle>
          <DialogDescription>
            {room.building && room.floor ? `${room.building}, Floor ${room.floor}` : (room.building || '')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{room.capacity} {room.capacity === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{room.occupied} Occupied</span>
            </div>
          </div>
          
          {room.description && (
            <div className="flex items-start gap-2 text-sm">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{room.description}</p>
            </div>
          )}
          
          {room.building && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{room.building}</span>
            </div>
          )}
          
          {room.floor && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Floor {room.floor}</span>
            </div>
          )}
          
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Occupancy</span>
              <span>{occupancyPercentage}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
              <div 
                className={`h-full rounded-full transition-all duration-750 ease-in-out ${
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
        
        <div className="flex justify-between items-center mt-2 pt-2 border-t">
          <Badge variant={isAvailable ? "outline" : "secondary"} className="ios-badge">
            {isAvailable ? 'Available' : 'Full'}
          </Badge>
          
          <Button 
            size="sm" 
            variant={isAvailable ? "default" : "outline"}
            className="transition-all duration-500 ease-in-out rounded-full ios-button"
            disabled={!isAvailable}
            onClick={() => isAvailable && onAssign(room)}
          >
            {isAvailable ? 'Assign' : 'Full'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsDialog;
