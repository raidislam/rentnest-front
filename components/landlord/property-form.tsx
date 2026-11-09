"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError, FormField, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { browserApi } from "@/lib/api/browser";
import type { UpdatePropertyBody } from "@/lib/api/dto";
import { applyFieldErrors, toApiError } from "@/lib/api/errors";
import { joinLocation, toPropertyBody, type MappedCategory, type MappedProperty } from "@/lib/api/mappers";
import { createProperty, updateProperty } from "@/lib/api/services/landlord";
import { AMENITIES } from "@/lib/constants";

const CITY_SUGGESTIONS = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi"];

// Only fields the backend supports: title, description, location, price, propertyType, amenities, categoryId
// (+ availability on update). There are no photo, bedroom, bathroom or size fields.
const schema = z.object({
  title: z.string().trim().min(10, "Use a descriptive title of at least 10 characters.").max(100, "Keep the title under 100 characters."),
  description: z
    .string()
    .trim()
    .min(40, "Describe the property in at least 40 characters.")
    .max(2000, "Keep the description under 2,000 characters."),
  categoryId: z.string().min(1, "Choose a property type."),
  area: z.string().trim().min(2, "Enter the area or neighbourhood."),
  city: z.string().trim().min(2, "Enter the city."),
  address: z.string().trim(),
  price: z.number({ error: "Enter the monthly rent." }).positive("Rent must be more than ৳0.").max(10_000_000, "That rent looks too high."),
  amenities: z.array(z.string()).min(1, "Select at least one amenity."),
  isAvailable: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
type FieldName = keyof FormValues;

/** Backend field -> form field, for showing backend validation errors on the right input. */
const BACKEND_FIELD_MAP: Partial<Record<string, FieldName>> = {
  propertyType: "categoryId",
  location: "area",
  availability: "isAvailable",
};
const FORM_FIELDS: FieldName[] = ["title", "description", "categoryId", "area", "city", "address", "price", "amenities", "isAvailable"];

function toDefaults(property: MappedProperty | undefined, categories: MappedCategory[]): Partial<FormValues> {
  if (!property) return { title: "", description: "", categoryId: "", area: "", city: "", address: "", amenities: [], isAvailable: true };
  // Use the property's categoryId; fall back to matching the category name with propertyType.
  const categoryId =
    (property.categoryId && categories.some((c) => c.id === property.categoryId) && property.categoryId) ||
    categories.find((c) => c.name.toUpperCase() === property.type.toUpperCase())?.id ||
    "";
  return {
    title: property.title,
    description: property.description,
    categoryId,
    area: property.location.area,
    city: property.location.city,
    address: property.location.address,
    price: property.price,
    amenities: property.amenities,
    isAvailable: property.isAvailable,
  };
}

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

/** PUT body with only the fields that changed (the backend documents every PUT field as optional). */
function changedFields(values: FormValues, original: Partial<FormValues>, category: MappedCategory | undefined): UpdatePropertyBody {
  const body: UpdatePropertyBody = {};
  if (values.title.trim() !== original.title) body.title = values.title.trim();
  if (values.description.trim() !== original.description) body.description = values.description.trim();
  const location = joinLocation({ address: values.address, area: values.area, city: values.city });
  const originalLocation = joinLocation({ address: original.address ?? "", area: original.area ?? "", city: original.city ?? "" });
  if (location !== originalLocation) body.location = location;
  if (values.price !== original.price) body.price = values.price;
  if (!sameSet(values.amenities, original.amenities ?? [])) body.amenities = values.amenities;
  if (values.categoryId !== original.categoryId && category) {
    body.categoryId = category.id;
    body.propertyType = category.name;
  }
  if (values.isAvailable !== original.isAvailable) body.availability = values.isAvailable;
  return body;
}

interface PropertyFormProps {
  /** From GET /api/categories. */
  categories: MappedCategory[];
  /** Present when editing. */
  property?: MappedProperty;
}

export function PropertyForm({ categories, property }: PropertyFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!property;
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [defaults] = useState(() => toDefaults(property, categories));
  // Keep amenities the backend already stores (free text) selectable, so editing never drops them.
  const amenityOptions = [...AMENITIES, ...(property?.amenities ?? []).filter((a) => !(AMENITIES as readonly string[]).includes(a))];

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: defaults,
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const category = categories.find((c) => c.id === values.categoryId);
    try {
      if (property) {
        const body = changedFields(values, defaults, category);
        if (Object.keys(body).length === 0) {
          toast({ title: "No changes to save" });
          return;
        }
        await updateProperty(browserApi, property.id, body); // PUT /api/landlord/properties/:id
        toast({ title: "Changes saved", description: `“${values.title}” has been updated.` });
      } else {
        if (!category) {
          setError("categoryId", { type: "manual", message: "Choose a property type." });
          return;
        }
        // POST /api/landlord/properties with exactly the documented fields.
        await createProperty(
          browserApi,
          toPropertyBody({
            title: values.title,
            description: values.description,
            location: { address: values.address, area: values.area, city: values.city },
            price: values.price,
            amenities: values.amenities,
            category: { id: category.id, name: category.name },
          }),
        );
        toast({ title: "Property created", description: `“${values.title}” is now listed.` });
      }
      setRedirecting(true);
      router.push("/dashboard/landlord/properties");
      router.refresh();
    } catch (err) {
      // 401 is handled by browserApi. 400 field errors go on their inputs; 403/404/409/network show the message.
      const error = toApiError(err);
      if (!applyFieldErrors(error, setError, BACKEND_FIELD_MAP, FORM_FIELDS)) setServerError(error.message);
    }
  };

  const busy = isSubmitting || redirecting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <CircleAlert aria-hidden className="size-5 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      <Section title="Basic information" description="What renters see first in search results.">
        <FormField id="title" label="Property title" error={errors.title?.message}>
          <Input id="title" placeholder="e.g. Sunlit 3-bed apartment near Gulshan Lake" {...fieldAria("title", errors.title)} {...register("title")} />
        </FormField>
        <FormField id="categoryId" label="Property type" error={errors.categoryId?.message}>
          <Select id="categoryId" {...fieldAria("categoryId", errors.categoryId)} {...register("categoryId")}>
            <option value="">Select a type</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="description" label="Description" error={errors.description?.message}>
          <Textarea
            id="description"
            rows={5}
            placeholder="Describe the layout, condition, building facilities and what's nearby."
            {...fieldAria("description", errors.description)}
            {...register("description")}
          />
        </FormField>
      </Section>

      <Section title="Location" description="Saved as one address line, e.g. “Road 9A, Dhanmondi, Dhaka”.">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="area" label="Area / neighbourhood" error={errors.area?.message}>
            <Input id="area" placeholder="e.g. Dhanmondi" {...fieldAria("area", errors.area)} {...register("area")} />
          </FormField>
          <FormField id="city" label="City" error={errors.city?.message}>
            <Input id="city" list="city-options" placeholder="e.g. Dhaka" {...fieldAria("city", errors.city)} {...register("city")} />
            <datalist id="city-options">
              {CITY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </FormField>
          <FormField id="address" label="Street address (optional)" error={errors.address?.message} className="sm:col-span-2">
            <Input id="address" placeholder="e.g. Road 9A, House 12" {...fieldAria("address", errors.address)} {...register("address")} />
          </FormField>
        </div>
      </Section>

      <Section title="Rent">
        <FormField id="price" label="Monthly rent (৳)" error={errors.price?.message}>
          <div className="relative sm:max-w-xs">
            <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-500">
              ৳
            </span>
            <Input
              id="price"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              placeholder="45000"
              className="pl-7"
              {...fieldAria("price", errors.price)}
              {...register("price", { valueAsNumber: true })}
            />
          </div>
        </FormField>
      </Section>

      <Section title="Amenities" description="Select everything the property offers.">
        <fieldset aria-describedby={errors.amenities ? "amenities-error" : undefined}>
          <legend className="sr-only">Amenities</legend>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {amenityOptions.map((amenity) => {
              const id = `amenity-${amenity.replace(/\W+/g, "-")}`;
              return (
                <div key={amenity} className="flex items-center gap-2.5">
                  <input id={id} type="checkbox" value={amenity} className="size-4 accent-brand-700" {...register("amenities")} />
                  <label htmlFor={id} className="text-sm text-stone-700">
                    {amenity}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
        <FieldError id="amenities-error">{errors.amenities?.message}</FieldError>
      </Section>

      {/* Availability isn't part of the create request; it can be changed after the property exists. */}
      {isEdit && (
        <Section title="Availability">
          <Controller
            control={control}
            name="isAvailable"
            render={({ field }) => (
              <div className="flex items-start gap-3">
                <Switch id="isAvailable" checked={field.value} onCheckedChange={field.onChange} aria-labelledby="isAvailable-label" aria-describedby="isAvailable-hint" />
                <div>
                  <p id="isAvailable-label" className="text-sm font-medium text-stone-900">
                    {field.value ? "Available for rent" : "Not available"}
                  </p>
                  <p id="isAvailable-hint" className="text-sm text-stone-500">
                    {field.value
                      ? "Shown in public search; renters can send rental requests."
                      : "Hidden from public search; renters can't send new requests."}
                  </p>
                </div>
              </div>
            )}
          />
        </Section>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-3 border-t border-stone-200 bg-stone-50/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:flex-row sm:justify-end sm:px-6 lg:mx-0 lg:rounded-xl lg:border lg:px-5">
        <Link
          href="/dashboard/landlord/properties"
          aria-disabled={busy}
          className={buttonVariants({ variant: "outline", size: "lg", className: busy ? "pointer-events-none opacity-50" : undefined })}
        >
          Cancel
        </Link>
        <Button type="submit" size="lg" disabled={busy} className="sm:min-w-44">
          {busy && <LoaderCircle className="animate-spin" />}
          {redirecting
            ? "Redirecting…"
            : isSubmitting
              ? isEdit
                ? "Saving changes…"
                : "Creating property…"
              : isEdit
                ? "Save changes"
                : "Create property"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="font-semibold text-stone-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
