import { useState, useEffect } from 'react';
import { Plus, Search, Building, Trash2 } from 'lucide-react';
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
import AllocationDetailsDialog from '@/components/AllocationDetailsDialog';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Allocations = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomIdFromUrl = searchParams.get('roomId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [viewedAllocation, setViewedAllocation] = useState<Allocation | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      notes: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: roomsData, error: roomsError } = await supabase
          .from('accommodation_rooms')
          .select('*');

        if (roomsError) throw roomsError;

        const { data: peopleData, error: peopleError } = await supabase
          .from('women_attendees')
          .select('*');

        if (peopleError) throw peopleError;

        const { data: allocationsData, error: allocationsError } = await supabase
          .from('room_allocations')
          .select(`
            id,
            date_assigned,
            notes,
            person_id,
            room_id,
            women_attendees!inner(id, name, email, phone, department, home_church),
            accommodation_rooms!inner(id, name, capacity, occupied, floor, building, type)
          `);

        if (allocationsError && allocationsError.code !== 'PGRST116') throw allocationsError;

        const formattedRooms: Room[] = roomsData?.map(room => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          occupied: room.occupied || 0,
          floor: room.floor,
          building: room.building,
          description: room.description,
          type: room.type || 'Hotel'
        })) || [];

        const formattedPeople: Person[] = peopleData?.map(person => {
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
            building: allocation.accommodation_rooms.building,
            type: allocation.accommodation_rooms.type || 'Hotel'
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

        if (roomIdFromUrl && formattedRooms.length > 0) {
          const roomToSelect = formattedRooms.find(room => room.id === roomIdFromUrl);
          if (roomToSelect) {
            setSelectedRoom(roomToSelect);
            if (roomToSelect.capacity > 1 && roomToSelect.capacity - roomToSelect.occupied > 1) {
              setMultiSelectMode(true);
            }
            setIsDialogOpen(true);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomIdFromUrl]);

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
    setSelectedPerson(null);
    setSelectedRoom(null);
    setSelectedPeople([]);
    form.reset({ notes: '' });
    
    const hasMultiCapacityRooms = rooms.some(room => room.capacity > 1 && room.occupied < room.capacity);
    setMultiSelectMode(hasMultiCapacityRooms);
    
    setIsDialogOpen(true);
  };
  
  const handleRemoveAllocation = async (allocationId: string) => {
    try {
      const { error } = await supabase
        .from('room_allocations')
        .delete()
        .eq('id', allocationId);

      if (error) throw error;

      const allocation = allocations.find(a => a.id === allocationId);
      if (allocation) {
        const { error: roomError } = await supabase
          .from('accommodation_rooms')
          .update({ occupied: allocation.room.occupied - 1 })
          .eq('id', allocation.roomId);

        if (roomError) throw roomError;
      }

      setAllocations(allocations.filter(a => a.id !== allocationId));
      
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
    setViewedAllocation(allocation);
    setIsDetailsDialogOpen(true);
  };

  const handleEditAllocation = (allocation: Allocation) => {
    setSelectedPerson(allocation.person);
    setSelectedRoom(allocation.room);
    setSelectedPeople([]);
    form.reset({ notes: allocation.notes || '' });
    setMultiSelectMode(false);
    setIsDialogOpen(true);
  };

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleMultiPersonSelect = (person: Person, selected: boolean) => {
    if (selected) {
      setSelectedPeople(prev => [...prev, person]);
    } else {
      setSelectedPeople(prev => prev.filter(p => p.id !== person.id));
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    
    if (room.capacity > 1 && room.capacity - room.occupied > 1) {
      setMultiSelectMode(true);
      setSelectedPeople([]);
    } else {
      setMultiSelectMode(false);
    }
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
          type: values.type || 'Hotel',
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
          description: data[0].description,
          type: data[0].type || 'Hotel'
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
    if (multiSelectMode && selectedPeople.length > 0 && selectedRoom) {
      try {
        if (selectedPeople.length > (selectedRoom.capacity - selectedRoom.occupied)) {
          toast.error(`This room only has space for ${selectedRoom.capacity - selectedRoom.occupied} more people`);
          return;
        }

        let totalNewAllocations = 0;
        let totalUpdatedAllocations = 0;
        const notes = form.getValues().notes;
        
        for (const person of selectedPeople) {
          const existingAllocation = allocations.find(a => a.personId === person.id);
          
          if (existingAllocation) {
            const { error } = await supabase
              .from('room_allocations')
              .update({ 
                room_id: selectedRoom.id,
                notes: notes,
                date_assigned: new Date().toISOString()
              })
              .eq('id', existingAllocation.id);

            if (error) throw error;

            if (existingAllocation.roomId !== selectedRoom.id) {
              await supabase
                .from('accommodation_rooms')
                .update({ occupied: existingAllocation.room.occupied - 1 })
                .eq('id', existingAllocation.roomId);
              
              totalUpdatedAllocations++;
            }
          } else {
            const { error } = await supabase
              .from('room_allocations')
              .insert({
                person_id: person.id,
                room_id: selectedRoom.id,
                notes: notes,
                date_assigned: new Date().toISOString()
              });

            if (error) throw error;
            totalNewAllocations++;
          }
        }
        
        const newOccupancy = selectedRoom.occupied + totalNewAllocations + totalUpdatedAllocations;
        await supabase
          .from('accommodation_rooms')
          .update({ occupied: newOccupancy })
          .eq('id', selectedRoom.id);
        
        const { data: freshData, error: refreshError } = await supabase
          .from('room_allocations')
          .select(`
            id,
            date_assigned,
            notes,
            person_id,
            room_id,
            women_attendees!inner(id, name, email, phone, department, home_church),
            accommodation_rooms!inner(id, name, capacity, occupied, floor, building, type)
          `);

        if (refreshError) throw refreshError;

        if (freshData) {
          const { data: updatedRooms } = await supabase
            .from('accommodation_rooms')
            .select('*');

          const updatedFormattedRooms: Room[] = updatedRooms?.map(room => ({
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            occupied: room.occupied || 0,
            floor: room.floor,
            building: room.building,
            description: room.description,
            type: room.type || 'Hotel'
          })) || [];

          const updatedFormattedAllocations: Allocation[] = freshData.map((allocation: any) => {
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
              building: allocation.accommodation_rooms.building,
              type: allocation.accommodation_rooms.type || 'Hotel'
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
          });

          const updatedPeople = people.map(person => {
            const allocation = freshData.find((a: any) => a.person_id === person.id);
            if (allocation) {
              return {
                ...person,
                roomId: allocation.room_id,
                roomName: allocation.accommodation_rooms.name
              };
            }
            return person;
          });

          setRooms(updatedFormattedRooms);
          setAllocations(updatedFormattedAllocations);
          setPeople(updatedPeople);
        }

        let successMessage = '';
        if (totalNewAllocations > 0 && totalUpdatedAllocations > 0) {
          successMessage = `Assigned ${totalNewAllocations} new and updated ${totalUpdatedAllocations} existing allocations to ${selectedRoom.name}`;
        } else if (totalNewAllocations > 0) {
          successMessage = `Assigned ${totalNewAllocations} attendees to ${selectedRoom.name}`;
        } else {
          successMessage = `Updated room assignments to ${selectedRoom.name}`;
        }

        toast.success(successMessage);
        setIsDialogOpen(false);
        setSelectedPeople([]);

      } catch (error) {
        console.error("Error processing batch allocations:", error);
        toast.error("Failed to save room allocations");
      }
      
      return;
    }

    if (!selectedPerson || !selectedRoom) {
      toast.error("Please select both a person and a room");
      return;
    }

    if (selectedRoom.occupied >= selectedRoom.capacity) {
      toast.error("This room is already at full capacity");
      return;
    }

    try {
      const { error } = await supabase
        .from('room_allocations')
        .insert({
          person_id: selectedPerson.id,
          room_id: selectedRoom.id,
          notes: form.getValues().notes,
          date_assigned: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      const { error: roomError } = await supabase
        .from('accommodation_rooms')
        .update({ occupied: selectedRoom.occupied + 1 })
        .eq('id', selectedRoom.id);

      if (roomError) throw roomError;

      const idResponse = await supabase
        .from('room_allocations')
        .select('id')
        .eq('person_id', selectedPerson.id)
        .eq('room_id', selectedRoom.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      const newAllocationId = idResponse.data?.id;

      const newAllocation: Allocation = {
        id: newAllocationId || crypto.randomUUID(),
        personId: selectedPerson.id,
        roomId: selectedRoom.id,
        dateAssigned: new Date().toISOString(),
        notes: form.getValues().notes,
        person: {
          id: selectedPerson.id,
          name: selectedPerson.name,
          email: selectedPerson.email || '',
          department: selectedPerson.department || '',
          roomId: selectedRoom.id,
          roomName: selectedRoom.name
        },
        room: {
          id: selectedRoom.id,
          name: selectedRoom.name,
          capacity: selectedRoom.capacity,
          occupied: selectedRoom.occupied + 1,
          floor: selectedRoom.floor,
          building: selectedRoom.building,
          type: selectedRoom.type || 'Hotel'
        }
      };

      setAllocations([...allocations, newAllocation]);
      setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, occupied: r.occupied + 1 } : r));
      setPeople(people.map(p => p.id === selectedPerson.id ? { ...p, roomId: selectedRoom.id, roomName: selectedRoom.name } : p));

      toast.success(`${selectedPerson.name} has been assigned to ${selectedRoom.name}`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating/updating allocation:", error);
      toast.error("Failed to save room allocation");
    }
  };

  const handleCancelAllocationDialog = () => {
    setIsDialogOpen(false);
    setSelectedPeople([]);
    
    if (roomIdFromUrl) {
      navigate('/allocations');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearAllData = async () => {
    try {
      setLoading(true);
      
      const { data: allAllocations, error: fetchError } = await supabase
        .from('room_allocations')
        .select('*');
        
      if (fetchError) throw fetchError;
      
      const { error: deleteError } = await supabase
        .from('room_allocations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (deleteError) throw deleteError;
      
      const roomUpdates = rooms.map(room => ({
        id: room.id,
        occupied: 0
      }));
      
      for (const roomUpdate of roomUpdates) {
        const { error: roomError } = await supabase
          .from('accommodation_rooms')
          .update({ occupied: 0 })
          .eq('id', roomUpdate.id);
          
        if (roomError) throw roomError;
      }
      
      setAllocations([]);
      const updatedRooms = rooms.map(room => ({
        ...room,
        occupied: 0
      }));
      setRooms(updatedRooms);
      
      const updatedPeople = people.map(person => ({
        ...person,
        roomId: undefined,
        roomName: undefined
      }));
      setPeople(updatedPeople);
      
      toast.success('All allocation data has been cleared');
      setIsAlertDialogOpen(false);
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Failed to clear allocation data");
    } finally {
      setLoading(false);
    }
  };
  
  const confirmClearAll = () => {
    setIsAlertDialogOpen(true);
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
            onClearAll={confirmClearAll}
            hasRooms={rooms.length > 0}
          />
        </div>

        <AllocationFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          people={people.filter(p => 
            multiSelectMode 
              ? (!p.roomId || (selectedRoom && p.roomId === selectedRoom.id))
              : true
          )}
          rooms={rooms}
          selectedPerson={selectedPerson}
          selectedRoom={selectedRoom}
          onPersonSelect={handlePersonSelect}
          onRoomSelect={handleRoomSelect}
          onSave={handleSaveAllocation}
          onCancel={handleCancelAllocationDialog}
          onCreateRoom={handleCreateRoom}
          selectedPeople={selectedPeople}
          onMultiPersonSelect={handleMultiPersonSelect}
          multiSelectMode={multiSelectMode}
        />

        <RoomFormDialog
          isOpen={isRoomDialogOpen}
          onOpenChange={setIsRoomDialogOpen}
          onSave={handleSaveRoom}
          onCancel={handleCancelRoomDialog}
        />

        <AllocationDetailsDialog
          allocation={viewedAllocation}
          isOpen={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          onDelete={handleRemoveAllocation}
          onEdit={handleEditAllocation}
        />
        
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove all room allocations and reset room occupancy counts to zero. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Clear All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Allocations;
