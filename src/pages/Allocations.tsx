
import { useState, useEffect } from 'react';
import { Plus, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Allocation } from '@/components/AllocationCard';
import AllocationsList, { RoomWithOccupants } from '@/components/AllocationsList';
import AllocationFormDialog from '@/components/AllocationFormDialog';
import RoomFormDialog from '@/components/RoomFormDialog';
import AllocationDetailsDialog from '@/components/AllocationDetailsDialog';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAllocations } from '@/hooks/useAllocations';
import { useAllocationFormHandlers } from '@/components/allocation/AllocationFormHandlers';
import { useRoomHandlers } from '@/components/allocation/RoomHandlers';
import { AllocationFilters } from '@/components/allocation/AllocationFilters';

const Allocations = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomIdFromUrl = searchParams.get('roomId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [filteredRoomAllocations, setFilteredRoomAllocations] = useState<RoomWithOccupants[]>([]);
  
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
    viewedRoomAllocation,
    setViewedRoomAllocation,
    handleRemoveOccupant,
    fetchData
  } = useAllocations(roomIdFromUrl);

  const form = useForm({
    defaultValues: {
      notes: '',
    },
  });

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

  useEffect(() => {
    if (roomIdFromUrl && rooms.length > 0) {
      const roomToSelect = rooms.find(room => room.id === roomIdFromUrl);
      if (roomToSelect) {
        setSelectedRoom(roomToSelect);
        if (roomToSelect.capacity > 1 && roomToSelect.capacity - roomToSelect.occupied > 1) {
          setMultiSelectMode(true);
        }
        setIsDialogOpen(true);
      }
    }
  }, [roomIdFromUrl, rooms]);

  useEffect(() => {
    setFilteredRoomAllocations(roomAllocations);
  }, [roomAllocations]);

  const handleCreateAllocation = () => {
    setSelectedPerson(null);
    setSelectedRoom(null);
    setSelectedPeople([]);
    form.reset({ notes: '' });
    
    const hasMultiCapacityRooms = rooms.some(room => room.capacity > 1 && room.occupied < room.capacity);
    setMultiSelectMode(hasMultiCapacityRooms);
    
    setIsDialogOpen(true);
  };
  
  const handleRoomAllocationClick = (roomAllocation: RoomWithOccupants) => {
    setViewedRoomAllocation(roomAllocation);
  };

  const handleAllocationClick = (allocation: Allocation) => {
    setViewedAllocation(allocation);
    setIsDetailsDialogOpen(true);
  };

  const handleEditAllocation = (allocation: Allocation) => {
    setSelectedPerson(allocation.person);
    setSelectedRoom(allocation.room);
    setSelectedPeople([]);
    form.reset({ notes: allocation.notes || '' });
    setMultiSelectMode(false);
    setIsDialogOpen(true);
  };

  const handleCreateRoom = () => {
    setIsRoomDialogOpen(true);
  };

  const handleCancelRoomDialog = () => {
    setIsRoomDialogOpen(false);
  };

  const handleCancelAllocationDialog = () => {
    setIsDialogOpen(false);
    setSelectedPeople([]);
    
    if (roomIdFromUrl) {
      navigate('/allocations');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredRoomAllocations(roomAllocations);
  };
  
  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Room Allocations</h1>
            <p className="text-muted-foreground mt-1">
              SDA Women's Ministry Camp Meeting - Harare City Centre Church
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="rounded-md" onClick={handleCreateRoom}>
              <Building className="mr-2 h-4 w-4" />
              Add Room
            </Button>
            <Button className="rounded-md" onClick={handleCreateAllocation}>
              <Plus className="mr-2 h-4 w-4" />
              New Allocation
            </Button>
          </div>
        </div>
        
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
            onRemoveOccupant={handleRemoveOccupant}
            onClick={handleRoomAllocationClick}
            onCreateRoom={handleCreateRoom}
            onCreateAllocation={searchQuery ? handleClearSearch : handleCreateAllocation}
            hasRooms={rooms.length > 0}
          />
        </div>

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
