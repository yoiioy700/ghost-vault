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
                return { nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno" };
            case mainnet.id:
                return { nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno" };
            default:
                return { nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno" };
        }
    };
    const provider = jsonRpcProvider({ rpc });

    const [connectors, setConnectors] = React.useState<any[]>([]);

    React.useEffect(() => {
        const initConnectors = async () => {
            const argentMobile = await ArgentMobileConnector.init({
                options: {
                    url: typeof window !== "undefined" ? window.location.href : "",
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

    if (connectors.length === 0) return <>{children}</>;

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
