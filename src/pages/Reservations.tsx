
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const Reservations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    setIsSubmitting(true);
    try {
      // Insert into women_attendees table (same as People collection)
      const { data, error } = await supabase
        .from('women_attendees')
        .insert({
          name: values.name,
          email: values.email,
          phone: values.phone,
          department: values.department,
          home_church: values.homeChurch,
          special_needs: values.specialNeeds
        })
        .select();

      if (error) throw error;

      toast.success("Reservation submitted successfully!");
      form.reset({
        name: '',
        email: '',
        phone: '',
        department: '',
        homeChurch: 'Harare City Centre Church',
        specialNeeds: '',
        eventName: 'SDA Women\'s Ministry Camp Meeting'
      });
    } catch (error) {
      console.error("Error submitting reservation:", error);
      toast.error("Failed to submit reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="page-container max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Event Reservation</h1>
          <p className="text-muted-foreground">
            Reserve your spot for the upcoming event without creating an account
          </p>
        </div>

        <div className="bg-card shadow-lg rounded-xl p-6 border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-lg mb-2">SDA Women's Ministry Camp Meeting</h2>
                <p className="text-sm text-muted-foreground">
                  Harare City Centre Church | August 5-7, 2023
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
              
              <FormField
                control={form.control}
                name="specialNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Needs (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special requirements or accommodation needs" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Reservation"}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Your information will be used for event planning purposes only
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default Reservations;
