import { Loader2, Users, Building, Plus, SendHorizontal } from 'lucide-react';
import RoomAllocationCard from '@/components/RoomAllocationCard';
import { Button } from '@/components/ui/button';
import { Room } from '@/components/RoomCard';
import { Person } from '@/components/PersonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import SMSNotificationDialog from '@/components/SMSNotificationDialog';

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
  const isMobile = useIsMobile();
  const [isSMSDialogOpen, setIsSMSDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithOccupants | null>(null);
  
  const handleSendSMS = (roomAllocation: RoomWithOccupants) => {
    setSelectedRoom(roomAllocation);
    setIsSMSDialogOpen(true);
  };

  const handleSendAllSMS = () => {
    const allOccupants = roomAllocations.flatMap(room => room.occupants);
    setSelectedRoom({ room: { id: 'all', name: 'All Rooms', capacity: 0, occupied: 0 }, occupants: allOccupants });
    setIsSMSDialogOpen(true);
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: isMobile ? 3 : 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl ios-shadow border border-border/30">
            <Skeleton className="h-16 w-full" />
            <div className="p-4 md:p-5">
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
      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center bg-muted/20 backdrop-blur-sm rounded-xl p-4 md:p-8 border border-border/30 ios-shadow">
        <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center mb-4">
          <Users className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg md:text-xl font-medium mb-1">No allocations found</h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          {searchQuery ? 'Try adjusting your search query' : 'There are no room allocations yet'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
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

  const totalPeopleAllocated = roomAllocations.reduce((total, room) => total + room.occupants.length, 0);

  return (
    <>
      {totalPeopleAllocated > 0 && (
        <div className="flex justify-end mb-4">
          <Button 
            onClick={handleSendAllSMS}
            variant="outline"
            className="rounded-full gap-2"
          >
            <SendHorizontal className="h-4 w-4" />
            SMS All ({totalPeopleAllocated})
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {roomAllocations.map((roomAllocation) => (
          <RoomAllocationCard
            key={roomAllocation.room.id}
            roomAllocation={roomAllocation}
            onRemoveOccupant={onRemoveOccupant}
            onClick={onClick}
            onSendSMS={handleSendSMS}
          />
        ))}
      </div>
      
      {selectedRoom && (
        <SMSNotificationDialog 
          isOpen={isSMSDialogOpen} 
          onOpenChange={setIsSMSDialogOpen}
          preselectedRecipients={selectedRoom.occupants}
          eventName={selectedRoom.room.id === 'all' ? 'all rooms' : selectedRoom.room.name}
        />
      )}
    </>
  );
};

export default AllocationsList;
