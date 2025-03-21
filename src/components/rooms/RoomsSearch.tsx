
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RoomsSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const RoomsSearch = ({ searchQuery, onSearchChange }: RoomsSearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rooms..."
          className="pl-9 rounded-md"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default RoomsSearch;
