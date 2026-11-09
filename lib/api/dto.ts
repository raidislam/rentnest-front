// Backend Data Transfer Objects: the shapes the RentNest API actually sends and
// accepts. Components never use these directly — lib/api/mappers.ts converts
// them into UI models.
//
// Source of each shape is noted:
//   VERIFIED   — observed in a live response from the backend.
//   DOCUMENTED — stated in the Postman collection (request bodies, descriptions,
//                test scripts). No response examples exist in the collection.
//   UNVERIFIED — not yet observed. Every field is optional until a real response
//                confirms it; mappers validate the fields the UI cannot do without.

/* ------------------------------------------------------------------ */
/* Response envelope (VERIFIED)                                        */
/* ------------------------------------------------------------------ */

export interface ApiSuccessDTO<T> {
  success: true;
  message: string;
  data: T;
}

/** VERIFIED: validation errors use 400 + message "Validation error" + a list of field errors. */
export interface ApiFieldErrorDTO {
  field: string;
  message: string;
}

/** VERIFIED: e.g. { success: false, message: "Property not found", errorDetails: null } */
export interface ApiFailureDTO {
  success: false;
  message: string;
  errorDetails: ApiFieldErrorDTO[] | null;
}

export type ApiEnvelopeDTO<T> = ApiSuccessDTO<T> | ApiFailureDTO;

/* ------------------------------------------------------------------ */
/* Shared enums (DOCUMENTED)                                           */
/* ------------------------------------------------------------------ */

/** DOCUMENTED + VERIFIED by register validation: only TENANT/LANDLORD can register. */
export type RoleDTO = "TENANT" | "LANDLORD" | "ADMIN";

/** DOCUMENTED in the Tenant/Landlord folder descriptions. */
export type RentalStatusDTO = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED";

/** DOCUMENTED (descriptions) + SOURCE-VERIFIED enum PaymentStatus. A gateway "cancel" is stored as FAILED. */
export type PaymentStatusDTO = "PENDING" | "COMPLETED" | "FAILED";

/** SOURCE-VERIFIED enum PaymentProvider. */
export type PaymentProviderDTO = "STRIPE" | "SSLCOMMERZ";

/* ------------------------------------------------------------------ */
/* Categories (VERIFIED: GET /api/categories)                          */
/* ------------------------------------------------------------------ */

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

/**
 * UNVERIFIED (GET /api/auth/me, GET /api/admin/users).
 * DOCUMENTED: admin users list includes `role` and boolean `status`
 * (true = active, false = banned); passwords are never returned.
 */
