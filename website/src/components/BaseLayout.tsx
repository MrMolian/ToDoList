import { Outlet, Link } from "react-router-dom";
import { useState } from "react";

import supabase from "../utils/supabase";
import { useSession } from "../providers/SessionProvider";

export default function BaseLayout() {
    const { session } = useSession();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const profileName =
        session?.user.user_metadata.full_name ??
        session?.user.user_metadata.name ??
        session?.user.email ??
        "ToDo User";
    const avatarUrl = session?.user.user_metadata.avatar_url as
        | string
        | undefined;

    async function handleSignOut() {
        setIsSigningOut(true);

        try {
            await supabase.auth.signOut();
        } finally {
            setIsSigningOut(false);
        }
    }

    return (
        <div className="app-shell">
            <div className="app-shell__orb app-shell__orb--left" />
            <div className="app-shell__orb app-shell__orb--right" />

            <header className="glass-panel app-shell__header">
                <Link to="/dashboard" className="app-shell__brand">
                    <span className="app-shell__brand-badge">TD</span>
                    <span>
                        <strong>ToDoApp</strong>
                        <small>Focused task spaces</small>
                    </span>
                </Link>

                <div className="app-shell__session">
                    <div className="app-shell__profile">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={profileName}
                                className="app-shell__avatar"
                            />
                        ) : (
                            <span className="app-shell__avatar app-shell__avatar--fallback">
                                {profileName.slice(0, 1).toUpperCase()}
                            </span>
                        )}

                        <div>
                            <p>{profileName}</p>
                            <small>{session?.user.email}</small>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                            void handleSignOut();
                        }}
                        disabled={isSigningOut}
                    >
                        {isSigningOut ? "Signing Out..." : "Sign Out"}
                    </button>
                </div>
            </header>

            <main className="app-shell__content">
                <Outlet />
            </main>
        </div>
    );
}
