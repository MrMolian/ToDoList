import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import supabase from "../utils/supabase";

export default function CallBackPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState("Verifying Google sign-in...");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        async function completeAuthentication() {
            const queryParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams(
                window.location.hash.replace(/^#/, ""),
            );

            const code = queryParams.get("code");
            const providerError =
                queryParams.get("error_description") ||
                queryParams.get("error") ||
                hashParams.get("error_description") ||
                hashParams.get("error");

            if (providerError) {
                if (isActive) {
                    setErrorMessage(providerError);
                    setStatus("Google sign-in failed.");
                }
                return;
            }

            try {
                if (code) {
                    setStatus("Exchanging Google session...");
                    const { error } = await supabase.auth.exchangeCodeForSession(
                        code,
                    );

                    if (error) {
                        throw error;
                    }
                }

                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session) {
                    throw new Error(
                        "No authenticated session was returned by Google.",
                    );
                }

                if (isActive) {
                    setStatus("Signed in. Opening dashboard...");
                    window.setTimeout(() => {
                        navigate("/dashboard", { replace: true });
                    }, 500);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Authentication could not be completed.",
                    );
                    setStatus("Google sign-in failed.");
                }
            }
        }

        void completeAuthentication();

        return () => {
            isActive = false;
        };
    }, [navigate]);

    return (
        <section className="auth-page auth-page--callback">
            <div className="glass-panel callback-card">
                <div className="callback-card__icon-wrap">
                    {errorMessage ? (
                        <ErrorOutlineRoundedIcon color="error" />
                    ) : (
                        <SyncRoundedIcon className="callback-card__spin" />
                    )}
                </div>
                <h1>{errorMessage ? "Authentication interrupted" : "Finalizing sign-in"}</h1>
                <p className="callback-card__status">{status}</p>

                {errorMessage ? (
                    <>
                        <p className="callback-card__error">{errorMessage}</p>
                        <Link to="/authentificate" className="secondary-button secondary-button--link">
                            Try again
                        </Link>
                    </>
                ) : (
                    <p className="callback-card__success">
                        <CheckCircleRoundedIcon fontSize="small" />
                        Secure session handoff in progress.
                    </p>
                )}
            </div>
        </section>
    );
}
