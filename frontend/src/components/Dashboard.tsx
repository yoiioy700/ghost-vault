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
        <div className="relative min-h-screen w-full font-sans bg-zinc-950 text-zinc-100 overflow-hidden pt-10">
            {/* Ambient background glows */}
            <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-blue-500/15 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 relative z-10 pb-20">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
                            My Vault
                        </h1>
                        <p className="text-sm font-medium text-zinc-400 tracking-wide uppercase">
                            Endur.fi xBTC • Starknet L2
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-xs font-semibold tracking-wider text-emerald-500 uppercase">
                            Active
                        </span>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">

                    {/* Principal Card */}
                    <div className="flex flex-col justify-between p-8 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                                <span className="text-sm font-medium">Total Principal</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-5xl font-bold tracking-tighter text-white">
                                    {principal}
                                </span>
                                <span className="text-lg font-semibold text-blue-500">BTC</span>
                            </div>
                            <div className="text-sm text-zinc-500 mt-1">
                                ~$ {(principal * 65000).toLocaleString()} USD
                            </div>
                        </div>
                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="mt-8 w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 text-sm font-medium rounded-xl transition-colors duration-200">
                            Manage Vault
                        </button>
                    </div>

                    {/* Yield Card */}
                    <div className="flex flex-col justify-between p-8 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                <span className="text-sm font-medium">Earned Yield</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-5xl font-bold tracking-tighter text-white">
                                    +{accumulatedYield}
                                </span>
                                <span className="text-lg font-semibold text-emerald-500">BTC</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-8 pt-3">
                            <span className="text-sm font-semibold text-emerald-500">
                                {apy}% APY
                            </span>
                            <button
                                onClick={() => sendClaim()}
                                disabled={isClaiming || accumulatedYield <= "0"}
                                className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold rounded-lg transition-colors duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50">
                                {isClaiming ? "Claiming..." : "Claim"}
                            </button>
                        </div>
                    </div>

                    {/* Check-in Card */}
                    <div className={`flex flex-col justify-between p-8 rounded-2xl backdrop-blur-2xl shadow-2xl transition-all duration-300 ${isCritical ? 'bg-red-500/10 border border-red-500/20' : 'bg-zinc-900/40 border border-white/5'}`}>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <svg className={`w-4 h-4 ${isCritical ? 'text-red-500' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span className={`text-sm font-medium ${isCritical ? 'text-red-500' : 'text-zinc-400'}`}>Next Check-in</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className={`text-5xl font-bold tracking-tighter ${isCritical ? 'text-red-500' : 'text-zinc-100'}`}>
                                    {daysRemaining}
                                </span>
                                <span className={`text-lg transition-colors ${isCritical ? 'text-red-500/70' : 'text-zinc-500'}`}>
                                    Days
                                </span>
                            </div>
                            {isCritical && (
                                <div className="text-xs font-semibold text-red-500 mt-1 uppercase tracking-wider animate-pulse">
                                    Critical Warning!
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => send()}
                            disabled={isPending}
                            className={`mt-8 w-full py-3 text-sm font-semibold rounded-xl transition-all duration-200 border disabled:opacity-50 
                                ${isCritical
                                    ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                    : 'bg-zinc-800/80 text-white border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                                }`}>
                            {isPending ? "Confirming..." : "Check In Now (I'm Alive)"}
                        </button>
                    </div>

                </div>

                {/* Vault Distribution Plan */}
                <div className="w-full flex flex-col md:flex-row gap-10 items-center p-10 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl">
                    <div className="flex-1 flex flex-col gap-8 w-full">
                        <h3 className="text-2xl font-bold tracking-tight text-white border-b border-white/5 pb-6">
                            Vault Distribution Plan
                        </h3>

                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end w-full">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                        Primary Beneficiary
                                    </span>
                                    <div className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 shadow-inner">
                                        <span className="text-sm text-zinc-100 font-mono tracking-wide">
                                            {displayBeneficiary}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">
                                        100% Allocation
                                    </span>
                                </div>
                            </div>

                            {/* Progress track */}
                            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden shadow-inner">
                                <div className="h-full bg-blue-500 rounded-full w-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Upon expiration of the Dead Man's Switch Check-in countdown, 100% of the vault principal and accumulated automated yields will be instantly and trustlessly distributed to this address.
                        </p>
                    </div>

                    {/* Circular visual graph */}
                    <div className="relative w-40 h-40 shrink-0 flex items-center justify-center bg-zinc-900/50 rounded-full border border-white/5 shadow-2xl p-4">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                            <path
                                className="text-zinc-800"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            />
                            <path
                                className={`transition-all duration-1000 ease-out ${isCritical ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}
                                strokeDasharray={`${dashArrayValue}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <div className="flex items-baseline">
                                <span className={`text-3xl font-bold tracking-tighter ${isCritical ? 'text-red-500' : 'text-zinc-100'}`}>
                                    {percentageRemaining.toFixed(0)}
                                </span>
                                <span className={`text-sm ml-0.5 ${isCritical ? 'text-red-400' : 'text-blue-500'}`}>%</span>
                            </div>
                            <span className={`text-[9px] font-bold tracking-widest uppercase mt-1 ${isCritical ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                                {isCritical ? 'Time Running Out' : 'Time Remaining'}
                            </span>
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
