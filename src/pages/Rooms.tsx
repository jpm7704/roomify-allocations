import { useState, useEffect } from 'react';
import { Building, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import RoomCard, { Room } from '@/components/RoomCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import RoomFormDialog from '@/components/RoomFormDialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Rooms = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
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

    fetchRooms();
  }, [user]);
  
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  const handleCancelRoomDialog = () => {
    setIsRoomDialogOpen(false);
  };
  
  const handleEditRoom = async (room: Room) => {
    toast.info(`Edit ${room.type === 'Personal tent' ? 'tent' : 'room'}: ${room.name}`);
    // Implement edit functionality
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
  
  const renderRoomList = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <h3 className="text-xl font-medium mb-1">Loading rooms...</h3>
        </div>
      );
    }

    if (filteredRooms.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-1">No rooms found</h3>
          <p className="text-muted-foreground max-w-sm">
            {searchQuery ? 'Try adjusting your search query' : 'There are no rooms added yet'}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={handleOpenRoomDialog}>
              Add Accommodation
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
            onClick={handleRoomClick}
            onAssign={handleAssignRoom}
          />
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accommodations</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all rooms and tents and their current occupancy
            </p>
          </div>
          
          <Button className="rounded-md" onClick={handleOpenRoomDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Accommodation
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accommodations..."
              className="pl-9 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="all" className="rounded-md">
              All <span className="ml-1 text-xs opacity-70">({allRoomsCount})</span>
            </TabsTrigger>
            <TabsTrigger value="available" className="rounded-md">
              Available <span className="ml-1 text-xs opacity-70">({availableRoomsCount})</span>
            </TabsTrigger>
            <TabsTrigger value="full" className="rounded-md">
              Full <span className="ml-1 text-xs opacity-70">({fullRoomsCount})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {renderRoomList()}
          </TabsContent>
          
          <TabsContent value="available" className="mt-6">
            {renderRoomList()}
          </TabsContent>
          
          <TabsContent value="full" className="mt-6">
            {renderRoomList()}
          </TabsContent>
        </Tabs>

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
