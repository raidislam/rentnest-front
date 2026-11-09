// Centralized API error model. Safe to import from Server and Client Components.
//
// Every failure — HTTP error, network failure, timeout or a response we can't
// read — becomes one ApiError, so UI code only ever handles a single type.

import axios from "axios";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";
import type { ApiFailureDTO, ApiFieldErrorDTO } from "./dto";

export type ApiErrorKind =
  /** The backend answered with a non-2xx status. */
  | "http"
  /** No response at all: offline, DNS failure, CORS rejection, server down. */
  | "network"
  /** The request took longer than the client timeout. */
  | "timeout"
  /** A 2xx response whose body didn't match what the frontend needs. */
  | "invalid_response"
  /** Anything else (a bug in our own code, usually). */
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status code, or null when no response was received. */
  readonly status: number | null;
  /** Per-field validation messages from the backend (400 "Validation error"). */
  readonly fieldErrors: ApiFieldErrorDTO[];

  constructor(
    message: string,
    options: { kind: ApiErrorKind; status?: number | null; fieldErrors?: ApiFieldErrorDTO[]; cause?: unknown },
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.kind = options.kind;
    this.status = options.status ?? null;
    this.fieldErrors = options.fieldErrors ?? [];
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

/** Fallback messages, used only when the backend didn't send its own. */
const STATUS_MESSAGES: Record<number, string> = {
  400: "Some of the information you entered isn't valid.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "This action conflicts with the current state. Please refresh and try again.",
  500: "The server ran into a problem. Please try again shortly.",
};

const NETWORK_MESSAGE = "We can't reach the RentNest server. Check your connection and try again.";
const TIMEOUT_MESSAGE = "The server is taking too long to respond. Please try again.";
const UNKNOWN_MESSAGE = "Something went wrong. Please try again.";

/** True for the documented error body: { success: false, message, errorDetails }. */
export function isApiFailure(body: unknown): body is ApiFailureDTO {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { success?: unknown }).success === false &&
    typeof (body as { message?: unknown }).message === "string"
  );
}

function readFieldErrors(details: unknown): ApiFieldErrorDTO[] {
  if (!Array.isArray(details)) return [];
  return details.filter(
    (d): d is ApiFieldErrorDTO =>
      typeof d === "object" && d !== null && typeof d.field === "string" && typeof d.message === "string",
  );
}

/** Builds an ApiError from a backend failure body that arrived with a given status. */
export function apiErrorFromBody(body: ApiFailureDTO, status: number | null, cause?: unknown): ApiError {
  return new ApiError(body.message || (status && STATUS_MESSAGES[status]) || UNKNOWN_MESSAGE, {
    kind: "http",
    status,
    fieldErrors: readFieldErrors(body.errorDetails),
    cause,
  });
}

/** Converts anything thrown during an API call into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response;
      if (isApiFailure(data)) return apiErrorFromBody(data, status, error);
      return new ApiError(STATUS_MESSAGES[status] ?? (status >= 500 ? STATUS_MESSAGES[500] : UNKNOWN_MESSAGE), {
        kind: "http",
        status,
        cause: error,
      });
    }
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError(TIMEOUT_MESSAGE, { kind: "timeout", cause: error });
    }
    return new ApiError(NETWORK_MESSAGE, { kind: "network", cause: error });
  }

  return new ApiError(UNKNOWN_MESSAGE, { kind: "unknown", cause: error });
}

/**
 * Copies backend validation messages onto React Hook Form fields.
 *
 * `fieldMap` translates backend field names to form field names where they
 * differ, e.g. { propertyType: "type", availability: "isAvailable" }.
 * Backend fields with no matching form field are skipped.
 *
 * @returns true if at least one field error was applied.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
  fieldMap: Partial<Record<string, FieldPath<T>>> = {},
  knownFields?: readonly FieldPath<T>[],
): boolean {
  let applied = false;
  for (const { field, message } of error.fieldErrors) {
    const target = fieldMap[field] ?? (field as FieldPath<T>);
    if (knownFields && !knownFields.includes(target)) continue;
    setError(target, { type: "server", message });
    applied = true;
  }
  return applied;
}
