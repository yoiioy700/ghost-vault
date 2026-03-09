"use client";

import { StarknetProvider } from "@/components/StarknetProvider";

export function AppWrapper({ children }: { children: React.ReactNode }) {
    return <StarknetProvider>{children}</StarknetProvider>;
}
