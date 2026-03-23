interface LoadingPageProps {
    status: string;
}

export default function LoadingPage({ status }: LoadingPageProps) {
    return (
        <section className="auth-page auth-page--callback">
            <div className="glass-panel callback-card">
                <div className="callback-card__icon-wrap">
                    <span className="loading-ring" aria-hidden="true" />
                </div>
                <h1>Loading</h1>
                <p className="callback-card__status">{status}</p>
            </div>
        </section>
    );
}
