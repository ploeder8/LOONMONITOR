import type { LoonrunWerknemerInput } from "@/lib/loonrun";
import type { StorageLike } from "@/lib/loonmotor";

export const LOONRUN_STORAGE_KEY = "jaakie:loonrun";

export function readLoonrunInputs(storage: StorageLike | undefined = browserStorage()): LoonrunWerknemerInput[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(LOONRUN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LoonrunWerknemerInput[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLoonrunInputs(inputs: LoonrunWerknemerInput[], storage: StorageLike | undefined = browserStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(LOONRUN_STORAGE_KEY, JSON.stringify(inputs));
  } catch {
  }
}

export function appendLoonrunInputs(
  existing: LoonrunWerknemerInput[],
  additions: LoonrunWerknemerInput[],
): LoonrunWerknemerInput[] {
  const byId = new Map(existing.map((input) => [input.id, input]));
  for (const addition of additions) byId.set(addition.id, addition);
  return Array.from(byId.values());
}

export function clearLoonrunInputs(storage: StorageLike | undefined = browserStorage()): void {
  try {
    storage?.removeItem?.(LOONRUN_STORAGE_KEY);
  } catch {
  }
}

function browserStorage(): StorageLike | undefined {
  if (typeof localStorage === "undefined") return undefined;
  return localStorage;
}
