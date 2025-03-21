
import { Event } from '@/types/event';
import EventCard from './EventCard';
import { useState } from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

const EventList = ({ events, onSelectEvent }: EventListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;
  
  // Calculate pagination values
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  
  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Available Events</h1>
        <p className="text-muted-foreground">
          Select an event to register
        </p>
      </div>

      {currentEvents.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No events available</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onSelect={onSelectEvent} 
            />
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {pageNumbers.map(pageNumber => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={pageNumber === currentPage}
                  onClick={() => handlePageChange(pageNumber)}
                  className="cursor-pointer"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default EventList;
