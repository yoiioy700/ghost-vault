"use client";

import React from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
    StarknetConfig,
    publicProvider,
    voyager,
} from "@starknet-react/core";
import { InjectedConnector } from "starknetkit/injected";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
    const chains = [sepolia, mainnet];
    const provider = publicProvider();
    const connectors = [
        new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
        new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
    ];

    return (
        <StarknetConfig
            chains={chains}
            provider={provider}
            connectors={connectors as any}
            explorer={voyager}
        >
            {children}
        </StarknetConfig>
    );
}
