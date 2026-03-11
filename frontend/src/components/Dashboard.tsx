"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAccount, useReadContract, useSendTransaction, useDisconnect, useConnect } from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { GHOST_VAULT_ADDRESS, GHOST_VAULT_ABI } from "@/lib/contract";
import { HonchoMemory } from "@/lib/honcho";
import WithdrawModal from "./WithdrawModal";
import AuthLock from "./AuthLock";

type ActivityItem = { type: string; label: string; time: string; ts: number };

// Icons
const IconDashboard = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconVault = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconLock = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

// Sidebar nav items
const NAV_ITEMS = [
  { icon: <IconDashboard />, label: "Dashboard", href: "/dashboard", active: true },
  { icon: <IconVault />, label: "Vault Settings", href: "/dashboard/setup", active: false },
];

function relativeTime(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Sidebar({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 flex-col bg-[#0a0a0a] border-r border-white/[0.06] z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.06] shrink-0">
        <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center border border-white/[0.08]">
          <IconLock />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">Ghost Vault</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium px-3 mb-3">Main Menu</p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              item.active
                ? "bg-white/[0.05] text-white border-l-2 border-violet-500 pl-[10px]"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Wallet info at bottom */}
      <div className="p-4 border-t border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="text-xs font-mono text-zinc-400 truncate">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="w-full py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.06]"
        >
          Disconnect
        </button>
      </div>
    </aside>
  );
}

