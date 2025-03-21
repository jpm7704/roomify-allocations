
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

// Update room occupancy
export const updateRoomOccupancy = async (roomId: string, newOccupancy: number) => {
  try {
    const { error } = await supabase
      .from('accommodation_rooms')
      .update({ occupied: newOccupancy })
      .eq('id', roomId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating room occupancy:", error);
    toast.error("Failed to update room");
    throw error;
  }
};
