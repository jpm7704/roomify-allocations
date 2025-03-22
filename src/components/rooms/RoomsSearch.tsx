
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RoomsSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const RoomsSearch = ({ searchQuery, setSearchQuery }: RoomsSearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search accommodations..."
          className="pl-9 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default RoomsSearch;
