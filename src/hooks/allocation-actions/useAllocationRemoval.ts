
import { toast } from 'sonner';
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { removeAllocationFromSupabase } from '@/services/allocationService';

interface UseAllocationRemovalProps {
  allocations: Allocation[];
  rooms: Room[];
  people: Person[];
  setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
}

export const useAllocationRemoval = ({
  allocations,
  rooms,
  people,
  setAllocations,
  setRooms,
  setPeople
}: UseAllocationRemovalProps) => {
  // Handle allocation removal
  const removeAllocation = async (allocationId: string) => {
    try {
      const allocation = allocations.find(a => a.id === allocationId);
      if (!allocation) return;

      await removeAllocationFromSupabase(allocationId, allocation.roomId, allocation.room.occupied);

      setAllocations(allocations.filter(a => a.id !== allocationId));
      
      const updatedRooms = [...rooms];
      const roomIndex = updatedRooms.findIndex(r => r.id === allocation.roomId);
      if (roomIndex >= 0) {
        updatedRooms[roomIndex] = {
          ...updatedRooms[roomIndex],
          occupied: updatedRooms[roomIndex].occupied - 1
        };
      }
      setRooms(updatedRooms);

      const updatedPeople = people.map(p => 
        p.id === allocation.personId 
          ? { ...p, roomId: undefined, roomName: undefined } 
          : p
      );
      setPeople(updatedPeople);

      toast.success('Room allocation removed successfully');
    } catch (error) {
      console.error("Error removing allocation:", error);
      toast.error("Failed to remove allocation");
    }
  };

  return {
    removeAllocation
  };
};
