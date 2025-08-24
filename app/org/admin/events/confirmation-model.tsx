import React from "react";
import { X, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmVariant?: "default" | "destructive";
  isLoading: boolean;
  itemName?: string;
  icon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmVariant = "default",
  isLoading,
  itemName,
  icon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                {icon ?? (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">{message}</h4>
            </div>
          </div>

          {itemName && (
            <div className="bg-muted rounded-lg p-3 mb-6">
              <p className="text-sm">
                <span className="font-medium">Event:</span> {itemName}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-muted/50">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {confirmText}...
              </>
            ) : (
              <>
                {confirmVariant === "destructive" && (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                {confirmText}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
