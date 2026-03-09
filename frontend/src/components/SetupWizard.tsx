"use client";

import { useState, useMemo } from "react";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { GHOST_VAULT_ADDRESS } from "@/lib/contract";
import { uint256 } from "starknet";
import { HonchoMemory } from "@/lib/honcho";

const TOKENS = [
    {
        id: "STRK", name: "Starknet Token", symbol: "STRK",
        address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        color: "text-violet-400", bg: "bg-violet-500/10", activeBorder: "border-violet-400",
    },
    {
        id: "ETH", name: "Ether", symbol: "ETH",
        address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        color: "text-blue-400", bg: "bg-blue-500/10", activeBorder: "border-blue-400",
    },
    {
        id: "xBTC", name: "Endur xBTC", symbol: "xBTC",
        address: "0x02892f4f7308a8a0b0b5e06e5dc88b6adb58fad7736af4e0a5ddb2b43e48aaa7",
        color: "text-amber-400", bg: "bg-amber-500/10", activeBorder: "border-amber-400",
    },
    {
        id: "USDC", name: "USD Coin", symbol: "USDC",
        address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        color: "text-emerald-400", bg: "bg-emerald-500/10", activeBorder: "border-emerald-400",
    },
];

const PERIODS = [
    { days: 14, label: "2 weeks" },
    { days: 30, label: "1 month" },
    { days: 60, label: "2 months" },
    { days: 90, label: "3 months" },
];

const STRATEGIES = [
    { id: "conservative", name: "Conservative", protocol: "Endur.fi (xSTRK)", apy: "~4%", risk: "Low", desc: "Stable yield, lowest risk." },
    { id: "moderate", name: "Moderate", protocol: "Endur + Vesu", apy: "~6-8%", risk: "Medium", desc: "LST looping for higher passive yield." },
];

