"use client";

import React from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
    StarknetConfig,
    jsonRpcProvider,
    voyager,
} from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
    const chains = [sepolia, mainnet];
    const rpc = (chain: any) => {
        switch (chain.id) {
            case sepolia.id:
                return { nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno" };
            case mainnet.id:
                return { nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno" };
            default:
                return { nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno" };
        }
    };
    const provider = jsonRpcProvider({ rpc });

    const [connectors, setConnectors] = React.useState<any[] | null>(null);

    React.useEffect(() => {
        const initConnectors = async () => {
            const { InjectedConnector } = await import("starknetkit/injected");
            const { ArgentMobileConnector } = await import("starknetkit/argentMobile");
            const { WebWalletConnector } = await import("starknetkit/webwallet");

            const argentMobile = await ArgentMobileConnector.init({
                options: {
                    url: window.location.href,
                    dappName: "Ghost Vault",
                    chainId: "SN_SEPOLIA",
                },
                inAppBrowserOptions: {},
            });

            setConnectors([
                new InjectedConnector({ options: { id: "braavos" } }),
                new InjectedConnector({ options: { id: "argentX" } }),
                argentMobile,
                new WebWalletConnector({ url: "https://web.argent.xyz" }),
            ]);
        };
        initConnectors();
    }, []);

    // PENTING: jangan render StarknetConfig sampe connectors ready
    if (!connectors) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <StarknetConfig
            chains={chains}
            provider={provider}
            connectors={connectors as any}
            explorer={voyager}
            autoConnect={true}
        >
            {children}
        </StarknetConfig>
    );
}
