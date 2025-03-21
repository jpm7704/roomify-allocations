
import { useNavigate } from 'react-router-dom';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Allocation } from '@/components/AllocationCard';
import AllocationFormDialog from '@/components/AllocationFormDialog';
import RoomFormDialog from '@/components/RoomFormDialog';
import AllocationDetailsDialog from '@/components/AllocationDetailsDialog';
import { useForm } from 'react-hook-form';
import { useAllocationDialog } from '@/contexts/AllocationDialogContext';
import { useEffect } from 'react';

interface AllocationDialogManagerProps {
  people: Person[];
  rooms: Room[];
  roomIdFromUrl: string | null;
  onCreateRoom: (values: any) => Promise<boolean>;
  onSaveAllocation: (
    selectedPerson: Person | null, 
    selectedRoom: Room | null, 
    notes: string, 
    selectedPeople?: Person[], 
    multiSelectMode?: boolean
  ) => Promise<boolean>;
  onRemoveAllocation: (allocationId: string) => Promise<void>;
  onEditAllocation?: (allocation: Allocation) => void;
}

const AllocationDialogManager = ({
  people,
  rooms,
  roomIdFromUrl,
  onCreateRoom,
  onSaveAllocation,
  onRemoveAllocation,
  onEditAllocation
}: AllocationDialogManagerProps) => {
  const navigate = useNavigate();
  
  const { 
    isAllocationDialogOpen, 
    closeAllocationDialog,
    isRoomDialogOpen,
    closeRoomDialog,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    selectedPerson,
    setSelectedPerson,
    selectedRoom,
    setSelectedRoom,
    selectedPeople,
    setSelectedPeople,
    viewedAllocation,
    multiSelectMode,
    setMultiSelectMode
  } = useAllocationDialog();

  const form = useForm({
    defaultValues: {
      notes: '',
    },
  });

  // Handle URL room ID on initial load
  useEffect(() => {
    if (roomIdFromUrl && rooms.length > 0) {
      const roomToSelect = rooms.find(room => room.id === roomIdFromUrl);
      if (roomToSelect) {
        setSelectedRoom(roomToSelect);
        
        // Set multi-select mode if room has enough capacity
        if (roomToSelect.capacity > 1 && roomToSelect.capacity - roomToSelect.occupied > 1) {
          setMultiSelectMode(true);
        }
        
        // Open allocation dialog with pre-selected room
        closeAllocationDialog();
      }
    }
  }, [roomIdFromUrl, rooms, setSelectedRoom, setMultiSelectMode, closeAllocationDialog]);

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleMultiPersonSelect = (person: Person, selected: boolean) => {
    if (selected) {
      setSelectedPeople(prev => [...prev, person]);
    } else {
      setSelectedPeople(prev => prev.filter(p => p.id !== person.id));
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    
    if (room.capacity > 1 && room.capacity - room.occupied > 1) {
      setMultiSelectMode(true);
      setSelectedPeople([]);
    } else {
      setMultiSelectMode(false);
    }
  };

  const handleSaveRoom = async (values: any) => {
    const success = await onCreateRoom(values);
    if (success) {
      closeRoomDialog();
    }
    return success;
  };

  const handleSaveAllocation = async () => {
    const success = await onSaveAllocation(
      selectedPerson, 
      selectedRoom, 
      form.getValues().notes,
      selectedPeople,
      multiSelectMode
    );
    
    if (success) {
      closeAllocationDialog();
    }
    
    return success;
  };

  const handleCancelAllocationDialog = () => {
    closeAllocationDialog();
    
    if (roomIdFromUrl) {
      navigate('/allocations');
    }
  };

  const handleEditAllocation = (allocation: Allocation) => {
    if (onEditAllocation) {
      onEditAllocation(allocation);
    } else {
      setSelectedPerson(allocation.person);
      setSelectedRoom(allocation.room);
      setSelectedPeople([]);
      form.reset({ notes: allocation.notes || '' });
      setMultiSelectMode(false);
    }
  };

  return (
    <>
      <AllocationFormDialog
        isOpen={isAllocationDialogOpen}
        onOpenChange={closeAllocationDialog}
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
        onCreateRoom={closeRoomDialog}
        selectedPeople={selectedPeople}
        onMultiPersonSelect={handleMultiPersonSelect}
        multiSelectMode={multiSelectMode}
      />

      <RoomFormDialog
        isOpen={isRoomDialogOpen}
        onOpenChange={closeRoomDialog}
        onSave={handleSaveRoom}
        onCancel={closeRoomDialog}
      />

      <AllocationDetailsDialog
        allocation={viewedAllocation}
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onDelete={onRemoveAllocation}
        onEdit={handleEditAllocation}
      />
    </>
  );
};

export { AllocationDialogManager };
