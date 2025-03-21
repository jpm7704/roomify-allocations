
import { Calendar, ChevronLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import NotesField from '@/components/allocation/NotesField';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Event } from '@/types/event';
import { RegistrationFormData, useEventRegistration } from '@/hooks/allocation-actions/useEventRegistration';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface RegistrationFormProps {
  selectedEvent: Event;
  onBack: () => void;
}

const RegistrationForm = ({ selectedEvent, onBack }: RegistrationFormProps) => {
  const { registerAttendee, isSubmitting } = useEventRegistration();
  
  const form = useForm<RegistrationFormData>({
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

  const handleSubmit = async (values: RegistrationFormData) => {
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
        onBack();
      } else {
        toast.error("Failed to submit registration");
      }
    } catch (error) {
      console.error("Error submitting reservation:", error);
      toast.error("Failed to submit registration");
    }
  };

  return (
    <div className="bg-card shadow-lg rounded-xl p-6 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
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
};

export default RegistrationForm;
