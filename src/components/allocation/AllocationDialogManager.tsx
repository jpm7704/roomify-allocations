
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Allocation } from '@/components/AllocationCard';
import AllocationFormDialog from '@/components/AllocationFormDialog';
import RoomFormDialog from '@/components/RoomFormDialog';
import AllocationDetailsDialog from '@/components/AllocationDetailsDialog';
import { useForm } from 'react-hook-form';

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
  const [isDialogOpen, setIsDialogOpen] = useState(!!roomIdFromUrl);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [viewedAllocation, setViewedAllocation] = useState<Allocation | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      notes: '',
    },
  });

  const handleCreateAllocation = () => {
    setSelectedPerson(null);
    setSelectedRoom(null);
    setSelectedPeople([]);
    form.reset({ notes: '' });
    
    const hasMultiCapacityRooms = rooms.some(room => room.capacity > 1 && room.occupied < room.capacity);
    setMultiSelectMode(hasMultiCapacityRooms);
    
    setIsDialogOpen(true);
  };

  const handleAllocationClick = (allocation: Allocation) => {
    setViewedAllocation(allocation);
    setIsDetailsDialogOpen(true);
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
      setIsDialogOpen(true);
    }
  };

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

  const handleCreateRoom = () => {
    setIsRoomDialogOpen(true);
  };

  const handleCancelRoomDialog = () => {
    setIsRoomDialogOpen(false);
  };

  const handleSaveRoom = async (values: any) => {
    const success = await onCreateRoom(values);
    if (success) {
      setIsRoomDialogOpen(false);
    }
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
      setIsDialogOpen(false);
      setSelectedPeople([]);
    }
  };

  const handleCancelAllocationDialog = () => {
    setIsDialogOpen(false);
    setSelectedPeople([]);
    
    if (roomIdFromUrl) {
      navigate('/allocations');
    }
  };

  return (
    <>
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
        onDelete={onRemoveAllocation}
        onEdit={handleEditAllocation}
      />

      {/* Return functions to be used by parent component */}
      {/* We don't return any visible JSX, just provide methods */}
      <span className="hidden">
        {/* This span is never displayed, just used to expose the methods */}
      </span>
    </>
  );
};

export { AllocationDialogManager };
