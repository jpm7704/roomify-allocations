
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, AlertTriangle, Download } from 'lucide-react';

interface ExcelUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ExcelUploadDialog = ({ isOpen, onOpenChange, onSuccess }: ExcelUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file (.csv)');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const downloadTemplate = () => {
    const data = [
      ['name', 'room', 'dietary'],
      ['Jane Doe', 'Double Room', 'Vegetarian'],
      ['Mary Smith', 'Single Room', 'None']
    ];
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      
      toast.info('Processing your CSV file...');
      
      const response = await supabase.functions.invoke('process-excel', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`CSV file processed successfully! ${response.data.processed} records imported.`);
      
      if (response.data.failed > 0) {
        toast.warning(`${response.data.failed} records failed to import.`);
      }
      
      onOpenChange(false);
      onSuccess();
      setFile(null);

    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Failed to process file');
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Attendees from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing attendee data with the following columns: name, room, dietary
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
            <p className="text-sm font-medium">Required CSV Format:</p>
            <pre className="bg-muted p-2 rounded text-xs font-mono">
              name,room,dietary
              Jane Doe,Double Room,Vegetarian
              Mary Smith,Single Room,None
            </pre>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={downloadTemplate}
              className="w-full mt-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/20 text-destructive flex items-start gap-2 p-3 rounded border border-destructive/50">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
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
