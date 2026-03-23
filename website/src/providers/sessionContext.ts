import { createContext, useContext } from "react";
import { type Session } from "@supabase/supabase-js";

export interface SessionContextValue {
    session: Session | null;
    loading: boolean;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error("useSession must be used within SessionProvider");
    }

    return context;
}
