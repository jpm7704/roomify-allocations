
import { Event } from '@/types/event';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

const EventList = ({ events, onSelectEvent }: EventListProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Available Events</h1>
        <p className="text-muted-foreground">
          Select an event to register
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onSelect={onSelectEvent} 
          />
        ))}
      </div>
    </div>
  );
};

export default EventList;
