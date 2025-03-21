
import { Room } from '@/components/RoomCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface RoomSelectionListProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  onCreateRoom: () => void;
  onOpenChange: (open: boolean) => void;
}

const RoomSelectionList = ({
  rooms,
  selectedRoom,
  onRoomSelect,
  onCreateRoom,
  onOpenChange
}: RoomSelectionListProps) => {
  if (rooms.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No rooms found. Please add rooms first.
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 w-full"
            onClick={() => {
              onOpenChange(false);
              setTimeout(() => {
                onCreateRoom();
              }, 100);
            }}
          >
            Add Room
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {rooms.map(room => (
        <div 
          key={room.id}
          className={`p-2 my-1 cursor-pointer rounded-md ${
            selectedRoom?.id === room.id 
              ? 'bg-primary text-primary-foreground' 
              : room.occupied >= room.capacity 
                ? 'bg-muted text-muted-foreground' 
                : 'hover:bg-muted'
          }`}
          onClick={() => {
            if (room.occupied < room.capacity) {
              onRoomSelect(room);
            }
          }}
        >
          <div className="font-medium">{room.name}</div>
          <div className="text-sm">
            {room.building} {room.floor && `- Floor ${room.floor}`}
          </div>
          <div className="text-xs mt-1">
            Occupancy: {room.occupied}/{room.capacity}
            {room.capacity > 1 && (
              <span className="ml-2">
                {room.capacity > 1 ? `(${room.capacity - room.occupied} beds available)` : ''}
              </span>
            )}
            {room.occupied >= room.capacity && ' (Full)'}
          </div>
        </div>
      ))}
    </>
  );
};

export default RoomSelectionList;
