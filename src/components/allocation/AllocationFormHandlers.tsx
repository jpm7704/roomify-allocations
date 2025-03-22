
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Allocation } from '@/components/AllocationCard';

export const useAllocationFormHandlers = (
  rooms: Room[],
  people: Person[],
  allocations: Allocation[],
  selectedPerson: Person | null,
  setSelectedPerson: (person: Person | null) => void,
  selectedRoom: Room | null,
  setSelectedRoom: (room: Room | null) => void,
  selectedPeople: Person[],
  setSelectedPeople: (people: Person[]) => void,
  multiSelectMode: boolean,
  setMultiSelectMode: (mode: boolean) => void,
  setAllocations: (allocations: Allocation[]) => void,
  setRooms: (rooms: Room[]) => void,
  setPeople: (people: Person[]) => void,
  setIsDialogOpen: (open: boolean) => void,
  onFetchData: () => void
) => {
  const form = useForm({
    defaultValues: {
      notes: '',
    },
  });

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
        
        onFetchData();

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
          type: selectedRoom.type || 'Chalet'
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

  return {
    form,
    handlePersonSelect,
    handleMultiPersonSelect,
    handleRoomSelect,
    handleSaveAllocation
  };
};
