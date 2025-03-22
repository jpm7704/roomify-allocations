
import React from 'react';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoomCard, { Room } from '@/components/RoomCard';

interface RoomsListProps {
  loading: boolean;
  filteredRooms: Room[];
  searchQuery: string;
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
  onClick: (room: Room) => void;
  onAssign: (room: Room) => void;
  onAddRoom: () => void;
}

const RoomsList = ({
  loading,
  filteredRooms,
  searchQuery,
  onEdit,
  onDelete,
  onClick,
  onAssign,
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

  if (filteredRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-1">No rooms found</h3>
        <p className="text-muted-foreground max-w-sm">
          {searchQuery ? 'Try adjusting your search query' : 'There are no rooms added yet'}
        </p>
        {!searchQuery && (
          <Button className="mt-4" onClick={onAddRoom}>
            Add Accommodation
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredRooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          onAssign={onAssign}
        />
      ))}
    </div>
  );
};

export default RoomsList;
