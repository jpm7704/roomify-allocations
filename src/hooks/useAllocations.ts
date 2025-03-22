
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { RoomWithOccupants } from '@/components/AllocationsList';

export const useAllocations = (roomIdFromUrl: string | null) => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [roomAllocations, setRoomAllocations] = useState<RoomWithOccupants[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [viewedAllocation, setViewedAllocation] = useState<Allocation | null>(null);
  const [viewedRoomAllocation, setViewedRoomAllocation] = useState<RoomWithOccupants | null>(null);
  
  useEffect(() => {
    fetchData();
  }, [roomIdFromUrl]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: roomsData, error: roomsError } = await supabase
        .from('accommodation_rooms')
        .select('*');

      if (roomsError) throw roomsError;

      const { data: peopleData, error: peopleError } = await supabase
        .from('women_attendees')
        .select('*');

      if (peopleError) throw peopleError;

      const { data: allocationsData, error: allocationsError } = await supabase
        .from('room_allocations')
        .select(`
          id,
          date_assigned,
          notes,
          person_id,
          room_id,
          women_attendees!inner(id, name, email, phone, department, home_church),
          accommodation_rooms!inner(id, name, capacity, occupied, type)
        `);

      if (allocationsError && allocationsError.code !== 'PGRST116') throw allocationsError;

      const formattedRooms: Room[] = roomsData?.map(room => ({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        occupied: room.occupied || 0,
        description: room.description,
        type: room.type || 'Chalet'
      })) || [];

      const formattedPeople: Person[] = peopleData?.map(person => {
        const allocation = allocationsData?.find(a => a.person_id === person.id);
        return {
          id: person.id,
          name: person.name,
          email: person.email || '',
          department: person.department || person.home_church || '',
          roomId: allocation ? allocation.room_id : undefined,
          roomName: allocation ? allocation.accommodation_rooms.name : undefined
        };
      }) || [];

      const formattedAllocations: Allocation[] = allocationsData?.map(allocation => {
        const person: Person = {
          id: allocation.person_id,
          name: allocation.women_attendees.name,
          email: allocation.women_attendees.email || '',
          department: allocation.women_attendees.department || allocation.women_attendees.home_church || '',
          roomId: allocation.room_id,
          roomName: allocation.accommodation_rooms.name
        };

        const room: Room = {
          id: allocation.room_id,
          name: allocation.accommodation_rooms.name,
          capacity: allocation.accommodation_rooms.capacity,
          occupied: allocation.accommodation_rooms.occupied || 0,
          type: allocation.accommodation_rooms.type || 'Chalet'
        };

        return {
          id: allocation.id,
          personId: allocation.person_id,
          roomId: allocation.room_id,
          person,
          room,
          dateAssigned: allocation.date_assigned,
          notes: allocation.notes
        };
      }) || [];

      const groupedRoomAllocations: RoomWithOccupants[] = [];
      
      formattedRooms.forEach(room => {
        const allocationsForRoom = formattedAllocations.filter(a => a.roomId === room.id);
        const occupants = allocationsForRoom.map(a => a.person);
        
        if (allocationsForRoom.length > 0 || room.occupied > 0) {
          groupedRoomAllocations.push({
            room,
            occupants
          });
        }
      });

      setRooms(formattedRooms);
      setPeople(formattedPeople);
      setAllocations(formattedAllocations);
      setRoomAllocations(groupedRoomAllocations);

      if (roomIdFromUrl && formattedRooms.length > 0) {
        const roomToSelect = formattedRooms.find(room => room.id === roomIdFromUrl);
        if (roomToSelect) {
          setSelectedRoom(roomToSelect);
          if (roomToSelect.capacity > 1 && roomToSelect.capacity - roomToSelect.occupied > 1) {
            setMultiSelectMode(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOccupant = async (roomId: string, personId: string) => {
    try {
      const allocation = allocations.find(a => a.roomId === roomId && a.personId === personId);
      if (!allocation) {
        toast.error("Allocation not found");
        return;
      }

      const { error } = await supabase
        .from('room_allocations')
        .delete()
        .eq('id', allocation.id);

      if (error) throw error;

      const { error: roomError } = await supabase
        .from('accommodation_rooms')
        .update({ occupied: allocation.room.occupied - 1 })
        .eq('id', roomId);

      if (roomError) throw roomError;

      setAllocations(allocations.filter(a => a.id !== allocation.id));
      
      const updatedRooms = [...rooms];
      const roomIndex = updatedRooms.findIndex(r => r.id === roomId);
      if (roomIndex >= 0) {
        updatedRooms[roomIndex] = {
          ...updatedRooms[roomIndex],
          occupied: updatedRooms[roomIndex].occupied - 1
        };
      }
      setRooms(updatedRooms);

      const updatedPeople = people.map(p => 
        p.id === personId 
          ? { ...p, roomId: undefined, roomName: undefined } 
          : p
      );
      setPeople(updatedPeople);

      const updatedRoomAllocations = [...roomAllocations];
      const roomAllocationIndex = updatedRoomAllocations.findIndex(ra => ra.room.id === roomId);
      if (roomAllocationIndex >= 0) {
        updatedRoomAllocations[roomAllocationIndex] = {
          ...updatedRoomAllocations[roomAllocationIndex],
          room: {
            ...updatedRoomAllocations[roomAllocationIndex].room,
            occupied: updatedRoomAllocations[roomAllocationIndex].room.occupied - 1
          },
          occupants: updatedRoomAllocations[roomAllocationIndex].occupants.filter(o => o.id !== personId)
        };
        
        if (updatedRoomAllocations[roomAllocationIndex].occupants.length === 0) {
          updatedRoomAllocations.splice(roomAllocationIndex, 1);
        }
      }
      setRoomAllocations(updatedRoomAllocations);

      toast.success('Room allocation removed successfully');
      
      if (viewedAllocation?.id === allocation.id) {
        setViewedAllocation(null);
      }
    } catch (error) {
      console.error("Error removing allocation:", error);
      toast.error("Failed to remove allocation");
    }
  };

  return {
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
  };
};
