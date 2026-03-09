"use client";

import React from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
    StarknetConfig,
    jsonRpcProvider,
    voyager,
} from "@starknet-react/core";
import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
import { ArgentMobileConnector } from "starknetkit/argentMobile";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
    const chains = [sepolia, mainnet];
    const rpc = (chain: any) => {
        switch (chain.id) {
            case sepolia.id:
                return { nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8" };
            case mainnet.id:
                return { nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8" };
            default:
                return { nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8" };
        }
    };
    const provider = jsonRpcProvider({ rpc });

    const connectors = [
        // InjectedConnector tanpa ID — auto-detect SEMUA wallet yang ter-install di browser
        new InjectedConnector({ options: { id: "braavos" } }),
        new InjectedConnector({ options: { id: "argentX" } }),
        // Argent Mobile via QR Code / WalletConnect
        ArgentMobileConnector.init({
            options: {
                url: typeof window !== "undefined" ? window.location.href : "",
                dappName: "Ghost Vault",
                chainId: "SN_SEPOLIA",
            },
            inAppBrowserOptions: {},
        }),
        // Argent Web Wallet (login via email, no extension needed)
        new WebWalletConnector({ url: "https://web.argent.xyz" }),
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
