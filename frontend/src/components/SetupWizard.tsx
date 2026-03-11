"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAccount, useSendTransaction, useReadContract, useContract, useConnect, useDisconnect } from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";
import { GHOST_VAULT_ADDRESS, GHOST_VAULT_ABI } from "@/lib/contract";
import { uint256 } from "starknet";
import { HonchoMemory } from "@/lib/honcho";

// ─── Constants ────────────────────────────────────────────────
const VAULT_TOKEN = {
  id: "STRK",
  address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
};

const PERIOD_OPTIONS = [
  { days: 14, label: "14 Days", sub: "~2 weeks" },
  { days: 30, label: "30 Days", sub: "~1 month" },
  { days: 60, label: "60 Days", sub: "~2 months" },
  { days: 90, label: "90 Days", sub: "~3 months" },
];

// ─── Icons ────────────────────────────────────────────────────
const IconLock = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconDashboard = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconVaultSettings = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const STEPS = [
  { n: 1, label: "Deposit & Interval" },
  { n: 2, label: "Beneficiaries" },
  { n: 3, label: "Security" },
  { n: 4, label: "Review & Confirm" },
];

const STEP_CONTEXT = [
  "Your deposit acts as the base inheritance. The check-in interval sets your dead-man's switch timeline. Miss a check-in, and your vault unlocks.",
  "Set one or more Starknet addresses as heirs. The primary beneficiary is required — additional ones are optional splits. Ghost Vault uses stealth addresses to keep all links private.",
  "Set up a Main PIN to secure your dashboard, and a Duress PIN in case you are forced to open the vault. The Duress PIN will show an empty decoy vault.",
  "Review all details before confirming. Your wallet will sign a single multicall: approve → create vault → deposit.",
];

