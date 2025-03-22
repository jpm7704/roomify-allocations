
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileUpIcon, AlertTriangle, HelpCircle, FileSpreadsheet, Download } from 'lucide-react';

interface ExcelUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ExcelUploadDialog = ({ isOpen, onOpenChange, onSuccess }: ExcelUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Accept CSV files
      if (selectedFile.type !== 'text/csv' && 
          !selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a valid CSV file (.csv)');
        return;
      }
      setFile(selectedFile);
      setStatus('idle');
      setErrorDetails(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setStatus('uploading');
      setProgress(10);
      setErrorDetails(null);

      const formData = new FormData();
      formData.append('file', file);
      
      setProgress(30);
      setStatus('processing');
      
      toast.info('Processing your CSV file...');
      
      const response = await supabase.functions.invoke('process-excel', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Unknown error occurred');
      }

      setProgress(100);
      setStatus('success');
      
      toast.success(`CSV file processed successfully! ${response.data.processed} records imported.`);
      
      if (response.data.failed > 0) {
        toast.warning(`${response.data.failed} records failed to import.`);
      }
      
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
        resetForm();
      }, 1500);

    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus('error');
      
      // Try to extract more detailed error message if available
      let errorMessage = 'Upload failed';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Check if we have a JSON response with more details
      try {
        if (typeof error.message === 'string' && error.message.includes('{')) {
          const jsonStr = error.message.substring(error.message.indexOf('{'));
          const errorData = JSON.parse(jsonStr);
          if (errorData.error) {
            errorMessage = errorData.error;
            setErrorDetails(errorData.message || null);
          }
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProgress(0);
    setStatus('idle');
    setUploading(false);
    setErrorDetails(null);
  };
  
  const downloadTemplate = () => {
    // Create a sample CSV file with the correct columns
    const data = [
      ['No.', 'Name', 'Surname', 'Room Pref', 'Dietary', 'Paid'],
      ['1', 'Jane', 'Doe', 'Double Room', 'Vegetarian', 'Yes'],
      ['2', 'Mary', 'Smith', 'Single Room', 'None', 'No']
    ];
    
    // Create CSV content
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendees_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Attendees from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file (.csv) containing attendee data. We'll process it and organize it for you.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="file">CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
                className={file ? 'file:text-primary' : ''}
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="bg-muted/50 p-3 rounded-md border">
            <div className="flex items-start gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">CSV File Requirements</p>
                <p className="text-muted-foreground mb-2">Your CSV file must:</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Be in .csv format</li>
                  <li>Have the first row as column headers</li>
                  <li>Include these column headers (or similar variations):</li>
                </ul>
                <div className="mt-2 mb-1 bg-muted p-2 rounded font-mono text-xs">
                  No.,Name,Surname,Room Pref,Dietary,Paid
                </div>
                <div className="mt-3 flex justify-center">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={downloadTemplate}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {(status === 'uploading' || status === 'processing') && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  {status === 'uploading' ? 'Uploading file...' : 'Processing file...'}
                </span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {status === 'error' && (
            <div className="bg-destructive/20 text-destructive flex items-start gap-2 p-3 rounded border border-destructive/50">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <span className="text-sm font-medium">An error occurred while processing the file.</span>
                {errorDetails && (
                  <p className="text-xs mt-1">{errorDetails}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <FileUpIcon className="mr-2 h-4 w-4 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Process
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelUploadDialog;
