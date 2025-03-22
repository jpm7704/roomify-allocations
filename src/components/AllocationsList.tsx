
import { Loader2, Users } from 'lucide-react';
import RoomAllocationCard from '@/components/RoomAllocationCard';
import { Button } from '@/components/ui/button';
import { Room } from '@/components/RoomCard';
import { Person } from '@/components/PersonCard';

export interface RoomWithOccupants {
  room: Room;
  occupants: Person[];
}

interface AllocationsListProps {
  loading: boolean;
  roomAllocations: RoomWithOccupants[];
  searchQuery: string;
  onRemoveOccupant: (roomId: string, personId: string) => void;
  onClick: (roomAllocation: RoomWithOccupants) => void;
  onCreateRoom: () => void;
  onCreateAllocation: () => void;
  hasRooms: boolean;
}

const AllocationsList = ({ 
  loading, 
  roomAllocations, 
  searchQuery, 
  onRemoveOccupant, 
  onClick,
  onCreateRoom,
  onCreateAllocation,
  hasRooms
}: AllocationsListProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-medium">Loading allocations...</h3>
      </div>
    );
  }

  if (roomAllocations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-1">No allocations found</h3>
        <p className="text-muted-foreground max-w-sm">
          {searchQuery ? 'Try adjusting your search query' : 'There are no room allocations yet'}
        </p>
        
        <div className="flex gap-3 mt-6">
          {!hasRooms && (
            <Button onClick={onCreateRoom}>
              Create a Room First
            </Button>
          )}
          <Button 
            onClick={searchQuery ? () => onCreateAllocation() : onCreateAllocation}
            disabled={!hasRooms}
          >
            {searchQuery ? 'Clear Search' : 'Create Allocation'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {roomAllocations.map((roomAllocation) => (
        <RoomAllocationCard
          key={roomAllocation.room.id}
          roomAllocation={roomAllocation}
          onRemoveOccupant={onRemoveOccupant}
          onClick={onClick}
        />
      ))}
    </div>
  );
};

export default AllocationsList;
