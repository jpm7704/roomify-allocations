
import React from 'react';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoomCard, { Room } from '@/components/RoomCard';
import ChaletCard from './ChaletCard';

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

  // Group rooms by chalet
  const chaletGroups: { [key: string]: Room[] } = {};
  const individualRooms: Room[] = [];

  filteredRooms.forEach(room => {
    if (room.chaletGroup) {
      if (!chaletGroups[room.chaletGroup]) {
        chaletGroups[room.chaletGroup] = [];
      }
      chaletGroups[room.chaletGroup].push(room);
    } else {
      individualRooms.push(room);
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Display chalet groups first */}
      {Object.keys(chaletGroups).map(chaletName => (
        <ChaletCard
          key={chaletName}
          chaletName={chaletName}
          rooms={chaletGroups[chaletName]}
          onEdit={(chaletName, rooms) => {
            // For simplicity, just edit the first room for now
            if (rooms.length > 0) {
              onEdit(rooms[0]);
            }
          }}
          onDelete={(chaletName, roomIds) => {
            // For simplicity, just delete the first room ID for now
            if (roomIds.length > 0) {
              onDelete(roomIds[0]);
            }
          }}
          onClick={onClick}
          onAssign={onAssign}
        />
      ))}
      
      {/* Display individual rooms */}
      {individualRooms.map((room) => (
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
