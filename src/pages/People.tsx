
import { useState, useEffect } from 'react';
import { UserRound, Plus, Search, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import PersonCard, { Person } from '@/components/PersonCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

const People = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      homeChurch: 'Harare City Centre Church',
      specialNeeds: ''
    }
  });

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch people
        const { data: peopleData, error: peopleError } = await supabase
          .from('women_attendees')
          .select('*');

        if (peopleError) throw peopleError;

        // Fetch allocations to get roomId and roomName
        const { data: allocationsData, error: allocationsError } = await supabase
          .from('room_allocations')
          .select(`
            person_id,
            accommodation_rooms(id, name)
          `);

        if (allocationsError) throw allocationsError;

        // Transform data to match component props
        const formattedPeople: Person[] = peopleData.map(person => {
          // Find allocation for this person
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
  
  // Filter people based on search query and active tab
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
  
  const handleEditPerson = (person: Person) => {
    form.reset({
      name: person.name,
      email: person.email || '',
      phone: '', // We don't have this in the component state
      department: person.department || '',
      homeChurch: 'Harare City Centre Church',
      specialNeeds: ''
    });
    // We would also store the ID for the update
    // This would need to be implemented
    setIsDialogOpen(true);
  };
  
  const handleDeletePerson = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('women_attendees')
        .delete()
        .eq('id', personId);

      if (error) throw error;

      // Update local state
      setPeople(people.filter(p => p.id !== personId));
      toast.success(`Person deleted successfully`);
    } catch (error) {
      console.error("Error deleting person:", error);
      toast.error("Failed to delete person");
    }
  };
  
  const handleAssignPerson = (person: Person) => {
    // Navigate to allocations page
    window.location.href = `/allocations`;
    toast.info(`Navigate to allocations to assign ${person.name} to a room`);
  };
  
  const handlePersonClick = (person: Person) => {
    toast.info(`Viewing person: ${person.name}`);
  };

  const handleAddPerson = async () => {
    try {
      const values = form.getValues();
      
      const { data, error } = await supabase
        .from('women_attendees')
        .insert({
          name: values.name,
          email: values.email,
          phone: values.phone,
          department: values.department,
          home_church: values.homeChurch,
          special_needs: values.specialNeeds
        })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Add the new person to the state
        const newPerson: Person = {
          id: data[0].id,
          name: data[0].name,
          email: data[0].email || '',
          department: data[0].department || data[0].home_church || '',
        };
        
        setPeople([...people, newPerson]);
        toast.success("Person added successfully");
        setIsDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Error adding person:", error);
      toast.error("Failed to add person");
    }
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
          
          <Button className="rounded-md" onClick={() => {
            form.reset({
              name: '',
              email: '',
              phone: '',
              department: '',
              homeChurch: 'Harare City Centre Church',
              specialNeeds: ''
            });
            setIsDialogOpen(true);
          }}>
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-medium">Loading attendees...</h3>
              </div>
            ) : filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No attendees found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'There are no women attendees added yet'}
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-medium">Loading attendees...</h3>
              </div>
            ) : filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No assigned attendees</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'There are no women assigned to rooms yet'}
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-medium">Loading attendees...</h3>
              </div>
            ) : filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No unassigned attendees</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 'Try adjusting your search query' : 'All women are currently assigned to rooms'}
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Attendee</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department/Ministry (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Women's Ministry, Dorcas, etc." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="homeChurch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Church</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specialNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Needs (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Any special requirements" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddPerson}>Save Attendee</Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default People;
