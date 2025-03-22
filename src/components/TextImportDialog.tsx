
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

const TextImportDialog = ({ isOpen, onOpenChange, onSuccess }: TextImportDialogProps) => {
  const [text, setText] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [parsedNames, setParsedNames] = useState<string[]>([]);
  const [step, setStep] = useState<'input' | 'review' | 'success'>('input');
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const parseNames = () => {
    // Split by newlines and filter out empty lines
    const names = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    setParsedNames(names);
    if (names.length > 0) {
      setStep('review');
    } else {
      toast.error('Please enter at least one name');
    }
  };

  const removeName = (index: number) => {
    const updatedNames = [...parsedNames];
    updatedNames.splice(index, 1);
    setParsedNames(updatedNames);
  };

  const processImport = async () => {
    if (parsedNames.length === 0) {
      toast.error('No names to import');
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

      // Process each name
      for (let i = 0; i < parsedNames.length; i++) {
        const name = parsedNames[i];
        
        try {
          const { error } = await supabase
            .from('women_attendees')
            .insert({
              name,
              import_source: 'manual-text-import'
            });

          if (error) {
            failedCount++;
            errors.push(`Failed to import "${name}": ${error.message}`);
          } else {
            successCount++;
          }
        } catch (error) {
          failedCount++;
          errors.push(`Failed to import "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    setParsedNames([]);
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
                <Label htmlFor="names">Enter Names (one per line)</Label>
                <Textarea
                  id="names"
                  placeholder="Jane Doe
Mary Smith
Sarah Johnson"
                  rows={10}
                  value={text}
                  onChange={handleTextChange}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Simple Import</AlertTitle>
                <AlertDescription>
                  Enter each attendee's name on a separate line. 
                  You can paste a list of names directly from Excel, Word, or any text editor.
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
                onClick={parseNames} 
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
                <AlertTitle>Review Names</AlertTitle>
                <AlertDescription>
                  Found {parsedNames.length} names to import. Please review before proceeding.
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                <div className="p-3 border-b bg-muted/50">
                  <h3 className="font-medium">Attendees to Import</h3>
                </div>
                <ul className="divide-y">
                  {parsedNames.map((name, index) => (
                    <li key={index} className="flex items-center justify-between p-3 hover:bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Circle className="h-2 w-2 text-primary" />
                        <span>{name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeName(index)} 
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
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
                disabled={parsedNames.length === 0 || processing}>
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import Attendees</DialogTitle>
          <DialogDescription>
            Quickly import multiple attendees by entering their names.
          </DialogDescription>
        </DialogHeader>
        
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default TextImportDialog;
