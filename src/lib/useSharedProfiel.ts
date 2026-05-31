import { useCallback, useEffect, useState } from "react";
import { DEFAULTS, normaliseerProfiel, type Profiel } from "@/lib/profiel";

const STORAGE_KEY = "jaakie:profiel";

function readProfielFromStorage(): Profiel | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Profiel;
    return normaliseerProfiel(parsed);
  } catch {
    return null;
  }
}

function writeProfielToStorage(profiel: Profiel): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiel));
  } catch {
    // Storage kan vol zijn; negeren
  }
}

export function useSharedProfiel(): [Profiel, (p: Profiel | ((prev: Profiel) => Profiel)) => void] {
  const [profiel, setProfielState] = useState<Profiel>(() => {
    return readProfielFromStorage() ?? DEFAULTS;
  });

  const setProfiel = useCallback((update: Profiel | ((prev: Profiel) => Profiel)) => {
    setProfielState((prev) => {
      const next = typeof update === "function" ? (update as (prev: Profiel) => Profiel)(prev) : update;
      return normaliseerProfiel(next);
    });
  }, []);

  useEffect(() => {
    writeProfielToStorage(profiel);
  }, [profiel]);

  // Luister naar wijzigingen vanuit andere tabs/pagina's
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Profiel;
          setProfielState(normaliseerProfiel(parsed));
        } catch {
          // negeren
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return [profiel, setProfiel];
}
