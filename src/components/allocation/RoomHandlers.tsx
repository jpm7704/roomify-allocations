
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/components/RoomCard';
import { useAuth } from '@/contexts/AuthContext';

export const useRoomHandlers = (
  rooms: Room[],
  setRooms: (rooms: Room[]) => void,
  setIsRoomDialogOpen: (open: boolean) => void
) => {
  const { user } = useAuth();
  
  const handleSaveRoom = async (values: any) => {
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    try {
      if (!values.name || !values.capacity) {
        toast.error("Room name and capacity are required");
        return;
      }

      const { data, error } = await supabase
        .from('accommodation_rooms')
        .insert({
          name: values.name,
          capacity: parseInt(values.capacity),
          description: values.description,
          type: values.type || 'Chalet',
          occupied: 0,
          user_id: user.id
        })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newRoom: Room = {
          id: data[0].id,
          name: data[0].name,
          capacity: data[0].capacity,
          occupied: 0,
          description: data[0].description,
          type: data[0].type || 'Chalet'
        };

        setRooms([...rooms, newRoom]);
        toast.success(`${values.type === 'Personal tent' ? 'Tent' : 'Room'} "${values.name}" created successfully`);
        setIsRoomDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create accommodation");
    }
  };

  return {
    handleSaveRoom
  };
};
