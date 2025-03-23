import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Person } from '@/components/PersonCard';
import { Room } from '@/components/RoomCard';
import { Allocation } from '@/components/AllocationCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSmsNotification } from '@/hooks/useSmsNotification';

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
  
  const { user } = useAuth();
  const { sendAllocationSms } = useSmsNotification();

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleMultiPersonSelect = (person: Person, selected: boolean) => {
    if (selected) {
      setSelectedPeople([...selectedPeople, person]);
    } else {
      setSelectedPeople(selectedPeople.filter(p => p.id !== person.id));
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

  const sendSmsNotifications = async (peopleToNotify: Person[], roomName: string, roomType: string) => {
    for (const person of peopleToNotify) {
      // Fetch the phone number for the person
      try {
        const { data, error } = await supabase
          .from('women_attendees')
          .select('phone')
          .eq('id', person.id)
          .single();
          
        if (error) {
          console.error(`Error fetching phone for ${person.name}:`, error);
          continue;
        }
        
        if (data && data.phone) {
          await sendAllocationSms(data.phone, person.name, roomName, roomType);
        } else {
          console.log(`No phone number available for ${person.name}, skipping SMS notification`);
        }
      } catch (error) {
        console.error(`Failed to send notification to ${person.name}:`, error);
      }
    }
  };

  const handleSaveAllocation = async () => {
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    if (multiSelectMode && selectedPeople.length > 0 && selectedRoom) {
      try {
        if (selectedPeople.length > (selectedRoom.capacity - selectedRoom.occupied)) {
          toast.error(`This room only has space for ${selectedRoom.capacity - selectedRoom.occupied} more people`);
          return;
        }

        let totalNewAllocations = 0;
        let totalUpdatedAllocations = 0;
        const notes = form.getValues().notes;
        
        // Keep track of the newly allocated people for sending SMS
        const peopleToNotify: Person[] = [];
        
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
              .eq('id', existingAllocation.id)
              .eq('user_id', user.id);

            if (error) throw error;

            if (existingAllocation.roomId !== selectedRoom.id) {
              await supabase
                .from('accommodation_rooms')
                .update({ occupied: existingAllocation.room.occupied - 1 })
                .eq('id', existingAllocation.roomId)
                .eq('user_id', user.id);
              
              totalUpdatedAllocations++;
              peopleToNotify.push(person);
            }
          } else {
            const { error } = await supabase
              .from('room_allocations')
              .insert({
                person_id: person.id,
                room_id: selectedRoom.id,
                notes: notes,
                date_assigned: new Date().toISOString(),
                user_id: user.id
              });

            if (error) throw error;
            totalNewAllocations++;
            peopleToNotify.push(person);
          }
        }
        
        const newOccupancy = selectedRoom.occupied + totalNewAllocations + totalUpdatedAllocations;
        await supabase
          .from('accommodation_rooms')
          .update({ occupied: newOccupancy })
          .eq('id', selectedRoom.id)
          .eq('user_id', user.id);
        
        // Send SMS notifications to all newly allocated people
        if (peopleToNotify.length > 0) {
          sendSmsNotifications(peopleToNotify, selectedRoom.name, selectedRoom.type || 'Chalet');
        }
        
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
          date_assigned: new Date().toISOString(),
          user_id: user.id
        })
        .select();

      if (error) throw error;

      const { error: roomError } = await supabase
        .from('accommodation_rooms')
        .update({ occupied: selectedRoom.occupied + 1 })
        .eq('id', selectedRoom.id)
        .eq('user_id', user.id);

      if (roomError) throw roomError;

      const idResponse = await supabase
        .from('room_allocations')
        .select('id')
        .eq('person_id', selectedPerson.id)
        .eq('room_id', selectedRoom.id)
        .eq('user_id', user.id)
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

      // Send SMS notification for the new allocation
      sendSmsNotifications([selectedPerson], selectedRoom.name, selectedRoom.type || 'Chalet');

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
