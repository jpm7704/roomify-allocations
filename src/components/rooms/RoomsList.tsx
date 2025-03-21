
import { Building } from 'lucide-react';
import RoomCard, { Room } from '@/components/RoomCard';
import { Button } from '@/components/ui/button';

interface RoomsListProps {
  rooms: Room[];
  loading: boolean;
  searchQuery: string;
  onRoomClick: (room: Room) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onAssignRoom: (room: Room) => void;
  onAddRoom: () => void;
}

const RoomsList = ({
  rooms,
  loading,
  searchQuery,
  onRoomClick,
  onEditRoom,
  onDeleteRoom,
  onAssignRoom,
  onAddRoom
}: RoomsListProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
        <h3 className="text-xl font-medium mb-1">Loading rooms...</h3>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-1">No rooms found</h3>
        <p className="text-muted-foreground max-w-sm">
          {searchQuery ? 'Try adjusting your search query' : 'There are no rooms added yet'}
        </p>
        {!searchQuery && (
          <Button className="mt-4" onClick={onAddRoom}>
            Add Room
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onEdit={onEditRoom}
          onDelete={onDeleteRoom}
          onClick={onRoomClick}
          onAssign={onAssignRoom}
        />
      ))}
    </div>
  );
};

export default RoomsList;
