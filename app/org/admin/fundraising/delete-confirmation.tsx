"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { AlertTriangle, Loader2 } from "lucide-react";

interface CampaignData {
  raised: number;
  donorCount: number;
  isActive: boolean;
  goal: number;
}

interface DeleteCampaignConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignTitle: string;
  isDeleting: boolean;
  campaignData?: CampaignData;
}

export function DeleteCampaignConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  campaignTitle,
  isDeleting,
  campaignData,
}: DeleteCampaignConfirmationModalProps) {
  const hasRaisedFunds = campaignData && campaignData.raised > 0;
  const hasDonors = campaignData && campaignData.donorCount > 0;
  const isActiveCampaign = campaignData && campaignData.isActive;

  // Loading component with fallback
 const LoadingComponent = LoadingSpinner ?? (() => (
  <div className="flex items-center justify-center">
    <Loader2 className="h-4 w-4 animate-spin" />
  </div>
));


  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Delete Campaign</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{campaignTitle}"</span>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The campaign will be permanently
              removed from the system.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Campaign Impact Warning */}
        {(hasRaisedFunds || hasDonors || isActiveCampaign) && (
          <div className="my-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    This campaign has important data:
                  </p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {hasRaisedFunds && (
                      <li>
                        <span className="font-medium">
                          LKR {campaignData!.raised.toLocaleString()}
                        </span>{" "}
                        has been raised
                      </li>
                    )}
                    {hasDonors && (
                      <li>
                        <span className="font-medium">
                          {campaignData!.donorCount} donors
                        </span>{" "}
                        have contributed
                      </li>
                    )}
                    {isActiveCampaign && (
                      <li>
                        Campaign is currently{" "}
                        <span className="font-medium">active</span> and
                        accepting donations
                      </li>
                    )}
                  </ul>
                  <p className="text-sm mt-2">
                    Consider deactivating the campaign instead of deleting it to
                    preserve donation history.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Campaign Statistics Summary */}
        {campaignData && (
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <h4 className="text-sm font-medium">Campaign Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Goal:</span>
                <span className="ml-1 font-medium">
                  LKR {campaignData.goal.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Raised:</span>
                <span className="ml-1 font-medium">
                  LKR {campaignData.raised.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Progress:</span>
                <span className="ml-1 font-medium">
                  {campaignData.goal > 0
                    ? Math.round(
                        (campaignData.raised / campaignData.goal) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Donors:</span>
                <span className="ml-1 font-medium">
                  {campaignData.donorCount}
                </span>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <LoadingComponent />
                <span className="ml-2">Deleting...</span>
              </>
            ) : (
              "Delete Campaign"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteCampaignConfirmationModal;

