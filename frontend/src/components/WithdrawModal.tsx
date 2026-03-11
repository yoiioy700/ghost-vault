"use client";

import { useMemo, useState, useEffect } from "react";
import { useSendTransaction, useAccount, useReadContract } from "@starknet-react/core";
import { GHOST_VAULT_ADDRESS } from "@/lib/contract";
import { uint256 } from "starknet";
import { HonchoMemory } from "@/lib/honcho";

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    principal: number;
}

const VAULT_TOKEN = {
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
};

export default function WithdrawModal({ isOpen, onClose, principal }: WithdrawModalProps) {
    const { address } = useAccount();
    const [activeTab, setActiveTab] = useState<"withdraw" | "deposit" | "settings">("withdraw");
    
    // Withdraw State
    const [withdrawAmount, setWithdrawAmount] = useState("");
    
    // Deposit State
    const [depositAmount, setDepositAmount] = useState("");
    
    // Settings State
    const [checkinPeriod, setCheckinPeriod] = useState(30);

    const PERIODS = [
        { days: 14, label: "2 weeks" },
        { days: 30, label: "1 month" },
        { days: 60, label: "2 months" },
        { days: 90, label: "3 months" },
    ];

    // Read STRK Balance for Deposit Tab
    const { data: strkBalanceData } = useReadContract({
        abi: [
            {
                name: "balanceOf",
                type: "function",
                inputs: [{ name: "account", type: "core::starknet::contract_address::ContractAddress" }],
                outputs: [{ type: "core::integer::u256" }],
                state_mutability: "view",
            },
        ] as const,
        address: VAULT_TOKEN.address as `0x${string}`,
        functionName: "balanceOf",
        args: address ? [address as `0x${string}`] : undefined,
        enabled: !!address && isOpen && activeTab === "deposit",
        watch: true,
    });

    let strkBalance = BigInt(0);
    if (strkBalanceData !== undefined) {
        strkBalance = typeof strkBalanceData === 'bigint' 
            ? strkBalanceData 
            : BigInt(strkBalanceData.toString());
    }
    const strkBalanceNum = strkBalanceData !== undefined ? Number(strkBalance) / 1e18 : 0;

    useEffect(() => {
        if (isOpen) {
            const mem = HonchoMemory.load("wizard_prefs");
            if (mem && mem.period) {
                setCheckinPeriod(mem.period);
            }
        }
    }, [isOpen]);

    // Withdraw Tx
    const withdrawCalls = useMemo(() => {
        if (!withdrawAmount || isNaN(parseFloat(withdrawAmount))) return [];
        const amountWei = BigInt(Math.floor(parseFloat(withdrawAmount) * 1e18));
        const amountU256 = uint256.bnToUint256(amountWei);

        return [{
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "withdraw",
            calldata: [amountU256.low, amountU256.high]
        }];
    }, [withdrawAmount]);

    const { send: sendWithdraw, isPending: isWithdrawPending, data: withdrawData } = useSendTransaction({ calls: withdrawCalls });

    const closeVaultCalls = useMemo(() => {
        const amountWei = BigInt(Math.floor(principal * 1e18));
        const amountU256 = uint256.bnToUint256(amountWei);
        return [{
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "withdraw",
            calldata: [amountU256.low, amountU256.high]
        }];
    }, [principal]);

    const { send: sendCloseVault, isPending: isClosingPending, data: closeData } = useSendTransaction({ calls: closeVaultCalls });

    // Deposit Tx
    const depositCalls = useMemo(() => {
        if (!depositAmount || isNaN(parseFloat(depositAmount))) return [];
        const amountWei = BigInt(Math.floor(parseFloat(depositAmount) * 1e18));
        const amountU256 = uint256.bnToUint256(amountWei);

        return [
            {
                contractAddress: VAULT_TOKEN.address,
                entrypoint: "approve",
                calldata: [GHOST_VAULT_ADDRESS, amountU256.low.toString(), amountU256.high.toString()],
            },
            {
                contractAddress: GHOST_VAULT_ADDRESS,
                entrypoint: "deposit",
                calldata: [amountU256.low.toString(), amountU256.high.toString()]
            }
        ];
    }, [depositAmount]);

    const { send: sendDeposit, isPending: isDepositPending, data: depositData } = useSendTransaction({ calls: depositCalls });

    useEffect(() => {
        if (withdrawData || closeData || depositData) {
            const timer = setTimeout(() => {
                onClose();
                setWithdrawAmount("");
                setDepositAmount("");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [withdrawData, closeData, depositData, onClose]);

    const handleSaveSettings = () => {
        const mem = HonchoMemory.load("wizard_prefs") || {};
        HonchoMemory.save("wizard_prefs", { ...mem, period: checkinPeriod });
        // Trigger a fake re-render hack by reloading dashboard (or user manually refreshes)
        // Since we don't have global state for the mockup, simply reload to show the "saved" mockup value
        window.location.reload(); 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[#0a0a0a] border border-white/[0.08] w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="p-8 pb-6 border-b border-white/[0.05]">
                    <h2 className="text-2xl font-bold mb-2 text-white">Manage Vault</h2>
                    <p className="text-zinc-500 text-sm">Add funds, withdraw principal, or adjust settings.</p>
                </div>

                {/* Tabs */}
                <div className="flex px-8 pt-4 border-b border-white/[0.05] gap-6">
                    <button 
                        onClick={() => setActiveTab("deposit")}
                        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "deposit" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Deposit
                        {activeTab === "deposit" && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-violet-500"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab("withdraw")}
                        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "withdraw" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Withdraw
                        {activeTab === "withdraw" && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-violet-500"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab("settings")}
                        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "settings" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Settings
                        {activeTab === "settings" && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-violet-500"></span>}
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {/* DEPOSIT TAB */}
                    {activeTab === "deposit" && (
                        <div className="space-y-6 flex flex-col h-full">
                            <div className="bg-[#111] rounded-xl p-4 border border-white/[0.05]">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-zinc-500">Wallet Balance</span>
                                    <span className="text-white font-mono">{strkBalanceNum.toFixed(4)} STRK</span>
                                </div>
                            </div>

                            <div className="space-y-2 relative">
                                <input
                                    type="number"
                                    placeholder="Amount to deposit"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="bg-[#111] border border-white/[0.08] focus:border-white/30 w-full px-4 py-4 rounded-xl text-white font-mono focus:outline-none transition-all pr-16"
                                />
                                <span className="absolute right-4 top-4 text-violet-400 font-bold text-sm">STRK</span>
                                
                                {strkBalanceNum > 0 && (
                                    <button 
                                        className="text-xs text-violet-400 hover:text-violet-300 ml-1"
                                        onClick={() => setDepositAmount(Math.max(0, strkBalanceNum - 0.005).toFixed(4))}
                                    >
                                        Max
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => sendDeposit()}
                                disabled={isDepositPending || !depositAmount || parseFloat(depositAmount) <= 0 || parseFloat(depositAmount) > strkBalanceNum}
                                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-4 rounded-xl disabled:opacity-50 transition-colors mt-auto"
                            >
                                {isDepositPending ? "Confirming in Wallet..." : depositData ? "Success!" : "Deposit STRK"}
                            </button>
                        </div>
                    )}

                    {/* WITHDRAW TAB */}
                    {activeTab === "withdraw" && (
                        <div className="space-y-6 flex flex-col h-full">
                            <div className="bg-[#111] rounded-xl p-4 border border-white/[0.05]">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Vault Principal</span>
                                    <span className="text-white font-mono font-bold">{principal} STRK</span>
                                </div>
                            </div>

                            <div className="flex gap-2 relative">
                                <input
                                    type="number"
                                    placeholder="Amount to withdraw"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="bg-[#111] border border-white/[0.08] focus:border-white/30 w-full px-4 py-4 rounded-xl text-white font-mono focus:outline-none transition-all"
                                />
                                <button
                                    onClick={() => sendWithdraw()}
                                    disabled={isWithdrawPending || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > principal}
                                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-4 rounded-xl disabled:opacity-50 transition-colors shrink-0"
                                >
                                    {isWithdrawPending ? "..." : withdrawData ? "✓" : "Withdraw"}
                                </button>
                            </div>

                            <div className="pt-4 border-t border-white/[0.05] mt-auto">
                                <button
                                    onClick={() => sendCloseVault()}
                                    disabled={isClosingPending || principal <= 0}
                                    className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/30 transition-all flex justify-between items-center px-6 disabled:opacity-50"
                                >
                                    <span>{isClosingPending ? "Confirming..." : closeData ? "Vault Closed" : "Close Vault (Withdraw All)"}</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === "settings" && (
                        <div className="space-y-6 flex flex-col h-full">
                            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500/80 text-xs">
                                Changing the default check-in period requires signature override (Mockup UI).
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-3">Check-in Period</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PERIODS.map(({ days, label }) => (
                                        <button
                                            key={days}
                                            onClick={() => setCheckinPeriod(days)}
                                            className={`py-3 rounded-xl border text-sm font-mono transition-all duration-150 cursor-pointer
                                                ${checkinPeriod === days
                                                    ? "bg-violet-500/10 border-violet-500/40 text-violet-400"
                                                    : "bg-[#111] border-white/[0.07] text-zinc-500 hover:border-white/[0.14]"
                                                }`}
                                        >
                                            <div className="font-bold">{days}d</div>
                                            <div className="text-[10px] mt-0.5 opacity-60 font-sans">{label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                className="w-full bg-white hover:bg-zinc-200 text-black font-bold px-6 py-4 rounded-xl transition-colors mt-auto"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
