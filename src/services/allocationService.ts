
import { supabase } from '@/integrations/supabase/client';
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { toast } from 'sonner';

export interface FetchedAllocation {
  id: string;
  date_assigned: string;
  notes: string;
  person_id: string;
  room_id: string;
  women_attendees: {
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    home_church: string;
  };
  accommodation_rooms: {
    id: string;
    name: string;
    capacity: number;
    occupied: number;
    floor: string;
    building: string;
  };
}

// Fetch data from Supabase: rooms, people, and allocations
export const fetchAllocationData = async () => {
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
        accommodation_rooms!inner(id, name, capacity, occupied, floor, building)
      `);

    if (allocationsError && allocationsError.code !== 'PGRST116') throw allocationsError;

    return {
      roomsData,
      peopleData,
      allocationsData,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Failed to load data");
    throw error;
  }
};

// Remove an allocation from Supabase
export const removeAllocationFromSupabase = async (allocationId: string, roomId: string, currentOccupied: number) => {
  try {
    const { error } = await supabase
      .from('room_allocations')
      .delete()
      .eq('id', allocationId);

    if (error) throw error;

    const { error: roomError } = await supabase
      .from('accommodation_rooms')
      .update({ occupied: currentOccupied - 1 })
      .eq('id', roomId);

    if (roomError) throw roomError;

    return true;
  } catch (error) {
    console.error("Error removing allocation:", error);
    toast.error("Failed to remove allocation");
    throw error;
  }
};

// Create a new room in Supabase
export const createRoomInSupabase = async (values: {
  name: string;
  capacity: string | number;
  building?: string;
  floor?: string;
  description?: string;
}) => {
  try {
    if (!values.name || !values.capacity) {
      toast.error("Room name and capacity are required");
      return null;
    }

    const { data, error } = await supabase
      .from('accommodation_rooms')
      .insert({
        name: values.name,
        capacity: typeof values.capacity === 'string' ? parseInt(values.capacity) : values.capacity,
        building: values.building || 'Main Building',
        floor: values.floor || '1',
        description: values.description,
        occupied: 0
      })
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      return data[0];
    }
    return null;
  } catch (error) {
    console.error("Error creating room:", error);
    toast.error("Failed to create room");
    throw error;
  }
};

// Create a single allocation in Supabase
export const createSingleAllocationInSupabase = async (
  personId: string,
  roomId: string,
  notes: string,
  currentOccupied: number
) => {
  try {
    const { error } = await supabase
      .from('room_allocations')
      .insert({
        person_id: personId,
        room_id: roomId,
        notes: notes,
        date_assigned: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    const { error: roomError } = await supabase
      .from('accommodation_rooms')
      .update({ occupied: currentOccupied + 1 })
      .eq('id', roomId);

    if (roomError) throw roomError;

    const idResponse = await supabase
      .from('room_allocations')
      .select('id')
      .eq('person_id', personId)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    return idResponse.data?.id || null;
  } catch (error) {
    console.error("Error creating allocation:", error);
    toast.error("Failed to save room allocation");
    throw error;
  }
};

// Update allocation in Supabase (for batch operations)
export const processMultipleAllocations = async (
  selectedPeople: Person[],
  selectedRoomId: string,
  notes: string,
  currentAllocations: Allocation[]
) => {
  try {
    let totalNewAllocations = 0;
    let totalUpdatedAllocations = 0;
    
    for (const person of selectedPeople) {
      const existingAllocation = currentAllocations.find(a => a.personId === person.id);
      
      if (existingAllocation) {
        const { error } = await supabase
          .from('room_allocations')
          .update({ 
            room_id: selectedRoomId,
            notes: notes,
            date_assigned: new Date().toISOString()
          })
          .eq('id', existingAllocation.id);

        if (error) throw error;

        if (existingAllocation.roomId !== selectedRoomId) {
          await supabase
            .from('accommodation_rooms')
            .update({ occupied: existingAllocation.room.occupied - 1 })
            .eq('id', existingAllocation.roomId);
          
          totalUpdatedAllocations++;
        }
      } else {
        const { error } = await supabase
          .from('room_allocations')
          .insert({
            person_id: person.id,
            room_id: selectedRoomId,
            notes: notes,
            date_assigned: new Date().toISOString()
          });

        if (error) throw error;
        totalNewAllocations++;
      }
    }
    
    return { totalNewAllocations, totalUpdatedAllocations };
  } catch (error) {
    console.error("Error processing batch allocations:", error);
    toast.error("Failed to save room allocations");
    throw error;
  }
};

// Refresh allocation data after changes
export const refreshAllocationData = async () => {
  try {
    const { data: freshData, error: refreshError } = await supabase
      .from('room_allocations')
      .select(`
        id,
        date_assigned,
        notes,
        person_id,
        room_id,
        women_attendees!inner(id, name, email, phone, department, home_church),
        accommodation_rooms!inner(id, name, capacity, occupied, floor, building)
      `);

    if (refreshError) throw refreshError;

    const { data: updatedRooms } = await supabase
      .from('accommodation_rooms')
      .select('*');

    return { freshData, updatedRooms };
  } catch (error) {
    console.error("Error refreshing data:", error);
    toast.error("Failed to refresh allocation data");
    throw error;
  }
};
