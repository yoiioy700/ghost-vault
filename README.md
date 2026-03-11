# Ghost Vault 👻 

**Re{define} Hackathon Submission - Privacy Track**

Ghost Vault is a **decentralized inheritance protocol and Dead Man's Switch** built natively on Starknet. It ensures that your crypto assets (like STRK or bridged BTC) are secure while you live, and trustlessly transfer to your designated beneficiaries if the worst happens.

## The Problem
Self-custody is the ultimate financial freedom, but it carries a fatal flaw: if you die or lose access to your keys, your wealth is lost forever. Traditional inheritance processes are slow, public, require trusting centralized intermediaries (lawyers, banks), and completely contradict the ethos of web3.

## The Solution: Ghost Vault
Ghost Vault leverages Starknet's scalable infrastructure to provide a **trustless, automated** inheritance protocol for your assets. Users can deploy their own personal vault directly from the Dapp. 

### How it works:
1. **Secure**: You deposit your assets (e.g. STRK) into your Ghost Vault on the Starknet protocol. While locked, your assets remain non-custodial.
2. **The Heartbeat (Dead Man's Switch)**: You set a periodic "check-in" interval (e.g., every 30 days). As long as you interact with the vault ("ping" it) before the timer runs out, you prove you are alive, and the vault remains locked and yielding.
3. **Trustless Execution**: If you fail to check in and the countdown hits zero, the Dead Man's Switch is triggered. Anyone can call the `trigger_inheritance` function, which automatically and instantly transfers 100% of your principal and accumulated yield to your predefined beneficiary address.

## Hackathon Narrative Alignment (Privacy Track)
* **Privacy Innovation**: Inheritance is a neglected area in DeFi. By building on Starknet, Ghost Vault utilizes cheap computation and scalable state to handle constant "ping" transactions (check-ins) without pricing out users. This creates a highly accessible web3 will-and-testament primitive.
* **Non-Custodial Focus**: It solves the biggest UX hurdle of self-custody: generational wealth transfer without relying on centralized layers.

## Features
- **Non-custodial**: You are the only one who can deposit and withdraw (while alive).
- **Fully On-Chain**: No centralized servers or oracles are managing the Dead Man's Switch. The Starknet blockchain is the single source of truth for time and execution.
- **Dynamic UI**: A beautiful, responsive frontend that visually communicates the urgency of the check-in period.

## Deployed Addresses (Starknet Sepolia Testnet)
* **Ghost Vault Protocol Contract**: `0x0315fb4e47f77a02df237a55538e35cfdafb2b32920e9b942fbcd3791f18e0c4`

## Local Development
```bash
git clone https://github.com/yoiioy700/ghost-vault.git
cd ghost-vault/frontend
yarn install
yarn dev
```
