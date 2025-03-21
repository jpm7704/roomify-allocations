
import { toast } from 'sonner';
import { Room } from '@/components/RoomCard';
import { createRoomInSupabase } from '@/services/allocationService';

interface UseRoomCreationProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export const useRoomCreation = ({
  rooms,
  setRooms
}: UseRoomCreationProps) => {
  // Handle room creation
  const createRoom = async (values: any) => {
    try {
      const newRoomData = await createRoomInSupabase(values);
      
      if (newRoomData) {
        const newRoom: Room = {
          id: newRoomData.id,
          name: newRoomData.name,
          capacity: newRoomData.capacity,
          occupied: 0,
          floor: newRoomData.floor || '1',
          building: newRoomData.building || 'Main Building',
          description: newRoomData.description
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

  return {
    createRoom
  };
};
