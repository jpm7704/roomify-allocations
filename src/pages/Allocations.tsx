import { useState, useEffect } from 'react';
import { Plus, Search, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AllocationsList from '@/components/AllocationsList';
import AllocationFormDialog from '@/components/AllocationFormDialog';
import RoomFormDialog from '@/components/RoomFormDialog';
import { useForm } from 'react-hook-form';

const Allocations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      notes: '',
    },
  });

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from('accommodation_rooms')
          .select('*');

        if (roomsError) throw roomsError;

        // Fetch people
        const { data: peopleData, error: peopleError } = await supabase
          .from('women_attendees')
          .select('*');

        if (peopleError) throw peopleError;

        // Fetch allocations with person and room details
        const { data: allocationsData, error: allocationsError } = await supabase
          .from('room_allocations')
          .select(`
            id,
            date_assigned,
            notes,
            person_id,
            room_id,
            women_attendees!inner(id, name, email, phone, department, home_church),
            accommodation_rooms!inner(id, name, capacity, occupied, floor, building)
          `);

        // It's okay if we don't have allocations yet
        if (allocationsError && allocationsError.code !== 'PGRST116') throw allocationsError;

        // Transform data to match component props
        const formattedRooms: Room[] = roomsData?.map(room => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          occupied: room.occupied || 0,
          floor: room.floor,
          building: room.building,
          description: room.description
        })) || [];

        const formattedPeople: Person[] = peopleData?.map(person => {
          // Find allocation for this person
          const allocation = allocationsData?.find(a => a.person_id === person.id);
          return {
            id: person.id,
            name: person.name,
            email: person.email || '',
            department: person.department || person.home_church || '',
            roomId: allocation ? allocation.room_id : undefined,
            roomName: allocation ? allocation.accommodation_rooms.name : undefined
          };
        }) || [];

        const formattedAllocations: Allocation[] = allocationsData?.map(allocation => {
          const person: Person = {
            id: allocation.person_id,
            name: allocation.women_attendees.name,
            email: allocation.women_attendees.email || '',
            department: allocation.women_attendees.department || allocation.women_attendees.home_church || '',
            roomId: allocation.room_id,
            roomName: allocation.accommodation_rooms.name
          };

          const room: Room = {
            id: allocation.room_id,
            name: allocation.accommodation_rooms.name,
            capacity: allocation.accommodation_rooms.capacity,
            occupied: allocation.accommodation_rooms.occupied || 0,
            floor: allocation.accommodation_rooms.floor,
            building: allocation.accommodation_rooms.building
          };

          return {
            id: allocation.id,
            personId: allocation.person_id,
            roomId: allocation.room_id,
            person,
            room,
            dateAssigned: allocation.date_assigned,
            notes: allocation.notes
          };
        }) || [];

        setRooms(formattedRooms);
        setPeople(formattedPeople);
        setAllocations(formattedAllocations);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter allocations based on search query
  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = 
      allocation.person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.person.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.room.building?.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  });

  const handleCreateAllocation = () => {
    // Open dialog for creating a new allocation
    setSelectedPerson(null);
    setSelectedRoom(null);
    form.reset({ notes: '' });
    setIsDialogOpen(true);
  };
  
  const handleRemoveAllocation = async (allocationId: string) => {
    try {
      const { error } = await supabase
        .from('room_allocations')
        .delete()
        .eq('id', allocationId);

      if (error) throw error;

      // Update the occupied count in the room
      const allocation = allocations.find(a => a.id === allocationId);
      if (allocation) {
        const { error: roomError } = await supabase
          .from('accommodation_rooms')
          .update({ occupied: allocation.room.occupied - 1 })
          .eq('id', allocation.roomId);

        if (roomError) throw roomError;
      }

      // Update local state
      setAllocations(allocations.filter(a => a.id !== allocationId));
      
      // Update the room and person data
      const updatedRooms = [...rooms];
      const roomIndex = updatedRooms.findIndex(r => r.id === allocation?.roomId);
      if (roomIndex >= 0) {
        updatedRooms[roomIndex] = {
          ...updatedRooms[roomIndex],
          occupied: updatedRooms[roomIndex].occupied - 1
        };
      }
      setRooms(updatedRooms);

      const updatedPeople = people.map(p => 
        p.id === allocation?.personId 
          ? { ...p, roomId: undefined, roomName: undefined } 
          : p
      );
      setPeople(updatedPeople);

      toast.success('Room allocation removed successfully');
    } catch (error) {
      console.error("Error removing allocation:", error);
      toast.error("Failed to remove allocation");
    }
  };
  
  const handleAllocationClick = (allocation: Allocation) => {
    toast.info(`Viewing allocation for ${allocation.person.name} in ${allocation.room.name}`);
  };

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleCreateRoom = () => {
    setIsRoomDialogOpen(true);
  };

  const handleCancelRoomDialog = () => {
    setIsRoomDialogOpen(false);
  };

  const handleSaveRoom = async (values: any) => {
    try {
      if (!values.name || !values.capacity) {
        toast.error("Room name and capacity are required");
        return;
      }

      const { data, error } = await supabase
        .from('accommodation_rooms')
        .insert({
          name: values.name,
          capacity: parseInt(values.capacity),
          building: values.building || 'Main Building',
          floor: values.floor || '1',
          description: values.description,
          occupied: 0
        })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newRoom: Room = {
          id: data[0].id,
          name: data[0].name,
          capacity: data[0].capacity,
          occupied: 0,
          floor: data[0].floor || '1',
          building: data[0].building || 'Main Building',
          description: data[0].description
        };

        setRooms([...rooms, newRoom]);
        toast.success(`Room "${values.name}" created successfully`);
        setIsRoomDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
    }
  };

  const handleSaveAllocation = async () => {
    if (!selectedPerson || !selectedRoom) {
      toast.error("Please select both a person and a room");
      return;
    }

    if (selectedRoom.occupied >= selectedRoom.capacity) {
      toast.error("This room is already at full capacity");
      return;
    }

    try {
      // Check if person is already allocated
      const existingAllocation = allocations.find(a => a.personId === selectedPerson.id);
      if (existingAllocation) {
        // Update existing allocation
        const { error } = await supabase
          .from('room_allocations')
          .update({ 
            room_id: selectedRoom.id,
            notes: form.getValues().notes,
            date_assigned: new Date().toISOString()
          })
          .eq('id', existingAllocation.id);

        if (error) throw error;

        // Update old room occupancy (decrease)
        await supabase
          .from('accommodation_rooms')
          .update({ occupied: existingAllocation.room.occupied - 1 })
          .eq('id', existingAllocation.roomId);

        // Update new room occupancy (increase)
        await supabase
          .from('accommodation_rooms')
          .update({ occupied: selectedRoom.occupied + 1 })
          .eq('id', selectedRoom.id);

      } else {
        // Create new allocation
        const { data, error } = await supabase
          .from('room_allocations')
          .insert({
            person_id: selectedPerson.id,
            room_id: selectedRoom.id,
            notes: form.getValues().notes,
            date_assigned: new Date().toISOString()
          })
          .select();

        if (error) throw error;

        // Update room occupancy
        await supabase
          .from('accommodation_rooms')
          .update({ occupied: selectedRoom.occupied + 1 })
          .eq('id', selectedRoom.id);
      }

      // Refresh data
      const { data: freshAllocation, error: refreshError } = await supabase
        .from('room_allocations')
        .select(`
          id,
          date_assigned,
          notes,
          person_id,
          room_id,
          women_attendees!inner(id, name, email, phone, department, home_church),
          accommodation_rooms!inner(id, name, capacity, occupied, floor, building)
        `)
        .eq('person_id', selectedPerson.id);

      if (refreshError) throw refreshError;

      if (freshAllocation && freshAllocation.length > 0) {
        // Update state with the new allocation
        const updatedRooms = rooms.map(r => {
          if (r.id === selectedRoom.id) {
            return { ...r, occupied: r.occupied + 1 };
          }
          // If this was a reassignment, decrease the old room's occupancy
          if (existingAllocation && r.id === existingAllocation.roomId) {
            return { ...r, occupied: r.occupied - 1 };
          }
          return r;
        });

        const updatedPeople = people.map(p => {
          if (p.id === selectedPerson.id) {
            return { 
              ...p, 
              roomId: selectedRoom.id, 
              roomName: selectedRoom.name 
            };
          }
          return p;
        });

        // Add or update the allocation in the allocations list
        const newAllocation: Allocation = {
          id: freshAllocation[0].id,
          personId: selectedPerson.id,
          roomId: selectedRoom.id,
          dateAssigned: freshAllocation[0].date_assigned,
          notes: freshAllocation[0].notes,
          person: {
            ...selectedPerson,
            roomId: selectedRoom.id,
            roomName: selectedRoom.name
          },
          room: {
            ...selectedRoom,
            occupied: selectedRoom.occupied + 1
          }
        };

        if (existingAllocation) {
          // Replace the existing allocation
          setAllocations(allocations.map(a => 
            a.personId === selectedPerson.id ? newAllocation : a
          ));
        } else {
          // Add the new allocation
          setAllocations([...allocations, newAllocation]);
        }

        setRooms(updatedRooms);
        setPeople(updatedPeople);

        toast.success(`${selectedPerson.name} has been assigned to ${selectedRoom.name}`);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating/updating allocation:", error);
      toast.error("Failed to save room allocation");
    }
  };

  const handleCancelAllocationDialog = () => {
    setIsDialogOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Room Allocations</h1>
            <p className="text-muted-foreground mt-1">
              SDA Women's Ministry Camp Meeting - Harare City Centre Church
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="rounded-md" onClick={handleCreateRoom}>
              <Building className="mr-2 h-4 w-4" />
              Add Room
            </Button>
            <Button className="rounded-md" onClick={handleCreateAllocation}>
              <Plus className="mr-2 h-4 w-4" />
              New Allocation
            </Button>
          </div>
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
          <AllocationsList
            loading={loading}
            allocations={filteredAllocations}
            searchQuery={searchQuery}
            onRemove={handleRemoveAllocation}
            onClick={handleAllocationClick}
            onCreateRoom={handleCreateRoom}
            onCreateAllocation={searchQuery ? handleClearSearch : handleCreateAllocation}
            hasRooms={rooms.length > 0}
          />
        </div>

        {/* Allocation Dialog */}
        <AllocationFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          people={people}
          rooms={rooms}
          selectedPerson={selectedPerson}
          selectedRoom={selectedRoom}
          onPersonSelect={handlePersonSelect}
          onRoomSelect={handleRoomSelect}
          onSave={handleSaveAllocation}
          onCancel={handleCancelAllocationDialog}
          onCreateRoom={handleCreateRoom}
        />

        {/* Room Creation Dialog */}
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

export default Allocations;