export default function SetupWizard() {
    const { address } = useAccount();

    // Form state
    const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
    const [depositAmount, setDepositAmount] = useState("");
    const [strategy, setStrategy] = useState(STRATEGIES[0]);
    const [checkinPeriod, setCheckinPeriod] = useState(30);
    const [beneficiary, setBeneficiary] = useState("");

    // Load saved prefs
    useMemo(() => {
        const mem = HonchoMemory.load("wizard_prefs");
        if (mem) {
            if (mem.period) setCheckinPeriod(mem.period);
            if (mem.beneficiary) setBeneficiary(mem.beneficiary);
        }
    }, []);

    const calls = useMemo(() => {
        if (!depositAmount || isNaN(parseFloat(depositAmount)) || !beneficiary) return [];
        const amountWei = BigInt(Math.floor(parseFloat(depositAmount) * 1e18));
        const amountU256 = uint256.bnToUint256(amountWei);
        const periodSeconds = checkinPeriod * 86400;
        const windowDurationSeconds = 7 * 86400;
        return [
            // 1. Approve
            {
                contractAddress: selectedToken.address,
                entrypoint: "approve",
                calldata: [GHOST_VAULT_ADDRESS, amountU256.low, amountU256.high],
            },
            // 2. Create vault
            {
                contractAddress: GHOST_VAULT_ADDRESS,
                entrypoint: "create_vault",
                calldata: [beneficiary, periodSeconds.toString(), windowDurationSeconds.toString()],
            },
            // 3. Deposit
            {
                contractAddress: GHOST_VAULT_ADDRESS,
                entrypoint: "deposit",
                calldata: [amountU256.low, amountU256.high],
            },
        ];
    }, [depositAmount, selectedToken, beneficiary, checkinPeriod]);

    const { send, isPending, data } = useSendTransaction({ calls });

    const isValid = depositAmount && parseFloat(depositAmount) > 0 && beneficiary.startsWith("0x") && beneficiary.length > 10;

    const handleSubmit = () => {
        HonchoMemory.save("wizard_prefs", { period: checkinPeriod, beneficiary });
        send();
    };

    if (!address) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="p-8 text-center rounded-2xl border border-white/[0.08] bg-[#0a0a0a] text-zinc-500 max-w-sm w-full">
                    Please connect your wallet first.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black font-sans text-zinc-100">
            {/* Nav */}
            <nav className="h-16 border-b border-white/[0.06] bg-[#0a0a0a] flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
                <a href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back to Dashboard
                </a>
                <span className="text-sm font-medium text-zinc-300">Ghost Vault</span>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Create Vault</h1>
                    <p className="text-sm text-zinc-500">Fill in all fields below. Your wallet will sign <span className="text-white font-medium">1 multicall</span> to approve, create, and deposit.</p>
                </div>

                <div className="space-y-6">

                    {/* Section 1: Asset & Amount */}
                    <section className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08]">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-4">1 · Asset & Amount</label>

                        <div className="grid grid-cols-4 gap-2 mb-5">
                            {TOKENS.map((token) => (
                                <button
                                    key={token.id}
                                    onClick={() => setSelectedToken(token)}
                                    className={`flex flex-col items-center gap-1.5 py-3.5 rounded-xl border transition-all duration-150 cursor-pointer
                                        ${selectedToken.id === token.id
                                            ? `${token.bg} ${token.activeBorder}`
                                            : "bg-[#111] border-white/[0.07] hover:border-white/[0.14]"
                                        }`}
                                >
                                    <span className={`text-xl font-bold font-mono ${selectedToken.id === token.id ? token.color : "text-zinc-500"}`}>
                                        {token.symbol}
                                    </span>
                                    <span className="text-[11px] text-zinc-600">{token.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                placeholder="0.00"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="w-full bg-[#111] border border-white/[0.08] focus:border-white/30 text-white rounded-xl py-4 pl-5 pr-20 focus:outline-none text-2xl font-mono transition-all"
                            />
                            <span className={`absolute right-5 top-1/2 -translate-y-1/2 font-bold text-sm ${selectedToken.color}`}>
                                {selectedToken.symbol}
                            </span>
                        </div>
                    </section>

                    {/* Section 2: Yield Strategy */}
                    <section className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08]">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-4">2 · Yield Strategy</label>
                        <div className="grid grid-cols-2 gap-3">
                            {STRATEGIES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setStrategy(s)}
                                    className={`text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer
                                        ${strategy.id === s.id
                                            ? "bg-amber-500/10 border-amber-500/40"
                                            : "bg-[#111] border-white/[0.07] hover:border-white/[0.14]"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-white">{s.name}</span>
                                        <span className="text-xs text-emerald-400 font-mono font-bold">{s.apy}</span>
                                    </div>
                                    <p className="text-xs text-zinc-600">{s.desc}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Section 3: Check-in Period */}
                    <section className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08]">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">3 · Check-in Period</label>
                        <p className="text-xs text-zinc-600 mb-4">If you don't check in within this period, inheritance triggers automatically.</p>
                        <div className="grid grid-cols-4 gap-2">
                            {PERIODS.map(({ days, label }) => (
                                <button
                                    key={days}
                                    onClick={() => setCheckinPeriod(days)}
                                    className={`py-3 rounded-xl border text-sm font-mono transition-all duration-150 cursor-pointer
                                        ${checkinPeriod === days
                                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                            : "bg-[#111] border-white/[0.07] text-zinc-500 hover:border-white/[0.14]"
                                        }`}
                                >
                                    <div className="font-bold">{days}d</div>
                                    <div className="text-[10px] mt-0.5 opacity-60">{label}</div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Section 4: Beneficiary */}
                    <section className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08]">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">4 · Beneficiary Address</label>
                        <p className="text-xs text-zinc-600 mb-4">100% of principal + yield goes here if the timer expires.</p>
                        <input
                            type="text"
                            placeholder="0x..."
                            value={beneficiary}
                            onChange={(e) => setBeneficiary(e.target.value)}
                            className="w-full bg-[#111] border border-white/[0.08] focus:border-white/30 text-white rounded-xl py-3.5 px-4 focus:outline-none font-mono text-sm transition-all placeholder:text-zinc-700"
                        />
                        {beneficiary && !beneficiary.startsWith("0x") && (
                            <p className="text-xs text-red-400 mt-2">Must be a valid Starknet address starting with 0x</p>
                        )}
                    </section>

                    {/* Tx Summary */}
                    <section className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/[0.05]">
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-3">Signing 1 Multicall:</p>
                        <div className="flex flex-col gap-1.5">
                            {[
                                { n: "01", text: `Approve ${depositAmount || "?"} ${selectedToken.symbol}`, color: selectedToken.color },
                                { n: "02", text: `Create vault · ${checkinPeriod}d period`, color: "text-zinc-400" },
                                { n: "03", text: `Deposit ${depositAmount || "?"} ${selectedToken.symbol}`, color: selectedToken.color },
                            ].map(({ n, text, color }) => (
                                <div key={n} className="flex items-center gap-3 text-sm">
                                    <span className="text-zinc-700 font-mono text-xs w-5">{n}</span>
                                    <span className={`font-medium ${color}`}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !isValid || !calls.length}
                        className="w-full py-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold text-sm rounded-xl transition-all duration-150"
                    >
                        {isPending ? "Waiting for signature..." : data ? "✓ Vault Created!" : "Confirm & Create Vault"}
                    </button>

                    {!isValid && (depositAmount || beneficiary) && (
                        <p className="text-center text-xs text-zinc-600">
                            {!depositAmount || parseFloat(depositAmount) <= 0 ? "Enter a deposit amount · " : ""}
                            {!beneficiary.startsWith("0x") || beneficiary.length <= 10 ? "Enter a valid beneficiary address" : ""}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
