
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileUpIcon, AlertTriangle } from 'lucide-react';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          selectedFile.type !== 'application/vnd.ms-excel') {
        toast.error('Please select a valid Excel file (.xls or .xlsx)');
        return;
      }
      setFile(selectedFile);
      setStatus('idle');
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

      // Upload and process the file
      const formData = new FormData();
      formData.append('file', file);
      
      setProgress(30);
      setStatus('processing');
      
      const result = await supabase.functions.invoke('process-excel', {
        body: formData,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setProgress(100);
      setStatus('success');
      
      toast.success(`Excel file processed successfully! ${result.data.processed} records imported.`);
      
      if (result.data.failed > 0) {
        toast.warning(`${result.data.failed} records failed to import.`);
      }
      
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
        resetForm();
      }, 1500);

    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus('error');
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProgress(0);
    setStatus('idle');
    setUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Attendees from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file containing attendee data. Our AI will process and organize it for you.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="file">Excel File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
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

          {(status === 'uploading' || status === 'processing') && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  {status === 'uploading' ? 'Uploading file...' : 'Processing with AI...'}
                </span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {status === 'error' && (
            <div className="bg-destructive/20 text-destructive flex items-center gap-2 p-2 rounded border border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">An error occurred while processing the file.</span>
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
            <Button type="submit" disabled={!file || uploading}>
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
