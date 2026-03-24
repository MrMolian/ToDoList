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
            <div className="glass-panel auth-page__panel">
                <div className="section-label">Moaad's ToDoList</div>
                <h1>Connect to Moaad&apos;s ToDoList app.</h1>
                <p className="auth-page__lead">
                    Sign in with Google to access your tasks.
                </p>

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
