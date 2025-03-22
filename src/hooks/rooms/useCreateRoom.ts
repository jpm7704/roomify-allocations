
import { useState } from 'react';
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { RoomFormInput } from './types';

export const useCreateRoom = (rooms: Room[], setRooms: (rooms: Room[]) => void) => {
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const { user } = useAuth();
  
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
            user_id: user.id,
            bed_type: values.rooms[0].bedType || 'single',
            bed_count: values.rooms[0].bedCount || 1
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
            type: data[0].type || 'Personal tent',
            bedType: data[0].bed_type,
            bedCount: data[0].bed_count
          };

          setRooms([...rooms, newRoom]);
          toast.success(`Tent "${tentName}" created successfully`);
        }
      } 
      // For Chalet type, we handle each room separately but grouped under one chalet
      else {
        const newRooms: Room[] = [];
        const chaletName = `Chalet ${values.chaletNumber}`;
        
        // Create each room in the chalet
        for (const room of values.rooms) {
          const roomName = `${chaletName}${room.roomNumber ? ` - Room ${room.roomNumber}` : ''}`;
          
          const { data, error } = await supabase
            .from('accommodation_rooms')
            .insert({
              name: roomName,
              capacity: room.capacity,
              description: values.notes || '',
              type: 'Chalet',
              occupied: 0,
              user_id: user.id,
              bed_type: room.bedType || 'single',
              bed_count: room.bedCount || 1,
              chalet_group: chaletName // Group rooms under the same chalet
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
              type: data[0].type || 'Chalet',
              bedType: data[0].bed_type,
              bedCount: data[0].bed_count,
              chaletGroup: data[0].chalet_group
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

  return {
    isRoomDialogOpen,
    setIsRoomDialogOpen,
    handleSaveRoom
  };
};
