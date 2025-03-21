
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Room } from '@/components/RoomCard';
import RoomFormDialog from '@/components/RoomFormDialog';
import RoomDetailsDialog from '@/components/RoomDetailsDialog';
import RoomsHeader from '@/components/rooms/RoomsHeader';
import RoomsSearch from '@/components/rooms/RoomsSearch';
import RoomsTabsSection from '@/components/rooms/RoomsTabsSection';
import RoomsList from '@/components/rooms/RoomsList';
import { useRooms } from '@/hooks/useRooms';

const Rooms = () => {
  const navigate = useNavigate();
  const { rooms, loading, createRoom, deleteRoom } = useRooms();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'available') return matchesSearch && room.occupied < room.capacity;
    if (activeTab === 'full') return matchesSearch && room.occupied === room.capacity;
    
    return matchesSearch;
  });
  
  const allRoomsCount = rooms.length;
  const availableRoomsCount = rooms.filter(room => room.occupied < room.capacity).length;
  const fullRoomsCount = rooms.filter(room => room.occupied === room.capacity).length;
  
  const handleOpenRoomDialog = () => {
    setIsRoomDialogOpen(true);
  };

  const handleSaveRoom = async (values: any) => {
    const success = await createRoom(values);
    if (success) {
      setIsRoomDialogOpen(false);
    }
  };

  const handleCancelRoomDialog = () => {
    setIsRoomDialogOpen(false);
  };
  
  const handleEditRoom = async (room: Room) => {
    toast.info(`Edit room: ${room.name}`);
    // Implement edit functionality
  };
  
  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailsDialogOpen(true);
  };
  
  const handleAssignRoom = (room: Room) => {
    if (room.occupied >= room.capacity) {
      toast.error("This room is already at full capacity");
      return;
    }
    
    navigate(`/allocations?roomId=${room.id}`);
  };

  return (
    <Layout>
      <div className="page-container">
        <RoomsHeader onAddRoom={handleOpenRoomDialog} />
        
        <RoomsSearch 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <RoomsTabsSection
          activeTab={activeTab}
          onTabChange={setActiveTab}
          allRoomsCount={allRoomsCount}
          availableRoomsCount={availableRoomsCount}
          fullRoomsCount={fullRoomsCount}
        >
          <RoomsList
            rooms={filteredRooms}
            loading={loading}
            searchQuery={searchQuery}
            onRoomClick={handleRoomClick}
            onEditRoom={handleEditRoom}
            onDeleteRoom={deleteRoom}
            onAssignRoom={handleAssignRoom}
            onAddRoom={handleOpenRoomDialog}
          />
        </RoomsTabsSection>

        <RoomFormDialog
          isOpen={isRoomDialogOpen}
          onOpenChange={setIsRoomDialogOpen}
          onSave={handleSaveRoom}
          onCancel={handleCancelRoomDialog}
        />

        <RoomDetailsDialog 
          room={selectedRoom}
          isOpen={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          onAssign={handleAssignRoom}
        />
      </div>
    </Layout>
  );
};

export default Rooms;
