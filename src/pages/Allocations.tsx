
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import AllocationFormDialog from '@/components/allocation-form/AllocationFormDialog';
import RoomFormDialog from '@/components/RoomFormDialog';
import AllocationDetailsDialog from '@/components/AllocationDetailsDialog';
import { useAllocations } from '@/hooks/useAllocations';
import { useAllocationFormHandlers } from '@/components/allocation/AllocationFormHandlers';
import { useRoomHandlers } from '@/components/allocation/RoomHandlers';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAllocationDialogs } from '@/hooks/useAllocationDialogs';
import AllocationsHeader from '@/components/allocations/AllocationsHeader';
import AllocationsContent from '@/components/allocations/AllocationsContent';
import { useSmsNotification } from '@/hooks/useSmsNotification';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Allocations = () => {
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const roomIdFromUrl = searchParams.get('roomId');
  const { sendAllocationSms } = useSmsNotification();
  
  const {
    loading,
    allocations,
    roomAllocations,
    people,
    rooms,
    selectedPerson,
    setSelectedPerson,
    selectedRoom,
    setSelectedRoom,
    selectedPeople,
    setSelectedPeople,
    multiSelectMode,
    setMultiSelectMode,
    viewedAllocation,
    setViewedAllocation,
    handleRemoveOccupant,
    fetchData
  } = useAllocations(roomIdFromUrl);

  const {
    isDialogOpen,
    setIsDialogOpen,
    isRoomDialogOpen,
    setIsRoomDialogOpen,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    handleCreateAllocation,
    handleRoomAllocationClick,
    handleAllocationClick,
    handleEditAllocation,
    handleCreateRoom,
    handleCancelRoomDialog,
    handleCancelAllocationDialog,
  } = useAllocationDialogs(
    rooms,
    selectedPerson,
    setSelectedPerson,
    selectedRoom,
    setSelectedRoom,
    selectedPeople,
    setSelectedPeople,
    multiSelectMode,
    setMultiSelectMode,
    fetchData,
    roomIdFromUrl
  );

  const {
    handlePersonSelect,
    handleMultiPersonSelect,
    handleRoomSelect,
    handleSaveAllocation
  } = useAllocationFormHandlers(
    rooms,
    people,
    allocations,
    selectedPerson,
    setSelectedPerson,
    selectedRoom,
    setSelectedRoom,
    selectedPeople,
    setSelectedPeople,
    multiSelectMode,
    setMultiSelectMode,
    (newAllocations) => {},  // We'll use the fetchData function instead
    (newRooms) => {},  // We'll use the fetchData function instead
    (newPeople) => {},  // We'll use the fetchData function instead
    setIsDialogOpen,
    fetchData
  );

  const { handleSaveRoom } = useRoomHandlers(
    rooms,
    (newRooms) => {},  // We'll use the fetchData function instead
    setIsRoomDialogOpen
  );
  
  const handleSendSms = async (allocation) => {
    try {
      // Fetch the phone number for the person
      const { data, error } = await supabase
        .from('women_attendees')
        .select('phone')
        .eq('id', allocation.personId)
        .single();
        
      if (error) {
        console.error(`Error fetching phone for ${allocation.person.name}:`, error);
        toast.error(`Failed to get phone number for ${allocation.person.name}`);
        return;
      }
      
      if (data && data.phone) {
        toast.loading(`Sending SMS to ${allocation.person.name}...`);
        const success = await sendAllocationSms(
          data.phone, 
          allocation.person.name, 
          allocation.room.name,
          allocation.room.type || 'Chalet'
        );
        
        if (success) {
          toast.success(`SMS sent successfully to ${allocation.person.name}`);
        } else {
          toast.error(`Failed to send SMS to ${allocation.person.name}`);
        }
      } else {
        toast.error(`No phone number available for ${allocation.person.name}`);
      }
    } catch (error) {
      console.error(`Failed to send notification to ${allocation.person.name}:`, error);
      toast.error(`Error sending SMS to ${allocation.person.name}`);
    }
  };
  
  const handleSendRoomSms = async (roomId, personId, personName, roomName, roomType = 'Chalet') => {
    try {
      // Fetch the phone number for the person
      const { data, error } = await supabase
        .from('women_attendees')
        .select('phone')
        .eq('id', personId)
        .single();
        
      if (error) {
        console.error(`Error fetching phone for ${personName}:`, error);
        toast.error(`Failed to get phone number for ${personName}`);
        return;
      }
      
      if (data && data.phone) {
        toast.loading(`Sending SMS to ${personName}...`);
        const success = await sendAllocationSms(
          data.phone, 
          personName, 
          roomName,
          roomType
        );
        
        if (success) {
          toast.success(`SMS sent successfully to ${personName}`);
        } else {
          toast.error(`Failed to send SMS to ${personName}`);
        }
      } else {
        toast.error(`No phone number available for ${personName}`);
      }
    } catch (error) {
      console.error(`Failed to send notification to ${personName}:`, error);
      toast.error(`Error sending SMS to ${personName}`);
    }
  };
  
  return (
    <Layout>
      <div className="page-container">
        <AllocationsHeader 
          onCreateRoom={handleCreateRoom}
          onCreateAllocation={handleCreateAllocation}
        />
        
        <AllocationsContent
          loading={loading}
          roomAllocations={roomAllocations}
          onRemoveOccupant={handleRemoveOccupant}
          onRoomAllocationClick={handleRoomAllocationClick}
          onCreateRoom={handleCreateRoom}
          onCreateAllocation={handleCreateAllocation}
          hasRooms={rooms.length > 0}
          onSendSms={handleSendRoomSms}
        />

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
          onDelete={handleRemoveOccupant ? (id) => {
            const allocation = allocations.find(a => a.id === id);
            if (allocation) {
              handleRemoveOccupant(allocation.roomId, allocation.personId);
            }
          } : undefined}
          onEdit={handleEditAllocation}
        />
      </div>
    </Layout>
  );
};

export default Allocations;
