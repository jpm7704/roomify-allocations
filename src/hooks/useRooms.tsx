
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/components/RoomCard';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accommodation_rooms')
        .select('*');
      
      if (error) throw error;

      const formattedRooms: Room[] = data?.map(room => ({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        occupied: room.occupied || 0,
        floor: room.floor,
        building: room.building,
        description: room.description
      })) || [];

      setRooms(formattedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (values: any) => {
    try {
      if (!values.name || !values.capacity) {
        toast.error("Room name and capacity are required");
        return false;
      }

      const { data, error } = await supabase
        .from('accommodation_rooms')
        .insert({
          name: values.name,
          capacity: parseInt(values.capacity),
          building: values.building || 'Main Building',
          floor: values.floor || '1',
          description: values.description,
          occupied: 0
        })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newRoom: Room = {
          id: data[0].id,
          name: data[0].name,
          capacity: data[0].capacity,
          occupied: 0,
          floor: data[0].floor || '1',
          building: data[0].building || 'Main Building',
          description: data[0].description
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

  const deleteRoom = async (roomId: string) => {
    try {
      const { data: allocations, error: checkError } = await supabase
        .from('room_allocations')
        .select('id')
        .eq('room_id', roomId);
      
      if (checkError) throw checkError;
      
      if (allocations && allocations.length > 0) {
        toast.error("Cannot delete room with active allocations");
        return false;
      }
      
      const { error } = await supabase
        .from('accommodation_rooms')
        .delete()
        .eq('id', roomId);
        
      if (error) throw error;
      
      setRooms(rooms.filter(room => room.id !== roomId));
      toast.success("Room deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room");
      return false;
    }
  };

  return { 
    rooms, 
    loading, 
    createRoom, 
    deleteRoom,
    setRooms
  };
};
