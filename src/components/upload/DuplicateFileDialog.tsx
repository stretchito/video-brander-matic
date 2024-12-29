import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DuplicateFileDialogProps {
  isOpen: boolean;
  fileName: string;
  onKeepNew: () => void;
  onKeepExisting: () => void;
  onClose: () => void;
}

const DuplicateFileDialog = ({
  isOpen,
  fileName,
  onKeepNew,
  onKeepExisting,
  onClose,
}: DuplicateFileDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate File Detected</AlertDialogTitle>
          <AlertDialogDescription>
            The file "{fileName}" already exists in your storage. Would you like to:
            <ul className="list-disc list-inside mt-2">
              <li>Keep the new version you just uploaded</li>
              <li>Use the existing version from storage</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onKeepExisting}>
            Use Existing
          </AlertDialogAction>
          <AlertDialogAction onClick={onKeepNew} className="bg-primary">
            Keep New
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DuplicateFileDialog;