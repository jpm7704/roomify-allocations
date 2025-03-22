
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Room } from '@/components/RoomCard';

interface RoomsTabsProps {
  rooms: Room[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const RoomsTabs = ({ rooms, activeTab, setActiveTab, children }: RoomsTabsProps) => {
  const allRoomsCount = rooms.length;
  const availableRoomsCount = rooms.filter(room => room.occupied < room.capacity).length;
  const fullRoomsCount = rooms.filter(room => room.occupied === room.capacity).length;
  
  return (
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
        {children}
      </TabsContent>
      
      <TabsContent value="available" className="mt-6">
        {children}
      </TabsContent>
      
      <TabsContent value="full" className="mt-6">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default RoomsTabs;
