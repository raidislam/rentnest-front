"use client";

import { startTransition, useOptimistic } from "react";

export type WithSaving<T> = T & { saving?: boolean };

/**
 * Optimistically applies a partial update to one item in a list while an async
 * mock-api call runs. The item is marked `saving` until it settles; if the call
 * throws, React drops the optimistic value and the item rolls back.
 *
 * Same pattern as the landlord request decisions, generalised for admin actions.
 */
export function useOptimisticPatch<T extends { id: string }>(items: T[]) {
  const [optimisticItems, apply] = useOptimistic(
    items as WithSaving<T>[],
    (state, update: { id: string; patch: Partial<T> }) =>
      state.map((item) => (item.id === update.id ? { ...item, ...update.patch, saving: true } : item)),
  );

  const run = (
    id: string,
    patch: Partial<T>,
    action: () => Promise<void>,
    callbacks: { onSuccess: () => void; onError: (error: unknown) => void },
  ) => {
    startTransition(async () => {
      apply({ id, patch });
      try {
        await action();
        callbacks.onSuccess();
      } catch (error) {
        callbacks.onError(error);
      }
    });
  };

  return [optimisticItems, run] as const;
}

/** Demo hook: add `?simulateFailure=1` to the page URL to see the rollback path. */
export const shouldSimulateFailure = () => new URLSearchParams(window.location.search).has("simulateFailure");
