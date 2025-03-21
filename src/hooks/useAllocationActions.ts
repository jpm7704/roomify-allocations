
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { 
  useAllocationFilters,
  useAllocationRemoval,
  useRoomCreation,
  useAllocationCreation
} from './allocation-actions';

interface UseAllocationActionsProps {
  allocations: Allocation[];
  people: Person[];
  rooms: Room[];
  setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export const useAllocationActions = ({
  allocations,
  people,
  rooms,
  setAllocations,
  setPeople,
  setRooms
}: UseAllocationActionsProps) => {
  // Use specialized hooks for different actions
  const { filterAllocations } = useAllocationFilters(allocations);
  
  const { removeAllocation } = useAllocationRemoval({
    allocations,
    rooms,
    people,
    setAllocations,
    setRooms,
    setPeople
  });
  
  const { createRoom } = useRoomCreation({
    rooms,
    setRooms
  });
  
  const { saveAllocation } = useAllocationCreation({
    allocations,
    people,
    rooms,
    setAllocations,
    setPeople,
    setRooms
  });

  return {
    filterAllocations,
    removeAllocation,
    createRoom,
    saveAllocation
  };
};
