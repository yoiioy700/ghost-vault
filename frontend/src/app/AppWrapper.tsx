"use client";

import dynamic from "next/dynamic";

const StarknetProvider = dynamic(
    () => import("@/components/StarknetProvider").then((mod) => mod.StarknetProvider),
    { ssr: false }
);

export function AppWrapper({ children }: { children: React.ReactNode }) {
    return <StarknetProvider>{children}</StarknetProvider>;
}
