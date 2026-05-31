import { useCallback, useEffect, useState } from "react";
import { DEFAULTS, normaliseerProfiel, type Profiel } from "@/lib/profiel";
const STORAGE_KEY = "jaakie:profiel";
export const PROFIEL_STORAGE_SCOPE = "venster";
function readProfielFromStorage(): Profiel | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw) as Profiel;
        return normaliseerProfiel(parsed);
    }
    catch {
        return null;
    }
}
function writeProfielToStorage(profiel: Profiel): void {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profiel));
    }
    catch {
    }
}
export function useSharedProfiel(): [
    Profiel,
    (p: Profiel | ((prev: Profiel) => Profiel)) => void
] {
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
    return [profiel, setProfiel];
}
