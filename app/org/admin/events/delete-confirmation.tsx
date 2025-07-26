import React from "react";
import { X, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

// Add this interface for the delete confirmation modal
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
  isDeleting: boolean;
}

// Add the DeleteConfirmationModal component
export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, eventName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">
            Delete Event
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">
                Are you sure you want to delete this event?
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3 mb-6">
            <p className="text-sm">
              <span className="font-medium">Event:</span> {eventName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All event data, registrations, and associated content will be
              permanently removed.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-muted/50">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
