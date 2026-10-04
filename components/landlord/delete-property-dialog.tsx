"use client";

import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { MockApiError, deleteProperty } from "@/lib/mock-api";
import type { Property } from "@/lib/types";

interface DeletePropertyDialogProps {
  /** The property to delete; the dialog is open while this is set. */
  property: Property | null;
  requestCount: number;
  onClose: () => void;
}

export function DeletePropertyDialog({ property, requestCount, onClose }: DeletePropertyDialogProps) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  const close = () => {
    if (!deleting) onClose();
  };

  const confirm = async () => {
    if (!property) return;
    setDeleting(true);
    try {
      await deleteProperty(property.id);
      toast({ title: "Property deleted", description: `“${property.title}” was removed from your listings.` });
      onClose();
    } catch (err) {
      toast({
        title: "Couldn't delete property",
        description: err instanceof MockApiError ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={!!property}
      onClose={close}
      title="Delete this property?"
      description={property?.title}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={close} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} disabled={deleting}>
            {deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
            {deleting ? "Deleting…" : "Delete property"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-stone-700">
        <p>
          This removes the property from your listings and renters will no longer be able to find it or send requests.
          This can&apos;t be undone.
        </p>
        {requestCount > 0 && (
          <p className="rounded-lg bg-amber-50 p-3 text-amber-900">
            This property has {requestCount} rental {requestCount === 1 ? "request" : "requests"}. They&apos;ll stay in your
            request history for your records.
          </p>
        )}
      </div>
    </Dialog>
  );
}
