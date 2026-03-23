import { Routes, Route } from "react-router-dom";
import { useLocation, Navigate, Outlet } from "react-router-dom";

import { useSession } from "./providers/sessionContext";

import BaseLayout from "./components/BaseLayout";

import LoadingPage from "./pages/LoadingPage";
import AuthentificatePage from "./pages/AuthentificatePage";
import CallBackPage from "./pages/CallBackPage";
import DashboardPage from "./pages/DashboardPage";

function RequireAuth() {
    const { session, loading } = useSession();
    const location = useLocation();

    if (loading) return <LoadingPage status="Checking Session" />;
    if (!session)
        return (
            <Navigate to="/authentificate" replace state={{ from: location }} />
        );
    return <Outlet />;
}

function RequireGuest() {
    const { session, loading } = useSession();
    const location = useLocation();
    if (loading) return <LoadingPage status="Checking Session" />;
    if (session)
        return <Navigate to="/dashboard" replace state={{ from: location }} />;
    return <Outlet />;
}

export default function App() {
    return (
        <Routes>
            <Route element={<RequireGuest />}>
                <Route
                    path="/"
                    element={<Navigate to="/authentificate" replace />}
                />
                <Route
                    path="/authentificate"
                    element={<AuthentificatePage />}
                />
                <Route path="/callback" element={<CallBackPage />} />
            </Route>

            <Route element={<RequireAuth />}>
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />
                <Route element={<BaseLayout />}>
                    <Route path="/dashboard/*" element={<DashboardPage />} />
                </Route>
            </Route>
        </Routes>
    );
}
