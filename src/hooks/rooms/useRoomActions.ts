
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useRoomActions = (rooms: Room[], setRooms: (rooms: Room[]) => void) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleDeleteRoom = async (roomId: string) => {
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    try {
      const { data: allocations, error: checkError } = await supabase
        .from('room_allocations')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id);
      
      if (checkError) throw checkError;
      
      if (allocations && allocations.length > 0) {
        toast.error("Cannot delete accommodation with active allocations");
        return;
      }
      
      const { error } = await supabase
        .from('accommodation_rooms')
        .delete()
        .eq('id', roomId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setRooms(rooms.filter(room => room.id !== roomId));
      toast.success("Accommodation deleted successfully");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete accommodation");
    }
  };
  
  const handleEditRoom = async (room: Room) => {
    toast.info(`Edit ${room.type === 'Personal tent' ? 'tent' : 'room'}: ${room.name}`);
    // Implement edit functionality
  };
  
  const handleRoomClick = (room: Room) => {
    toast.info(`Viewing ${room.type === 'Personal tent' ? 'tent' : 'room'}: ${room.name}`);
    // Implement view room details functionality
  };
  
  const handleAssignRoom = (room: Room) => {
    if (room.occupied >= room.capacity) {
      toast.error(`This ${room.type === 'Personal tent' ? 'tent' : 'room'} is already at full capacity`);
      return;
    }
    
    navigate(`/allocations?roomId=${room.id}`);
  };

  return {
    handleDeleteRoom,
    handleEditRoom,
    handleRoomClick,
    handleAssignRoom
  };
};
