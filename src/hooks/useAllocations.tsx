
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { 
  fetchAllocationData, 
  refreshAllocationData
} from '@/services/allocationService';
import {
  formatRooms,
  formatPeople,
  formatAllocations,
  filterAllocations as filterAllocationsByQuery
} from '@/utils/allocationMappers';
import { useAllocationState } from '@/hooks/useAllocationState';
import { useAllocationActions } from '@/hooks/useAllocationActions';

export const useAllocations = (roomIdFromUrl: string | null) => {
  const { 
    allocations, 
    people, 
    rooms, 
    loading, 
    selectedRoom,
    setAllocations,
    setPeople,
    setRooms,
    setLoading,
    setSelectedRoom
  } = useAllocationState();

  // Initial data loading
  useEffect(() => {
    loadAllocationData(roomIdFromUrl);
  }, [roomIdFromUrl]);

  const loadAllocationData = async (roomIdFromUrl: string | null) => {
    setLoading(true);
    try {
      const { roomsData, peopleData, allocationsData } = await fetchAllocationData();
      
      const formattedRooms = formatRooms(roomsData || []);
      const formattedPeople = formatPeople(peopleData || [], allocationsData || []);
      const formattedAllocations = formatAllocations(allocationsData || []);

      setRooms(formattedRooms);
      setPeople(formattedPeople);
      setAllocations(formattedAllocations);

      if (roomIdFromUrl && formattedRooms.length > 0) {
        const roomToSelect = formattedRooms.find(room => room.id === roomIdFromUrl);
        if (roomToSelect) {
          setSelectedRoom(roomToSelect);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const { 
    filterAllocations,
    removeAllocation,
    createRoom,
    saveAllocation
  } = useAllocationActions({
    allocations,
    people,
    rooms,
    setAllocations,
    setPeople,
    setRooms
  });

  return { 
    allocations, 
    people, 
    rooms, 
    loading, 
    selectedRoom,
    filterAllocations, 
    removeAllocation, 
    createRoom, 
    saveAllocation, 
    setAllocations,
    setPeople,
    setRooms 
  };
};
