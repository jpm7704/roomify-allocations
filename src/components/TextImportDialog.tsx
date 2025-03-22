
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Circle, Info, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TextImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface AttendeeData {
  number?: string;
  name: string;
  surname?: string;
  roomPreference?: string;
  dietary?: string;
  paid?: string;
}

const TextImportDialog = ({ isOpen, onOpenChange, onSuccess }: TextImportDialogProps) => {
  const [text, setText] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<AttendeeData[]>([]);
  const [step, setStep] = useState<'input' | 'review' | 'success'>('input');
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const parseData = () => {
    // Split by newlines and filter out empty lines
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length === 0) {
      toast.error('Please enter at least one line of data');
      return;
    }

    const attendees: AttendeeData[] = [];
    
    lines.forEach(line => {
      // Split by commas or tabs
      const parts = line.split(/[,\t]+/).map(part => part.trim());
      
      // Must have at least a name
      if (parts.length > 0 && parts[0]) {
        const attendee: AttendeeData = {
          name: '',
        };

        // Map parts to corresponding fields
        if (parts.length >= 1) attendee.number = parts[0];
        if (parts.length >= 2) attendee.name = parts[1];
        if (parts.length >= 3) attendee.surname = parts[2];
        if (parts.length >= 4) attendee.roomPreference = parts[3];
        if (parts.length >= 5) attendee.dietary = parts[4];
        if (parts.length >= 6) attendee.paid = parts[5];

        // If no name found in the right position, use the first non-empty value
        if (!attendee.name) {
          for (const part of parts) {
            if (part) {
              attendee.name = part;
              break;
            }
          }
        }

        // Only add if we have a name
        if (attendee.name) {
          attendees.push(attendee);
        }
      }
    });

    setParsedData(attendees);
    
    if (attendees.length > 0) {
      setStep('review');
    } else {
      toast.error('No valid data found. Please ensure each line contains at least a name.');
    }
  };

  const removeAttendee = (index: number) => {
    const updatedData = [...parsedData];
    updatedData.splice(index, 1);
    setParsedData(updatedData);
  };

  const processImport = async () => {
    if (parsedData.length === 0) {
      toast.error('No data to import');
      return;
    }

    setProcessing(true);
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      // Create import record
      const { data: importRecord, error: importError } = await supabase
        .from('file_imports')
        .insert({
          filename: 'manual-text-import',
          status: 'processing',
        })
        .select()
        .single();

      if (importError) {
        throw new Error('Failed to create import record');
      }

      // Process each attendee
      for (let i = 0; i < parsedData.length; i++) {
        const attendee = parsedData[i];
        
        // Format the full name
        const fullName = attendee.surname 
          ? `${attendee.name} ${attendee.surname}` 
          : attendee.name;
        
        try {
          const { error } = await supabase
            .from('women_attendees')
            .insert({
              name: fullName,
              department: attendee.roomPreference || null,
              special_needs: attendee.dietary || null,
              import_source: 'manual-text-import',
              // You can add more fields as they become available in the database structure
            });

          if (error) {
            failedCount++;
            errors.push(`Failed to import "${fullName}": ${error.message}`);
          } else {
            successCount++;
          }
        } catch (error) {
          failedCount++;
          errors.push(`Failed to import "${fullName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Update import status
      const status = failedCount > 0 ? 'completed_with_errors' : 'completed';
      const errorMessage = errors.length > 0 ? errors.slice(0, 5).join('; ') + (errors.length > 5 ? ` and ${errors.length - 5} more errors` : '') : null;
      
      await supabase
        .from('file_imports')
        .update({
          status,
          completed_at: new Date().toISOString(),
          records_processed: successCount,
          records_failed: failedCount,
          error_message: errorMessage
        })
        .eq('id', importRecord.id);

      // Set results and move to success step
      setResults({
        success: successCount,
        failed: failedCount,
        errors: errors
      });
      
      setStep('success');
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} attendees`);
      }
      
      if (failedCount > 0) {
        toast.error(`Failed to import ${failedCount} attendees`);
      }
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setText('');
    setParsedData([]);
    setStep('input');
    setResults({ success: 0, failed: 0, errors: [] });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
    if (results.success > 0) {
      onSuccess();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'input':
        return (
          <>
            <div className="space-y-4 py-2">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="names">Enter Attendee Data (one per line)</Label>
                <Textarea
                  id="names"
                  placeholder="1, Jane, Doe, Single Room, Vegetarian, Yes
2, Mary, Smith, Double Room, None, Yes
3, Sarah, Johnson, , Gluten Free, No"
                  rows={10}
                  value={text}
                  onChange={handleTextChange}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Simple Import Format</AlertTitle>
                <AlertDescription>
                  Enter each attendee on a separate line using this format:
                  <div className="mt-2 text-xs">
                    <code>No., Name, Surname, Room Preference, Dietary Needs, Paid</code>
                  </div>
                  <div className="mt-2">
                    You can paste data directly from Excel, Word, or any text editor. Separate fields with commas or tabs.
                  </div>
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={parseData} 
                disabled={!text.trim()}>
                Continue to Review
              </Button>
            </div>
          </>
        );
        
      case 'review':
        return (
          <>
            <div className="space-y-4 py-2">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Review Attendee Data</AlertTitle>
                <AlertDescription>
                  Found {parsedData.length} attendees to import. Please review before proceeding.
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                <div className="p-3 border-b bg-muted/50 sticky top-0">
                  <div className="grid grid-cols-6 gap-2 text-xs font-medium">
                    <div>No.</div>
                    <div>Name</div>
                    <div>Surname</div>
                    <div>Room Pref</div>
                    <div>Dietary</div>
                    <div>Paid</div>
                  </div>
                </div>
                <ul className="divide-y">
                  {parsedData.map((attendee, index) => (
                    <li key={index} className="hover:bg-muted/30">
                      <div className="flex items-center justify-between p-3">
                        <div className="grid grid-cols-6 gap-2 w-full text-sm">
                          <div>{attendee.number || '-'}</div>
                          <div>{attendee.name || '-'}</div>
                          <div>{attendee.surname || '-'}</div>
                          <div>{attendee.roomPreference || '-'}</div>
                          <div>{attendee.dietary || '-'}</div>
                          <div>{attendee.paid || '-'}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeAttendee(index)} 
                          className="h-8 w-8 p-0 ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('input')}>
                Back
              </Button>
              <Button 
                onClick={processImport} 
                disabled={parsedData.length === 0 || processing}>
                {processing ? 'Importing...' : 'Import Attendees'}
              </Button>
            </div>
          </>
        );
        
      case 'success':
        return (
          <>
            <div className="space-y-4 py-2">
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Import Complete</AlertTitle>
                <AlertDescription>
                  Successfully imported {results.success} attendees.
                  {results.failed > 0 && ` Failed to import ${results.failed} attendees.`}
                </AlertDescription>
              </Alert>
              
              {results.failed > 0 && results.errors.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="p-3 border-b bg-muted/50">
                    <h3 className="font-medium text-destructive">Import Errors</h3>
                  </div>
                  <ul className="divide-y max-h-[200px] overflow-y-auto">
                    {results.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="p-3 text-sm text-destructive">
                        {error}
                      </li>
                    ))}
                    {results.errors.length > 5 && (
                      <li className="p-3 text-sm text-muted-foreground">
                        And {results.errors.length - 5} more errors...
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {results.success > 0 && (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="text-center">
                    <p className="mb-2">Do you want to add more attendees?</p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        onClick={resetForm}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add More
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={handleClose}>
                {results.success > 0 ? 'Done' : 'Close'}
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Import Attendees</DialogTitle>
          <DialogDescription>
            Quickly import multiple attendees by entering their details.
          </DialogDescription>
        </DialogHeader>
        
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default TextImportDialog;
