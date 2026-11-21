"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { browserApi } from "@/lib/api/browser";
import { toApiError, type ApiError } from "@/lib/api/errors";
import type { MappedCategory } from "@/lib/api/mappers";
import { createCategory, deleteCategory, updateCategory } from "@/lib/api/services/admin";

// Same limits as the backend's validation (name 2–50 characters, description up to 200).
const NAME_MIN = 2;
const NAME_MAX = 50;
const DESCRIPTION_MAX = 200;

type FieldErrors = { name?: string; description?: string };

function validate(name: string, description: string): FieldErrors {
  const errors: FieldErrors = {};
  if (name.trim().length < NAME_MIN) errors.name = `Use at least ${NAME_MIN} characters.`;
  else if (name.trim().length > NAME_MAX) errors.name = `Keep the name under ${NAME_MAX} characters.`;
  if (description.trim().length > DESCRIPTION_MAX) errors.description = `Keep the description under ${DESCRIPTION_MAX} characters.`;
  return errors;
}

/** Backend 400 field errors -> form fields; returns the remaining message for the banner (or null). */
function splitErrors(error: ApiError): { fields: FieldErrors; message: string | null } {
  const fields: FieldErrors = {};
  for (const e of error.fieldErrors) if (e.field === "name" || e.field === "description") fields[e.field] = e.message;
  return { fields, message: Object.keys(fields).length > 0 ? null : error.message };
}

/**
 * Categories: list from GET /api/categories; create/update/delete via
 * POST /api/admin/categories, PUT/DELETE /api/admin/categories/:id with { name, description }.
 * The list changes only after the backend confirms.
 */
export function CategoryManager({ initialCategories }: { initialCategories: MappedCategory[] }) {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState(initialCategories);
  const [lastInitial, setLastInitial] = useState(initialCategories);
  if (initialCategories !== lastInitial) {
    setLastInitial(initialCategories);
    setCategories(initialCategories);
  }
  const [editing, setEditing] = useState<MappedCategory | "new" | null>(null);
  const [deleting, setDeleting] = useState<MappedCategory | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  const remove = async () => {
    const target = deleting;
    if (!target) return;
    setDeleting(null);
    setBusyDelete(true);
    try {
      await deleteCategory(browserApi, target.id);
      setCategories((list) => list.filter((c) => c.id !== target.id));
      toast({ title: "Category deleted", description: `“${target.name}” was removed.` });
      router.refresh();
    } catch (err) {
      // 409 = the category still has properties.
      toast({ title: "Couldn't delete category", description: toApiError(err).message, variant: "error" });
    } finally {
      setBusyDelete(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus />
          Add category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={Tags} title="No categories yet" description="Landlords choose a category for every property. Add the first one." />
      ) : (
        <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
              <div className="min-w-0 flex-1 basis-60">
                <p className="font-medium text-stone-900">{c.name}</p>
                {c.description && <p className="text-sm text-stone-500">{c.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(c)}>
                  <Pencil />
                  Edit
                  <span className="sr-only">{c.name}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleting(c)}
                  disabled={busyDelete}
                  className="text-red-700 hover:border-red-300 hover:bg-red-50"
                >
                  <Trash2 />
                  Delete
                  <span className="sr-only">{c.name}</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add category" : "Edit category"}
        description={editing && editing !== "new" ? editing.name : undefined}
      >
        {editing !== null && (
          <CategoryForm
            key={editing === "new" ? "new" : editing.id}
            category={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSaved={(saved, isNew) => {
              setCategories((list) => (isNew ? [...list, saved] : list.map((c) => (c.id === saved.id ? saved : c))));
              toast({ title: isNew ? "Category added" : "Category updated", description: `“${saved.name}” was saved.` });
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title={`Delete “${deleting?.name ?? "category"}”?`}
        confirmLabel="Delete category"
        confirmIcon={<Trash2 />}
      >
        <p>This can&apos;t be undone. A category that still has properties can&apos;t be deleted.</p>
      </ConfirmDialog>
    </div>
  );
}

function CategoryForm({
  category,
  onCancel,
  onSaved,
}: {
  category?: MappedCategory;
  onCancel: () => void;
  onSaved: (category: MappedCategory, isNew: boolean) => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const local = validate(name, description);
    setErrors(local);
    setMessage(null);
    if (Object.keys(local).length > 0) return;
    // Exactly the documented fields.
    const body = { name: name.trim(), description: description.trim() };
    setSaving(true);
    try {
      if (category) {
        await updateCategory(browserApi, category.id, body);
        onSaved({ id: category.id, name: body.name, description: body.description || undefined }, false);
      } else {
        const { id } = await createCategory(browserApi, body);
        onSaved({ id, name: body.name, description: body.description || undefined }, true);
      }
    } catch (err) {
      // 400 validation -> fields; 409 duplicate name; 404 unknown; network.
      const split = splitErrors(toApiError(err));
      setErrors(split.fields);
      setMessage(split.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {message && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {message}
        </p>
      )}
      <FormField id="category-name" label="Name" error={errors.name}>
        <Input id="category-name" value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? true : undefined} />
      </FormField>
      <FormField id="category-description" label="Description (optional)" error={errors.description}>
        <Textarea
          id="category-description"
          rows={3}
          value={description}
          maxLength={DESCRIPTION_MAX}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={errors.description ? true : undefined}
        />
      </FormField>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="animate-spin" />}
          {saving ? "Saving…" : category ? "Save changes" : "Add category"}
        </Button>
      </div>
    </form>
  );
}
