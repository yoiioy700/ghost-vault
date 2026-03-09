"use client";

import { useAccount, useReadContract, useSendTransaction } from "@starknet-react/core";
import { useMemo } from "react";
import { GHOST_VAULT_ADDRESS, GHOST_VAULT_ABI } from "@/lib/contract";

export default function Dashboard() {
    const { address } = useAccount();

    const { data: vaultStatus } = useReadContract({
        functionName: "get_vault_status",
        args: [],
        abi: GHOST_VAULT_ABI as any,
        address: GHOST_VAULT_ADDRESS,
        watch: true
    });

    const principalU256 = vaultStatus ? (vaultStatus as any).principal || (vaultStatus as any)[0] : undefined;
    const deadlineU64 = vaultStatus ? (vaultStatus as any).deadline || (vaultStatus as any)[1] : undefined;

    const principalStr = principalU256 ? principalU256.toString() : "0";
    const principal = Number(principalStr) / 1e18;
    const vaultActive = principal > 0;

    const deadlineTimestamp = deadlineU64 ? Number(deadlineU64) : 0;
    const now = Math.floor(Date.now() / 1000);
    const daysRemaining = deadlineTimestamp > now ? Math.ceil((deadlineTimestamp - now) / 86400) : 0;

    const calls = useMemo(() => {
        return [{
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "checkin",
            calldata: []
        }];
    }, []);

    const { send, isPending, data } = useSendTransaction({ calls });

    const apy = 4.2;
    const accumulatedYield = (principal * 0.042 * (30 - daysRemaining) / 365).toFixed(4);

    if (!address) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold text-gray-400">Please connect your wallet to view your Dashboard.</h2>
            </div>
        );
    }

    if (!vaultActive) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <h2 className="text-3xl font-bold text-brand-100 mb-4">You don't have an active vault.</h2>
                <p className="text-gray-400 mb-8">Secure your assets and start earning yield today.</p>
                <button className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold shadow-lg transition-transform hover:-translate-y-1">
                    Create Ghost Vault
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto w-full mt-10 p-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-white mb-2">My Vault</h1>
                    <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Via Endur.fi xBTC</p>
                </div>
                <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-900/40 text-green-400 border border-green-800 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                        Active
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Total Value Card */}
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all"></div>
                    <h3 className="text-gray-400 font-medium mb-2">Total Principal</h3>
                    <div className="text-5xl font-black text-white font-mono tracking-tighter">
                        {principal} <span className="text-2xl text-brand-500">BTC</span>
                    </div>
                    <div className="mt-4 text-sm text-gray-500 font-mono">
                        ~$ {(principal * 65000).toLocaleString()} USD
                    </div>
                </div>

                {/* Yield Card */}
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
                    <h3 className="text-gray-400 font-medium mb-2">Earned Yield</h3>
                    <div className="text-5xl font-black text-green-400 font-mono tracking-tighter">
                        +{accumulatedYield} <span className="text-2xl text-green-600">BTC</span>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-green-500 bg-green-900/30 px-2 py-1 rounded">~{apy}% APY</span>
                        <button className="text-sm text-brand-400 hover:text-brand-300 font-semibold transition-colors underline decoration-brand-500/30 underline-offset-4">
                            Claim Yield
                        </button>
                    </div>
                </div>

                {/* Dead Man's Switch Card */}
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between border border-accent/20">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all"></div>
                    <div>
                        <h3 className="text-gray-400 font-medium mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Next Check-in
                        </h3>
                        <div className="text-5xl font-black text-accent font-mono tracking-tighter">
                            {daysRemaining} <span className="text-2xl text-accent/50 text-base font-sans">Days</span>
                        </div>
                    </div>

                    <button
                        onClick={() => send()}
                        disabled={isPending}
                        className="mt-6 w-full py-4 bg-accent/10 hover:bg-accent disabled:opacity-50 hover:text-gray-900 text-accent font-bold rounded-xl transition-all border border-accent/30 hover:border-accent shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                        {isPending ? "Confirming..." : "Check In Now"}
                    </button>
                </div>

            </div>

        </div>
    );
}
