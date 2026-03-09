"use client";

import { useAccount, useReadContract, useSendTransaction } from "@starknet-react/core";
import { useMemo, useState } from "react";
import { GHOST_VAULT_ADDRESS, GHOST_VAULT_ABI } from "@/lib/contract";
import { HonchoMemory } from "@/lib/honcho";
import WithdrawModal from "./WithdrawModal";

export default function Dashboard() {
    const { address } = useAccount();
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const memory = useMemo(() => HonchoMemory.load("wizard_prefs"), []);
    const beneficiary = memory?.beneficiary || "0xNotSetYet... (Update in Wizard)";

    const { data: vaultStatus, error: vaultError } = useReadContract({
        functionName: "get_vault",
        args: address ? [address] : [],
        abi: GHOST_VAULT_ABI as any,
        address: GHOST_VAULT_ADDRESS,
        watch: true
    });

    // get_vault returns (beneficiary, principal, deadline, period, window_duration)
    const onChainBeneficiary = vaultStatus ? (vaultStatus as any).beneficiary || (vaultStatus as any)[0] : undefined;
    const principalU256 = vaultStatus ? (vaultStatus as any).principal || (vaultStatus as any)[1] : undefined;
    const deadlineU64 = vaultStatus ? (vaultStatus as any).deadline || (vaultStatus as any)[2] : undefined;
    const periodU64 = vaultStatus ? (vaultStatus as any).period || (vaultStatus as any)[3] : undefined;

    // Override local memory if onchain data exists
    const displayBeneficiary = onChainBeneficiary && onChainBeneficiary !== "0x0" ? `0x${onChainBeneficiary.toString(16)}` : beneficiary;

    const principalStr = principalU256 ? principalU256.toString() : "0";
    const principal = Number(principalStr) / 1e18;
    const vaultActive = principal > 0;

    const deadlineTimestamp = deadlineU64 ? Number(deadlineU64) : 0;
    const periodFromContract = periodU64 ? Number(periodU64) : 0;
    const period = periodFromContract > 0 ? periodFromContract : (memory?.period ? Number(memory.period) * 86400 : 30 * 86400); // default 30 days
    const now = Math.floor(Date.now() / 1000);
    const timeRemainingSeconds = deadlineTimestamp > now ? deadlineTimestamp - now : 0;
    const daysRemaining = Math.ceil(timeRemainingSeconds / 86400);

    // Calculate percentage for the dynamic graph ring (100 = full period, 0 = dead)
    const percentageRemaining = period > 0 ? Math.min(Math.max((timeRemainingSeconds / period) * 100, 0), 100) : 0;
    const dashArrayValue = Math.max(percentageRemaining, 1); // SVG stroke dash array
    const isCritical = percentageRemaining < 15; // < 15% remaining (e.g. < 4 days left out of 30)

    const calls = useMemo(() => {
        if (!address) return [];
        return [{
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "checkin",
            calldata: []
        }];
    }, [address]);

    const claimCalls = useMemo(() => {
        if (!address) return [];
        return [{
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "claim_yield",
            calldata: []
        }];
    }, [address]);

    const { send, isPending, data } = useSendTransaction({ calls });
    const { send: sendClaim, isPending: isClaiming } = useSendTransaction({ calls: claimCalls });

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
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all"></div>
                    <div>
                        <h3 className="text-gray-400 font-medium mb-2">Total Principal</h3>
                        <div className="text-5xl font-black text-white font-mono tracking-tighter">
                            {principal} <span className="text-2xl text-brand-500">BTC</span>
                        </div>
                        <div className="mt-4 text-sm text-gray-500 font-mono">
                            ~$ {(principal * 65000).toLocaleString()} USD
                        </div>
                    </div>

                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="mt-6 w-full py-3 bg-surface-dark border border-gray-700 hover:border-brand-500/50 text-gray-300 hover:text-white font-semibold rounded-xl transition-all">
                        Manage Vault
                    </button>
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
                        <button
                            onClick={() => sendClaim()}
                            disabled={isClaiming || accumulatedYield <= "0"}
                            className="text-sm border border-brand-500/30 px-3 py-1 bg-brand-900/10 rounded-lg text-brand-400 hover:text-brand-300 font-semibold hover:bg-brand-500/20 transition-all disabled:opacity-30">
                            {isClaiming ? "Claiming..." : "Claim Yield"}
                        </button>
                    </div>
                </div>

                {/* Dead Man's Switch Card */}
                <div className={`glass-panel rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between border ${isCritical ? 'border-red-500/50 bg-red-900/10' : 'border-accent/20'}`}>
                    <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl transition-all ${isCritical ? 'bg-red-500/20 group-hover:bg-red-500/30 animate-pulse' : 'bg-accent/10 group-hover:bg-accent/20'}`}></div>
                    <div>
                        <h3 className="text-gray-400 font-medium mb-2 flex items-center gap-2">
                            <svg className={`w-5 h-5 ${isCritical ? 'text-red-400' : 'text-accent'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Next Check-in
                        </h3>
                        <div className={`text-5xl font-black font-mono tracking-tighter ${isCritical ? 'text-red-400' : 'text-accent'}`}>
                            {daysRemaining} <span className={`text-2xl text-base font-sans ${isCritical ? 'text-red-400/50' : 'text-accent/50'}`}>Days</span>
                        </div>
                        {isCritical && <div className="text-xs text-red-400/80 mt-2 font-bold uppercase tracking-wider animate-pulse">Critical Warning!</div>}
                    </div>

                    <button
                        onClick={() => send()}
                        disabled={isPending}
                        className={`mt-6 w-full py-4 font-bold rounded-xl transition-all border shadow-lg disabled:opacity-50
                            ${isCritical
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border-red-500/50 shadow-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                                : 'bg-accent/10 hover:bg-accent hover:text-gray-900 text-accent border-accent/30 hover:border-accent shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                            }`}>
                        {isPending ? "Confirming..." : "Check In Now (I'm Alive)"}
                    </button>
                </div>

                {/* Beneficiary Distribution Graph */}
                <div className="glass-panel rounded-3xl p-8 md:col-span-3 transition-all relative overflow-hidden group border border-brand-500/20">
                    <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all delay-150"></div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 z-10 relative">
                        <div className="flex-1 w-full">
                            <h3 className="text-gray-400 font-medium mb-4 text-xl border-b border-white/5 pb-3">Vault Distribution Plan</h3>

                            <div className="mb-4 pt-2">
                                <div className="flex justify-between items-end text-sm mb-3">
                                    <div>
                                        <span className="block text-xs text-gray-500 mb-1 uppercase tracking-widest">Primary Beneficiary</span>
                                        <span className="text-gray-200 font-mono bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">{displayBeneficiary}</span>
                                    </div>
                                    <span className="text-brand-400 font-bold bg-brand-900/30 px-3 py-1 rounded shadow-sm border border-brand-500/30">100% Allocation</span>
                                </div>
                                <div className="h-3 w-full bg-gray-900/80 rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-brand-600 to-accent w-full rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 max-w-xl leading-relaxed mt-6">
                                Upon expiration of the Dead Man's Switch Check-in countdown, 100% of the vault principal and accumulated automated yields will be instantly, and trustlessly distributed to the address above via Starknet L2.
                            </p>
                        </div>

                        {/* Visual Circle Graph */}
                        <div className="relative w-48 h-48 shrink-0 flex items-center justify-center bg-black/20 rounded-full border border-white/5 p-4 shadow-xl">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                                <path
                                    className="text-gray-800/50"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className={`transition-all duration-1000 ease-out ${isCritical ? 'text-red-500' : 'text-brand-500'}`}
                                    strokeDasharray={`${dashArrayValue}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={isCritical ? "currentColor" : "url(#gradient)"}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                                {!isCritical && (
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#0ea5e9" />
                                            <stop offset="100%" stopColor="#f59e0b" />
                                        </linearGradient>
                                    </defs>
                                )}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">{percentageRemaining.toFixed(0)}<span className="text-base text-brand-400">%</span></span>
                                <span className={`text-[10px] uppercase tracking-widest font-semibold mt-1 ${isCritical ? 'text-red-400 animate-pulse' : 'text-gray-500'}`}>
                                    {isCritical ? 'Time Running Out' : 'Time Remaining'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <WithdrawModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                principal={principal}
            />
        </div>
    );
}
