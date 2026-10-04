"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldHint, FormField, Textarea } from "@/components/ui/field";

const NOTE_MAX = 300;

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with the optional note (empty string if none). The caller closes the dialog. */
  onConfirm: (note: string) => void;
  title: string;
  subtitle?: string;
  /** Explains what will happen — be explicit for destructive actions. */
  children: ReactNode;
  confirmLabel: string;
  confirmIcon?: ReactNode;
  tone?: "danger" | "primary";
  /** Adds an optional free-text note (e.g. a reason) when set. */
  noteLabel?: string;
  notePlaceholder?: string;
}

export function ConfirmDialog({ open, onClose, title, subtitle, ...rest }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={subtitle}>
      {/* Mounted only while open so the note starts empty each time. */}
      {open && <ConfirmBody onClose={onClose} {...rest} />}
    </Dialog>
  );
}

function ConfirmBody({
  onClose,
  onConfirm,
  children,
  confirmLabel,
  confirmIcon,
  tone = "danger",
  noteLabel,
  notePlaceholder,
}: Omit<ConfirmDialogProps, "open" | "title" | "subtitle">) {
  const [note, setNote] = useState("");
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm(note);
      }}
    >
      <div className="space-y-3 text-sm text-stone-700">{children}</div>
      {noteLabel && (
        <FormField id="confirm-note" label={noteLabel}>
          <Textarea
            id="confirm-note"
            rows={3}
            maxLength={NOTE_MAX}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={notePlaceholder}
          />
          <FieldHint className="text-right text-xs">
            {note.length}/{NOTE_MAX}
          </FieldHint>
        </FormField>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant={tone}>
          {confirmIcon}
          {confirmLabel}
        </Button>
      </div>
    </form>
  );
}
