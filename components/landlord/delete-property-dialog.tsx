"use client";

import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { browserApi } from "@/lib/api/browser";
import { toApiError } from "@/lib/api/errors";
import type { MappedProperty } from "@/lib/api/mappers";
import { deleteProperty } from "@/lib/api/services/landlord";

interface DeletePropertyDialogProps {
  /** The property to delete; the dialog is open while this is set. */
  property: MappedProperty | null;
  requestCount: number;
  onClose: () => void;
  /** Called only after the backend confirms the deletion. */
  onDeleted: (id: string) => void;
}

/** DELETE /api/landlord/properties/:id. The backend refuses (409) when the property has rental requests. */
export function DeletePropertyDialog({ property, requestCount, onClose, onDeleted }: DeletePropertyDialogProps) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (deleting) return;
    setError(null);
    onClose();
  };

  const confirm = async () => {
    if (!property) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteProperty(browserApi, property.id);
      toast({ title: "Property deleted", description: `“${property.title}” was removed from your listings.` });
      onDeleted(property.id);
      onClose();
    } catch (err) {
      // e.g. 409 "has rental requests", 403, 404, network. The property stays in the list.
      setError(toApiError(err).message);
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
        <p>This permanently removes the property from your listings. This can&apos;t be undone.</p>
        {requestCount > 0 && (
          <p className="rounded-lg bg-amber-50 p-3 text-amber-900">
            This property has {requestCount} rental {requestCount === 1 ? "request" : "requests"}. Properties with rental
            requests can&apos;t be deleted — mark it as unavailable instead to hide it from search.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
