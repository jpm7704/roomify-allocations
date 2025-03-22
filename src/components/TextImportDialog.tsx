
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlignLeft, Check, X, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TextImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParsedPerson {
  no?: string;
  name: string;
  surname?: string;
  roomPref?: string;
  dietary?: string;
  paid?: string;
  valid: boolean;
  error?: string;
}

const TextImportDialog = ({ isOpen, onOpenChange, onSuccess }: TextImportDialogProps) => {
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<ParsedPerson[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseData = (inputText: string): ParsedPerson[] => {
    // Split by newlines and remove empty lines
    const lines = inputText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return [];
    }

    // Try to parse each line
    return lines.map((line, index) => {
      // Split by tabs or multiple spaces or commas with optional spaces
      const parts = line.split(/[\t,]+|\s{2,}/).map(part => part.trim());
      
      if (parts.length < 2) {
        return {
          name: line.trim(),
          valid: true
        };
      }

      // Try to determine if the first column is a number
      const firstIsNumber = !isNaN(Number(parts[0]));
      
      let result: ParsedPerson;
      
      if (firstIsNumber) {
        // Format: No., Name, Surname, Room Pref, Dietary, Paid
        result = {
          no: parts[0],
          name: parts[1] || '',
          surname: parts[2] || '',
          roomPref: parts[3] || '',
          dietary: parts[4] || '',
          paid: parts[5] || '',
          valid: true
        };
      } else {
        // Format might be: Name, Surname, Room Pref, Dietary, Paid (no number)
        result = {
          name: parts[0] || '',
          surname: parts[1] || '',
          roomPref: parts[2] || '',
          dietary: parts[3] || '',
          paid: parts[4] || '',
          valid: true
        };
      }

      // Validate: name is required
      if (!result.name) {
        result.valid = false;
        result.error = 'Name is required';
      }

      return result;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    
    if (value.trim()) {
      const parsed = parseData(value);
      setPreviewData(parsed);
      setShowPreview(parsed.length > 0);
    } else {
      setPreviewData([]);
      setShowPreview(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to import');
      return;
    }

    const parsedData = parseData(text);
    
    if (parsedData.length === 0) {
      toast.error('No valid data found to import');
      return;
    }

    const invalidEntries = parsedData.filter(person => !person.valid);
    if (invalidEntries.length > 0) {
      toast.error(`Found ${invalidEntries.length} invalid entries. Please fix them before importing.`);
      return;
    }

    setProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Process each person
      for (const person of parsedData) {
        if (!person.valid) continue;

        // Combine name and surname if both exist
        const fullName = person.surname 
          ? `${person.name} ${person.surname}`.trim() 
          : person.name.trim();

        try {
          const { error } = await supabase
            .from('women_attendees')
            .insert({
              name: fullName,
              department: person.roomPref || '',
              special_needs: person.dietary || '',
              import_source: 'text_import',
              // Additional metadata could be stored in a JSON field if needed
              // e.g., paid status could be added to a metadata column if available
            });

          if (error) {
            console.error('Error importing person:', error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Exception importing person:', err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} attendees`);
        
        if (errorCount > 0) {
          toast.warning(`Failed to import ${errorCount} attendees`);
        }
        
        // Clear form and close dialog on success
        setText('');
        setPreviewData([]);
        setShowPreview(false);
        onSuccess();
        setTimeout(() => onOpenChange(false), 1500);
      } else {
        toast.error('Failed to import any attendees');
      }
    } catch (err) {
      console.error('Error in import process:', err);
      toast.error('An unexpected error occurred during import');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setText('');
    setPreviewData([]);
    setShowPreview(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Attendees from Text</DialogTitle>
          <DialogDescription>
            Paste a list of attendees. Format: No., Name, Surname, Room Pref, Dietary, Paid.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">Paste Attendee Data</Label>
            <Textarea
              id="text-input"
              placeholder="1 Jane Doe Single Vegetarian Yes
2 John Smith Double None No"
              value={text}
              onChange={handleInputChange}
              className="min-h-[150px] font-mono text-sm"
              disabled={processing}
            />
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Each person should be on a new line</p>
              <p>• Format: No., Name, Surname, Room Pref, Dietary, Paid</p>
              <p>• Only the name is required, other fields are optional</p>
              <p>• Separate fields with commas, tabs or multiple spaces</p>
            </div>
          </div>

          {showPreview && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Info className="h-4 w-4" />
                Preview ({previewData.length} entries)
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-3 py-2 text-xs font-medium border-b">
                  Data Preview
                </div>
                <div className="max-h-[200px] overflow-y-auto p-2">
                  {previewData.map((person, index) => (
                    <div 
                      key={index}
                      className={`text-xs font-mono p-1.5 flex items-start gap-2 ${
                        index % 2 === 0 ? 'bg-muted/30' : ''
                      } ${!person.valid ? 'border-l-2 border-destructive pl-2' : ''}`}
                    >
                      {person.valid ? (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="leading-tight">
                        <span className="font-medium">
                          {person.surname 
                            ? `${person.name} ${person.surname}` 
                            : person.name}
                        </span>
                        {(person.roomPref || person.dietary) && (
                          <span className="text-muted-foreground">
                            {person.roomPref && ` • Room: ${person.roomPref}`}
                            {person.dietary && ` • Dietary: ${person.dietary}`}
                            {person.paid && ` • Paid: ${person.paid}`}
                          </span>
                        )}
                        {!person.valid && person.error && (
                          <div className="text-destructive mt-0.5">{person.error}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {previewData.length > 0 && previewData.some(p => !p.valid) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid Entries Detected</AlertTitle>
              <AlertDescription>
                Please fix the highlighted entries before importing.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={processing || previewData.length === 0 || previewData.some(p => !p.valid)}
            >
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <AlignLeft className="mr-2 h-4 w-4" />
                  Import Attendees
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextImportDialog;
