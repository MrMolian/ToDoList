import type { PropsWithChildren } from "react";

import SessionProvider from "./SessionProvider";

export default function MasterProvider({ children }: PropsWithChildren) {
    return <SessionProvider>{children}</SessionProvider>;
}
