
import { toast } from 'sonner';
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import {
  removeAllocationFromSupabase,
  createRoomInSupabase,
  createSingleAllocationInSupabase,
  processMultipleAllocations,
  refreshAllocationData
} from '@/services/allocationService';
import {
  filterAllocations as filterAllocationsByQuery,
  formatRefreshedData,
  updatePeopleWithAllocations
} from '@/utils/allocationMappers';

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
  // Filter allocations based on search query
  const filterAllocations = (query: string) => {
    return filterAllocationsByQuery(allocations, query);
  };

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

  // Handle room creation
  const createRoom = async (values: any) => {
    try {
      const newRoomData = await createRoomInSupabase(values);
      
      if (newRoomData) {
        const newRoom: Room = {
          id: newRoomData.id,
          name: newRoomData.name,
          capacity: newRoomData.capacity,
          occupied: 0,
          floor: newRoomData.floor || '1',
          building: newRoomData.building || 'Main Building',
          description: newRoomData.description
        };

        setRooms([...rooms, newRoom]);
        toast.success(`Room "${values.name}" created successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
      return false;
    }
  };

  // Handle allocation creation or update
  const saveAllocation = async (
    selectedPerson: Person | null, 
    selectedRoom: Room | null, 
    notes: string, 
    selectedPeople: Person[] = [], 
    multiSelectMode: boolean = false
  ) => {
    if (multiSelectMode) {
      return handleMultipleAllocations(selectedPeople, selectedRoom, notes);
    } else {
      return handleSingleAllocation(selectedPerson, selectedRoom, notes);
    }
  };

  // Handle multiple allocations (batch mode)
  const handleMultipleAllocations = async (
    selectedPeople: Person[],
    selectedRoom: Room | null,
    notes: string
  ) => {
    if (!selectedPeople.length || !selectedRoom) {
      toast.error("Please select both people and a room");
      return false;
    }

    try {
      if (selectedPeople.length > (selectedRoom.capacity - selectedRoom.occupied)) {
        toast.error(`This room only has space for ${selectedRoom.capacity - selectedRoom.occupied} more people`);
        return false;
      }

      const { totalNewAllocations, totalUpdatedAllocations } = await processMultipleAllocations(
        selectedPeople,
        selectedRoom.id,
        notes,
        allocations
      );
      
      const newOccupancy = selectedRoom.occupied + totalNewAllocations + totalUpdatedAllocations;
      await supabase
        .from('accommodation_rooms')
        .update({ occupied: newOccupancy })
        .eq('id', selectedRoom.id);
      
      const { freshData, updatedRooms } = await refreshAllocationData();

      if (freshData) {
        const { formattedRooms, formattedAllocations } = formatRefreshedData(freshData, updatedRooms || []);
        const updatedPeople = updatePeopleWithAllocations(people, freshData);

        setRooms(formattedRooms);
        setAllocations(formattedAllocations);
        setPeople(updatedPeople);
      }

      let successMessage = '';
      if (totalNewAllocations > 0 && totalUpdatedAllocations > 0) {
        successMessage = `Assigned ${totalNewAllocations} new and updated ${totalUpdatedAllocations} existing allocations to ${selectedRoom.name}`;
      } else if (totalNewAllocations > 0) {
        successMessage = `Assigned ${totalNewAllocations} attendees to ${selectedRoom.name}`;
      } else {
        successMessage = `Updated room assignments to ${selectedRoom.name}`;
      }

      toast.success(successMessage);
      return true;
    } catch (error) {
      console.error("Error processing batch allocations:", error);
      toast.error("Failed to save room allocations");
      return false;
    }
  };

  // Handle single allocation
  const handleSingleAllocation = async (
    selectedPerson: Person | null,
    selectedRoom: Room | null,
    notes: string
  ) => {
    if (!selectedPerson || !selectedRoom) {
      toast.error("Please select both a person and a room");
      return false;
    }

    if (selectedRoom.occupied >= selectedRoom.capacity) {
      toast.error("This room is already at full capacity");
      return false;
    }

    try {
      const newAllocationId = await createSingleAllocationInSupabase(
        selectedPerson.id,
        selectedRoom.id,
        notes,
        selectedRoom.occupied
      );

      const newAllocation: Allocation = {
        id: newAllocationId || crypto.randomUUID(),
        personId: selectedPerson.id,
        roomId: selectedRoom.id,
        dateAssigned: new Date().toISOString(),
        notes: notes,
        person: {
          id: selectedPerson.id,
          name: selectedPerson.name,
          email: selectedPerson.email || '',
          department: selectedPerson.department || '',
          roomId: selectedRoom.id,
          roomName: selectedRoom.name
        },
        room: {
          id: selectedRoom.id,
          name: selectedRoom.name,
          capacity: selectedRoom.capacity,
          occupied: selectedRoom.occupied + 1,
          floor: selectedRoom.floor,
          building: selectedRoom.building
        }
      };

      setAllocations([...allocations, newAllocation]);
      setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, occupied: r.occupied + 1 } : r));
      setPeople(people.map(p => p.id === selectedPerson.id ? { ...p, roomId: selectedRoom.id, roomName: selectedRoom.name } : p));

      toast.success(`${selectedPerson.name} has been assigned to ${selectedRoom.name}`);
      return true;
    } catch (error) {
      console.error("Error creating/updating allocation:", error);
      toast.error("Failed to save room allocation");
      return false;
    }
  };

  return {
    filterAllocations,
    removeAllocation,
    createRoom,
    saveAllocation
  };
};
