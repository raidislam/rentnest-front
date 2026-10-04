// In-memory "mock backend" for the landlord and admin dashboards.
//
// Seeded from mock-data.ts, mutated only through the async functions in
// mock-api.ts, and read through the hooks below. Changes last for the current
// browser session (across client-side navigation) and reset on a full reload.
//
// API integration: replace the hooks with data fetching for
// GET /api/landlord/properties, GET /api/landlord/requests and the
// GET /api/admin/* endpoints, and the mock-api mutations with the matching
// POST/PATCH/DELETE calls.

import { useMemo, useSyncExternalStore } from "react";
import { payments, properties as seedProperties, rentalRequests as seedRequests, users as seedUsers } from "./mock-data";
import type {
  AdminPropertyView,
  AdminRequestView,
  AdminStats,
  LandlordRequestView,
  Property,
  RentalRequest,
  User,
} from "./types";

interface MockState {
  users: User[];
  properties: Property[];
  requests: RentalRequest[];
}

const initialState: MockState = { users: seedUsers, properties: seedProperties, requests: seedRequests };
let state = initialState;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Only mock-api.ts should call this. */
export function updateMockState(updater: (current: MockState) => MockState) {
  state = updater(state);
  listeners.forEach((listener) => listener());
}

export function getMockState() {
  return state;
}

function useMockState() {
  // The server snapshot is always the seed data, so hydration matches the server render.
  return useSyncExternalStore(subscribe, getMockState, () => initialState);
}

/** Future: GET /api/landlord/properties — newest first. */
export function useLandlordProperties(landlordId: string): Property[] {
  const { properties } = useMockState();
  return useMemo(
    () => properties.filter((p) => p.landlordId === landlordId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [properties, landlordId],
  );
}

/** Future: GET /api/landlord/requests — newest first, joined with property, tenant and payments. */
export function useLandlordRequests(landlordId: string): LandlordRequestView[] {
  const { users, properties, requests } = useMockState();
  return useMemo(
    () =>
      requests
        .filter((r) => r.landlordId === landlordId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .flatMap((r) => {
          const tenant = users.find((u) => u.id === r.tenantId);
          if (!tenant) return [];
          return [
            {
              ...r,
              tenant,
              property: properties.find((p) => p.id === r.propertyId),
              payments: payments.filter((p) => p.rentalRequestId === r.id),
            },
          ];
        }),
    [users, properties, requests, landlordId],
  );
}

const newestFirst = (a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt);

/** Future: GET /api/admin/users — newest first. */
export function useAdminUsers(): User[] {
  const { users } = useMockState();
  return useMemo(() => [...users].sort(newestFirst), [users]);
}

/** Future: admin property listing — every property regardless of status, with its landlord. */
export function useAdminProperties(): AdminPropertyView[] {
  const { users, properties } = useMockState();
  return useMemo(
    () => [...properties].sort(newestFirst).map((p) => ({ ...p, landlord: users.find((u) => u.id === p.landlordId) })),
    [users, properties],
  );
}

/** Future: admin request listing — every rental request on the platform. */
export function useAdminRequests(): AdminRequestView[] {
  const { users, properties, requests } = useMockState();
  return useMemo(
    () =>
      [...requests].sort(newestFirst).flatMap((r) => {
        const tenant = users.find((u) => u.id === r.tenantId);
        const landlord = users.find((u) => u.id === r.landlordId);
        if (!tenant || !landlord) return [];
        return [
          {
            ...r,
            tenant,
            landlord,
            property: properties.find((p) => p.id === r.propertyId),
            payments: payments.filter((p) => p.rentalRequestId === r.id),
          },
        ];
      }),
    [users, properties, requests],
  );
}

/** Platform totals, reflecting changes made during this session. */
export function useAdminStats(): AdminStats {
  const { users, properties, requests } = useMockState();
  return useMemo(
    () => ({
      totalUsers: users.length,
      totalProperties: properties.length,
      pendingProperties: properties.filter((p) => p.status === "PENDING").length,
      pendingRequests: requests.filter((r) => r.status === "PENDING").length,
    }),
    [users, properties, requests],
  );
}