// ─── Types ────────────────────────────────────────────────────
type BeneficiaryEntry = { id: number; address: string; pct: number };

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 flex-col bg-[#0a0a0a] border-r border-white/[0.06] z-40">
      <Link href="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.06] shrink-0 hover:bg-white/[0.02] transition-colors">
        <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center border border-white/[0.08]">
          <IconLock />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">Ghost Vault</span>
      </Link>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium px-3 mb-3">Main Menu</p>
        <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]">
          <IconDashboard />
          <span className="text-sm font-medium">Dashboard</span>
        </a>
        <a href="/dashboard/setup" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all bg-white/[0.05] text-white border-l-2 border-violet-500 pl-[10px]">
          <IconVaultSettings />
          <span className="text-sm font-medium">Vault Settings</span>
        </a>
      </nav>
      <div className="p-4 border-t border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-xs font-mono text-zinc-400 truncate">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        <button onClick={onDisconnect} className="w-full py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.06]">
          Disconnect
        </button>
      </div>
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function SetupWizard() {
  const { address } = useAccount();
  const [step, setStep] = useState(1);

  const [depositAmount, setDepositAmount] = useState("");
  const [checkinPeriod, setCheckinPeriod] = useState(30);
  // Primary beneficiary (used for contract call)
  const [beneficiary, setBeneficiary] = useState("");
  // Optional additional beneficiaries (frontend split tracking only)
  const [extraBeneficiaries, setExtraBeneficiaries] = useState<BeneficiaryEntry[]>([]);
  const [nextId, setNextId] = useState(1);
  // PIN states
  const [mainPIN, setMainPIN] = useState("");
  const [duressPIN, setDuressPIN] = useState("");

  const totalPct = 100 - extraBeneficiaries.reduce((acc, b) => acc + b.pct, 0);
  const primaryPct = totalPct;

  const addBeneficiary = () => {
    const remaining = extraBeneficiaries.reduce((acc, b) => acc + b.pct, 0);
    const available = 100 - remaining;
    if (available <= 0) return;
    const defaultPct = Math.min(10, available);
    setExtraBeneficiaries(prev => [...prev, { id: nextId, address: "", pct: defaultPct }]);
    setNextId(n => n + 1);
  };

  const removeBeneficiary = (id: number) => {
    setExtraBeneficiaries(prev => prev.filter(b => b.id !== id));
  };

  const updateBeneficiary = (id: number, field: "address" | "pct", value: string | number) => {
    setExtraBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({ connectors: connectors as any, modalMode: "alwaysAsk" });
  const { contract: vaultContract } = useContract({ abi: GHOST_VAULT_ABI as any, address: GHOST_VAULT_ADDRESS as `0x${string}` });

  useMemo(() => {
    if (!HonchoMemory) return;
    const mem = HonchoMemory.load("wizard_prefs");
    if (mem) {
      if (mem.period) setCheckinPeriod(mem.period);
      if (mem.beneficiary) setBeneficiary(mem.beneficiary);
    }
  }, []);

  const { data: vaultData } = useReadContract({
    abi: GHOST_VAULT_ABI as any,
    address: GHOST_VAULT_ADDRESS as `0x${string}`,
    functionName: "get_vault",
    args: address ? [address as `0x${string}`] : ([] as any),
    enabled: !!address,
  });
  // vault exists = deadline is set (index 2)
  // vault has balance = principal > 0 (index 1)
  const vaultDeadline = vaultData ? Number((vaultData as any[])[2]) : 0;
  const vaultPrincipal = vaultData ? Number((vaultData as any[])[1]) : 0;
  const vaultAlreadyExists = vaultDeadline > 0 && vaultPrincipal > 0; // only block if vault has active balance
  const vaultExistsButEmpty = vaultDeadline > 0 && vaultPrincipal === 0; // vault created, but currently no balance

  const { data: strkBalanceData, isLoading: balanceLoading } = useReadContract({
    abi: [{ name: "balanceOf", type: "function", inputs: [{ name: "account", type: "core::starknet::contract_address::ContractAddress" }], outputs: [{ type: "core::integer::u256" }], state_mutability: "view" }] as const,
    address: VAULT_TOKEN.address as `0x${string}`,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    enabled: !!address,
    watch: true,
  });

  let strkBalance = BigInt(0);
  if (strkBalanceData !== undefined) {
    strkBalance = typeof strkBalanceData === "bigint" ? strkBalanceData : BigInt(strkBalanceData.toString());
  }
  const strkBalanceNum = strkBalanceData !== undefined ? Number(strkBalance) / 1e18 : null;
  const depositNum = Number(depositAmount) || 0;
  const isInsufficientBalance = strkBalanceNum !== null && depositNum > strkBalanceNum;

  const amountWei = depositAmount && !isNaN(parseFloat(depositAmount))
    ? BigInt(Math.floor(parseFloat(depositAmount) * 1e18))
    : BigInt(0);

  const calls = useMemo(() => {
    // For deposit-only (vault exists but empty), beneficiary is not needed in the call
    const isDepositOnly = vaultExistsButEmpty;
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || (!isDepositOnly && !beneficiary) || !vaultContract) return [];
    const amountU256 = uint256.bnToUint256(amountWei);
    const periodSeconds = checkinPeriod * 86400;
    const windowDurationSeconds = 7 * 86400;
    const approveTx = { contractAddress: VAULT_TOKEN.address, entrypoint: "approve", calldata: [GHOST_VAULT_ADDRESS, amountU256.low.toString(), amountU256.high.toString()] };
    const createVaultTx = { contractAddress: GHOST_VAULT_ADDRESS, entrypoint: "create_vault", calldata: [beneficiary, periodSeconds.toString(), windowDurationSeconds.toString()] };
    const depositTx = { contractAddress: GHOST_VAULT_ADDRESS, entrypoint: "deposit", calldata: [amountU256.low.toString(), amountU256.high.toString()] };
    // vault exists with balance = skip create; vault exists but empty = skip create too; brand new = full multicall
    return (vaultAlreadyExists || vaultExistsButEmpty) ? [approveTx, depositTx] : [approveTx, createVaultTx, depositTx];
  }, [depositAmount, beneficiary, checkinPeriod, vaultAlreadyExists, vaultExistsButEmpty, vaultContract, amountWei]);

  const { send, isPending, data, error } = useSendTransaction({ calls });

  const hasEnoughBalance = amountWei <= strkBalance;
  const step1Valid = depositAmount && parseFloat(depositAmount) > 0 && hasEnoughBalance && !isInsufficientBalance;
  const extraValid = extraBeneficiaries.every(b => b.address.startsWith("0x") && b.address.length > 10 && b.pct > 0);
  const step2Valid = beneficiary.startsWith("0x") && beneficiary.length > 10 && extraValid && primaryPct > 0;
  const step3Valid = mainPIN.length >= 4 && duressPIN.length >= 4 && mainPIN !== duressPIN;
  // If vault exists but empty, user only needs to do deposit (no beneficiary needed again)
  const isValid = vaultExistsButEmpty ? step1Valid : step1Valid && step2Valid && step3Valid;

  const handleSubmit = () => {
    // Save primary + extra beneficiaries so Dashboard can display all of them
    const extrasData = extraBeneficiaries.map(b => ({ address: b.address, pct: b.pct }));
    HonchoMemory.save("wizard_prefs", {
      period: checkinPeriod,
      beneficiary,
      extraBeneficiaries: extrasData,
      mainPIN,
      duressPIN,
    });
    // In a prod env we'd hash the ping before saving, but local storage is OK for hackathon/demo
    send();
  };

  React.useEffect(() => {
    if (data) {
      HonchoMemory.addActivity("Vault deployed successfully");
      const timer = setTimeout(() => { window.location.href = "/dashboard"; }, 1200);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleConnect = async () => {
    if (!connectors || connectors.length === 0) return;
    const { connector } = await starknetkitConnectModal();
    if (connector) connect({ connector: connector as any });
  };

  // ── Not connected ──
  if (!address) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
        <div className="p-8 text-center rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm max-w-sm w-full relative z-10">
          <div className="w-14 h-14 rounded-full bg-[#111] mx-auto mb-6 flex items-center justify-center border border-white/[0.06]">
            <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Connect your wallet</h2>
          <p className="text-sm text-zinc-500 mb-8">Please connect your Starknet wallet to setup your vault.</p>
          <button onClick={handleConnect} className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // ── Vault already exists WITH balance — block re-creation ──
  if (vaultAlreadyExists) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
        <div className="p-8 text-center rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm max-w-md w-full relative z-10">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 mx-auto mb-6 flex items-center justify-center border border-amber-500/20">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Vault Already Active</h2>
          <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
            You already have an active vault with funds. To add more funds, use the deposit flow from Dashboard.
          </p>
          <div className="flex items-start gap-2 mb-6 px-3 py-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/20 text-left">
            <span className="text-amber-400 shrink-0 mt-0.5 text-sm">*</span>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              To recreate a vault with different settings, withdraw all assets first, then come back here.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="/dashboard" className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              Go to Dashboard
            </a>
            <a href="/dashboard" className="w-full flex items-center justify-center gap-2 px-5 py-3 text-zinc-500 hover:text-zinc-300 font-medium text-sm rounded-xl transition-all duration-200 cursor-pointer border border-white/[0.06] hover:border-white/[0.12]">
              Withdraw Assets First
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Main layout ──
  return (
    <div className="min-h-screen w-full font-sans bg-[#050507] text-zinc-100 overflow-y-auto selection:bg-violet-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none z-0" />

      <Sidebar address={address} onDisconnect={() => disconnect()} />

      {/* Mobile top nav */}
      <nav className="md:hidden h-16 border-b border-white/[0.06] bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#111] flex items-center justify-center border border-white/[0.08]"><IconLock /></div>
          <span className="text-sm font-medium text-zinc-300">Ghost Vault</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Dashboard</Link>
      </nav>

      <main className="md:ml-64 p-6 md:p-8 relative z-10 min-h-screen">
        <div className="max-w-5xl mx-auto mt-4">

          {/* Page header */}
          <div className="mb-8">
            <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">{vaultAlreadyExists ? "Existing Vault" : "New Vault"}</span>
            <h1 className="text-3xl font-semibold tracking-tight text-white mt-1">Vault Settings</h1>
          </div>

          {/* Main glassmorphism card */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10 md:gap-16">

              {/* ── LEFT: Progress Tracker ── */}
              <div className="flex flex-col">
                {/* Vertical steps */}
                <div className="relative flex flex-col gap-0">
                  {/* Connecting line */}
                  <div className="absolute left-[5px] top-3 bottom-3 w-px bg-white/[0.06] hidden md:block" />
                  {STEPS.map((s, i) => (
                    <div key={s.n} className="flex items-start gap-3 relative pb-8 last:pb-0">
                      {/* Dot */}
                      <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 z-10 transition-all ${step === s.n ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" : step > s.n ? "bg-violet-700/50" : "bg-zinc-800"}`} />
                      <div>
                        <p className={`text-sm font-semibold transition-colors ${step === s.n ? "text-white" : step > s.n ? "text-zinc-500" : "text-zinc-600"}`}>
                          {s.label}
                        </p>
                        {step > s.n && <p className="text-[10px] text-violet-500/60 mt-0.5">Complete</p>}
                        {step === s.n && <p className="text-[10px] text-violet-400/60 mt-0.5">Current</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Context info box */}
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mt-8 hidden md:block">
                  <p className="text-xs text-zinc-400 leading-relaxed">{STEP_CONTEXT[step - 1]}</p>
                </div>

                {/* Balance */}
                {strkBalanceNum !== null && (
                  <div className="mt-4 hidden md:block">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-1">Wallet Balance</p>
                    <p className="text-sm font-mono text-white">{strkBalanceNum.toFixed(4)} <span className="text-violet-400">STRK</span></p>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Form Inputs ── */}
              <div className="flex flex-col">

                {/* ──── STEP 1: Deposit & Interval ──── */}
                {step === 1 && (
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-10 text-white">Deposit &amp; Interval</h2>

                    {/* Amount input */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-4">STRK Deposit Amount</p>
                      <div className={`border-b pb-4 transition-colors ${isInsufficientBalance ? "border-red-500/60" : "border-white/20 focus-within:border-violet-500"}`}>
                        <div className="flex items-baseline gap-3">
                          <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="text-5xl md:text-6xl text-white bg-transparent outline-none w-full placeholder:text-zinc-700 font-bold"
                          />
                          <span className="text-xl text-violet-400 font-semibold shrink-0">STRK</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        {balanceLoading ? (
                          <p className="text-sm text-zinc-600">Loading balance...</p>
                        ) : strkBalanceNum !== null ? (
                          <p className="text-sm text-zinc-500">
                            Available: <span className="text-zinc-300 font-mono">{strkBalanceNum.toFixed(4)}</span> STRK
                          </p>
                        ) : (
                          <p className="text-sm text-zinc-600">Could not read balance</p>
                        )}
                        {strkBalanceNum !== null && strkBalanceNum > 0 && (
                          <button type="button" onClick={() => setDepositAmount(Math.max(0, strkBalanceNum - 0.005).toFixed(4))} className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors cursor-pointer px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                            MAX
                          </button>
                        )}
                      </div>
                      {isInsufficientBalance && (
                        <p className="text-xs text-red-400 mt-2">Insufficient balance. You have {strkBalanceNum?.toFixed(4)} STRK.</p>
                      )}
                    </div>

                    {/* Check-in interval */}
                    <div className="mt-12">
                      <p className="text-lg font-semibold text-white mb-1">Check-in Interval</p>
                      <p className="text-sm text-zinc-500 mb-5">How often must you prove you&apos;re alive?</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PERIOD_OPTIONS.map(({ days, label, sub }) => (
                          <button
                            key={days}
                            onClick={() => setCheckinPeriod(days)}
                            className={`flex flex-col items-center justify-center p-5 rounded-2xl border cursor-pointer transition-all ${
                              checkinPeriod === days
                                ? "border-violet-500 bg-violet-500/10 text-white shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
                                : "bg-[#0a0a0a] border-white/10 text-zinc-400 hover:border-violet-500/40 hover:text-zinc-200"
                            }`}
                          >
                            <span className="text-base font-bold">{label}</span>
                            <span className="text-[10px] text-zinc-600 mt-1">{sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ──── STEP 2: Beneficiaries ──── */}
                {step === 2 && (
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">Beneficiaries</h2>

                    {/* Info note */}
                    <div className="flex items-start gap-2 mb-6 px-3 py-2.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/20">
                      <span className="text-amber-400 shrink-0 mt-0.5">*</span>
                      <p className="text-xs text-amber-300/80 leading-relaxed">
                        User only can use 1 mandatory and another optional address for beneficiary. If user want to recreate vault please withdraw all assets first.
                      </p>
                    </div>

                    {/* Primary (Mandatory) */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium">Primary Beneficiary</span>
                          <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Required</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white">{primaryPct}%</span>
                      </div>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={beneficiary}
                        onChange={(e) => setBeneficiary(e.target.value)}
                        className={`w-full bg-[#09090b] border rounded-2xl p-5 text-zinc-300 font-mono text-base shadow-inner outline-none transition-colors placeholder:text-zinc-700 ${
                          beneficiary && !beneficiary.startsWith("0x") ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-violet-500"
                        }`}
                      />
                      {beneficiary && !beneficiary.startsWith("0x") && (
                        <p className="text-xs text-red-400 mt-2">Must be a valid Starknet address starting with 0x</p>
                      )}
                    </div>

                    {/* Extra beneficiaries */}
                    {extraBeneficiaries.map((b) => (
                      <div key={b.id} className="mb-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium">Additional Beneficiary</span>
                            <span className="text-[10px] bg-zinc-800 text-zinc-500 border border-white/[0.06] px-2 py-0.5 rounded-full">Optional</span>
                          </div>
                          <button onClick={() => removeBeneficiary(b.id)} className="text-zinc-700 hover:text-red-400 transition-colors text-xs cursor-pointer">
                            ✕ Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={b.address}
                          onChange={(e) => updateBeneficiary(b.id, "address", e.target.value)}
                          className={`w-full bg-[#09090b] border rounded-xl p-4 text-zinc-300 font-mono text-sm shadow-inner outline-none transition-colors placeholder:text-zinc-700 mb-3 ${
                            b.address && !b.address.startsWith("0x") ? "border-red-500/50" : "border-white/[0.08] focus:border-violet-500"
                          }`}
                        />
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-600 w-16 shrink-0">Allocation</span>
                          <input
                            type="range"
                            min={1}
                            max={Math.min(99, 100 - extraBeneficiaries.filter(x => x.id !== b.id).reduce((a, x) => a + x.pct, 0) - 1)}
                            value={b.pct}
                            onChange={(e) => updateBeneficiary(b.id, "pct", Number(e.target.value))}
                            className="flex-1 accent-violet-500 cursor-pointer"
                          />
                          <span className="text-sm font-mono font-bold text-violet-400 w-10 text-right">{b.pct}%</span>
                        </div>
                        {b.address && !b.address.startsWith("0x") && (
                          <p className="text-xs text-red-400 mt-2">Must start with 0x</p>
                        )}
                      </div>
                    ))}

                    {/* Distribution bar */}
                    {extraBeneficiaries.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-zinc-600">Allocation Distribution</span>
                          <span className={`text-[10px] font-mono ${primaryPct < 0 ? "text-red-400" : "text-zinc-500"}`}>
                            Primary: {primaryPct}% · Total: {extraBeneficiaries.reduce((a,b) => a+b.pct,0) + primaryPct}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden flex">
                          <div className="h-full bg-gradient-to-r from-violet-600 to-blue-600 transition-all" style={{ width: `${primaryPct}%` }} />
                          {extraBeneficiaries.map((b, i) => (
                            <div key={b.id} className="h-full transition-all" style={{ width: `${b.pct}%`, background: `hsl(${200 + i * 30}, 70%, 60%)` }} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add button — max 1 extra beneficiary */}
                    {primaryPct > 1 && extraBeneficiaries.length < 1 && (
                      <button
                        onClick={addBeneficiary}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-violet-400 transition-colors border border-dashed border-white/[0.08] hover:border-violet-500/40 rounded-xl px-4 py-3 w-full justify-center cursor-pointer mt-2"
                      >
                        <span className="text-lg leading-none">+</span> Add Optional Beneficiary
                        <span className="text-[10px] text-zinc-700">(max 1)</span>
                      </button>
                    )}
                    {extraBeneficiaries.length >= 1 && (
                      <p className="text-[10px] text-zinc-700 text-center mt-2">Maximum 1 optional beneficiary allowed</p>
                    )}

                    <div className="mt-6 p-4 rounded-xl bg-violet-500/[0.04] border border-violet-500/15">
                      <p className="text-xs font-semibold text-violet-400 mb-1">Privacy Guaranteed</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">Ghost Vault uses stealth addresses so no on-chain observer can link your identity to your beneficiaries.</p>
                    </div>
                  </div>
                )}

                {/* ──── STEP 3: Security ──── */}
                {step === 3 && (
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">Security & Access</h2>

                    <div className="flex items-start gap-2 mb-6 px-3 py-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/20">
                      <span className="text-red-400 shrink-0 mt-0.5">*</span>
                      <p className="text-xs text-red-300/80 leading-relaxed">
                        To protect against physical extortion ($5 wrench attacks), Ghost Vault uses two PINs. A Main PIN for your actual dashboard, and a Duress PIN that shows a fake empty vault. Keep both PINs secret.
                      </p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        <span className="text-[10px] uppercase tracking-[0.15em] text-emerald-500 font-medium">Main Access PIN</span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3">This PIN unlocks your real vault and reveals your true asset balances.</p>
                      <input
                        type="password"
                        placeholder="4 to 6 digits"
                        value={mainPIN}
                        maxLength={6}
                        onChange={(e) => setMainPIN(e.target.value.replace(/[^0-9]/g, ""))}
                        className={`w-full bg-[#09090b] border rounded-2xl p-5 text-zinc-300 font-mono text-base shadow-inner outline-none transition-colors placeholder:text-zinc-700 tracking-[0.5em] ${
                          mainPIN.length > 0 && mainPIN.length < 4 ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-violet-500"
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>
                        <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">Duress/Decoy PIN</span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3">Give this PIN to an attacker if forced. It opens a fake, empty vault dashboard.</p>
                      <input
                        type="password"
                        placeholder="4 to 6 digits"
                        value={duressPIN}
                        maxLength={6}
                        onChange={(e) => setDuressPIN(e.target.value.replace(/[^0-9]/g, ""))}
                        className={`w-full bg-[#09090b] border rounded-2xl p-5 text-zinc-300 font-mono text-base shadow-inner outline-none transition-colors placeholder:text-zinc-700 tracking-[0.5em] ${
                          duressPIN.length > 0 && duressPIN.length < 4 ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-violet-500"
                        }`}
                      />
                      {mainPIN && duressPIN && mainPIN === duressPIN && (
                         <p className="text-xs text-red-400 mt-2">Main PIN and Duress PIN cannot be the same.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ──── STEP 4: Review ──── */}
                {step === 4 && (
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-10 text-white">Review &amp; Confirm</h2>
                    <div className="border border-dashed border-white/20 bg-white/[0.02] rounded-3xl p-8 font-mono flex flex-col gap-5">
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                        <span className="text-xs uppercase tracking-widest text-zinc-600">Deposit</span>
                        <span className="text-lg font-bold text-white">{depositAmount || "0"} <span className="text-violet-400">STRK</span></span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                        <span className="text-xs uppercase tracking-widest text-zinc-600">Check-in Interval</span>
                        <span className="text-lg font-bold text-white">{checkinPeriod} days</span>
                      </div>
                      {/* Beneficiaries breakdown */}
                      <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-5">
                        <span className="text-xs uppercase tracking-widest text-zinc-600 mb-1">Beneficiaries</span>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                            <span className="text-xs text-zinc-300 break-all">{beneficiary}</span>
                          </div>
                          <span className="text-sm font-bold text-violet-400 shrink-0">{primaryPct}%</span>
                        </div>
                        {extraBeneficiaries.map((b, i) => (
                          <div key={b.id} className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `hsl(${200 + i * 30}, 70%, 60%)` }} />
                              <span className="text-xs text-zinc-400 break-all">{b.address}</span>
                            </div>
                            <span className="text-sm font-bold shrink-0" style={{ color: `hsl(${200 + i * 30}, 70%, 60%)` }}>{b.pct}%</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-zinc-600">Ops in Multicall</span>
                        <span className="text-base font-bold text-emerald-400">{(vaultAlreadyExists || vaultExistsButEmpty) ? 2 : 3} txns</span>
                      </div>
                    </div>

                    {(vaultAlreadyExists || vaultExistsButEmpty) && (
                      <div className="mt-4 px-4 py-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
                        <p className="text-xs text-emerald-400">
                          {vaultExistsButEmpty
                            ? "Your vault is empty — only approve + deposit will run (no re-create)."
                            : "Vault exists — create step will be skipped, only approve + deposit."}
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono break-all">
                        <strong>Error:</strong> {error.message || "Unknown error"}
                      </div>
                    )}

                    {data && (
                      <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center font-semibold">
                        ✓ Vault Created! Redirecting to Dashboard...
                      </div>
                    )}
                  </div>
                )}

                {/* ── Action Buttons ── */}
                <div className="flex items-center gap-4 mt-12 pt-8 border-t border-white/[0.08]">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(s => s - 1)}
                      className="text-zinc-400 hover:text-white px-6 py-4 font-medium transition-colors cursor-pointer"
                    >
                      ← Back
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-3">
                    {step < 4 && (
                      <button
                        onClick={() => setStep(s => s + 1)}
                        disabled={step === 1 ? !step1Valid : step === 2 ? !step2Valid : !step3Valid}
                        className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-2xl py-4 px-10 font-bold text-lg text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        Next →
                      </button>
                    )}
                    {step === 4 && (
                      <button
                        onClick={handleSubmit}
                        disabled={isPending || !isValid || !calls.length || !!data}
                        className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-2xl py-4 px-10 font-bold text-lg text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        {isPending ? "Signing..." : data ? "Done ✓" : "Create Vault →"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
