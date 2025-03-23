
import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout';
import RoomFormDialog from '@/components/RoomFormDialog';
import useRooms from '@/hooks/useRooms';
import RoomsHeader from '@/components/rooms/RoomsHeader';
import RoomsSearch from '@/components/rooms/RoomsSearch';
import RoomsTabs from '@/components/rooms/RoomsTabs';
import RoomsList from '@/components/rooms/RoomsList';
import { Room } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [userStats, setUserStats] = useState<{ total: number, withRooms: number } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
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
  
  useEffect(() => {
    // This will only show for the current user's session
    // Won't affect other users' data
    const checkRoomStats = async () => {
      if (!user) return;
      
      try {
        // Get total number of users
        const { count: totalUsers, error: countError } = await supabase
          .from('auth.users')
          .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        
        // Get number of users with rooms
        const { data: userRooms, error: roomsError } = await supabase
          .from('accommodation_rooms')
          .select('user_id', { count: 'exact' })
          .limit(1);
          
        if (roomsError) throw roomsError;
        
        // Get unique count of users with rooms
        const { data: uniqueUsers, error: uniqueError } = await supabase
          .from('accommodation_rooms')
          .select('user_id')
          .limit(100);
          
        if (uniqueError) throw uniqueError;
        
        // Calculate unique users with rooms
        const uniqueUserIds = new Set();
        uniqueUsers?.forEach(row => uniqueUserIds.add(row.user_id));
        
        setUserStats({
          total: totalUsers || 0,
          withRooms: uniqueUserIds.size
        });
        
        // Notify the current user about the data status
        toast({
          title: "Room Data Report",
          description: `${uniqueUserIds.size} out of ${totalUsers} users have room data.`,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };
    
    checkRoomStats();
  }, [user, toast]);
  
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
        {userStats && (
          <div className="mb-4 p-4 border rounded-md bg-slate-50">
            <h3 className="text-sm font-medium">User Data Report</h3>
            <p className="text-sm text-slate-500">
              {userStats.withRooms} out of {userStats.total} users have the 67 room dataset.
              {userStats.withRooms < userStats.total && 
                " New users will need to have rooms added separately."}
            </p>
          </div>
        )}
        
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
