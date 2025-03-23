
import AllocationsList from '@/components/AllocationsList';
import { AllocationFilters } from '@/components/allocation/AllocationFilters';
import { RoomWithOccupants } from '@/components/AllocationsList';
import { useState, useEffect } from 'react';

interface AllocationsContentProps {
  loading: boolean;
  roomAllocations: RoomWithOccupants[];
  onRemoveOccupant: (roomId: string, personId: string) => void;
  onRoomAllocationClick: (roomAllocation: RoomWithOccupants) => void;
  onCreateRoom: () => void;
  onCreateAllocation: () => void;
  hasRooms: boolean;
  onSendSms?: (roomId: string, personId: string, personName: string, roomName: string, roomType?: string) => void;
  sendingStatus?: Record<string, boolean>;
}

const AllocationsContent = ({
  loading,
  roomAllocations,
  onRemoveOccupant,
  onRoomAllocationClick,
  onCreateRoom,
  onCreateAllocation,
  hasRooms,
  onSendSms,
  sendingStatus = {}
}: AllocationsContentProps) => {
  const [filteredRoomAllocations, setFilteredRoomAllocations] = useState<RoomWithOccupants[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setFilteredRoomAllocations(roomAllocations);
  }, [roomAllocations]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredRoomAllocations(roomAllocations);
  };

  return (
    <>
      <AllocationFilters 
        roomAllocations={roomAllocations}
        onFilterChange={setFilteredRoomAllocations}
        onSearchChange={setSearchQuery}
      />
      
      <div className="mt-6">
        <AllocationsList
          loading={loading}
          roomAllocations={filteredRoomAllocations}
          searchQuery={searchQuery}
          onRemoveOccupant={onRemoveOccupant}
          onClick={onRoomAllocationClick}
          onCreateRoom={onCreateRoom}
          onCreateAllocation={searchQuery ? handleClearSearch : onCreateAllocation}
          hasRooms={hasRooms}
          onSendSms={onSendSms}
          sendingStatus={sendingStatus}
        />
      </div>
    </>
  );
};

export default AllocationsContent;
