
import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import RoomFormDialog from '@/components/RoomFormDialog';
import useRooms from '@/hooks/useRooms';
import RoomsHeader from '@/components/rooms/RoomsHeader';
import RoomsSearch from '@/components/rooms/RoomsSearch';
import RoomsTabs from '@/components/rooms/RoomsTabs';
import RoomsList from '@/components/rooms/RoomsList';
import { Room } from '@/components/RoomCard';

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const {
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
  } = useRooms();
  
  const handleOpenRoomDialog = () => {
    setIsRoomDialogOpen(true);
  };

  const handleCancelRoomDialog = () => {
    setIsRoomDialogOpen(false);
  };
  
  const handleDataCleared = () => {
    // Refresh the rooms data after clearing
    fetchRooms();
  };
  
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.chaletGroup?.toLowerCase().includes(searchQuery.toLowerCase());
        
      // Filter by tab type
      if (activeTab === 'all') return matchesSearch;
      if (activeTab === 'chalets') return matchesSearch && (room.type === 'Chalet' || !room.type);
      if (activeTab === 'tents') return matchesSearch && room.type === 'Personal tent';
      
      return matchesSearch;
    });
  }, [rooms, searchQuery, activeTab]);

  return (
    <Layout>
      <div className="page-container">
        <RoomsHeader 
          onAddRoom={handleOpenRoomDialog} 
          onDataCleared={handleDataCleared}
        />
        <RoomsSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <RoomsTabs 
          rooms={rooms} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
        >
          <RoomsList
            loading={loading}
            filteredRooms={filteredRooms}
            searchQuery={searchQuery}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
            onClick={handleRoomClick}
            onAssign={handleAssignRoom}
            onAddRoom={handleOpenRoomDialog}
          />
        </RoomsTabs>

        <RoomFormDialog
          isOpen={isRoomDialogOpen}
          onOpenChange={setIsRoomDialogOpen}
          onSave={handleSaveRoom}
          onCancel={handleCancelRoomDialog}
        />
      </div>
    </Layout>
  );
};

export default Rooms;
