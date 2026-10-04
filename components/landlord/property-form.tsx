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
import { AMENITIES, PROPERTY_TYPES } from "@/lib/constants";
import { MockApiError, createProperty, updateProperty } from "@/lib/mock-api";
import type { Amenity, Property, PropertyInput, PropertyType } from "@/lib/types";
import { ImageUrlManager } from "./image-url-manager";

const TYPE_VALUES = PROPERTY_TYPES.map((t) => t.value) as [PropertyType, ...PropertyType[]];
const AMENITY_VALUES = AMENITIES as [Amenity, ...Amenity[]];
const CITY_SUGGESTIONS = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi"];

const wholeNumber = (missing: string) => z.number({ error: missing }).int("Use a whole number.");

const schema = z.object({
  title: z.string().trim().min(10, "Use a descriptive title of at least 10 characters.").max(100, "Keep the title under 100 characters."),
  description: z
    .string()
    .trim()
    .min(40, "Describe the property in at least 40 characters.")
    .max(2000, "Keep the description under 2,000 characters."),
  type: z.enum(TYPE_VALUES, { error: "Choose a property type." }),
  area: z.string().trim().min(2, "Enter the area or neighbourhood."),
  city: z.string().trim().min(2, "Enter the city."),
  address: z.string().trim().min(3, "Enter the street address."),
  price: wholeNumber("Enter the monthly rent.").positive("Rent must be more than ৳0.").max(10_000_000, "That rent looks too high."),
  bedrooms: wholeNumber("Enter the number of bedrooms.").min(0, "Bedrooms can't be negative.").max(20, "Enter 20 or fewer bedrooms."),
  bathrooms: wholeNumber("Enter the number of bathrooms.").min(1, "Enter at least 1 bathroom.").max(20, "Enter 20 or fewer bathrooms."),
  areaSqft: wholeNumber("Enter the size in square feet.").positive("Size must be more than 0.").max(100_000, "That size looks too large."),
  amenities: z.array(z.enum(AMENITY_VALUES)).min(1, "Select at least one amenity."),
  images: z.array(z.url()).min(1, "Add at least one photo.").max(10, "Add up to 10 photos."),
  isAvailable: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function toDefaults(property?: Property): Partial<FormValues> {
  if (!property) return { title: "", description: "", area: "", city: "", address: "", amenities: [], images: [], isAvailable: true };
  return {
    title: property.title,
    description: property.description,
    type: property.type,
    area: property.location.area,
    city: property.location.city,
    address: property.location.address,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqft: property.areaSqft,
    amenities: property.amenities,
    images: property.images,
    isAvailable: property.isAvailable,
  };
}

interface PropertyFormProps {
  landlordId: string;
  /** Present when editing. */
  property?: Property;
}

export function PropertyForm({ landlordId, property }: PropertyFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!property;
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: toDefaults(property),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const input: PropertyInput = {
      title: values.title,
      description: values.description,
      type: values.type,
      location: { area: values.area, city: values.city, address: values.address },
      price: values.price,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      areaSqft: values.areaSqft,
      amenities: values.amenities,
      images: values.images,
      isAvailable: values.isAvailable,
    };
    try {
      if (property) {
        await updateProperty(property.id, input);
        toast({ title: "Changes saved", description: `“${values.title}” has been updated.` });
      } else {
        await createProperty(landlordId, input);
        toast({ title: "Property created", description: "It will be visible to renters once our team approves it." });
      }
      setRedirecting(true);
      router.push("/dashboard/landlord/properties");
    } catch (err) {
      setServerError(err instanceof MockApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  const busy = isSubmitting || redirecting;
  const numberField = { valueAsNumber: true } as const;

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
        <FormField id="type" label="Property type" error={errors.type?.message}>
          <Select id="type" {...fieldAria("type", errors.type)} {...register("type")}>
            <option value="">Select a type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
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

      <Section title="Location">
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
          <FormField id="address" label="Street address" error={errors.address?.message} className="sm:col-span-2">
            <Input id="address" placeholder="e.g. Road 9A, House 12" {...fieldAria("address", errors.address)} {...register("address")} />
          </FormField>
        </div>
      </Section>

      <Section title="Rent & size">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="price" label="Monthly rent (৳)" error={errors.price?.message} className="sm:col-span-2">
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
                {...register("price", numberField)}
              />
            </div>
          </FormField>
          <FormField id="bedrooms" label="Bedrooms" error={errors.bedrooms?.message}>
            <Input id="bedrooms" type="number" inputMode="numeric" min={0} max={20} {...fieldAria("bedrooms", errors.bedrooms)} {...register("bedrooms", numberField)} />
          </FormField>
          <FormField id="bathrooms" label="Bathrooms" error={errors.bathrooms?.message}>
            <Input id="bathrooms" type="number" inputMode="numeric" min={1} max={20} {...fieldAria("bathrooms", errors.bathrooms)} {...register("bathrooms", numberField)} />
          </FormField>
          <FormField id="areaSqft" label="Size (sqft)" error={errors.areaSqft?.message}>
            <Input id="areaSqft" type="number" inputMode="numeric" min={1} placeholder="1200" {...fieldAria("areaSqft", errors.areaSqft)} {...register("areaSqft", numberField)} />
          </FormField>
        </div>
      </Section>

      <Section title="Amenities" description="Select everything the property offers.">
        <fieldset aria-describedby={errors.amenities ? "amenities-error" : undefined}>
          <legend className="sr-only">Amenities</legend>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {AMENITIES.map((amenity) => {
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

      <Section title="Photos" description="Add up to 10 photos. Bright, wide shots of each room work best.">
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <ImageUrlManager
              value={field.value ?? []}
              onChange={field.onChange}
              invalid={!!errors.images}
              describedBy={errors.images ? "images-error" : undefined}
            />
          )}
        />
        <FieldError id="images-error">{errors.images?.message ?? errors.images?.root?.message}</FieldError>
      </Section>

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
                    ? "Renters can send you rental requests for this property."
                    : "The listing stays visible but renters can't send new requests."}
                </p>
              </div>
            </div>
          )}
        />
      </Section>

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
