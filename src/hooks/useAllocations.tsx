
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Allocation } from '@/components/AllocationCard';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';

export const useAllocations = (roomIdFromUrl: string | null) => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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
            accommodation_rooms!inner(id, name, capacity, occupied, floor, building)
          `);

        if (allocationsError && allocationsError.code !== 'PGRST116') throw allocationsError;

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

        if (roomIdFromUrl && formattedRooms.length > 0) {
          const roomToSelect = formattedRooms.find(room => room.id === roomIdFromUrl);
          if (roomToSelect) {
            setSelectedRoom(roomToSelect);
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

  // Helper function to filter allocations based on search query
  const filterAllocations = (query: string) => {
    return allocations.filter(allocation => {
      return (
        allocation.person.name.toLowerCase().includes(query.toLowerCase()) ||
        allocation.person.email.toLowerCase().includes(query.toLowerCase()) ||
        allocation.person.department?.toLowerCase().includes(query.toLowerCase()) ||
        allocation.room.name.toLowerCase().includes(query.toLowerCase()) ||
        allocation.room.building?.toLowerCase().includes(query.toLowerCase())
      );
    });
  };

  // Handle allocation removal
  const removeAllocation = async (allocationId: string) => {
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

  // Handle room creation
  const createRoom = async (values: any) => {
    try {
      if (!values.name || !values.capacity) {
        toast.error("Room name and capacity are required");
        return false;
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
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
      return false;
    }
  };

  // Handle allocation creation or update
  const saveAllocation = async (
    selectedPerson: Person | null, 
    selectedRoom: Room | null, 
    notes: string, 
    selectedPeople: Person[] = [], 
    multiSelectMode: boolean = false
  ) => {
    // Handle multi-select mode
    if (multiSelectMode && selectedPeople.length > 0 && selectedRoom) {
      try {
        if (selectedPeople.length > (selectedRoom.capacity - selectedRoom.occupied)) {
          toast.error(`This room only has space for ${selectedRoom.capacity - selectedRoom.occupied} more people`);
          return false;
        }

        let totalNewAllocations = 0;
        let totalUpdatedAllocations = 0;
        
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
            accommodation_rooms!inner(id, name, capacity, occupied, floor, building)
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
            description: room.description
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
        return true;
      } catch (error) {
        console.error("Error processing batch allocations:", error);
        toast.error("Failed to save room allocations");
        return false;
      }
    }

    // Handle single allocation
    if (!selectedPerson || !selectedRoom) {
      toast.error("Please select both a person and a room");
      return false;
    }

    if (selectedRoom.occupied >= selectedRoom.capacity) {
      toast.error("This room is already at full capacity");
      return false;
    }

    try {
      const { error } = await supabase
        .from('room_allocations')
        .insert({
          person_id: selectedPerson.id,
          room_id: selectedRoom.id,
          notes: notes,
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
        notes: notes,
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
          building: selectedRoom.building
        }
      };

      setAllocations([...allocations, newAllocation]);
      setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, occupied: r.occupied + 1 } : r));
      setPeople(people.map(p => p.id === selectedPerson.id ? { ...p, roomId: selectedRoom.id, roomName: selectedRoom.name } : p));

      toast.success(`${selectedPerson.name} has been assigned to ${selectedRoom.name}`);
      return true;
    } catch (error) {
      console.error("Error creating/updating allocation:", error);
      toast.error("Failed to save room allocation");
      return false;
    }
  };

  return { 
    allocations, 
    people, 
    rooms, 
    loading, 
    selectedRoom,
    filterAllocations, 
    removeAllocation, 
    createRoom, 
    saveAllocation, 
    setAllocations,
    setPeople,
    setRooms 
  };
};
