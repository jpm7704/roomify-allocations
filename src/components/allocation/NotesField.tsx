
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface NotesFieldProps {
  form: UseFormReturn<any>;
  name?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  multiline?: boolean;
  required?: boolean;
}

const NotesField = ({ 
  form, 
  name = "notes", 
  label = "Notes",
  placeholder = "Any special requirements or notes",
  description,
  multiline = false,
  required = false
}: NotesFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{!required && " (Optional)"}</FormLabel>
          <FormControl>
            {multiline ? (
              <Textarea 
                placeholder={placeholder} 
                className="min-h-[100px]" 
                {...field} 
              />
            ) : (
              <Input 
                placeholder={placeholder} 
                {...field} 
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NotesField;
