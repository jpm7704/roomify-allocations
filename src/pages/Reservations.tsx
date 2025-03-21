
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
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

const Reservations = () => {
  const navigate = useNavigate();
  const { registerAttendee, isSubmitting } = useEventRegistration();
  
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      homeChurch: 'Harare City Centre Church',
      specialNeeds: '',
      eventName: 'SDA Women\'s Ministry Camp Meeting'
    }
  });

  const handleSubmit = async (values: any) => {
    try {
      const result = await registerAttendee({
        name: values.name,
        email: values.email,
        phone: values.phone,
        department: values.department,
        homeChurch: values.homeChurch,
        specialNeeds: values.specialNeeds,
        eventName: values.eventName
      });

      if (result.success) {
        toast.success("Registration submitted successfully!");
        form.reset({
          name: '',
          email: '',
          phone: '',
          department: '',
          homeChurch: 'Harare City Centre Church',
          specialNeeds: '',
          eventName: 'SDA Women\'s Ministry Camp Meeting'
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="page-container max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goToHome} 
          className="mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">SDA Women's Ministry Camp Meeting</h1>
          <p className="text-muted-foreground">
            Register for the upcoming event at Harare City Centre Church
          </p>
        </div>

        <div className="bg-card shadow-lg rounded-xl p-6 border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-lg mb-2">Event Details</h2>
                <p className="text-sm text-muted-foreground">
                  August 5-7, 2023 | Harare City Centre Church
                </p>
              </div>
              
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
      </div>
    </div>
  );
};

export default Reservations;
