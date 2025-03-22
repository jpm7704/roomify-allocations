
import { useFetchRooms } from './useFetchRooms';
import { useCreateRoom } from './useCreateRoom';
import { useRoomActions } from './useRoomActions';

export const useRooms = () => {
  const { rooms, setRooms, loading, fetchRooms } = useFetchRooms();
  const { isRoomDialogOpen, setIsRoomDialogOpen, handleSaveRoom } = useCreateRoom(rooms, setRooms);
  const { handleDeleteRoom, handleEditRoom, handleRoomClick, handleAssignRoom } = useRoomActions(rooms, setRooms);

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
