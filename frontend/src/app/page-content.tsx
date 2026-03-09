"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";

export default function Home({ onNavigate }: { onNavigate?: (view: "home" | "setup" | "dashboard") => void }) {
    const { address } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    return (
        <main className="flex flex-col items-center justify-between px-6 pb-24 lg:p-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-[pulse_8s_ease-in-out_infinite]"></div>
                <div className="absolute top-40 -left-40 w-96 h-96 bg-accent rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-[pulse_10s_ease-in-out_infinite_2s]"></div>
            </div>

            <div className="z-10 w-full items-center justify-between font-mono text-sm lg:flex max-w-6xl mx-auto">
                <div className="invisible lg:visible fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-gray-900 via-gray-900 lg:static lg:h-auto lg:w-auto lg:bg-none">
                    {!address ? (
                        <div className="flex gap-4">
                            {connectors.map((connector) => (
                                <button
                                    key={connector.id}
                                    onClick={() => connect({ connector })}
                                    className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-brand-500/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                                >
                                    Connect {connector.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 glass-panel px-6 py-2 rounded-xl">
                            <span className="text-gray-300 truncate w-32 hidden sm:block">
                                {address}
                            </span>
                            <button
                                onClick={() => disconnect()}
                                className="text-red-400 hover:text-red-300 transition-colors font-medium text-sm"
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative flex place-items-center flex-col my-16 text-center z-10 p-8 sm:p-16 rounded-3xl max-w-4xl mx-auto">
                <p className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-brand-100 uppercase bg-brand-900/30 border border-brand-500/20 rounded-full animate-pulse">
                    Starknet Native Protocol
                </p>
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 font-sans leading-tight">
                    Your Bitcoin <br />Earns While It Waits.
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mt-4 font-light leading-relaxed">
                    And if the worst happens, everything goes to who matters most. A trustless, ZK-powered inheritance protocol.
                </p>

                <div className="mt-12 flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                    <button
                        onClick={() => onNavigate && onNavigate("setup")}
                        className="w-full sm:w-auto px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(14,165,233,0.25)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(14,165,233,0.4)]"
                    >
                        Create Vault
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate("dashboard")}
                        className="w-full sm:w-auto px-10 py-4 bg-surface-dark border border-gray-700 hover:border-gray-500 text-gray-300 rounded-2xl font-bold text-lg transition-all hover:bg-gray-800"
                    >
                        Launch App
                    </button>
                </div>
            </div>

            <div className="mt-16 sm:mt-32 grid text-center lg:max-w-6xl lg:w-full lg:grid-cols-3 lg:text-left gap-8 z-10 px-4">
                <div className="group rounded-3xl border border-gray-800/50 p-8 transition-all hover:border-brand-500/50 hover:bg-brand-900/10 glass-panel">
                    <div className="w-12 h-12 bg-brand-900/50 rounded-xl flex items-center justify-center mb-6 text-brand-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-gray-200 group-hover:text-brand-400 transition-colors">
                        Passive Yield
                    </h2>
                    <p className="m-0 text-base text-gray-400 leading-relaxed">
                        Earn ~4% APY securely via Endur.fi liquid staking. Your BTC grows effortlessly while you hold it.
                    </p>
                </div>

                <div className="group rounded-3xl border border-gray-800/50 p-8 transition-all hover:border-accent/50 hover:bg-accent/10 glass-panel">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-6 text-accent">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-gray-200 group-hover:text-accent transition-colors">
                        Dead Man's Switch
                    </h2>
                    <p className="m-0 text-base text-gray-400 leading-relaxed">
                        Automated asset transfer to your designated beneficiaries if you miss your periodic check-in.
                    </p>
                </div>

                <div className="group rounded-3xl border border-gray-800/50 p-8 transition-all hover:border-gray-500/50 hover:bg-gray-800/50 glass-panel">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6 text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-gray-200 group-hover:text-white transition-colors">
                        ZK Privacy
                    </h2>
                    <p className="m-0 text-base text-gray-400 leading-relaxed">
                        100% non-custodial and private, powered by Starknet's cryptographic STARK proofs.
                    </p>
                </div>
            </div>
        </main>
    );
}
