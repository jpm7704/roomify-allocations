
import { supabase } from '@/integrations/supabase/client';
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
