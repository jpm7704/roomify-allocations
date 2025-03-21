
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAllocations } from '@/hooks/useAllocations';
import AllocationHeader from '@/components/allocation/AllocationHeader';
import AllocationSearch from '@/components/allocation/AllocationSearch';
import AllocationsList from '@/components/AllocationsList';
import { AllocationDialogManager } from '@/components/allocation/AllocationDialogManager';
import { Allocation } from '@/components/AllocationCard';

const Allocations = () => {
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
          onCreateAllocation={handleCreateAllocation} 
          onCreateRoom={handleCreateRoom}
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
            onRemove={handleRemoveAllocation}
            onClick={handleAllocationClick}
            onCreateRoom={handleCreateRoom}
            onCreateAllocation={searchQuery ? handleClearSearch : handleCreateAllocation}
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

  // Handlers to pass to the dialog manager
  function handleCreateRoom() {
    // Access through the ref to avoid re-renders
    document.dispatchEvent(new CustomEvent('open-room-dialog'));
  }

  function handleCreateAllocation() {
    document.dispatchEvent(new CustomEvent('open-allocation-dialog'));
  }

  function handleAllocationClick(allocation: Allocation) {
    document.dispatchEvent(new CustomEvent('open-allocation-details', { 
      detail: { allocation } 
    }));
  }

  function handleRemoveAllocation(allocationId: string) {
    removeAllocation(allocationId);
  }
};

export default Allocations;
