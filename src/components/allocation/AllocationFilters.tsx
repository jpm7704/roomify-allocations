
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RoomWithOccupants } from '@/components/AllocationsList';

interface AllocationFiltersProps {
  roomAllocations: RoomWithOccupants[];
  onFilterChange: (filtered: RoomWithOccupants[]) => void;
  onSearchChange: (query: string) => void;
}

export const AllocationFilters = ({ 
  roomAllocations, 
  onFilterChange, 
  onSearchChange 
}: AllocationFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange(query);
    
    const filtered = roomAllocations.filter(roomAllocation => {
      const matchesSearch = 
        roomAllocation.room.name.toLowerCase().includes(query.toLowerCase()) ||
        roomAllocation.occupants.some(person => 
          person.name.toLowerCase().includes(query.toLowerCase()) ||
          person.email.toLowerCase().includes(query.toLowerCase()) ||
          (person.department && person.department.toLowerCase().includes(query.toLowerCase()))
        );
        
      return matchesSearch;
    });
    
    onFilterChange(filtered);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search allocations..."
          className="pl-9 rounded-md"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
