
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttendeeList from './AttendeeList';
import { Person } from '@/components/PersonCard';

interface AttendeeTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  allPeopleCount: number;
  assignedPeopleCount: number;
  unassignedPeopleCount: number;
  loading: boolean;
  filteredPeople: Person[];
  searchQuery: string;
  onEdit: (person: Person) => void;
  onDelete: (personId: string) => void;
  onAssign: (person: Person) => void;
  onClick: (person: Person) => void;
}

const AttendeeTabs = ({
  activeTab,
  setActiveTab,
  allPeopleCount,
  assignedPeopleCount,
  unassignedPeopleCount,
  loading,
  filteredPeople,
  searchQuery,
  onEdit,
  onDelete,
  onAssign,
  onClick
}: AttendeeTabsProps) => {
  return (
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
        <AttendeeList
          loading={loading}
          people={filteredPeople}
          searchQuery={searchQuery}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssign={onAssign}
          onClick={onClick}
        />
      </TabsContent>
      
      <TabsContent value="assigned" className="mt-6">
        <AttendeeList
          loading={loading}
          people={filteredPeople.filter(person => !!person.roomId)}
          searchQuery={searchQuery}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssign={onAssign}
          onClick={onClick}
        />
      </TabsContent>
      
      <TabsContent value="unassigned" className="mt-6">
        <AttendeeList
          loading={loading}
          people={filteredPeople.filter(person => !person.roomId)}
          searchQuery={searchQuery}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssign={onAssign}
          onClick={onClick}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AttendeeTabs;