export default function Dashboard() {
  const { address } = useAccount();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const memory = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return HonchoMemory.load("wizard_prefs");
    } catch {
      return null;
    }
  }, []);
  const beneficiary = memory?.beneficiary || "0xNotSetYet... (Update in Wizard)";
  const extraBeneficiaries: { address: string; pct: number }[] = memory?.extraBeneficiaries || [];
  const primaryPct = 100 - extraBeneficiaries.reduce((s: number, b: { pct: number }) => s + b.pct, 0);

  const { data: vaultStatus } = useReadContract({
    functionName: "get_vault",
    args: address ? [address] : [],
    abi: GHOST_VAULT_ABI as any,
    address: GHOST_VAULT_ADDRESS,
    watch: true
  });

  const onChainBeneficiary = vaultStatus ? (vaultStatus as any).beneficiary || (vaultStatus as any)[0] : undefined;
  const principalU256 = vaultStatus ? (vaultStatus as any).principal || (vaultStatus as any)[1] : undefined;
  const deadlineU64 = vaultStatus ? (vaultStatus as any).deadline || (vaultStatus as any)[2] : undefined;
  const periodU64 = vaultStatus ? (vaultStatus as any).period || (vaultStatus as any)[3] : undefined;

  const displayBeneficiary = onChainBeneficiary && onChainBeneficiary !== "0x0"
    ? `0x${onChainBeneficiary.toString(16)}`
    : beneficiary;

  const principalStr = principalU256 ? principalU256.toString() : "0";
  const principal = Number(principalStr) / 1e18;
  const vaultActive = principal > 0;

  const deadlineTimestamp = deadlineU64 ? Number(deadlineU64) : 0;
  const periodFromContract = periodU64 ? Number(periodU64) : 0;
  const period = periodFromContract > 0 ? periodFromContract : (memory?.period ? Number(memory.period) * 86400 : 30 * 86400);
  // eslint-disable-next-line react-hooks/purity
  const now = Math.floor(Date.now() / 1000);
  const timeRemainingSeconds = deadlineTimestamp > now ? deadlineTimestamp - now : 0;
  const daysRemaining = Math.ceil(timeRemainingSeconds / 86400);

  const percentageRemaining = period > 0 ? Math.min(Math.max((timeRemainingSeconds / period) * 100, 0), 100) : 0;
  const dashArrayValue = Math.max(percentageRemaining, 1);
  const isCritical = percentageRemaining < 15;

  const vaultHealthStatus = !vaultActive ? "Inactive" : isCritical ? "Critical" : "Healthy";

  const calls = useMemo(() => {
    if (!address) return [];
    return [{ contractAddress: GHOST_VAULT_ADDRESS, entrypoint: "checkin", calldata: [] }];
  }, [address]);

  const claimCalls = useMemo(() => {
    if (!address) return [];
    return [{ contractAddress: GHOST_VAULT_ADDRESS, entrypoint: "claim_yield", calldata: [] }];
  }, [address]);

  const { send, isPending, data: checkinData } = useSendTransaction({ calls });
  const { send: sendClaim, isPending: isClaiming, data: claimData } = useSendTransaction({ calls: claimCalls });

  const loadLocalActivity = () => {
    const raw = HonchoMemory.load("activities") || [];
    setActivity(raw.map((r: any) => ({ ...r, time: relativeTime(r.ts) })));
  };

  // Add activity on transaction success
  useEffect(() => {
    if (checkinData) {
      HonchoMemory.addActivity("Check-in confirmed");
      loadLocalActivity();
    }
  }, [checkinData]);

  useEffect(() => {
    if (claimData) {
      HonchoMemory.addActivity(`Yield claimed successfully`);
      loadLocalActivity();
    }
  }, [claimData]);

  // ── Fetch local activity ──
  useEffect(() => {
    if (!address) return;
    setActivityLoading(true);
    loadLocalActivity();
    setActivityLoading(false);
  }, [address]);

  const apy = 4.2;
  const accumulatedYield = (principal * 0.042 * (30 - daysRemaining) / 365).toFixed(4);

  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as any,
    modalMode: "alwaysAsk",
  });
  const { disconnect } = useDisconnect();

  const handleConnect = async () => {
    if (!connectors || connectors.length === 0) return;
    const { connector } = await starknetkitConnectModal();
    if (connector) connect({ connector: connector as any });
  };

  // ---- NOT CONNECTED STATE ----
  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050507] text-zinc-100 font-sans px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
        <div className="fixed top-0 inset-x-0 h-16 border-b border-white/[0.06] bg-black/80 backdrop-blur-md flex items-center px-6 z-50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center border border-white/[0.08]">
              <IconLock />
            </div>
            <span className="text-sm font-medium text-zinc-300">Ghost Vault</span>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center p-10 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] shadow-2xl max-w-md w-full text-center relative z-10">
          <div className="w-14 h-14 rounded-full bg-[#111] mb-6 flex items-center justify-center border border-white/[0.06]">
            <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Connect your wallet</h2>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">Connect your Starknet wallet to access Ghost Vault and manage your digital legacy.</p>
          <button
            onClick={handleConnect}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthLock skipAuth={!vaultActive}>
      {(authMode) => {
        // ---- FORCED DECOY STATE OVERRIDES ----
        const isDecoy = authMode === "decoy";
        
        // If decoy mode, we pretend the vault is empty/inactive
        const displayPrincipal = isDecoy ? 0 : principal;
        const displayVaultActive = isDecoy ? false : vaultActive;
        const displayAPY = isDecoy ? 0 : apy;
        const displayAccumulatedYield = isDecoy ? "0.0000" : accumulatedYield;
        const displayDaysRemaining = isDecoy ? 0 : daysRemaining;
        const displayPercentageRemaining = isDecoy ? 0 : percentageRemaining;
        const displayDashArrayValue = isDecoy ? 0 : dashArrayValue;
        const displayIsCritical = isDecoy ? false : isCritical;
        const displayVaultHealthStatus = isDecoy ? "Inactive" : vaultHealthStatus;

        // ---- NO VAULT STATE (Real or Decoy) ----
        if (!displayVaultActive) {
          return (
            <div className="min-h-screen w-full font-sans bg-[#050507] text-zinc-100 overflow-y-auto">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
              <Sidebar address={address} onDisconnect={() => disconnect()} />
              {/* Mobile top nav */}
              <nav className="md:hidden h-16 border-b border-white/[0.06] bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center border border-white/[0.08]">
                    <IconLock />
                  </div>
                  <span className="text-sm font-medium text-zinc-300">Ghost Vault</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-white/[0.08] text-xs font-mono text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                  <button onClick={() => disconnect()} className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-zinc-500 hover:text-zinc-300 transition-all">Disconnect</button>
                </div>
              </nav>

              <div className="md:ml-64 p-6 md:p-8 relative z-10">
                <div className="mb-8 p-5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-amber-400 mb-0.5">No vault active</p>
                    <p className="text-xs text-zinc-500">Set up a vault to start protecting your crypto with a dead man&apos;s switch.</p>
                  </div>
                  <Link href="/dashboard/setup" className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    Create Vault →
                  </Link>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium">No Vault</span>
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
                  <p className="text-sm text-zinc-600 mt-1">Create a vault to get started</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 opacity-40 pointer-events-none select-none">
                  {["Total Principal", "Earned Yield", "Next Check-in", "Vault Health"].map((label) => (
                    <div key={label} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-4">{label}</p>
                      <p className="text-4xl font-semibold text-zinc-700">--</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // ---- ACTIVE VAULT STATE ----
        return (
          <div className="min-h-screen w-full font-sans bg-[#050507] text-zinc-100 overflow-y-auto selection:bg-violet-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none z-0" />
      
            <Sidebar address={address} onDisconnect={() => disconnect()} />
      
            {/* Mobile top nav */}
            <nav className="md:hidden h-16 border-b border-white/[0.06] bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center border border-white/[0.08]">
                  <IconLock />
                </div>
                <span className="text-sm font-medium text-zinc-300">Ghost Vault</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-white/[0.08] text-xs font-mono text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <button onClick={() => disconnect()} className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-zinc-500 hover:text-zinc-300 transition-all">Disconnect</button>
              </div>
            </nav>
      
            {/* Main content */}
            <main className="md:ml-64 p-6 md:p-8 relative z-10">
      
              {/* Page header */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-emerald-500 font-medium">Active Vault</span>
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
                  <p className="text-sm text-zinc-500 mt-1">Endur.fi xSTRK on Starknet L2</p>
                </div>
              </div>
      
              {/* ---- TOP STATS ROW: 4 columns ---- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
                {/* Card 1: Total Principal */}
                <div className="flex flex-col justify-between p-6 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.12] hover:shadow-[0_0_30px_rgba(139,92,246,0.05)] transition-all group">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-3">Total Principal</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-white">{displayPrincipal}</span>
                    <span className="text-sm font-medium text-zinc-500">STRK</span>
                  </div>
                  <div className="text-xs text-zinc-600 mt-2 font-mono">~ ${(displayPrincipal * 0.45).toLocaleString()} USD</div>
                </div>
      
                {/* Card 2: Earned Yield */}
                <div className="flex flex-col justify-between p-6 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.12] hover:shadow-[0_0_30px_rgba(139,92,246,0.05)] transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium">Earned Yield</p>
                    <span className="text-xs font-medium text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 2.5V9.5M6 2.5L3.5 5M6 2.5L8.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {displayAPY}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-emerald-400">{displayAccumulatedYield}</span>
                    <span className="text-sm font-medium text-zinc-500">STRK</span>
                  </div>
                </div>
      
                {/* Card 3: Next Check-in */}
                <div className={`flex flex-col justify-between p-6 rounded-2xl backdrop-blur-sm border hover:shadow-[0_0_30px_rgba(139,92,246,0.05)] transition-all ${displayIsCritical ? "bg-red-950/20 border-red-500/30" : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-[10px] uppercase tracking-[0.15em] font-medium ${displayIsCritical ? "text-red-400/80" : "text-zinc-600"}`}>Next Check-in</p>
                    {displayIsCritical && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-semibold tracking-tight ${displayIsCritical ? "text-red-400" : "text-white"}`}>{displayDaysRemaining}</span>
                    <span className={`text-sm font-medium ${displayIsCritical ? "text-red-500/60" : "text-zinc-500"}`}>days</span>
                  </div>
                  <div className="text-xs text-zinc-600 mt-2 font-mono">{displayPercentageRemaining.toFixed(1)}% safe period remaining</div>
                </div>
      
                {/* Card 4: Vault Health (with gauge ring) */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.12] hover:shadow-[0_0_30px_rgba(139,92,246,0.05)] transition-all">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-4 self-start">Vault Health</p>
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className={`w-full h-full transform -rotate-90 ${displayIsCritical ? "animate-pulse" : ""}`}>
                      <path className="text-white/[0.04]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path
                        className={`transition-all duration-1000 ease-out ${displayIsCritical ? "text-red-500" : "text-violet-500"}`}
                        strokeDasharray={`${displayDashArrayValue}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-base font-bold ${displayIsCritical ? "text-red-400" : "text-white"}`}>
                        {displayPercentageRemaining.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold mt-3 px-2 py-0.5 rounded-full ${
                    displayVaultHealthStatus === "Healthy" ? "text-emerald-400 bg-emerald-500/10" :
                    displayVaultHealthStatus === "Critical" ? "text-red-400 bg-red-500/10" :
                    "text-zinc-500 bg-white/[0.04]"
                  }`}>{displayVaultHealthStatus}</span>
                </div>
              </div>
      
              {/* ---- MIDDLE SECTION: Trigger + Quick Actions ---- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Trigger Condition (2/3 width) */}
                <div className="lg:col-span-2 p-6 md:p-8 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.12] transition-all">
                  <h3 className="text-base font-semibold text-white mb-1">Trigger Condition</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-6 max-w-xl">
                    If the check-in timer reaches zero, the dead man&apos;s switch activates. Your vault balance and yield will be trustlessly transferred to your designated beneficiaries.
                  </p>
                  <div className="flex flex-col gap-3">
                    {/* Primary beneficiary */}
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">Primary Beneficiary</span>
                      <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{primaryPct}% Allocation</span>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center font-mono text-sm text-zinc-300 break-all">
                      {displayBeneficiary}
                    </div>
                    {/* Extra beneficiaries from localStorage */}
                    {extraBeneficiaries.map((b, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-xs font-medium mb-1">
                          <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">Additional Beneficiary {i + 1}</span>
                          <span className="text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">{b.pct}% Allocation</span>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center font-mono text-sm text-zinc-400 break-all">
                          {b.address}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
      
                {/* Quick Actions (1/3 width) */}
                <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col gap-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-1">Quick Actions</p>
                  <button
                    onClick={() => send()}
                    disabled={isPending}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      displayIsCritical
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        : "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                    } disabled:opacity-40 cursor-pointer`}
                  >
                    {isPending ? "Confirming..." : "Check In Now"}
                  </button>
                  <button
                    onClick={() => sendClaim()}
                    disabled={isClaiming || displayAccumulatedYield <= "0"}
                    className="w-full py-3 rounded-xl text-sm font-medium text-zinc-300 border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04] transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {isClaiming ? "Claiming..." : "Harvest Yield"}
                  </button>
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all cursor-pointer"
                  >
                    Withdraw Assets
                  </button>
                </div>
              </div>
      
              {/* ---- BOTTOM SECTION: Activity Feed ---- */}
              <div className="p-6 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:border-white/[0.12] transition-all">
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-4">Recent Activity</p>
                <div className="flex flex-col gap-4">
                  {activityLoading ? (
                    <div className="flex flex-col gap-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
                          <span className="h-3 bg-zinc-800 rounded w-2/3" />
                          <span className="h-3 bg-zinc-800 rounded w-16 ml-auto" />
                        </div>
                      ))}
                    </div>
                  ) : activity.length === 0 ? (
                    <p className="text-sm text-zinc-600 italic">No on-chain activity found for this vault.</p>
                  ) : (
                    activity.slice(0, 10).map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] shrink-0"></span>
                        <span className="text-sm text-zinc-300 flex-1">{item.label}</span>
                        <span className="text-xs text-zinc-600 font-mono shrink-0">{item.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </main>
      
            <WithdrawModal
              isOpen={isWithdrawModalOpen}
              onClose={() => setIsWithdrawModalOpen(false)}
              principal={displayPrincipal}
            />
          </div>
        );
      }}
    </AuthLock>
  );
}
