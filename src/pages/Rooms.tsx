
import { useState } from 'react';
import { Building, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import RoomCard, { Room } from '@/components/RoomCard';
import { toast } from 'sonner';

// Mock data
const mockRooms: Room[] = [
  { id: '1', name: 'Room 101', capacity: 2, occupied: 2, floor: '1', building: 'Main Building', description: 'Double room with mountain view' },
  { id: '2', name: 'Room 102', capacity: 4, occupied: 3, floor: '1', building: 'Main Building', description: 'Quad room with city view' },
  { id: '3', name: 'Room 201', capacity: 1, occupied: 0, floor: '2', building: 'Main Building', description: 'Single room with private bathroom' },
  { id: '4', name: 'Room 202', capacity: 2, occupied: 1, floor: '2', building: 'Main Building', description: 'Double room with garden view' },
  { id: '5', name: 'Room A1', capacity: 6, occupied: 5, floor: '1', building: 'Annex', description: 'Large room with shared facilities' },
  { id: '6', name: 'Room A2', capacity: 4, occupied: 4, floor: '1', building: 'Annex', description: 'Quad room with shared bathroom' },
];

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter rooms based on search query and active tab
  const filteredRooms = mockRooms.filter(room => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'available') return matchesSearch && room.occupied < room.capacity;
    if (activeTab === 'full') return matchesSearch && room.occupied === room.capacity;
    
    return matchesSearch;
  });
  
  const allRoomsCount = mockRooms.length;
  const availableRoomsCount = mockRooms.filter(room => room.occupied < room.capacity).length;
  const fullRoomsCount = mockRooms.filter(room => room.occupied === room.capacity).length;
  
  const handleEditRoom = (room: Room) => {
    toast.info(`Edit room: ${room.name}`);
  };
  
  const handleDeleteRoom = (roomId: string) => {
    toast.success(`Room deleted successfully`);
  };
  
  const handleRoomClick = (room: Room) => {
    toast.info(`Viewing room: ${room.name}`);
  };
  
  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all rooms and their current occupancy
            </p>
          </div>
          
          <Button className="rounded-md">
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
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
            {filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No rooms found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'There are no rooms added yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={handleEditRoom}
                    onDelete={handleDeleteRoom}
                    onClick={handleRoomClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="mt-6">
            {filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No available rooms</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'There are no available rooms at the moment'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={handleEditRoom}
                    onDelete={handleDeleteRoom}
                    onClick={handleRoomClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="full" className="mt-6">
            {filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No full rooms</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'There are no fully occupied rooms at the moment'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={handleEditRoom}
                    onDelete={handleDeleteRoom}
                    onClick={handleRoomClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Rooms;
