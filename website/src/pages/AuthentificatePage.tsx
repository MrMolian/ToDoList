import GoogleIcon from "@mui/icons-material/Google";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useState } from "react";

import { logInWithGoogle } from "../api/Auth";

export default function AuthentificatePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleGoogleLogin() {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const { error } = await logInWithGoogle();

            if (error) {
                throw error;
            }
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Google sign-in could not be started.",
            );
            setIsSubmitting(false);
        }
    }

    return (
        <section className="auth-page">
            <div className="auth-page__orb auth-page__orb--top" />
            <div className="auth-page__orb auth-page__orb--bottom" />

            <div className="glass-panel auth-page__panel">
                <div className="section-label">ToDoApp</div>
                <h1>Organize work through calm, nested task spaces.</h1>
                <p className="auth-page__lead">
                    Sign in with Google to open your dashboard, move through task
                    groups like folders, and keep every to-do anchored to the
                    right place.
                </p>

                <div className="auth-page__features">
                    <div className="mini-feature">
                        <span>Nested groups</span>
                        <small>Move from root to any child workspace via breadcrumbs.</small>
                    </div>
                    <div className="mini-feature">
                        <span>Focused editing</span>
                        <small>Adjust tasks and groups in-place with lightweight dialogs.</small>
                    </div>
                </div>

                <button
                    type="button"
                    className="primary-button auth-page__action"
                    onClick={() => {
                        void handleGoogleLogin();
                    }}
                    disabled={isSubmitting}
                >
                    <GoogleIcon fontSize="small" />
                    {isSubmitting ? "Redirecting..." : "Continue with Google"}
                    <ArrowForwardRoundedIcon fontSize="small" />
                </button>

                {errorMessage ? (
                    <p className="auth-page__error">{errorMessage}</p>
                ) : null}
            </div>
        </section>
    );
}
