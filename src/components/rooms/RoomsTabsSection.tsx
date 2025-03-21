
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Room } from '@/components/RoomCard';

interface RoomsTabsSectionProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  allRoomsCount: number;
  availableRoomsCount: number;
  fullRoomsCount: number;
  children: React.ReactNode;
}

const RoomsTabsSection = ({
  activeTab,
  onTabChange,
  allRoomsCount,
  availableRoomsCount,
  fullRoomsCount,
  children
}: RoomsTabsSectionProps) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="mb-8">
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

export default RoomsTabsSection;
