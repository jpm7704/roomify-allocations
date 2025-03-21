
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Allocation } from '@/components/AllocationCard';
import { FetchedAllocation } from '@/services/allocationService';

// Format rooms from Supabase data
export const formatRooms = (roomsData: any[]): Room[] => {
  return roomsData?.map(room => ({
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    occupied: room.occupied || 0,
    floor: room.floor,
    building: room.building,
    description: room.description
  })) || [];
};

// Format people from Supabase data
export const formatPeople = (peopleData: any[], allocationsData: any[]): Person[] => {
  return peopleData?.map(person => {
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
};

// Format allocations from Supabase data
export const formatAllocations = (allocationsData: any[]): Allocation[] => {
  return allocationsData?.map(allocation => {
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
      floor: allocation.accommodation_rooms.floor,
      building: allocation.accommodation_rooms.building
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
};

// Format allocation data from refresh operation
export const formatRefreshedData = (freshData: FetchedAllocation[], updatedRooms: any[]): {
  formattedRooms: Room[],
  formattedAllocations: Allocation[],
} => {
  const formattedRooms = formatRooms(updatedRooms);
  const formattedAllocations = formatAllocations(freshData);

  return {
    formattedRooms,
    formattedAllocations
  };
};

// Update people data with refreshed allocation information
export const updatePeopleWithAllocations = (
  people: Person[],
  freshData: FetchedAllocation[]
): Person[] => {
  return people.map(person => {
    const allocation = freshData.find((a) => a.person_id === person.id);
    if (allocation) {
      return {
        ...person,
        roomId: allocation.room_id,
        roomName: allocation.accommodation_rooms.name
      };
    }
    return person;
  });
};

// Filter allocations based on search query
export const filterAllocations = (allocations: Allocation[], query: string): Allocation[] => {
  if (!query) return allocations;
  
  return allocations.filter(allocation => {
    return (
      allocation.person.name.toLowerCase().includes(query.toLowerCase()) ||
      allocation.person.email.toLowerCase().includes(query.toLowerCase()) ||
      allocation.person.department?.toLowerCase().includes(query.toLowerCase()) ||
      allocation.room.name.toLowerCase().includes(query.toLowerCase()) ||
      allocation.room.building?.toLowerCase().includes(query.toLowerCase())
    );
  });
};
