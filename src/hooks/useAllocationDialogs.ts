
import { useState, useEffect } from 'react';
import { Room } from '@/components/RoomCard';
import { Person } from '@/components/PersonCard';
import { Allocation } from '@/components/AllocationCard';
import { RoomWithOccupants } from '@/components/AllocationsList';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

export const useAllocationDialogs = (
  rooms: Room[],
  selectedPerson: Person | null,
  setSelectedPerson: (person: Person | null) => void,
  selectedRoom: Room | null,
  setSelectedRoom: (room: Room | null) => void,
  selectedPeople: Person[],
  setSelectedPeople: (people: Person[]) => void,
  multiSelectMode: boolean,
  setMultiSelectMode: (mode: boolean) => void,
  fetchData: () => void,
  roomIdFromUrl: string | null
) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [viewedAllocation, setViewedAllocation] = useState<Allocation | null>(null);
  const [viewedRoomAllocation, setViewedRoomAllocation] = useState<RoomWithOccupants | null>(null);
  
  const form = useForm({
    defaultValues: {
      notes: '',
    },
  });

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
  }, [roomIdFromUrl, rooms, setSelectedRoom, setMultiSelectMode]);

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

  return {
    isDialogOpen,
    setIsDialogOpen,
    isRoomDialogOpen,
    setIsRoomDialogOpen,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    viewedAllocation,
    setViewedAllocation,
    viewedRoomAllocation,
    handleCreateAllocation,
    handleRoomAllocationClick,
    handleAllocationClick,
    handleEditAllocation,
    handleCreateRoom,
    handleCancelRoomDialog,
    handleCancelAllocationDialog,
  };
};
