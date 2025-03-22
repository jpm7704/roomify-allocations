
import { useState, useEffect } from 'react';
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
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

  const handleSaveRoom = async (values: any) => {
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    try {
      if (!values.chaletNumber || !values.capacity) {
        toast.error("Chalet/Tent number and capacity are required");
        return;
      }

      const roomName = values.name || (values.type === 'Chalet' 
        ? `Chalet ${values.chaletNumber}${values.roomNumber ? ` - Room ${values.roomNumber}` : ''}`
        : `Tent ${values.chaletNumber}`);

      const { data, error } = await supabase
        .from('accommodation_rooms')
        .insert({
          name: roomName,
          capacity: parseInt(values.capacity),
          description: values.notes || '',
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
        toast.success(`${values.type === 'Personal tent' ? 'Tent' : 'Chalet'} "${roomName}" created successfully`);
        setIsRoomDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create accommodation");
    }
  };

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
    rooms,
    loading,
    isRoomDialogOpen,
    setIsRoomDialogOpen,
    handleSaveRoom,
    handleDeleteRoom,
    handleEditRoom,
    handleRoomClick,
    handleAssignRoom,
    fetchRooms
  };
};

export default useRooms;
