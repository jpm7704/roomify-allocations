
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Person } from '@/components/PersonCard';
import { Allocation } from '@/components/AllocationCard';
import { updateRoomOccupancy } from '../rooms/roomService';
import { refreshAllocationData } from '../core/allocationService';

// Remove an allocation from Supabase
export const removeAllocationFromSupabase = async (allocationId: string, roomId: string, currentOccupied: number) => {
  try {
    const { error } = await supabase
      .from('room_allocations')
      .delete()
      .eq('id', allocationId);

    if (error) throw error;

    // Update room occupancy
    await updateRoomOccupancy(roomId, currentOccupied - 1);
    
    return true;
  } catch (error) {
    console.error("Error removing allocation:", error);
    toast.error("Failed to remove allocation");
    throw error;
  }
};

// Create a single allocation in Supabase
export const createSingleAllocationInSupabase = async (
  personId: string,
  roomId: string,
  notes: string,
  currentOccupied: number
) => {
  try {
    const { error } = await supabase
      .from('room_allocations')
      .insert({
        person_id: personId,
        room_id: roomId,
        notes: notes,
        date_assigned: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    // Update room occupancy
    await updateRoomOccupancy(roomId, currentOccupied + 1);

    const idResponse = await supabase
      .from('room_allocations')
      .select('id')
      .eq('person_id', personId)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    return idResponse.data?.id || null;
  } catch (error) {
    console.error("Error creating allocation:", error);
    toast.error("Failed to save room allocation");
    throw error;
  }
};

// Update allocation in Supabase (for batch operations)
export const processMultipleAllocations = async (
  selectedPeople: Person[],
  selectedRoomId: string,
  notes: string,
  currentAllocations: Allocation[]
) => {
  try {
    let totalNewAllocations = 0;
    let totalUpdatedAllocations = 0;
    
    for (const person of selectedPeople) {
      const existingAllocation = currentAllocations.find(a => a.personId === person.id);
      
      if (existingAllocation) {
        const { error } = await supabase
          .from('room_allocations')
          .update({ 
            room_id: selectedRoomId,
            notes: notes,
            date_assigned: new Date().toISOString()
          })
          .eq('id', existingAllocation.id);

        if (error) throw error;

        if (existingAllocation.roomId !== selectedRoomId) {
          await updateRoomOccupancy(existingAllocation.roomId, existingAllocation.room.occupied - 1);
          totalUpdatedAllocations++;
        }
      } else {
        const { error } = await supabase
          .from('room_allocations')
          .insert({
            person_id: person.id,
            room_id: selectedRoomId,
            notes: notes,
            date_assigned: new Date().toISOString()
          });

        if (error) throw error;
        totalNewAllocations++;
      }
    }
    
    return { totalNewAllocations, totalUpdatedAllocations };
  } catch (error) {
    console.error("Error processing batch allocations:", error);
    toast.error("Failed to save room allocations");
    throw error;
  }
};
