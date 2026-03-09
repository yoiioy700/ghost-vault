"use client";

import { useState, useMemo } from "react";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { GHOST_VAULT_ADDRESS } from "@/lib/contract";
import { uint256 } from "starknet";
import { HonchoMemory } from "@/lib/honcho";

const TIERS = [
    { id: "conservative", name: "Conservative", protocol: "Endur.fi (xBTC)", apy: "~4%", risk: "Low", description: "Default safe strategy. Stable BTC-denominated yield." },
    { id: "moderate", name: "Moderate", protocol: "Endur + Vesu", apy: "~6-8%", risk: "Medium", description: "LST looping strategy for higher passive yield." },
];

const PERIODS = [14, 30, 60, 90];

export default function SetupWizard() {
    const { address } = useAccount();
    const [step, setStep] = useState(1);
    const [depositAmount, setDepositAmount] = useState("");
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
            // Save preferences to Honcho when reaching review step
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
        // Mocking scale using 10^18 for the u256 value
        const amountWei = BigInt(Math.floor(parseFloat(depositAmount) * 1e18));
        const amountU256 = uint256.bnToUint256(amountWei);
        return [{
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "deposit",
            calldata: [amountU256.low, amountU256.high]
        }];
    }, [depositAmount]);

    const { send, isPending, data } = useSendTransaction({ calls });

    if (!address) {
        return (
            <div className="glass-panel p-8 text-center rounded-2xl w-full max-w-lg mx-auto mt-20 text-gray-400">
                Please connect your wallet to create a Ghost Vault.
            </div>
        );
    }

    const renderStep1 = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-4 text-brand-100">Step 1: Deposit Bitcoin</h2>
            <p className="text-gray-400 text-sm mb-6">How much BTC do you want to secure in the vault?</p>
            <div className="relative">
                <input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-4 px-6 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all text-2xl font-mono"
                />
                <span className="absolute right-6 top-4 text-gray-500 font-bold text-xl">BTC</span>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-4 text-brand-100">Step 2: Choose Yield Strategy</h2>
            <p className="text-gray-400 text-sm mb-6">Your BTC will earn passive yield while securely locked.</p>
            <div className="space-y-4">
                {TIERS.map((tier) => (
                    <div
                        key={tier.id}
                        onClick={() => setSelectedTier(tier)}
                        className={`cursor-pointer border p-5 rounded-xl transition-all ${selectedTier.id === tier.id ? 'border-brand-500 bg-brand-900/30' : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'}`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-bold text-white">{tier.name}</span>
                            <span className="text-green-400 font-mono font-bold bg-green-900/30 px-3 py-1 rounded-full text-sm">{tier.apy} APY</span>
                        </div>
                        <div className="text-sm text-gray-400 flex justify-between">
                            <span>Via {tier.protocol}</span>
                            <span className="text-gray-500 text-xs uppercase tracking-wider">Risk: {tier.risk}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-4 text-brand-100">Step 3: Dead Man's Switch</h2>
            <p className="text-gray-400 text-sm mb-6">If you don't "check-in" within this period, the inheritance triggers.</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {PERIODS.map((p) => (
                    <button
                        key={p}
                        onClick={() => setCheckinPeriod(p)}
                        className={`py-3 rounded-lg border font-mono transition-all ${checkinPeriod === p ? 'border-accent bg-accent/20 text-accent' : 'border-slate-700 text-gray-400 hover:border-slate-500'}`}
                    >
                        {p} Days
                    </button>
                ))}
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Beneficiary Starknet Address</label>
                <input
                    type="text"
                    placeholder="0x..."
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-accent focus:outline-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">100% of principal + yield goes here if the timer expires.</p>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-4 text-brand-100">Review & Confirm</h2>

            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-gray-400">Total Deposit</span>
                    <span className="text-white font-bold">{depositAmount || "0"} BTC</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-gray-400">Strategy</span>
                    <span className="text-brand-100">{selectedTier.name} ({selectedTier.apy})</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-gray-400">Check-in Period</span>
                    <span className="text-accent">{checkinPeriod} Days</span>
                </div>
                <div>
                    <span className="text-gray-400 block mb-1">Beneficiary Address</span>
                    <span className="text-gray-300 break-all text-xs">{beneficiary || "Not set"}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-xl mx-auto mt-16 glass-panel rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-800 w-full absolute top-0 left-0">
                <div
                    className="h-full bg-gradient-to-r from-brand-500 to-accent transition-all duration-500 ease-out"
                    style={{ width: `${(step / 4) * 100}%` }}
                />
            </div>

            <div className="p-8 md:p-10 pt-12">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-800">
                    <button
                        onClick={handleBack}
                        className={`px-4 py-2 text-gray-400 hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
                    >
                        &larr; Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
                        >
                            Continue &rarr;
                        </button>
                    ) : (
                        <button
                            onClick={() => send()}
                            disabled={isPending || !calls.length}
                            className="px-8 py-3 bg-gradient-to-r from-brand-500 to-accent hover:from-brand-400 hover:to-yellow-400 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
                        >
                            {isPending ? "Confirming in Wallet..." : data ? "Tx Sent!" : "Confirm Setup"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
