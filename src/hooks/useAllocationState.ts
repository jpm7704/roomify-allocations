
import { useState } from 'react';
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';

export const useAllocationState = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return {
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
  };
};
