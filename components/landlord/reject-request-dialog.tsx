"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { MappedRentalRequest } from "@/lib/api/mappers";

interface RejectRequestDialogProps {
  /** The request being rejected; the dialog is open while this is set. */
  request: MappedRentalRequest | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmation before rejecting. The backend accepts only { status }, so there is no note field. */
export function RejectRequestDialog({ request, onClose, onConfirm }: RejectRequestDialogProps) {
  const tenant = request?.tenant?.name ?? "the tenant";
  return (
    <Dialog
      open={!!request}
      onClose={onClose}
      title="Reject this request?"
      description={request ? [request.tenant?.name, request.property?.title].filter(Boolean).join(" · ") || undefined : undefined}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            <X />
            Reject request
          </Button>
        </div>
      }
    >
      <p className="text-sm text-stone-700">
        The request from {tenant} will be marked as rejected. This can&apos;t be undone.
      </p>
    </Dialog>
  );
}
