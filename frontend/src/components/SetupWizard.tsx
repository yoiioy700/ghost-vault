"use client";

import { useState, useMemo } from "react";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { GHOST_VAULT_ADDRESS } from "@/lib/contract";
import { uint256 } from "starknet";
import { HonchoMemory } from "@/lib/honcho";

const TIERS = [
    { id: "conservative", name: "Conservative", protocol: "Endur.fi (xSTRK)", apy: "~4%", risk: "Low", description: "Default safe strategy. Stable STRK-denominated yield via Endur.fi." },
    { id: "moderate", name: "Moderate", protocol: "Endur + Vesu", apy: "~6-8%", risk: "Medium", description: "LST looping strategy for higher passive yield." },
];

const PERIODS = [14, 30, 60, 90];

const TOKENS = [
    {
        id: "STRK",
        name: "Starknet Token",
        symbol: "STRK",
        address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/30",
        selectedBorder: "border-violet-400",
    },
    {
        id: "ETH",
        name: "Ether",
        symbol: "ETH",
        address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        selectedBorder: "border-blue-400",
    },
    {
        id: "USDC",
        name: "USD Coin",
        symbol: "USDC",
        address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        selectedBorder: "border-emerald-400",
    },
];

export default function SetupWizard() {
    const { address } = useAccount();
    const [step, setStep] = useState(1);
    const [depositAmount, setDepositAmount] = useState("");
    const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
    const [selectedTier, setSelectedTier] = useState(TIERS[0]);
    const [checkinPeriod, setCheckinPeriod] = useState(30);
    const [beneficiary, setBeneficiary] = useState("");

    // Load Honcho Memory
    useMemo(() => {
        const memory = HonchoMemory.load("wizard_prefs");
        if (memory) {
            if (memory.tier) setSelectedTier(TIERS.find(t => t.id === memory.tier) || TIERS[0]);
            if (memory.period) setCheckinPeriod(memory.period);
            if (memory.beneficiary) setBeneficiary(memory.beneficiary);
        }
    }, []);

    const handleNext = () => {
        setStep((s) => Math.min(s + 1, 4));
        if (step === 3) {
            HonchoMemory.save("wizard_prefs", {
                tier: selectedTier.id,
                period: checkinPeriod,
                beneficiary: beneficiary,
            });
        }
    };
    const handleBack = () => setStep((s) => Math.max(s - 1, 1));

    const calls = useMemo(() => {
        if (!depositAmount || isNaN(parseFloat(depositAmount))) return [];
        const amountWei = BigInt(Math.floor(parseFloat(depositAmount) * 1e18));
        const amountU256 = uint256.bnToUint256(amountWei);
        const periodSeconds = checkinPeriod * 86400;
        const windowDurationSeconds = 7 * 86400;

        return [
            {
                contractAddress: GHOST_VAULT_ADDRESS,
                entrypoint: "create_vault",
                calldata: [beneficiary, periodSeconds.toString(), windowDurationSeconds.toString()]
            },
            {
                contractAddress: selectedToken.address,
                entrypoint: "approve",
                calldata: [GHOST_VAULT_ADDRESS, amountU256.low, amountU256.high]
            },
            {
                contractAddress: GHOST_VAULT_ADDRESS,
                entrypoint: "deposit",
                calldata: [amountU256.low, amountU256.high]
            }
        ];
    }, [depositAmount, beneficiary, checkinPeriod, selectedToken]);

    const { send, isPending, data } = useSendTransaction({ calls });

    if (!address) {
        return (
            <div className="bg-[var(--bg-surface)] p-8 text-center rounded-[var(--radius-lg)] border border-[var(--border-subtle)] w-full max-w-lg mx-auto text-[var(--text-secondary)]">
                Please connect your wallet to create a Ghost Vault.
            </div>
        );
    }

    const renderStep1 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-display font-semibold mb-2 text-[var(--text-primary)] tracking-tight">Step 1: Choose Asset & Amount</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Select the token you want to secure in the vault.</p>

            {/* Token picker */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {TOKENS.map((token) => (
                    <button
                        key={token.id}
                        onClick={() => setSelectedToken(token)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-150 cursor-pointer
                            ${selectedToken.id === token.id
                                ? `${token.bg} ${token.selectedBorder} border`
                                : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-white/20"
                            }`}
                    >
                        <span className={`text-2xl font-bold font-mono ${selectedToken.id === token.id ? token.color : "text-zinc-500"}`}>
                            {token.symbol}
                        </span>
                        <span className="text-xs text-zinc-600">{token.name}</span>
                    </button>
                ))}
            </div>

            {/* Amount input */}
            <div className="relative">
                <input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-[var(--text-primary)] rounded-[var(--radius-md)] py-4 px-6 focus:ring-4 focus:ring-[var(--accent-primary-muted)] focus:outline-none transition-all text-3xl font-mono shadow-inner"
                />
                <span className={`absolute right-6 top-5 font-bold text-xl ${selectedToken.color}`}>{selectedToken.symbol}</span>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-display font-semibold mb-2 text-[var(--text-primary)] tracking-tight">Step 2: Choose Yield Strategy</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-8">Your BTC will earn passive yield while securely locked.</p>
            <div className="space-y-4">
                {TIERS.map((tier) => (
                    <div
                        key={tier.id}
                        onClick={() => setSelectedTier(tier)}
                        className={`cursor-pointer border p-5 rounded-[var(--radius-md)] transition-all ${selectedTier.id === tier.id ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-muted)]' : 'border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-[var(--border-hover)]'}`}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-semibold text-[var(--text-primary)]">{tier.name}</span>
                            <span className="text-[var(--success)] font-mono font-bold bg-[var(--success)]/10 px-3 py-1 rounded-[var(--radius-pill)] text-xs border border-[var(--success)]/20">{tier.apy} APY</span>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] flex justify-between items-end">
                            <span>Via {tier.protocol}</span>
                            <span className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-wider">Risk: {tier.risk}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-display font-semibold mb-2 text-[var(--text-primary)] tracking-tight">Step 3: Dead Man's Switch</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-8">If you don't check-in within this period, inheritance triggers.</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
                {PERIODS.map((p) => (
                    <button
                        key={p}
                        onClick={() => setCheckinPeriod(p)}
                        className={`py-3 rounded-[var(--radius-md)] border font-mono text-sm font-medium transition-all ${checkinPeriod === p ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]' : 'border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'}`}
                    >
                        {p} Days
                    </button>
                ))}
            </div>

            <div className="mt-8">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Beneficiary Starknet Address</label>
                <input
                    type="text"
                    placeholder="0x..."
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-[var(--radius-sm)] py-3 px-4 focus:ring-4 focus:ring-[var(--accent-primary-muted)] focus:border-[var(--accent-primary)] focus:outline-none font-mono text-sm transition-all"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-3">100% of principal + yield goes here if timer expires.</p>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-display font-semibold mb-6 text-[var(--text-primary)] tracking-tight">Review & Confirm</h2>

            <div className="bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-6 space-y-5 font-mono text-sm">
                <div className="flex justify-between border-b border-[var(--border-subtle)] pb-4">
                    <span className="text-[var(--text-secondary)]">Total Deposit</span>
                    <span className="text-[var(--text-primary)] font-bold text-base">{depositAmount || "0"} BTC</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-subtle)] pb-4">
                    <span className="text-[var(--text-secondary)]">Strategy</span>
                    <span className="text-[var(--text-primary)]">{selectedTier.name} <span className="text-[var(--success)]">({selectedTier.apy})</span></span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-subtle)] pb-4">
                    <span className="text-[var(--text-secondary)]">Check-in Period</span>
                    <span className="text-[var(--accent-primary)] font-bold">{checkinPeriod} Days</span>
                </div>
                <div className="pt-2">
                    <span className="text-[var(--text-secondary)] block mb-2">Beneficiary Address</span>
                    <span className="text-[var(--text-primary)] break-all text-xs opacity-80">{beneficiary || "Not set"}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-xl mx-auto bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden shadow-2xl relative">
            {/* Minimal Progress Bar */}
            <div className="h-1 w-full bg-[#0a0a0a] absolute top-0 left-0">
                <div
                    className="h-full bg-[var(--accent-primary)] transition-all duration-500 ease-out"
                    style={{ width: `${(step / 4) * 100}%` }}
                />
            </div>

            <div className="p-8 md:p-10 pt-12">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                <div className="mt-10 flex justify-between items-center pt-6 border-t border-[var(--border-subtle)]">
                    <button
                        onClick={handleBack}
                        className={`px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium ${step === 1 ? 'invisible' : ''}`}
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="btn-primary"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={() => send()}
                            disabled={isPending || !calls.length}
                            className="btn-primary disabled:opacity-50"
                        >
                            {isPending ? "Confirming..." : data ? "Tx Sent!" : "Confirm Setup"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
