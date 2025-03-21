
import { Allocation } from '@/components/AllocationCard';
import { filterAllocations as filterAllocationsByQuery } from '@/utils/allocationMappers';

export const useAllocationFilters = (allocations: Allocation[]) => {
  // Filter allocations based on search query
  const filterAllocations = (query: string) => {
    return filterAllocationsByQuery(allocations, query);
  };

  return {
    filterAllocations
  };
};