export interface UserDTO {
  id?: string;
  name?: string;
  email?: string;
  role?: RoleDTO;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** VERIFIED: the `landlord` object embedded in public property responses. */
export interface LandlordSummaryDTO {
  id: string;
  name: string;
}

/* ------------------------------------------------------------------ */
/* Properties                                                          */
/* ------------------------------------------------------------------ */

/**
 * VERIFIED on GET /api/properties and GET /api/properties/:id.
 * Note: `price` arrives as a string (e.g. "28000"), `location` is one string,
 * and there are no images, bedrooms, bathrooms, size, featured or moderation fields.
 */
export interface PropertyDTO {
  id: string;
  landlordId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  price: string | number;
  propertyType: string;
  amenities: string[];
  availability: boolean;
  createdAt: string;
  updatedAt: string;
  category?: CategoryDTO;
  landlord?: LandlordSummaryDTO;
}

/** VERIFIED: GET /api/properties/:id additionally embeds `reviews` (an empty array in every sample seen). */
export interface PropertyDetailsDTO extends PropertyDTO {
  reviews?: ReviewDTO[];
}

/**
 * UNVERIFIED: the same resource returned by landlord/admin endpoints or nested
 * inside rentals and payments. Assumed to resemble PropertyDTO, but every field
 * stays optional until confirmed.
 */
export type UnverifiedPropertyDTO = Partial<PropertyDetailsDTO>;

/* ------------------------------------------------------------------ */
/* Rental requests (UNVERIFIED)                                        */
/* ------------------------------------------------------------------ */

/**
 * DOCUMENTED: details include the property and payment; landlord list includes
 * payment info; admin list includes tenant, property and payment.
 */
export interface RentalDTO {
  id?: string;
  propertyId?: string;
  tenantId?: string;
  message?: string;
  status?: RentalStatusDTO;
  createdAt?: string;
  updatedAt?: string;
  property?: UnverifiedPropertyDTO;
  tenant?: UserDTO;
  /**
   * UNVERIFIED shape: documented only as "with payment" / "with payment info".
   * Handled as an object, null, or an array; `payments` is accepted too.
   */
  payment?: PaymentDTO | PaymentDTO[] | null;
  payments?: PaymentDTO[];
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

/**
 * Payment record. SOURCE-VERIFIED (backend repo prisma/schema.prisma, payment.service.ts):
 * id, transactionId, rentalRequestId, amount (Decimal -> string), method ("ONLINE"),
 * provider (STRIPE | SSLCOMMERZ), status, paidAt, createdAt, updatedAt.
 * GET /payments includes rentalRequest.property { id, title, location };
 * GET /payments/:id includes rentalRequest.property with category.
 * Not observed live (the QA tenant has no payments), so fields stay optional.
 */
export interface PaymentDTO {
  id?: string;
  rentalRequestId?: string;
  amount?: string | number;
  status?: PaymentStatusDTO;
  transactionId?: string;
  method?: string;
  provider?: PaymentProviderDTO;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  rentalRequest?: RentalDTO;
  /** UNVERIFIED: payment details are documented as including "property details"; nesting unknown. */
  property?: UnverifiedPropertyDTO;
}

/**
 * DOCUMENTED: POST /api/payments/create returns paymentId and transactionId (test script) and paymentUrl (description).
 * SOURCE-VERIFIED: also `amount`. `paymentUrl` is SSLCommerz's GatewayPageURL.
 */
export interface CreatePaymentResultDTO {
  paymentId: string;
  transactionId: string;
  amount?: string | number;
  paymentUrl: string;
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

/**
 * VERIFIED inside GET /api/properties/:id `reviews`: id, tenantId, propertyId,
 * rating, comment, createdAt, updatedAt — and NO tenant object (no reviewer name).
 * UNVERIFIED: GET /api/landlord/reviews, DOCUMENTED to add "property and tenant
 * basic info"; those relations stay optional. Fields stay optional because the
 * same DTO serves both endpoints.
 */
export interface ReviewDTO {
  id?: string;
  propertyId?: string;
  tenantId?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  property?: UnverifiedPropertyDTO;
  tenant?: UserDTO;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

/** DOCUMENTED: the Postman login test script reads `data.token`. Other fields are unverified. */
export interface LoginResultDTO {
  token: string;
}

/** DOCUMENTED: create endpoints return the new record; test scripts read `data.id`. */
export interface CreatedResourceDTO {
  id: string;
}

/* ------------------------------------------------------------------ */
/* Request bodies (DOCUMENTED in the Postman collection)               */
/* ------------------------------------------------------------------ */

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: Extract<RoleDTO, "TENANT" | "LANDLORD">;
}

export interface LoginBody {
  email: string;
  password: string;
}

/** PATCH /api/auth/me — only `name` is allowed. */
export interface UpdateProfileBody {
  name: string;
}

/** GET /api/properties query. `amenity` takes a single value. */
export interface PropertyQueryParams {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  amenity?: string;
}

/** POST /api/landlord/properties */
export interface CreatePropertyBody {
  title: string;
  description: string;
  location: string;
  price: number;
  propertyType: string;
  amenities: string[];
  categoryId: string;
}

/** PUT /api/landlord/properties/:id — all fields optional, including `availability`. */
export type UpdatePropertyBody = Partial<CreatePropertyBody> & { availability?: boolean };

/** PATCH /api/landlord/requests/:id */
export interface DecideRentalBody {
  status: Extract<RentalStatusDTO, "APPROVED" | "REJECTED">;
}

/** POST /api/rentals */
export interface CreateRentalBody {
  propertyId: string;
  message: string;
}

/** POST /api/payments/create */
export interface CreatePaymentBody {
  rentalRequestId: string;
}

/** POST /api/payments/confirm */
export interface ConfirmPaymentBody {
  tran_id: string;
  val_id: string;
}

/** POST /api/reviews — rating 1–5. */
export interface CreateReviewBody {
  propertyId: string;
  rating: number;
  comment: string;
}

/** PATCH /api/admin/users/:id */
export interface UpdateUserStatusBody {
  status: boolean;
}

/** POST/PUT /api/admin/categories */
export interface CategoryBody {
  name: string;
  description: string;
}
