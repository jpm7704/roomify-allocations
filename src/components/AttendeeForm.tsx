
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useAttendeeForm } from '@/hooks/useAttendeeForm';
import AttendeeFormFields from '@/components/attendee/AttendeeFormFields';
import { AttendeeFormProps } from '@/types/attendee';

const AttendeeForm = ({ isOpen, onOpenChange, onSuccess, initialData, mode }: AttendeeFormProps) => {
  const { form, handleSubmit } = useAttendeeForm(
    initialData,
    mode,
    onSuccess,
    () => onOpenChange(false)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Attendee' : 'Edit Attendee'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <AttendeeFormFields form={form} />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{mode === 'add' ? 'Save Attendee' : 'Update Attendee'}</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendeeForm;
