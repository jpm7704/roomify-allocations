
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RoomFormInput } from '@/hooks/rooms/types';

interface AddPresetChaletsProps {
  onDataAdded: () => void;
}

// This component will add all predefined chalets to the database
const AddPresetChalets = ({ onDataAdded }: AddPresetChaletsProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const chaletData = [
    { number: '1', bedrooms: 3, bedSetup: [{ type: 'double', count: 3 }], capacity: 6 },
    { number: '2', bedrooms: 3, bedSetup: [{ type: 'twin', count: 3 }], capacity: 6 },
    { number: '3', bedrooms: 4, bedSetup: [{ type: 'double', count: 4 }], capacity: 8 },
    { number: '4', bedrooms: 3, bedSetup: [{ type: 'double', count: 3 }], capacity: 6 },
    { number: '5', bedrooms: 4, bedSetup: [{ type: 'double', count: 4 }], capacity: 8 },
    { number: '6', bedrooms: 3, bedSetup: [{ type: 'double', count: 2 }, { type: 'single', count: 2 }], capacity: 6 },
    { number: '7', bedrooms: 3, bedSetup: [{ type: 'double', count: 1 }, { type: 'single', count: 2 }], capacity: 4 },
    { number: '8', bedrooms: 2, bedSetup: [{ type: 'double', count: 2 }], capacity: 4 },
    { number: '9', bedrooms: 3, bedSetup: [{ type: 'double', count: 3 }], capacity: 6 },
    { number: '10', bedrooms: 3, bedSetup: [{ type: 'double', count: 2 }, { type: 'single', count: 1 }], capacity: 5 },
    { number: '11', bedrooms: 3, bedSetup: [{ type: 'double', count: 3 }], capacity: 6 },
    { number: '14', bedrooms: 4, bedSetup: [{ type: 'double', count: 4 }], capacity: 8 },
    { number: '15', bedrooms: 4, bedSetup: [{ type: 'double', count: 4 }], capacity: 8 },
    { number: '17', bedrooms: 3, bedSetup: [{ type: 'double', count: 3 }], capacity: 6 },
    { number: '18', bedrooms: 4, bedSetup: [{ type: 'double', count: 1 }, { type: 'single', count: 6 }], capacity: 8 },
    { number: '19', bedrooms: 3, bedSetup: [{ type: 'double', count: 1 }, { type: 'single', count: 4 }], capacity: 6 },
    { number: '20', bedrooms: 3, bedSetup: [{ type: 'double', count: 3 }], capacity: 6 },
    { number: '21', bedrooms: 3, bedSetup: [{ type: 'double', count: 1 }, { type: 'single', count: 4 }], capacity: 6 },
    { number: '22', bedrooms: 4, bedSetup: [{ type: 'single', count: 8 }], capacity: 8 },
    { number: '23', bedrooms: 2, bedSetup: [{ type: 'double', count: 1 }, { type: 'single', count: 2 }], capacity: 4 },
    { number: '25', bedrooms: 3, bedSetup: [{ type: 'single', count: 6 }], capacity: 6 },
  ];

  const addChalets = async () => {
    if (!user) {
      toast.error("You must be logged in to add chalets");
      return;
    }
    
    setLoading(true);
    toast.info("Adding all chalets, please wait...");
    
    try {
      let successCount = 0;
      
      for (const chalet of chaletData) {
        const chaletName = `Chalet ${chalet.number}`;
        
        // Create different room configurations based on the chalet data
        for (let i = 1; i <= chalet.bedrooms; i++) {
          const roomName = `${chaletName} - Room ${i}`;
          let bedType = 'single';
          let bedCount = 1;
          let capacity = 1;
          
          // Distribute bed types among rooms
          if (chalet.bedSetup.some(setup => setup.type === 'double')) {
            // For chalets with mixed bed types, distribute accordingly
            if (i <= chalet.bedSetup.find(setup => setup.type === 'double')?.count || 0) {
              bedType = 'double';
              bedCount = 1;
              capacity = 2;
            } else {
              bedType = 'single';
              // For rooms with twin beds 
              if (chalet.bedSetup.some(setup => setup.type === 'twin')) {
                bedCount = 2;
                capacity = 2;
              } else {
                bedCount = chalet.number === '18' || chalet.number === '19' || chalet.number === '21' ? 2 : 1;
                capacity = bedCount;
              }
            }
          } else if (chalet.bedSetup.some(setup => setup.type === 'twin')) {
            bedType = 'twin';
            bedCount = 1;
            capacity = 2;
          } else if (chalet.bedSetup.some(setup => setup.type === 'single')) {
            bedType = 'single';
            bedCount = 2;
            capacity = 2;
          }
          
          const { error } = await supabase
            .from('accommodation_rooms')
            .insert({
              name: roomName,
              capacity: capacity,
              description: `Part of ${chaletName}`,
              type: 'Chalet',
              occupied: 0,
              user_id: user.id,
              bed_type: bedType,
              bed_count: bedCount,
              chalet_group: chaletName
            });
          
          if (error) {
            console.error(`Error adding room ${roomName}:`, error);
          } else {
            successCount++;
          }
        }
      }
      
      toast.success(`Successfully added ${successCount} rooms across ${chaletData.length} chalets`);
      onDataAdded();
    } catch (error) {
      console.error("Error adding chalets:", error);
      toast.error("Failed to add chalets");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      className="rounded-md"
      onClick={addChalets}
      disabled={loading}
    >
      <Building className="mr-2 h-4 w-4" />
      <PlusCircle className="mr-2 h-4 w-4" />
      Add All Chalets
    </Button>
  );
};

export default AddPresetChalets;
