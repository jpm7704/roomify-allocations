
import { useState } from 'react';
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useRoomActions = (rooms: Room[], setRooms: (rooms: Room[]) => void) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { user } = useAuth();
  
  const handleDeleteRoom = async (roomId: string) => {
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    if (!roomId) return;
    
    if (confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      try {
        // Check if room is part of a chalet group
        const roomToDelete = rooms.find(r => r.id === roomId);
        const chaletGroup = roomToDelete?.chaletGroup;
        
        // If room is part of a chalet group, ask if user wants to delete all rooms in that chalet
        let roomsToDelete = [roomId];
        
        if (chaletGroup && rooms.filter(r => r.chaletGroup === chaletGroup).length > 1) {
          if (confirm(`This room is part of ${chaletGroup}. Do you want to delete all rooms in this chalet?`)) {
            roomsToDelete = rooms
              .filter(r => r.chaletGroup === chaletGroup)
              .map(r => r.id);
          }
        }
        
        // Delete the room(s)
        const { error } = await supabase
          .from('accommodation_rooms')
          .delete()
          .in('id', roomsToDelete);
        
        if (error) throw error;
        
        setRooms(rooms.filter(room => !roomsToDelete.includes(room.id)));
        
        if (roomsToDelete.length > 1) {
          toast.success(`${chaletGroup} has been deleted successfully`);
        } else {
          toast.success("Room has been deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting room:", error);
        toast.error("Failed to delete room");
      }
    }
  };
  
  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    // You would implement additional edit logic here
    toast.info("Room editing is not yet implemented");
  };
  
  const handleRoomClick = (room: Room) => {
    // You would implement room detail view logic here
    console.log("Room clicked:", room);
    toast.info(`Selected ${room.name}`);
  };
  
  const handleAssignRoom = (room: Room) => {
    // You would implement room assignment logic here
    console.log("Assign to room:", room);
    toast.info(`Assigning to ${room.name}`);
  };
  
  return {
    selectedRoom,
    setSelectedRoom,
    handleDeleteRoom,
    handleEditRoom,
    handleRoomClick,
    handleAssignRoom
  };
};
