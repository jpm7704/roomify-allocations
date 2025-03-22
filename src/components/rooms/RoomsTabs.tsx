
import React, { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Room } from '@/components/RoomCard';

interface RoomsTabsProps {
  rooms: Room[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const RoomsTabs = ({ rooms, activeTab, setActiveTab, children }: RoomsTabsProps) => {
  // Group calculations
  const { allRooms, chaletRooms, tentRooms } = useMemo(() => {
    // Filter rooms by type and availability
    const allRoomsCount = rooms.length;
    const chaletRooms = rooms.filter(room => room.type === 'Chalet' || !room.type);
    const tentRooms = rooms.filter(room => room.type === 'Personal tent');
    
    // Calculate available counts
    const availableRoomsCount = rooms.filter(room => room.occupied < room.capacity).length;
    const availableChaletRoomsCount = chaletRooms.filter(room => room.occupied < room.capacity).length;
    const availableTentRoomsCount = tentRooms.filter(room => room.occupied < room.capacity).length;
    
    return {
      allRooms: {
        count: allRoomsCount,
        availableCount: availableRoomsCount
      },
      chaletRooms: {
        count: chaletRooms.length,
        availableCount: availableChaletRoomsCount
      },
      tentRooms: {
        count: tentRooms.length,
        availableCount: availableTentRoomsCount
      }
    };
  }, [rooms]);
  
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
      <TabsList className="grid w-full grid-cols-3 sm:w-auto">
        <TabsTrigger value="all" className="rounded-md">
          All <span className="ml-1 text-xs opacity-70">({allRooms.count})</span>
        </TabsTrigger>
        <TabsTrigger value="chalets" className="rounded-md">
          Chalets <span className="ml-1 text-xs opacity-70">({chaletRooms.count})</span>
        </TabsTrigger>
        <TabsTrigger value="tents" className="rounded-md">
          Tents <span className="ml-1 text-xs opacity-70">({tentRooms.count})</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-6">
        {children}
      </TabsContent>
      
      <TabsContent value="chalets" className="mt-6">
        {children}
      </TabsContent>
      
      <TabsContent value="tents" className="mt-6">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default RoomsTabs;
