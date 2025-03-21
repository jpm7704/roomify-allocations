
import { useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import AllocationCard, { Allocation } from '@/components/AllocationCard';
import { Button } from '@/components/ui/button';
import AllocationTable from '@/components/allocation/AllocationTable';
import ViewToggle, { ViewMode } from '@/components/allocation/ViewToggle';

interface AllocationsListProps {
  loading: boolean;
  allocations: Allocation[];
  searchQuery: string;
  onRemove: (allocationId: string) => void;
  onClick: (allocation: Allocation) => void;
  onCreateRoom: () => void;
  onCreateAllocation: () => void;
  hasRooms: boolean;
}

const AllocationsList = ({ 
  loading, 
  allocations, 
  searchQuery, 
  onRemove, 
  onClick,
  onCreateRoom,
  onCreateAllocation,
  hasRooms
}: AllocationsListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-medium">Loading allocations...</h3>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-1">No allocations found</h3>
        <p className="text-muted-foreground max-w-sm">
          {searchQuery ? 'Try adjusting your search query' : 'There are no room allocations yet'}
        </p>
        
        <div className="flex gap-3 mt-6">
          {!hasRooms && (
            <Button onClick={onCreateRoom}>
              Create a Room First
            </Button>
          )}
          <Button 
            onClick={searchQuery ? () => onCreateAllocation() : onCreateAllocation}
            disabled={!hasRooms}
          >
            {searchQuery ? 'Clear Search' : 'Create Allocation'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
      </div>
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {allocations.map((allocation) => (
            <AllocationCard
              key={allocation.id}
              allocation={allocation}
              onRemove={onRemove}
              onClick={onClick}
            />
          ))}
        </div>
      ) : (
        <AllocationTable 
          allocations={allocations}
          onClick={onClick}
          onRemove={onRemove}
        />
      )}
    </div>
  );
};

export default AllocationsList;
