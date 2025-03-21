
import { Plus, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AllocationHeaderProps {
  onCreateAllocation: () => void;
  onCreateRoom: () => void;
}

const AllocationHeader = ({ onCreateAllocation, onCreateRoom }: AllocationHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Room Allocations</h1>
        <p className="text-muted-foreground mt-1">
          SDA Women's Ministry Camp Meeting - Harare City Centre Church
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="rounded-md" onClick={onCreateRoom}>
          <Building className="mr-2 h-4 w-4" />
          Add Room
        </Button>
        <Button className="rounded-md" onClick={onCreateAllocation}>
          <Plus className="mr-2 h-4 w-4" />
          New Allocation
        </Button>
      </div>
    </div>
  );
};

export default AllocationHeader;
