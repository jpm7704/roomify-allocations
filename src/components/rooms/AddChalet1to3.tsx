
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ChaletData {
  chaletNumber: string;
  roomCount: number;
  bedConfiguration: string;
  capacity: number;
  rooms: {
    bedType: string;
    bedCount: number;
    capacity: number;
  }[];
}

const AddChalet1to3 = ({ onComplete }: { onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const sampleChalets: ChaletData[] = [
    {
      chaletNumber: '1',
      roomCount: 3,
      bedConfiguration: '3 double beds (2 people per bed)',
      capacity: 6,
      rooms: [
        { bedType: 'double', bedCount: 1, capacity: 2 },
        { bedType: 'double', bedCount: 1, capacity: 2 },
        { bedType: 'double', bedCount: 1, capacity: 2 }
      ]
    },
    {
      chaletNumber: '2',
      roomCount: 3,
      bedConfiguration: 'Twin beds in each bedroom (1 person per bed)',
      capacity: 6,
      rooms: [
        { bedType: 'twin', bedCount: 2, capacity: 2 },
        { bedType: 'twin', bedCount: 2, capacity: 2 },
        { bedType: 'twin', bedCount: 2, capacity: 2 }
      ]
    },
    {
      chaletNumber: '3',
      roomCount: 4,
      bedConfiguration: '4 double beds (2 people per bed)',
      capacity: 8,
      rooms: [
        { bedType: 'double', bedCount: 1, capacity: 2 },
        { bedType: 'double', bedCount: 1, capacity: 2 },
        { bedType: 'double', bedCount: 1, capacity: 2 },
        { bedType: 'double', bedCount: 1, capacity: 2 }
      ]
    }
  ];

  const addChalets = async () => {
    if (!user) {
      toast.error("You must be logged in to add chalets");
      return;
    }

    setLoading(true);
    let addedChalets = 0;
    let failedChalets = 0;

    try {
      for (const chalet of sampleChalets) {
        // Create the chalet name without duplicating "Chalet" prefix
        const chaletName = `Chalet ${chalet.chaletNumber}`;
        
        try {
          // Add each room in the chalet
          for (let i = 0; i < chalet.rooms.length; i++) {
            const room = chalet.rooms[i];
            const roomNumber = (i + 1).toString();
            const roomName = `${chaletName} - Room ${roomNumber}`;
            
            await supabase
              .from('accommodation_rooms')
              .insert({
                name: roomName,
                capacity: room.capacity,
                description: chalet.bedConfiguration,
                type: 'Chalet',
                occupied: 0,
                user_id: user.id,
                bed_type: room.bedType,
                bed_count: room.bedCount,
                chalet_group: chaletName
              });
          }
          
          addedChalets++;
        } catch (err) {
          console.error(`Error adding chalet ${chaletName}:`, err);
          failedChalets++;
        }
      }

      if (addedChalets === sampleChalets.length) {
        toast.success(`Successfully added all ${addedChalets} chalets!`);
      } else {
        toast.success(`Added ${addedChalets} chalets. ${failedChalets} failed.`);
      }
      
      onComplete();
    } catch (error) {
      console.error("Error adding chalets:", error);
      toast.error("Failed to add chalets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={addChalets} 
      disabled={loading}
      variant="outline"
      className="min-w-32"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding Chalets 1-3...
        </>
      ) : (
        'Add Chalets 1-3'
      )}
    </Button>
  );
};

export default AddChalet1to3;
