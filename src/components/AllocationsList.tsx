
import { Loader2, Users, Building, Plus } from 'lucide-react';
import RoomAllocationCard from '@/components/RoomAllocationCard';
import { Button } from '@/components/ui/button';
import { Room } from '@/components/RoomCard';
import { Person } from '@/components/PersonCard';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl ios-shadow border border-border/30">
            <Skeleton className="h-16 w-full" />
            <div className="p-5">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-3 mb-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <Skeleton className="h-4 w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (roomAllocations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 backdrop-blur-sm rounded-xl p-8 border border-border/30 ios-shadow">
        <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-1">No allocations found</h3>
        <p className="text-muted-foreground max-w-sm">
          {searchQuery ? 'Try adjusting your search query' : 'There are no room allocations yet'}
        </p>
        
        <div className="flex gap-3 mt-6">
          {!hasRooms && (
            <Button onClick={onCreateRoom} variant="outline" className="rounded-full">
              <Building className="h-4 w-4 mr-2" />
              Create a Room First
            </Button>
          )}
          <Button 
            onClick={searchQuery ? () => onCreateAllocation() : onCreateAllocation}
            disabled={!hasRooms}
            className="rounded-full bg-primary/90 hover:bg-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
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
