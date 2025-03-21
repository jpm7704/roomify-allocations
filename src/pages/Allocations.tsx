
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAllocations } from '@/hooks/useAllocations';
import AllocationHeader from '@/components/allocation/AllocationHeader';
import AllocationSearch from '@/components/allocation/AllocationSearch';
import AllocationsList from '@/components/AllocationsList';
import { AllocationDialogManager } from '@/components/allocation/AllocationDialogManager';
import { AllocationDialogProvider, useAllocationDialog } from '@/contexts/AllocationDialogContext';
import { Allocation } from '@/components/AllocationCard';

// Inner component that uses the context
const AllocationsContent = () => {
  const [searchParams] = useSearchParams();
  const roomIdFromUrl = searchParams.get('roomId');
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    allocations, 
    people, 
    rooms, 
    loading,
    filterAllocations, 
    removeAllocation, 
    createRoom, 
    saveAllocation 
  } = useAllocations(roomIdFromUrl);

  const {
    openAllocationDialog,
    openRoomDialog,
    openAllocationDetails
  } = useAllocationDialog();

  const filteredAllocations = filterAllocations(searchQuery);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Layout>
      <div className="page-container">
        <AllocationHeader 
          onCreateAllocation={openAllocationDialog} 
          onCreateRoom={openRoomDialog}
        />
        
        <AllocationSearch 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange} 
        />
        
        <div className="mt-6">
          <AllocationsList
            loading={loading}
            allocations={filteredAllocations}
            searchQuery={searchQuery}
            onRemove={removeAllocation}
            onClick={openAllocationDetails}
            onCreateRoom={openRoomDialog}
            onCreateAllocation={searchQuery ? handleClearSearch : openAllocationDialog}
            hasRooms={rooms.length > 0}
          />
        </div>

        <AllocationDialogManager
          people={people}
          rooms={rooms}
          roomIdFromUrl={roomIdFromUrl}
          onCreateRoom={createRoom}
          onSaveAllocation={saveAllocation}
          onRemoveAllocation={removeAllocation}
        />
      </div>
    </Layout>
  );
};

// Main component that provides the context
const Allocations = () => {
  return (
    <AllocationDialogProvider>
      <AllocationsContent />
    </AllocationDialogProvider>
  );
};

export default Allocations;
