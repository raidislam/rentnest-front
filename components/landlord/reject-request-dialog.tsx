"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldHint, FormField, Textarea } from "@/components/ui/field";
import type { LandlordRequestView } from "@/lib/types";

const NOTE_MAX = 300;

interface RejectRequestDialogProps {
  /** The request being rejected; the dialog is open while this is set. */
  request: LandlordRequestView | null;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

export function RejectRequestDialog({ request, onClose, onConfirm }: RejectRequestDialogProps) {
  return (
    <Dialog
      open={!!request}
      onClose={onClose}
      title="Reject this request?"
      description={request ? `${request.tenant.name} · ${request.property?.title ?? "Removed property"}` : undefined}
    >
      {/* Mounted per request so the note starts empty each time. */}
      {request && <RejectForm key={request.id} tenantName={request.tenant.name} onClose={onClose} onConfirm={onConfirm} />}
    </Dialog>
  );
}

function RejectForm({ tenantName, onClose, onConfirm }: { tenantName: string; onClose: () => void; onConfirm: (note: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm(note);
      }}
    >
      <p className="text-sm text-stone-700">
        {tenantName.split(" ")[0]} will see that the request was declined. You can add a short note to explain why.
      </p>
      <FormField id="reject-note" label="Note to tenant (optional)">
        <Textarea
          id="reject-note"
          rows={3}
          maxLength={NOTE_MAX}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Sorry, the property has already been let for these dates."
        />
        <FieldHint className="text-right text-xs">
          {note.length}/{NOTE_MAX}
        </FieldHint>
      </FormField>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="danger">
          <X />
          Reject request
        </Button>
      </div>
    </form>
  );
}
