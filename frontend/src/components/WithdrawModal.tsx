"use client";

import { useMemo, useState } from "react";
import { useSendTransaction } from "@starknet-react/core";
import { GHOST_VAULT_ADDRESS } from "@/lib/contract";
import { uint256 } from "starknet";

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    principal: number;
}

export default function WithdrawModal({ isOpen, onClose, principal }: WithdrawModalProps) {
    const [amount, setAmount] = useState("");

    const calls = useMemo(() => {
        if (!amount || isNaN(parseFloat(amount))) return [];
        const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
        const amountU256 = uint256.bnToUint256(amountWei);

        return [{
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "withdraw",
            calldata: [amountU256.low, amountU256.high]
        }];
    }, [amount]);

    const { send, isPending, data } = useSendTransaction({ calls });

    // For "Close Vault" we set amount to full principal then send in a separate click
    const [closingVault, setClosingVault] = useState(false);

    const closeVaultCalls = useMemo(() => {
        const amountWei = BigInt(Math.floor(principal * 1e18));
        const amountU256 = uint256.bnToUint256(amountWei);
        return [{
            contractAddress: GHOST_VAULT_ADDRESS,
            entrypoint: "withdraw",
            calldata: [amountU256.low, amountU256.high]
        }];
    }, [principal]);

    const { send: sendCloseVault, isPending: isClosingPending } = useSendTransaction({ calls: closeVaultCalls });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-white/[0.08] w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <h2 className="text-2xl font-bold mb-2 text-white">Manage Vault Assets</h2>
                <p className="text-zinc-500 text-sm mb-6">Withdraw your principal or terminate the Dead Man's Switch entirely.</p>

                <div className="bg-[#111] rounded-xl p-4 mb-6 border border-white/[0.05]">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500">Available Principal</span>
                        <span className="text-white font-mono font-bold">{principal} STRK</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Amount to withdraw"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-[#111] border border-white/[0.08] focus:border-white/30 w-full px-4 py-3 rounded-xl text-white font-mono focus:outline-none transition-all"
                        />
                        <button
                            onClick={() => send()}
                            disabled={isPending || !amount}
                            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition-colors"
                        >
                            {isPending ? "..." : "Withdraw"}
                        </button>
                    </div>

                    <button
                        onClick={() => sendCloseVault()}
                        disabled={isClosingPending}
                        className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/30 transition-all flex justify-between items-center px-6"
                    >
                        <span>{isClosingPending ? "Confirming in Wallet..." : "Close Vault (Withdraw All)"}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
