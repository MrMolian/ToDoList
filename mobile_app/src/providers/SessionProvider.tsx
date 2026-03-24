import { AppState, type AppStateStatus } from "react-native";
import {
    useEffect,
    useState,
    type PropsWithChildren,
} from "react";
import { type Session } from "@supabase/supabase-js";

import { SessionContext } from "./sessionContext";
import supabase from "../utils/supabase";

export default function SessionProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        const handleAppStateChange = (state: AppStateStatus) => {
            if (state === "active") {
                supabase.auth.startAutoRefresh();
                return;
            }

            supabase.auth.stopAutoRefresh();
        };

        handleAppStateChange(AppState.currentState);

        async function bootstrap() {
            try {
                const {
                    data: { session: nextSession },
                } = await supabase.auth.getSession();

                if (isActive) {
                    setSession(nextSession);
                }
            } catch (error) {
                console.warn("Failed to restore auth session", error);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        }

        void bootstrap();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, nextSession) => {
                if (!isActive) {
                    return;
                }

                setSession(nextSession);
                setLoading(false);
            },
        );

        const appStateSubscription = AppState.addEventListener(
            "change",
            handleAppStateChange,
        );

        return () => {
            isActive = false;
            authListener.subscription.unsubscribe();
            appStateSubscription.remove();
        };
    }, []);

    return (
        <SessionContext.Provider value={{ session, loading }}>
            {children}
        </SessionContext.Provider>
    );
}
