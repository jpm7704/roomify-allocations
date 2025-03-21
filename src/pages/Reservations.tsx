
import { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import NotesField from '@/components/allocation/NotesField';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useEventRegistration } from '@/hooks/allocation-actions/useEventRegistration';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Interface for event data
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
}

const Reservations = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { registerAttendee, isSubmitting } = useEventRegistration();
  
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
  
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      homeChurch: '',
      specialNeeds: '',
      eventName: selectedEvent?.title || ''
    }
  });

  // Update form when selectedEvent changes
  useEffect(() => {
    if (selectedEvent) {
      form.setValue('eventName', selectedEvent.title);
      form.setValue('homeChurch', '');
    }
  }, [selectedEvent, form]);

  const handleSubmit = async (values: any) => {
    if (!selectedEvent) {
      toast.error("Please select an event first");
      return;
    }
    
    try {
      const result = await registerAttendee({
        name: values.name,
        email: values.email,
        phone: values.phone,
        department: values.department,
        homeChurch: values.homeChurch,
        specialNeeds: values.specialNeeds,
        eventName: selectedEvent.title
      });

      if (result.success) {
        toast.success("Registration submitted successfully!");
        form.reset({
          name: '',
          email: '',
          phone: '',
          department: '',
          homeChurch: '',
          specialNeeds: '',
          eventName: ''
        });
        setSelectedEvent(null);
      } else {
        toast.error("Failed to submit registration");
      }
    } catch (error) {
      console.error("Error submitting reservation:", error);
      toast.error("Failed to submit registration");
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  const selectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  // View for event selection
  const renderEventSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Available Events</h1>
        <p className="text-muted-foreground">
          Select an event to register
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card 
            key={event.id}
            className="cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => selectEvent(event)}
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
        ))}
      </div>
    </div>
  );

  // View for registration form
  const renderRegistrationForm = () => (
    <div className="bg-card shadow-lg rounded-xl p-6 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSelectedEvent(null)}
          className="h-8 px-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to events
        </Button>
      </div>
      
      <div className="bg-primary/5 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-lg mb-1">{selectedEvent?.title}</h2>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5" /> 
            {selectedEvent?.date}
          </div>
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1.5" /> 
            {selectedEvent?.location}
          </div>
        </div>
      </div>
    
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input required placeholder="Enter your full name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department/Ministry (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Women's Ministry, Dorcas" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="homeChurch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Church</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your home church" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <NotesField 
            form={form}
            name="specialNeeds"
            label="Special Needs"
            placeholder="Any special requirements or accommodation needs"
            multiline={true}
          />
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Register for Event"}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Your information will be used for event planning purposes only
            </p>
          </div>
        </form>
      </Form>
    </div>
  );

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
        
        {!selectedEvent ? renderEventSelection() : renderRegistrationForm()}
      </div>
    </div>
  );
};

export default Reservations;
