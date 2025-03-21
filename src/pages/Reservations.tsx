
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/types/event';
import EventList from '@/components/reservations/EventList';
import RegistrationForm from '@/components/reservations/RegistrationForm';

const Reservations = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Simulating events from a database - in a real app, this would come from supabase
  useEffect(() => {
    // Dummy events data - in a real implementation, this would be fetched from the database
    const availableEvents: Event[] = [
      {
        id: '1',
        title: 'SDA Women\'s Ministry Camp Meeting',
        date: 'August 5-7, 2023',
        location: 'Harare City Centre Church',
        description: 'Annual gathering for women in ministry with workshops, prayer sessions, and fellowship.'
      },
      // In a real implementation, more events would be fetched from the database
    ];
    
    setEvents(availableEvents);
  }, []);

  const goToHome = () => {
    navigate('/');
  };

  const selectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="page-container max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goToHome} 
          className="mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        {!selectedEvent ? (
          <EventList 
            events={events} 
            onSelectEvent={selectEvent} 
          />
        ) : (
          <RegistrationForm 
            selectedEvent={selectedEvent} 
            onBack={() => setSelectedEvent(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default Reservations;
