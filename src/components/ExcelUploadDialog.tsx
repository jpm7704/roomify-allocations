
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileUpIcon, AlertTriangle, WifiIcon, KeyIcon } from 'lucide-react';

interface ExcelUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ExcelUploadDialog = ({ isOpen, onOpenChange, onSuccess }: ExcelUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error' | 'testing'>('idle');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

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

      const formData = new FormData();
      formData.append('file', file);
      
      // If manual API key is provided, add it to the request
      if (apiKey.trim()) {
        formData.append('apiKey', apiKey.trim());
      }
      
      setProgress(30);
      setStatus('processing');
      
      toast.info('Processing with Mistral AI, this may take a few moments...');
      
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
    setShowApiKeyInput(false);
  };

  const testConnection = async () => {
    try {
      setStatus('testing');
      toast.info('Testing connection to Mistral AI...');
      
      const testBody: any = { action: 'test_connection' };
      
      // If manual API key is provided, add it to the test request
      if (apiKey.trim()) {
        testBody.apiKey = apiKey.trim();
      }
      
      const testResult = await supabase.functions.invoke('process-excel', {
        body: testBody,
      });
      
      if (testResult.error) {
        throw new Error(testResult.error.message);
      }
      
      if (testResult.data?.success) {
        toast.success('Successfully connected to Mistral AI API!');
      } else {
        toast.error(`Connection test failed: ${testResult.data?.message || 'Unknown error'}`);
        // If connection failed, show the API key input
        setShowApiKeyInput(true);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error(`Connection test failed: ${error.message}`);
      // If connection failed, show the API key input
      setShowApiKeyInput(true);
    } finally {
      setStatus('idle');
    }
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
                disabled={uploading || status === 'testing'}
                className={file ? 'file:text-primary' : ''}
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {showApiKeyInput && (
            <div className="grid w-full gap-1.5">
              <Label htmlFor="apiKey">Mistral AI API Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Mistral AI API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={uploading || status === 'testing'}
                  className="font-mono text-sm"
                />
                <Button 
                  type="button" 
                  size="icon" 
                  variant="outline"
                  onClick={() => setShowApiKeyInput(false)}
                  disabled={uploading || status === 'testing'}
                >
                  <KeyIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                If the server API key isn't working, you can provide your own key here.
                <a href="https://console.mistral.ai/api-keys/" className="text-primary ml-1" target="_blank" rel="noreferrer">
                  Get a key
                </a>
              </p>
            </div>
          )}

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

          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={testConnection}
                disabled={uploading || status === 'testing'}
              >
                <WifiIcon className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                disabled={uploading || status === 'testing'}
              >
                <KeyIcon className="mr-2 h-4 w-4" />
                {showApiKeyInput ? 'Hide API Key' : 'Enter API Key'}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={uploading || status === 'testing'}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!file || uploading || status === 'testing'}
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelUploadDialog;
