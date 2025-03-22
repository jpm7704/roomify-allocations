
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { AttendeeFormData } from '@/types/attendee';

interface AttendeeFormFieldsProps {
  form: UseFormReturn<AttendeeFormData>;
}

const AttendeeFormFields = ({ form }: AttendeeFormFieldsProps) => {
  return (
    <div className="grid gap-4 py-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter full name" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Enter email address" {...field} />
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
              <Input placeholder="Enter phone number" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department/Ministry (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Women's Ministry, Dorcas, etc." {...field} />
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
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="specialNeeds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Special Needs (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Any special requirements" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default AttendeeFormFields;
