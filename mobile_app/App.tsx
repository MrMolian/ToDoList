import { StatusBar } from "expo-status-bar";

import AuthScreen from "./src/screens/AuthScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import LoadingScreen from "./src/screens/LoadingScreen";
import MasterProvider from "./src/providers/MasterProvider";
import { useSession } from "./src/providers/sessionContext";

function Root() {
    const { session, loading } = useSession();

    if (loading) {
        return <LoadingScreen status="Checking session" />;
    }

    if (!session) {
        return <AuthScreen />;
    }

    return <DashboardScreen />;
}

export default function App() {
    return (
        <MasterProvider>
            <StatusBar style="dark" />
            <Root />
        </MasterProvider>
    );
}
