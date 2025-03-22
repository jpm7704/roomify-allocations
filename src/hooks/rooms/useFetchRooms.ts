
import { useState, useEffect } from 'react';
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useFetchRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    fetchRooms();
  }, [user]);
  
  const fetchRooms = async () => {
    if (!user) {
      setRooms([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accommodation_rooms')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;

      const formattedRooms: Room[] = data?.map(room => ({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        occupied: room.occupied || 0,
        description: room.description,
        type: room.type || 'Chalet'
      })) || [];

      setRooms(formattedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  return {
    rooms,
    setRooms,
    loading,
    fetchRooms
  };
};
