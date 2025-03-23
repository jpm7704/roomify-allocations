
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import AllocationFormDialog from '@/components/allocation-form/AllocationFormDialog';
import RoomFormDialog from '@/components/RoomFormDialog';
import AllocationDetailsDialog from '@/components/AllocationDetailsDialog';
import { useAllocations } from '@/hooks/useAllocations';
import { useAllocationFormHandlers } from '@/components/allocation/AllocationFormHandlers';
import { useRoomHandlers } from '@/components/allocation/RoomHandlers';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAllocationDialogs } from '@/hooks/useAllocationDialogs';
import AllocationsHeader from '@/components/allocations/AllocationsHeader';
import AllocationsContent from '@/components/allocations/AllocationsContent';

const Allocations = () => {
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const roomIdFromUrl = searchParams.get('roomId');
  
  const {
    loading,
    allocations,
    roomAllocations,
    people,
    rooms,
    selectedPerson,
    setSelectedPerson,
    selectedRoom,
    setSelectedRoom,
    selectedPeople,
    setSelectedPeople,
    multiSelectMode,
    setMultiSelectMode,
    viewedAllocation,
    setViewedAllocation,
    handleRemoveOccupant,
    fetchData
  } = useAllocations(roomIdFromUrl);

  const {
    isDialogOpen,
    setIsDialogOpen,
    isRoomDialogOpen,
    setIsRoomDialogOpen,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    handleCreateAllocation,
    handleRoomAllocationClick,
    handleAllocationClick,
    handleEditAllocation,
    handleCreateRoom,
    handleCancelRoomDialog,
    handleCancelAllocationDialog,
  } = useAllocationDialogs(
    rooms,
    selectedPerson,
    setSelectedPerson,
    selectedRoom,
    setSelectedRoom,
    selectedPeople,
    setSelectedPeople,
    multiSelectMode,
    setMultiSelectMode,
    fetchData,
    roomIdFromUrl
  );

  const {
    handlePersonSelect,
    handleMultiPersonSelect,
    handleRoomSelect,
    handleSaveAllocation
  } = useAllocationFormHandlers(
    rooms,
    people,
    allocations,
    selectedPerson,
    setSelectedPerson,
    selectedRoom,
    setSelectedRoom,
    selectedPeople,
    setSelectedPeople,
    multiSelectMode,
    setMultiSelectMode,
    (newAllocations) => {},  // We'll use the fetchData function instead
    (newRooms) => {},  // We'll use the fetchData function instead
    (newPeople) => {},  // We'll use the fetchData function instead
    setIsDialogOpen,
    fetchData
  );

  const { handleSaveRoom } = useRoomHandlers(
    rooms,
    (newRooms) => {},  // We'll use the fetchData function instead
    setIsRoomDialogOpen
  );
  
  return (
    <Layout>
      <div className="page-container">
        <AllocationsHeader 
          onCreateRoom={handleCreateRoom}
          onCreateAllocation={handleCreateAllocation}
        />
        
        <AllocationsContent
          loading={loading}
          roomAllocations={roomAllocations}
          onRemoveOccupant={handleRemoveOccupant}
          onRoomAllocationClick={handleRoomAllocationClick}
          onCreateRoom={handleCreateRoom}
          onCreateAllocation={handleCreateAllocation}
          hasRooms={rooms.length > 0}
        />

        <AllocationFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          people={people.filter(p => 
            multiSelectMode 
              ? (!p.roomId || (selectedRoom && p.roomId === selectedRoom.id))
              : true
          )}
          rooms={rooms}
          selectedPerson={selectedPerson}
          selectedRoom={selectedRoom}
          onPersonSelect={handlePersonSelect}
          onRoomSelect={handleRoomSelect}
          onSave={handleSaveAllocation}
          onCancel={handleCancelAllocationDialog}
          onCreateRoom={handleCreateRoom}
          selectedPeople={selectedPeople}
          onMultiPersonSelect={handleMultiPersonSelect}
          multiSelectMode={multiSelectMode}
        />

        <RoomFormDialog
          isOpen={isRoomDialogOpen}
          onOpenChange={setIsRoomDialogOpen}
          onSave={handleSaveRoom}
          onCancel={handleCancelRoomDialog}
        />

        <AllocationDetailsDialog
          allocation={viewedAllocation}
          isOpen={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          onDelete={handleRemoveOccupant ? (id) => {
            const allocation = allocations.find(a => a.id === id);
            if (allocation) {
              handleRemoveOccupant(allocation.roomId, allocation.personId);
            }
          } : undefined}
          onEdit={handleEditAllocation}
        />
      </div>
    </Layout>
  );
};

export default Allocations;
