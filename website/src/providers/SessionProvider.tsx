import {
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { type Session } from "@supabase/supabase-js";

import { SessionContext } from "./sessionContext";
import supabase from "../utils/supabase";

export default function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            },
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    return (
        <SessionContext.Provider value={{ session, loading }}>
            {children}
        </SessionContext.Provider>
    );
}
