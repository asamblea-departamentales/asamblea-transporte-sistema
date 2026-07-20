import { useCallback, useState } from "react";
import { STORAGE_KEY, type WizardData } from "./transportUtils";

const VERSION = 1;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
type PersistedDraft = WizardData & { _meta?: { version: number; expiresAt: number } };

function isTransportDraft(value: unknown): value is PersistedDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const draft = value as Record<string, unknown>;
  return draft.destinos === undefined || Array.isArray(draft.destinos);
}

export const transportDraftStorage = {
  read(): WizardData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!isTransportDraft(parsed)) return null;
      if (parsed._meta?.expiresAt && parsed._meta.expiresAt <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY); return null;
      }
      const draft: PersistedDraft = { ...parsed };
      delete draft._meta;
      return draft;
    } catch { return null; }
  },
  write(value: WizardData) {
    const persisted: PersistedDraft = {
      ...value, _meta: { version: VERSION, expiresAt: Date.now() + THIRTY_DAYS },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  },
  remove() { localStorage.removeItem(STORAGE_KEY); },
};

export function validateTransportRoute(draft: WizardData) {
  return {
    origen: draft.origen?.trim() ? undefined : "Indique el punto de salida.",
    destinos: draft.destinos?.some((destination) => destination.address.trim())
      ? undefined : "Indique al menos un destino.",
  };
}

export function useTransportDraft() {
  const [draft, setDraftState] = useState<WizardData>(() => transportDraftStorage.read() ?? {});
  const saveDraft = useCallback((patch: Partial<WizardData>) => {
    setDraftState((current) => {
      const next = { ...current, ...patch }; transportDraftStorage.write(next); return next;
    });
  }, []);
  const clearDraft = useCallback(() => {
    transportDraftStorage.remove(); setDraftState({});
  }, []);
  return { draft, saveDraft, clearDraft };
}
