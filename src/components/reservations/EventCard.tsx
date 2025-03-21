
import { Calendar, MapPin } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  onSelect: (event: Event) => void;
}

const EventCard = ({ event, onSelect }: EventCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all"
      onClick={() => onSelect(event)}
    >
      <CardHeader>
        <div className="p-2 w-fit rounded-md bg-primary/10 text-primary">
          <Calendar className="h-6 w-6" />
        </div>
        <CardTitle className="mt-4">{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1">
          <MapPin className="h-3.5 w-3.5" /> {event.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
        <div className="flex items-center text-sm font-medium">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          {event.date}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          Register Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
