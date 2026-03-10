"use client";

import { useState, useMemo } from "react";
import { useAccount, useSendTransaction, useReadContract, useContract, useConnect, useBalance } from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";
import { GHOST_VAULT_ADDRESS, GHOST_VAULT_ABI } from "@/lib/contract";
import { uint256 } from "starknet";
import { HonchoMemory } from "@/lib/honcho";

// The deployed contract is single-token: hardcoded to STRK at deploy time.
// Other tokens will be supported when new contract versions are deployed.
const VAULT_TOKEN = {
    id: "STRK", name: "Starknet Token", symbol: "STRK",
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    color: "text-violet-400", bg: "bg-violet-500/10", activeBorder: "border-violet-400",
};

const COMING_SOON_TOKENS = ["ETH", "xBTC", "USDC"];

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

    const [depositAmount, setDepositAmount] = useState("");
    const [strategy, setStrategy] = useState(STRATEGIES[0]);
    const [checkinPeriod, setCheckinPeriod] = useState(30);
    const [beneficiary, setBeneficiary] = useState("");

    const { connect, connectors } = useConnect();
    const { starknetkitConnectModal } = useStarknetkitConnectModal({
        connectors: connectors as any,
        modalMode: "alwaysAsk",
    });

    const { contract: vaultContract } = useContract({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        abi: GHOST_VAULT_ABI as any,
        address: GHOST_VAULT_ADDRESS as `0x${string}`
    });

    useMemo(() => {
        if (!HonchoMemory) return;
        const mem = HonchoMemory.load("wizard_prefs");
        if (mem) {
            if (mem.period) setCheckinPeriod(mem.period);
            if (mem.beneficiary) setBeneficiary(mem.beneficiary);
        }
    }, []);

    const { data: vaultData } = useReadContract({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        abi: GHOST_VAULT_ABI as any,
        address: GHOST_VAULT_ADDRESS as `0x${string}`,
        functionName: "get_vault",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: address ? [address as `0x${string}`] : ([] as any),
        enabled: !!address,
    });

    const vaultAlreadyExists = vaultData ? Number((vaultData as any[])[2]) > 0 : false;

    const { data: strkBalanceData, isLoading: balanceLoading } = useReadContract({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        abi: [
            {
                name: "balance_of",
                type: "function",
                inputs: [{ name: "account", type: "core::starknet::contract_address::ContractAddress" }],
                outputs: [{ type: "core::integer::u256" }],
                state_mutability: "view",
            },
        ] as const,
        address: VAULT_TOKEN.address as `0x${string}`,
        functionName: "balance_of",
        args: address ? [address as `0x${string}`] : undefined,
        enabled: !!address,
        watch: true,
    });

    let strkBalance = BigInt(0);
    if (strkBalanceData !== undefined) {
        const dataAny = strkBalanceData as any;
        if (typeof dataAny === 'bigint') {
            strkBalance = dataAny;
        } else if (typeof dataAny === 'object' && dataAny !== null) {
            strkBalance = BigInt(dataAny.balance?.low ?? dataAny.low ?? dataAny.toString());
        } else {
            strkBalance = BigInt(dataAny.toString());
        }
    }

    const strkBalanceNum = strkBalanceData !== undefined ? Number(strkBalance) / 1e18 : null;
    const depositNum = Number(depositAmount) || 0;
    const isInsufficientBalance = strkBalanceNum !== null && depositNum > strkBalanceNum;
    const isTightBalance = strkBalanceNum !== null && !isInsufficientBalance && depositNum > 0 && (strkBalanceNum - depositNum) < 0.01;

    const amountWei = depositAmount && !isNaN(parseFloat(depositAmount))
        ? BigInt(Math.floor(parseFloat(depositAmount) * 1e18))
        : BigInt(0);

    const calls = useMemo(() => {
        if (!depositAmount || isNaN(parseFloat(depositAmount)) || !beneficiary || !vaultContract) return [];

        const amountU256 = uint256.bnToUint256(amountWei);
        const periodSeconds = checkinPeriod * 86400;
        const windowDurationSeconds = 7 * 86400;

        // ERC20 Approve (Cairo 0/1 typical structure: spender, low, high)
        const approveTx = {
            contractAddress: VAULT_TOKEN.address,
            entrypoint: "approve",
            calldata: [GHOST_VAULT_ADDRESS, amountU256.low.toString(), amountU256.high.toString()],
        };

        const createVaultTx = {
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "create_vault",
            calldata: [
                beneficiary,
                periodSeconds.toString(),
                windowDurationSeconds.toString()
            ]
        };

        const depositTx = {
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "deposit",
            calldata: [
                amountU256.low.toString(),
                amountU256.high.toString()
            ]
        };

        if (vaultAlreadyExists) {
            return [approveTx, depositTx];
        }
        return [approveTx, createVaultTx, depositTx];
    }, [depositAmount, beneficiary, checkinPeriod, vaultAlreadyExists, vaultContract, amountWei]);

    const { send, isPending, data, error } = useSendTransaction({ calls });

    const hasEnoughBalance = amountWei <= strkBalance;
    const isValid = depositAmount && parseFloat(depositAmount) > 0 && beneficiary.startsWith("0x") && beneficiary.length > 10 && hasEnoughBalance && !isInsufficientBalance;

    const handleSubmit = () => {
        HonchoMemory.save("wizard_prefs", { period: checkinPeriod, beneficiary });
        send();
    };

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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
                <div className="p-8 text-center rounded-2xl border border-white/[0.08] bg-[#0a0a0a] max-w-sm w-full">
                    <div className="w-14 h-14 rounded-full bg-[#111] mx-auto mb-6 flex items-center justify-center border border-white/[0.06]">
                        <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Connect your wallet</h2>
                    <p className="text-sm text-zinc-500 mb-8">Please connect your starknet wallet to setup your vault.</p>
                    <button
                        onClick={handleConnect}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold text-sm rounded-xl transition-all duration-150 cursor-pointer"
                    >
                        Connect Wallet
                    </button>
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
                <span className="text-sm font-medium text-zinc-300">Ghost Vault {strkBalance > BigInt(0) ? `(Bal: ${(Number(strkBalance) / 1e18).toFixed(2)} STRK)` : ""}</span>
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

                        {/* Token chips */}
                        <div className="flex items-center gap-2 mb-5 flex-wrap">
                            {/* Active: STRK */}
                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-400 cursor-default">
                                <span className="text-sm font-bold font-mono text-violet-400">STRK</span>
                                <span className="text-[10px] text-violet-500/70">Active</span>
                            </div>
                            {/* Coming soon */}
                            {COMING_SOON_TOKENS.map((sym) => (
                                <div key={sym} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111] border border-white/[0.05] cursor-not-allowed opacity-50">
                                    <span className="text-sm font-bold font-mono text-zinc-600">{sym}</span>
                                    <span className="text-[9px] text-zinc-700 uppercase tracking-wider">Soon</span>
                                </div>
                            ))}
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                placeholder="0.00"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className={`w-full bg-[#111] border focus:border-white/30 text-white rounded-xl py-4 pl-5 pr-20 focus:outline-none text-2xl font-mono transition-all ${isInsufficientBalance ? 'border-red-500/50' : 'border-white/[0.08]'}`}
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-sm text-violet-400">
                                STRK
                            </span>
                        </div>

                        {/* Balance display */}
                        <div className="flex items-center justify-between mt-3 text-xs">
                            {balanceLoading ? (
                                <span className="text-zinc-500">Loading balance...</span>
                            ) : strkBalanceNum !== null ? (
                                <span className="text-zinc-400">
                                    Wallet balance: <span className="text-white font-mono">{strkBalanceNum.toFixed(4)}</span> STRK
                                </span>
                            ) : (
                                <span className="text-zinc-500">Could not read balance</span>
                            )}
                            {strkBalanceNum !== null && strkBalanceNum > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const maxDeposit = Math.max(0, strkBalanceNum - 0.005);
                                        setDepositAmount(maxDeposit.toFixed(4));
                                    }}
                                    className="text-violet-400 hover:text-violet-300 font-medium transition-colors cursor-pointer"
                                >
                                    Max
                                </button>
                            )}
                        </div>

                        {/* Insufficient balance warning */}
                        {isInsufficientBalance && (
                            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                <p className="text-red-400 text-xs">
                                    Insufficient STRK balance. You have {strkBalanceNum?.toFixed(4)} but trying to deposit {depositNum.toFixed(4)}
                                </p>
                            </div>
                        )}

                        {/* Tight balance warning */}
                        {isTightBalance && (
                            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                <p className="text-amber-400 text-xs">
                                    Balance is tight — you might not have enough left for gas fees (~0.005 STRK)
                                </p>
                            </div>
                        )}
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
                        <p className="text-xs text-zinc-600 mb-4">If you don&apos;t check in within this period, inheritance triggers automatically.</p>
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
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                Signing 1 Multicall · {vaultAlreadyExists ? "2" : "3"} ops
                            </p>
                            {vaultAlreadyExists && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Vault exists — skip create</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-zinc-700 font-mono text-xs w-5">01</span>
                                <span className="font-medium text-violet-400">Approve {depositAmount || "?"} STRK</span>
                            </div>
                            {!vaultAlreadyExists && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-zinc-700 font-mono text-xs w-5">02</span>
                                    <span className="font-medium text-zinc-400">Create vault · {checkinPeriod}d period</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-zinc-700 font-mono text-xs w-5">{vaultAlreadyExists ? "02" : "03"}</span>
                                <span className="font-medium text-violet-400">Deposit {depositAmount || "?"} STRK</span>
                            </div>
                        </div>
                    </section>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !isValid || !calls.length || isInsufficientBalance || depositNum <= 0}
                        className={`w-full py-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold text-sm rounded-xl transition-all duration-150 ${isInsufficientBalance ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isPending ? "Waiting for signature..." : data ? "\u2713 Vault Created!" : "Confirm & Create Vault"}
                    </button>

                    {error && (
                        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono break-all">
                            <strong>Transaction Error:</strong> {error.message || "Unknown error occurred"}
                        </div>
                    )}

                    {!isValid && (depositAmount || beneficiary) && (
                        <p className="text-center text-xs text-red-400 font-mono">
                            {!depositAmount || parseFloat(depositAmount) <= 0 ? "Enter a deposit amount \u00b7 " : ""}
                            {!beneficiary.startsWith("0x") || beneficiary.length <= 10 ? "Enter a valid beneficiary address \u00b7 " : ""}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
