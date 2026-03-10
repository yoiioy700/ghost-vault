"use client";

import { useAccount, useReadContract, useSendTransaction, useDisconnect, useConnect } from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";
import { useMemo, useState } from "react";
import { GHOST_VAULT_ADDRESS, GHOST_VAULT_ABI } from "@/lib/contract";
import { HonchoMemory } from "@/lib/honcho";
import WithdrawModal from "./WithdrawModal";

export default function Dashboard() {
    const { address } = useAccount();
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const memory = useMemo(() => {
        if (typeof window === "undefined") return null;
        try {
            return HonchoMemory.load("wizard_prefs");
        } catch {
            return null;
        }
    }, []);
    const beneficiary = memory?.beneficiary || "0xNotSetYet... (Update in Wizard)";

    const { data: vaultStatus, error: vaultError } = useReadContract({
        functionName: "get_vault",
        args: address ? [address] : [],
        abi: GHOST_VAULT_ABI as any,
        address: GHOST_VAULT_ADDRESS,
        watch: true
    });

    console.log("Vault Status Debug:", vaultStatus);

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

    const { connect, connectors } = useConnect();
    const { starknetkitConnectModal } = useStarknetkitConnectModal({
        connectors: connectors as any,
        modalMode: "alwaysAsk",
    });
    const { disconnect } = useDisconnect();

    const handleConnect = async () => {
        if (!connectors || connectors.length === 0) {
            console.warn("Connectors not ready yet");
            return;
        }
        const { connector } = await starknetkitConnectModal();
        if (connector) {
            connect({ connector: connector as any });
        }
    };

    if (!address) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-zinc-100 font-sans px-4">
                {/* Subtle top nav */}
                <div className="fixed top-0 inset-x-0 h-16 border-b border-white/[0.06] bg-black/80 backdrop-blur-md flex items-center px-6">
                    <a href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center border border-white/[0.08]">
                            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <span className="text-sm font-medium text-zinc-300">Ghost Vault</span>
                    </a>
                </div>
                <div className="flex flex-col items-center justify-center p-10 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] shadow-2xl max-w-md w-full text-center">
                    <div className="w-14 h-14 rounded-full bg-[#111] mb-6 flex items-center justify-center border border-white/[0.06]">
                        <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Connect your wallet</h2>
                    <p className="text-sm text-zinc-500 mb-8 leading-relaxed">Connect your Starknet wallet to access Ghost Vault and manage your digital legacy.</p>
                    <div className="w-full">
                        <button
                            onClick={handleConnect}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold text-sm rounded-xl transition-all duration-150 cursor-pointer"
                        >
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!vaultActive) {
        return (
            <div className="min-h-screen w-full font-sans bg-black text-zinc-100 overflow-y-auto">
                {/* Nav -- same as active state */}
                <nav className="h-16 border-b border-white/[0.06] bg-[#0a0a0a] flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center border border-white/[0.08]">
                            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Ghost Vault</span>
                    </a>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-white/[0.08] text-xs font-mono text-zinc-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </div>
                        <button onClick={() => disconnect()} className="px-3 py-1.5 rounded-lg bg-transparent border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-all">Disconnect</button>
                    </div>
                </nav>

                <div className="max-w-[1000px] mx-auto w-full px-6 py-12">
                    {/* Setup banner */}
                    <div className="mb-8 p-5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-amber-400 mb-0.5">No vault active</p>
                            <p className="text-xs text-zinc-500">Set up a vault to start protecting your crypto with a dead man's switch.</p>
                        </div>
                        <a href="/dashboard/setup" className="shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">
                            Create Vault -&gt;
                        </a>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                                <span className="text-xs font-mono tracking-wider text-zinc-600 uppercase">No Vault</span>
                            </div>
                            <h1 className="text-4xl font-semibold tracking-tight text-white">Dashboard</h1>
                            <p className="text-sm text-zinc-600 mt-1">Create a vault to get started</p>
                        </div>
                    </div>

                    {/* Empty cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 opacity-40 pointer-events-none select-none">
                        <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-4">Total Principal</p>
                            <p className="text-4xl font-semibold text-zinc-700">0.00</p>
                            <p className="text-xs text-zinc-700 mt-2 font-mono">-- STRK / ETH / USDC</p>
                        </div>
                        <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-4">Earned Yield</p>
                            <p className="text-4xl font-semibold text-zinc-700">0.0000</p>
                            <p className="text-xs text-zinc-700 mt-2">~4.2% APY (Endur.fi)</p>
                        </div>
                        <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08]">
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-4">Next Check-in</p>
                            <p className="text-4xl font-semibold text-zinc-700">--</p>
                            <p className="text-xs text-zinc-700 mt-2">Timer starts after deposit</p>
                        </div>
                    </div>
                    <div className="w-full p-8 rounded-xl bg-[#0a0a0a] border border-white/[0.08] opacity-40 pointer-events-none select-none">
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-2">Trigger Condition</p>
                        <p className="text-sm text-zinc-700">Set beneficiary and inheritance period to activate the dead man's switch.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full font-sans bg-black text-zinc-100 overflow-y-auto selection:bg-blue-500/30">
            {/* Top Nav */}
            <nav className="h-16 border-b border-white/[0.06] bg-[#0a0a0a] flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
                <a href="/" className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center border border-white/[0.08] transition-colors group-hover:border-white/[0.14]">
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Ghost Vault</span>
                </a>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-white/[0.08] text-xs font-mono text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                    <button
                        onClick={() => disconnect()}
                        className="px-3 py-1.5 rounded-lg bg-transparent border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-all"
                    >
                        Disconnect
                    </button>
                </div>
            </nav>

            <div className="max-w-[1000px] mx-auto w-full px-6 py-12 relative z-10">
                {/* Header Subdued Linear Style */}
                <div className="flex justify-between items-end mb-12">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-xs font-mono tracking-wider text-emerald-500 uppercase">
                                Active Vault
                            </span>
                        </div>
                        <h1 className="text-4xl font-semibold tracking-tight text-white mb-1">
                            Dashboard
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Endur.fi xSTRK on Starknet L2
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-white/[0.08] text-zinc-300 text-sm font-medium rounded-lg transition-colors duration-150">
                            Manage Vault
                        </button>
                    </div>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 w-full">

                    {/* Principal Card */}
                    <div className="flex flex-col justify-between p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-px bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors"></div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-zinc-500 mb-2">
                                <span className="text-xs font-medium uppercase tracking-wider">Total Principal</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-semibold tracking-tight text-white">
                                    {principal}
                                </span>
                                <span className="text-sm font-medium text-zinc-500">STRK</span>
                            </div>
                            <div className="text-xs text-zinc-500 mt-2 font-mono">
                                ~ ${(principal * 0.45).toLocaleString()} USD
                            </div>
                        </div>
                    </div>

                    {/* Yield Card */}
                    <div className="flex flex-col justify-between p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-px bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors"></div>
                        <div className="flex flex-col gap-1 mb-4">
                            <div className="flex items-center justify-between text-zinc-500 mb-2">
                                <span className="text-xs font-medium uppercase tracking-wider">Earned Yield</span>
                                <span className="text-xs font-medium text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2.5V9.5M6 2.5L3.5 5M6 2.5L8.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    {apy}%
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-semibold tracking-tight text-emerald-400">
                                    {accumulatedYield}
                                </span>
                                <span className="text-sm font-medium text-zinc-500">STRK</span>
                            </div>
                        </div>
                        <button
                            onClick={() => sendClaim()}
                            disabled={isClaiming || accumulatedYield <= "0"}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-md transition-colors duration-150 disabled:opacity-40 border border-transparent hover:border-white/10">
                            {isClaiming ? "Claiming..." : "Harvest Yield"}
                        </button>
                    </div>

                    {/* Check-in Card */}
                    <div className={`flex flex-col justify-between p-6 rounded-xl border shadow-sm relative overflow-hidden group transition-colors ${isCritical ? 'bg-red-950/20 border-red-500/30' : 'bg-[#0a0a0a] border-white/[0.08]'}`}>
                        <div className={`absolute top-0 inset-x-0 h-px transition-colors ${isCritical ? 'bg-red-500/40' : 'bg-white/[0.02] group-hover:bg-white/[0.05]'}`}></div>
                        <div className="flex flex-col gap-1 mb-4">
                            <div className="flex items-center justify-between text-zinc-500 mb-2">
                                <span className={`text-xs font-medium uppercase tracking-wider ${isCritical ? 'text-red-400/80' : 'text-zinc-500'}`}>Next Check-in</span>
                                {isCritical && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-semibold tracking-tight ${isCritical ? 'text-red-400' : 'text-white'}`}>
                                    {daysRemaining}
                                </span>
                                <span className={`text-sm font-medium ${isCritical ? 'text-red-500/60' : 'text-zinc-500'}`}>
                                    days
                                </span>
                            </div>
                            <div className="text-xs text-zinc-500 mt-2 font-mono">
                                {percentageRemaining.toFixed(1)}% safe period remaining
                            </div>
                        </div>
                        <button
                            onClick={() => send()}
                            disabled={isPending}
                            className={`w-full py-2 text-xs font-medium rounded-md transition-all duration-150 disabled:opacity-40 border
                                ${isCritical
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40'
                                    : 'bg-white text-black border-transparent hover:bg-zinc-200 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                                }`}>
                            {isPending ? "Confirming..." : "Check In Now"}
                        </button>
                    </div>

                </div>

                {/* Dead Man's Switch Visualization */}
                <div className="mt-4 w-full p-8 rounded-xl bg-[#0a0a0a] border border-white/[0.08] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-px bg-white/[0.02]"></div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="flex-1 flex flex-col gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">Trigger Condition</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">
                                    If the check-in timer reaches zero, the dead man's switch activates. 100% of your vault balance and yield will be trustlessly transferred to your designated beneficiary address below.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-zinc-500 uppercase tracking-widest">Primary Beneficiary</span>
                                    <span className="text-blue-400 tracking-wide bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">100% Allocation</span>
                                </div>
                                <div className="px-4 py-3 rounded-lg bg-[#111] border border-white/[0.05] flex items-center font-mono text-sm text-zinc-300">
                                    {displayBeneficiary}
                                </div>
                            </div>
                        </div>

                        {/* Minimalist Gauge */}
                        <div className="shrink-0 w-32 h-32 relative flex items-center justify-center bg-[#111] rounded-full border border-white/[0.05]">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                <path
                                    className="text-white/[0.03]"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                />
                                <path
                                    className={`transition-all duration-1000 ease-out ${isCritical ? 'text-red-500' : 'text-blue-500'}`}
                                    strokeDasharray={`${dashArrayValue}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-2xl font-semibold tracking-tighter ${isCritical ? 'text-red-400' : 'text-zinc-200'}`}>
                                    {daysRemaining}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-zinc-600 mt-0.5">Days</span>
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
