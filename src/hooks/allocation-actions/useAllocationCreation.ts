
import { toast } from 'sonner';
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import {
  createSingleAllocationInSupabase,
  processMultipleAllocations,
  refreshAllocationData
} from '@/services/allocationService';
import {
  formatRefreshedData,
  updatePeopleWithAllocations
} from '@/utils/allocationMappers';

interface UseAllocationCreationProps {
  allocations: Allocation[];
  people: Person[];
  rooms: Room[];
  setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export const useAllocationCreation = ({
  allocations,
  people,
  rooms,
  setAllocations,
  setPeople,
  setRooms
}: UseAllocationCreationProps) => {
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
    saveAllocation
  };
};
