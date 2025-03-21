import { useState, useEffect } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { Person } from '@/components/PersonCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AttendeeForm from '@/components/AttendeeForm';
import AttendeeTabs from '@/components/AttendeeTabs';
import { useNavigate } from 'react-router-dom';

const People = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<Person | undefined>(undefined);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: peopleData, error: peopleError } = await supabase
          .from('women_attendees')
          .select('*');

        if (peopleError) throw peopleError;

        const { data: allocationsData, error: allocationsError } = await supabase
          .from('room_allocations')
          .select(`
            person_id,
            accommodation_rooms(id, name)
          `);

        if (allocationsError) throw allocationsError;

        const formattedPeople: Person[] = peopleData.map(person => {
          const allocation = allocationsData.find(a => a.person_id === person.id);
          
          return {
            id: person.id,
            name: person.name,
            email: person.email || '',
            department: person.department || person.home_church || '',
            roomId: allocation ? allocation.accommodation_rooms.id : undefined,
            roomName: allocation ? allocation.accommodation_rooms.name : undefined
          };
        });

        setPeople(formattedPeople);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const filteredPeople = people.filter(person => {
    const matchesSearch = 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.department?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'assigned') return matchesSearch && !!person.roomId;
    if (activeTab === 'unassigned') return matchesSearch && !person.roomId;
    
    return matchesSearch;
  });
  
  const allPeopleCount = people.length;
  const assignedPeopleCount = people.filter(person => !!person.roomId).length;
  const unassignedPeopleCount = people.filter(person => !person.roomId).length;
  
  const handleOpenAddDialog = () => {
    setFormMode('add');
    setCurrentPerson(undefined);
    setIsDialogOpen(true);
  };
  
  const handleEditPerson = (person: Person) => {
    setFormMode('edit');
    setCurrentPerson(person);
    setIsDialogOpen(true);
  };
  
  const handleDeletePerson = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('women_attendees')
        .delete()
        .eq('id', personId);

      if (error) throw error;

      setPeople(people.filter(p => p.id !== personId));
      toast.success(`Person deleted successfully`);
    } catch (error) {
      console.error("Error deleting person:", error);
      toast.error("Failed to delete person");
    }
  };
  
  const handleAssignPerson = (person: Person) => {
    navigate('/allocations');
  };
  
  const handlePersonClick = (person: Person) => {
    toast.info(`Viewing person: ${person.name}`);
  };

  const handleAddSuccess = (newPerson: Person) => {
    setPeople([...people, newPerson]);
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Women Attendees</h1>
            <p className="text-muted-foreground mt-1">
              SDA Women's Ministry Camp Meeting - Harare City Centre Church
            </p>
          </div>
          
          <Button className="rounded-md" onClick={handleOpenAddDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Attendee
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
        
        <AttendeeTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          allPeopleCount={allPeopleCount}
          assignedPeopleCount={assignedPeopleCount}
          unassignedPeopleCount={unassignedPeopleCount}
          loading={loading}
          filteredPeople={filteredPeople}
          searchQuery={searchQuery}
          onEdit={handleEditPerson}
          onDelete={handleDeletePerson}
          onAssign={handleAssignPerson}
          onClick={handlePersonClick}
        />

        <AttendeeForm 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleAddSuccess}
          initialData={currentPerson}
          mode={formMode}
        />
      </div>
    </Layout>
  );
};

export default People;
