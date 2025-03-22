
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AddPresetChalets from './AddPresetChalets';

interface RoomsHeaderProps {
  onAddRoom: () => void;
  onDataCleared?: () => void;
}

const RoomsHeader = ({ onAddRoom, onDataCleared }: RoomsHeaderProps) => {
  const { user } = useAuth();
  
  const handleClearAllData = async () => {
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    if (confirm("Are you sure you want to delete ALL accommodation data? This action cannot be undone.")) {
      try {
        // First, delete all allocations that reference rooms
        const { error: allocError } = await supabase
          .from('room_allocations')
          .delete()
          .eq('user_id', user.id);
          
        if (allocError) throw allocError;
        
        // Then delete all room records
        const { error: roomError } = await supabase
          .from('accommodation_rooms')
          .delete()
          .eq('user_id', user.id);
          
        if (roomError) throw roomError;
        
        toast.success("All accommodation data has been deleted");
        
        // Trigger refetch in parent component
        if (onDataCleared) {
          onDataCleared();
        }
      } catch (error) {
        console.error("Error clearing data:", error);
        toast.error("Failed to clear accommodation data");
      }
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accommodations</h1>
        <p className="text-muted-foreground mt-1">
          Manage and view all rooms and tents and their current occupancy
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="destructive" className="rounded-md" onClick={handleClearAllData}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Data
        </Button>
        
        <AddPresetChalets onDataAdded={onDataCleared || (() => {})} />
        
        <Button className="rounded-md" onClick={onAddRoom}>
          <Plus className="mr-2 h-4 w-4" />
          Add Accommodation
        </Button>
      </div>
    </div>
  );
};

export default RoomsHeader;
