
import { useState } from 'react';
import { UserRound, Plus, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import PersonCard, { Person } from '@/components/PersonCard';
import { toast } from 'sonner';

// Mock data
const mockPeople: Person[] = [
  { 
    id: '1', 
    name: 'Alex Johnson', 
    email: 'alex.johnson@example.com', 
    department: 'Engineering',
    roomId: '1',
    roomName: 'Room 101'
  },
  { 
    id: '2', 
    name: 'Sam Taylor', 
    email: 'sam.taylor@example.com', 
    department: 'Design',
    roomId: '1',
    roomName: 'Room 101'
  },
  { 
    id: '3', 
    name: 'Jordan Smith', 
    email: 'jordan.smith@example.com', 
    department: 'Marketing',
    roomId: '2',
    roomName: 'Room 102'
  },
  { 
    id: '4', 
    name: 'Morgan Lee', 
    email: 'morgan.lee@example.com', 
    department: 'Engineering',
    roomId: '2',
    roomName: 'Room 102'
  },
  { 
    id: '5', 
    name: 'Taylor Brown', 
    email: 'taylor.brown@example.com', 
    department: 'Product',
    roomId: '2',
    roomName: 'Room 102'
  },
  { 
    id: '6', 
    name: 'Casey Wilson', 
    email: 'casey.wilson@example.com', 
    department: 'Sales'
  },
  { 
    id: '7', 
    name: 'Riley Moore', 
    email: 'riley.moore@example.com', 
    department: 'Finance',
    roomId: '4',
    roomName: 'Room 202'
  },
  { 
    id: '8', 
    name: 'Jamie Williams', 
    email: 'jamie.williams@example.com', 
    department: 'Customer Support'
  },
];

const People = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter people based on search query and active tab
  const filteredPeople = mockPeople.filter(person => {
    const matchesSearch = 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.department?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'assigned') return matchesSearch && !!person.roomId;
    if (activeTab === 'unassigned') return matchesSearch && !person.roomId;
    
    return matchesSearch;
  });
  
  const allPeopleCount = mockPeople.length;
  const assignedPeopleCount = mockPeople.filter(person => !!person.roomId).length;
  const unassignedPeopleCount = mockPeople.filter(person => !person.roomId).length;
  
  const handleEditPerson = (person: Person) => {
    toast.info(`Edit person: ${person.name}`);
  };
  
  const handleDeletePerson = (personId: string) => {
    toast.success(`Person deleted successfully`);
  };
  
  const handleAssignPerson = (person: Person) => {
    toast.info(`Assign ${person.name} to a room`);
  };
  
  const handlePersonClick = (person: Person) => {
    toast.info(`Viewing person: ${person.name}`);
  };
  
  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">People</h1>
            <p className="text-muted-foreground mt-1">
              Manage people and their room allocations
            </p>
          </div>
          
          <Button className="rounded-md">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              className="pl-9 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="all" className="rounded-md">
              All <span className="ml-1 text-xs opacity-70">({allPeopleCount})</span>
            </TabsTrigger>
            <TabsTrigger value="assigned" className="rounded-md">
              Assigned <span className="ml-1 text-xs opacity-70">({assignedPeopleCount})</span>
            </TabsTrigger>
            <TabsTrigger value="unassigned" className="rounded-md">
              Unassigned <span className="ml-1 text-xs opacity-70">({unassignedPeopleCount})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No people found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'There are no people added yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPeople.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onEdit={handleEditPerson}
                    onDelete={handleDeletePerson}
                    onAssign={handleAssignPerson}
                    onClick={handlePersonClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assigned" className="mt-6">
            {filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No assigned people</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'There are no people assigned to rooms yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPeople.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onEdit={handleEditPerson}
                    onDelete={handleDeletePerson}
                    onAssign={handleAssignPerson}
                    onClick={handlePersonClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unassigned" className="mt-6">
            {filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No unassigned people</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'All people are currently assigned to rooms'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPeople.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onEdit={handleEditPerson}
                    onDelete={handleDeletePerson}
                    onAssign={handleAssignPerson}
                    onClick={handlePersonClick}
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

export default People;
