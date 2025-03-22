
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Download, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExcelUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ExcelUploadDialog = ({ isOpen, onOpenChange, onSuccess }: ExcelUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    processed: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file (.csv)');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const downloadTemplate = () => {
    const data = [
      ['name', 'room', 'dietary', 'phone', 'email', 'church'],
      ['Jane Doe', 'Double Room', 'Vegetarian', '123-456-7890', 'jane@example.com', 'Central Church'],
      ['Mary Smith', 'Single Room', 'None', '234-567-8901', 'mary@example.com', 'East Church']
    ];
    
    const csvContent = data.map(row => 
      row.map(cell => {
        // Quote cells that contain commas
        if (cell.includes(',')) {
          return `"${cell}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadResult(null);

      const formData = new FormData();
      formData.append('file', file);
      
      toast.info('Processing your CSV file...');
      
      const response = await supabase.functions.invoke('process-excel', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to process file');
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setUploadResult({
        processed: response.data.processed || 0,
        failed: response.data.failed || 0,
        errors: response.data.errors || []
      });
      
      toast.success(`CSV file processed successfully! ${response.data.processed} records imported.`);
      
      if (response.data.failed > 0) {
        toast.warning(`${response.data.failed} records failed to import.`);
      } else {
        // Only close dialog and refresh data if there were no failures
        setTimeout(() => {
          onOpenChange(false);
          onSuccess();
        }, 2000);
      }

    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Failed to process file');
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setUploadResult(null);
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import Attendees from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing attendee data. Only the name column is required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-md border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Required CSV Format:</p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={downloadTemplate}
                className="h-8"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Template
              </Button>
            </div>
            
            <div className="bg-background/80 p-3 rounded text-xs font-mono">
              <p>name,room,dietary,phone,email,church</p>
              <p>Jane Doe,Double Room,Vegetarian,123-456-7890,...</p>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1 pt-1">
              <p>• Only the <strong>name</strong> column is required</p>
              <p>• Other columns are optional but helpful if available</p>
              <p>• The column order doesn't matter</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {uploadResult && (
            <Alert variant={uploadResult.failed > 0 ? "warning" : "default"} className="border border-primary/20">
              {uploadResult.failed > 0 ? (
                <XCircle className="h-4 w-4 text-warning" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
              <AlertTitle>Upload Result</AlertTitle>
              <AlertDescription className="space-y-1">
                <p>Successfully imported: <strong>{uploadResult.processed}</strong> records</p>
                {uploadResult.failed > 0 && (
                  <>
                    <p>Failed to import: <strong>{uploadResult.failed}</strong> records</p>
                    {uploadResult.errors.length > 0 && (
                      <div className="mt-2 text-xs bg-background p-2 rounded max-h-24 overflow-y-auto">
                        {uploadResult.errors.map((err, i) => (
                          <div key={i} className="text-warning py-0.5">{err}</div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </AlertDescription>
            </Alert>
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
                <>Processing...</>
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
