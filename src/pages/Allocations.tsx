
import { useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import AllocationCard, { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { toast } from 'sonner';

// Mock data
const mockRooms: Room[] = [
  { id: '1', name: 'Room 101', capacity: 2, occupied: 2, floor: '1', building: 'Main Building' },
  { id: '2', name: 'Room 102', capacity: 4, occupied: 3, floor: '1', building: 'Main Building' },
  { id: '4', name: 'Room 202', capacity: 2, occupied: 1, floor: '2', building: 'Main Building' },
  { id: '5', name: 'Room A1', capacity: 6, occupied: 5, floor: '1', building: 'Annex' },
];

const mockPeople: Person[] = [
  { 
    id: '1', name: 'Alex Johnson', email: 'alex.johnson@example.com', department: 'Engineering',
    roomId: '1', roomName: 'Room 101'
  },
  { 
    id: '2', name: 'Sam Taylor', email: 'sam.taylor@example.com', department: 'Design',
    roomId: '1', roomName: 'Room 101'
  },
  { 
    id: '3', name: 'Jordan Smith', email: 'jordan.smith@example.com', department: 'Marketing',
    roomId: '2', roomName: 'Room 102'
  },
  { 
    id: '4', name: 'Morgan Lee', email: 'morgan.lee@example.com', department: 'Engineering',
    roomId: '2', roomName: 'Room 102'
  },
  { 
    id: '5', name: 'Taylor Brown', email: 'taylor.brown@example.com', department: 'Product',
    roomId: '2', roomName: 'Room 102'
  },
  { 
    id: '7', name: 'Riley Moore', email: 'riley.moore@example.com', department: 'Finance',
    roomId: '4', roomName: 'Room 202'
  },
];

const mockAllocations: Allocation[] = mockPeople
  .filter(person => person.roomId)
  .map(person => {
    const room = mockRooms.find(r => r.id === person.roomId)!;
    return {
      id: `a-${person.id}-${room.id}`,
      personId: person.id,
      roomId: room.id,
      person,
      room,
      dateAssigned: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
    };
  });

const Allocations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter allocations based on search query
  const filteredAllocations = mockAllocations.filter(allocation => {
    const matchesSearch = 
      allocation.person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.person.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.room.building?.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  });
  
  const handleRemoveAllocation = (allocationId: string) => {
    toast.success('Allocation removed successfully');
  };
  
  const handleAllocationClick = (allocation: Allocation) => {
    toast.info(`Viewing allocation for ${allocation.person.name} in ${allocation.room.name}`);
  };
  
  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Allocations</h1>
            <p className="text-muted-foreground mt-1">
              Manage room allocations for people
            </p>
          </div>
          
          <Button className="rounded-md">
            <Plus className="mr-2 h-4 w-4" />
            New Allocation
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search allocations..."
              className="pl-9 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-6">
          {filteredAllocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-1">No allocations found</h3>
              <p className="text-muted-foreground max-w-sm">
                {searchQuery ? 'Try adjusting your search query' : 'There are no room allocations yet'}
              </p>
              
              <Button className="mt-6" onClick={() => setSearchQuery('')}>
                {searchQuery ? 'Clear Search' : 'Create Allocation'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAllocations.map((allocation) => (
                <AllocationCard
                  key={allocation.id}
                  allocation={allocation}
                  onRemove={handleRemoveAllocation}
                  onClick={handleAllocationClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Allocations;
