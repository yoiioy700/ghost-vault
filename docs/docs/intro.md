---
sidebar_position: 1
---

# Introduction to Ghost Vault

**Ghost Vault** is a decentralized inheritance protocol built on **Starknet** using **Cairo 1.0**. It acts as a non-custodial Dead Man's Switch for your crypto assets, allowing you to ensure your holdings are securely passed on to your designated beneficiary if something unexpected happens to you.

## The Problem
Holding self-custodial assets is great for financial sovereignty, but it introduces a major risk: what happens to your crypto if you lose access to your wallet, pass away, or are permanently incapacitated? Without a secure backup plan, those assets can be lost forever.

## The Ghost Vault Solution
Ghost Vault solves this by allowing you to deposit your tokens (like STRK) into a fully decentralized smart contract vault. You designate a **Beneficiary Address**. 

To prove you are still active, you simply "ping" your vault periodically. If a predefined **Cooldown Period** passes without a ping from you, the smart contract automatically considers the vault "inactive." Once inactive, your designated beneficiary is the *only* one allowed to claim the assets.

### Key Features
- **100% Non-Custodial**: We never have access to your private keys or your funds. Everything is managed transparently via Starknet smart contracts.
- **Gas-Efficient**: Built on Starknet, taking advantage of low-cost L2 transactions.
- **Customizable**: You get to set the cooldown timeframe that best fits your needs. 
- **Simple UI**: A clean, glassmorphism-inspired dashboard that makes managing your vaults and pings effortless.

## How It Works (High Level)
1. **Connect & Setup**: Connect your Starknet wallet (e.g., Argent X or Braavos) and specify a beneficiary and a time-lock (cooldown) period.
2. **Deposit Funds**: Transfer STRK (or other supported tokens) into your newly deployed Ghost Vault.
3. **Stay Alive (Ping)**: Log in and click "Ping" before the timer runs out to reset the countdown.
4. **Inheritance Claim**: If the timer hits zero, your beneficiary can call the `claim` function to withdraw the funds.

Read on to learn more about the [System Architecture](./architecture.md) and our [Smart Contracts](./smart-contracts.md).
