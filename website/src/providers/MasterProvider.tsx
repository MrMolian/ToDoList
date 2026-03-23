import SessionProvider from "./SessionProvider";

export default function MasterProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SessionProvider>{children}</SessionProvider>;
}
