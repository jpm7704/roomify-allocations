
import { useState } from 'react';
import { toast } from 'sonner';
import { SendHorizontal, InfoIcon, UsersRound, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { useSendSMS } from '@/hooks/useSendSMS';
import { Person } from '@/components/PersonCard';

interface SMSFormData {
  recipients: string;
  message: string;
}

interface SMSNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedRecipients?: Person[];
  eventName?: string;
}

const SMSNotificationDialog = ({ 
  isOpen, 
  onOpenChange, 
  preselectedRecipients = [], 
  eventName = 'the event'
}: SMSNotificationDialogProps) => {
  const { sendSMS, sending } = useSendSMS();
  const [selectedRecipients, setSelectedRecipients] = useState<Person[]>(preselectedRecipients);
  
  const form = useForm<SMSFormData>({
    defaultValues: {
      recipients: preselectedRecipients.map(p => p.phone || '').filter(Boolean).join(','),
      message: `Dear attendee, this is a notification about ${eventName}. `
    }
  });

  const handleRemoveRecipient = (personId: string) => {
    const updatedRecipients = selectedRecipients.filter(p => p.id !== personId);
    setSelectedRecipients(updatedRecipients);
    
    const phoneNumbers = updatedRecipients
      .map(p => p.phone || '')
      .filter(Boolean)
      .join(',');
      
    form.setValue('recipients', phoneNumbers);
  };

  const handleSubmit = async (data: SMSFormData) => {
    // Validate recipients
    if (!data.recipients.trim()) {
      toast.error("Please add at least one recipient phone number");
      return;
    }

    // Clean and validate phone numbers
    const phoneNumbers = data.recipients
      .split(',')
      .map(num => num.trim())
      .filter(Boolean);
    
    if (phoneNumbers.length === 0) {
      toast.error("Please add at least one valid phone number");
      return;
    }

    // Validate message
    if (!data.message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    const result = await sendSMS({
      to: phoneNumbers,
      message: data.message
    });

    if (result.success) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Send SMS Notification</DialogTitle>
          <DialogDescription>
            Send an SMS notification to attendees. Messages will be sent to the selected phone numbers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {selectedRecipients.length > 0 && (
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4" />
                  Selected Recipients ({selectedRecipients.length})
                </FormLabel>
                <div className="flex flex-wrap gap-2 bg-muted/30 p-2 rounded-lg">
                  {selectedRecipients.map(person => (
                    <Badge key={person.id} variant="outline" className="flex items-center gap-1 pl-2 bg-background/60">
                      {person.name}
                      {person.phone && <span className="text-xs text-muted-foreground ml-1">({person.phone})</span>}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1 rounded-full"
                        onClick={() => handleRemoveRecipient(person.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="recipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Numbers</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., +263771234567,+263771234568" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter phone numbers separated by commas. Include country code (e.g., +263).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Type your message here..." 
                      rows={5}
                      maxLength={160}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between">
                    <span>Keep your message concise and clear.</span>
                    <span>
                      {field.value.length}/160 characters
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert variant="maroon" className="mt-4">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Standard SMS rates may apply to recipients. Make sure you have their consent to send messages.
              </AlertDescription>
            </Alert>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? 'Sending...' : 'Send Notification'}
                <SendHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SMSNotificationDialog;
