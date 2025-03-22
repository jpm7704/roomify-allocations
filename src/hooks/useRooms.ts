
import { useState, useEffect } from 'react';
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RoomFormInput {
  type: string;
  chaletNumber: string;
  rooms: { roomNumber: string; capacity: number }[];
  notes: string;
}

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

  const handleSaveRoom = async (values: RoomFormInput) => {
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    try {
      if (!values.chaletNumber || values.rooms.length === 0) {
        toast.error("Chalet/Tent number and at least one room are required");
        return;
      }

      // For Personal tent type, we only have one room
      if (values.type === 'Personal tent') {
        const tentName = `Tent ${values.chaletNumber}`;
        
        const { data, error } = await supabase
          .from('accommodation_rooms')
          .insert({
            name: tentName,
            capacity: values.rooms[0].capacity,
            description: values.notes || '',
            type: 'Personal tent',
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
            type: data[0].type || 'Personal tent'
          };

          setRooms([...rooms, newRoom]);
          toast.success(`Tent "${tentName}" created successfully`);
        }
      } 
      // For Chalet type, we can have multiple rooms (no more limit of 4)
      else {
        const newRooms: Room[] = [];
        
        // Create each room in the chalet
        for (const room of values.rooms) {
          const roomName = `Chalet ${values.chaletNumber}${room.roomNumber ? ` - Room ${room.roomNumber}` : ''}`;
          
          const { data, error } = await supabase
            .from('accommodation_rooms')
            .insert({
              name: roomName,
              capacity: room.capacity,
              description: values.notes || '',
              type: 'Chalet',
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

            newRooms.push(newRoom);
          }
        }

        if (newRooms.length > 0) {
          setRooms([...rooms, ...newRooms]);
          toast.success(`Chalet ${values.chaletNumber} with ${newRooms.length} room${newRooms.length > 1 ? 's' : ''} created successfully`);
        }
      }
      
      setIsRoomDialogOpen(false);
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
