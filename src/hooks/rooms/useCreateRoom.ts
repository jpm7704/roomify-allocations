
import { useState } from 'react';
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useCreateRoom = (rooms: Room[], setRooms: React.Dispatch<React.SetStateAction<Room[]>>) => {
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleSaveRoom = async (roomData: Partial<Room>) => {
    if (!user) {
      toast.error("You must be logged in to create rooms");
      return;
    }

    try {
      // Check if it's an update or create operation
      if (roomData.id) {
        // Update existing room
        const { error } = await supabase
          .from('accommodation_rooms')
          .update({
            name: roomData.name,
            capacity: roomData.capacity,
            description: roomData.description,
            type: roomData.type,
            bed_type: roomData.bedType,
            bed_count: roomData.bedCount,
            chalet_group: roomData.chaletGroup,
            // Don't update user_id when updating a room
          })
          .eq('id', roomData.id);

        if (error) throw error;

        // Update rooms state
        setRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === roomData.id ? { ...room, ...roomData } : room
          )
        );

        toast.success("Room updated successfully");
      } else {
        // Create new room
        const { data, error } = await supabase
          .from('accommodation_rooms')
          .insert({
            name: roomData.name,
            capacity: roomData.capacity || 1,
            description: roomData.description || '',
            type: roomData.type || 'Chalet',
            bed_type: roomData.bedType || 'single',
            bed_count: roomData.bedCount || 1,
            chalet_group: roomData.chaletGroup || '',
            user_id: user.id, // Assign the current user's ID
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
            type: data[0].type,
            bedType: data[0].bed_type,
            bedCount: data[0].bed_count,
            chaletGroup: data[0].chalet_group,
          };

          setRooms(prevRooms => [...prevRooms, newRoom]);
          toast.success("Room created successfully");
        }
      }

      setIsRoomDialogOpen(false);
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error("Failed to save room");
    }
  };

  return {
    isRoomDialogOpen,
    setIsRoomDialogOpen,
    handleSaveRoom
  };
};
