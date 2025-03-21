
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const clearAllData = async () => {
  try {
    toast.info("Clearing all data...");

    // Step 1: Delete all room allocations first (due to foreign key constraints)
    const { error: allocationsError } = await supabase
      .from('room_allocations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (allocationsError) throw allocationsError;
    
    // Step 2: Update room occupancy counts to zero
    const { error: roomsUpdateError } = await supabase
      .from('accommodation_rooms')
      .update({ occupied: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (roomsUpdateError) throw roomsUpdateError;
    
    // Step 3: Delete all rooms
    const { error: roomsError } = await supabase
      .from('accommodation_rooms')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (roomsError) throw roomsError;
    
    // Step 4: Delete all women attendees
    const { error: peopleError } = await supabase
      .from('women_attendees')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (peopleError) throw peopleError;
    
    toast.success("All data has been cleared successfully!");
    
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error("Error clearing data:", error);
    toast.error("Failed to clear all data");
  }
};

const ClearDataButton = () => {
  return (
    <Button 
      variant="destructive" 
      onClick={clearAllData}
      className="mt-4"
    >
      Clear All Data
    </Button>
  );
};

export default ClearDataButton;
