
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Receipt, Upload, Image } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getUser } from '@/lib/auth';

interface UploadReceiptProps {
  listId: string;
  itemId?: string;
  onReceiptUploaded: () => void;
}

const UploadReceipt: React.FC<UploadReceiptProps> = ({ 
  listId, 
  itemId, 
  onReceiptUploaded 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    
    try {
      setIsUploading(true);
      
      const user = await getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      // Get a pre-signed URL for upload
      const response = await api.receipts.getUploadUrl(listId, user.id);
      
      // Upload the file using the pre-signed URL
      const uploadSuccess = await api.receipts.uploadImage(response.uploadUrl, selectedFile);
      
      if (uploadSuccess) {
        toast.success('Receipt uploaded successfully');
        setSelectedFile(null);
        setPreviewUrl(null);
        onReceiptUploaded();
      } else {
        throw new Error('Failed to upload receipt');
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload receipt');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <Receipt className="w-4 h-4" />
          Upload Receipt
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="receipt">Select Image</Label>
            <div className="border-2 border-dashed border-muted rounded-md p-6 flex flex-col items-center justify-center">
              {previewUrl ? (
                <div className="relative w-full aspect-square max-h-64 overflow-hidden rounded-md">
                  <img 
                    src={previewUrl} 
                    alt="Receipt preview" 
                    className="object-contain w-full h-full"
                  />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Image className="w-12 h-12 text-muted mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click or drag and drop to upload receipt
                  </p>
                  <input
                    id="receipt"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <Label 
                    htmlFor="receipt" 
                    className="cursor-pointer px-4 py-2 border border-input bg-background hover:bg-muted rounded-md"
                  >
                    Select File
                  </Label>
                </>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="gap-1.5"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload Receipt'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadReceipt;
