# Ghost Vault 👻 

**Re{define} Hackathon Submission - Privacy & Bitcoin Tracks**

Ghost Vault is a **decentralized, ZK-powered inheritance protocol and Dead Man's Switch** built natively on Starknet. It ensures that your Bitcoin earns yield while you live, and trustlessly transfers to your designated beneficiaries if the worst happens.

## The Problem
Self-custody is the ultimate financial freedom, but it carries a fatal flaw: if you die or lose access to your keys, your wealth is lost forever. Traditional inheritance processes are slow, public, require trusting centralized intermediaries (lawyers, banks), and completely contradict the ethos of web3.

## The Solution: Ghost Vault
Ghost Vault leverages Starknet's zero-knowledge infrastructure to provide a **trustless, private, and automated** inheritance system for your Bitcoin (via Starknet bridged assets like Endur.fi xBTC). 

### How it works:
1. **Secure & Earn**: You lock your wrapped BTC into your personal Ghost Vault smart contract. While locked, your assets aren't just sitting idle; they generate passive yield (e.g., via liquid staking).
2. **The Heartbeat (Dead Man's Switch)**: You set a periodic "check-in" interval (e.g., every 30 days). As long as you interact with the vault ("ping" it) before the timer runs out, you prove you are alive, and the vault remains locked and yielding.
3. **Trustless Execution**: If you fail to check in and the countdown hits zero, the Dead Man's Switch is triggered. Anyone can call the `trigger_inheritance` function, which automatically and instantly transfers 100% of your principal and accumulated yield to your predefined beneficiary address.

## Hackathon Narrative Alignment
* **Privacy Track**: Inheritance is a profoundly private matter. By building on Starknet, Ghost Vault utilizes STARK proofs to ensure that the underlying execution logic and state transitions inherit Ethereum's security without exposing all operational mechanisms to the surface level, paving the way for further confidential transaction integrations.
* **Bitcoin Track**: Ghost Vault is designed as a BTC-native DeFi primitive on Starknet. It turns sterile Bitcoin into productive, yield-bearing assets (via Endur.fi or OP_CAT extensions in the future) while solving the biggest UX hurdle of Bitcoin self-custody: generational wealth transfer.

## Features
- **Non-custodial**: You are the only one who can deposit, withdraw (while alive), and claim yield.
- **Yield-Bearing**: Your inheritance fund grows over time.
- **Fully On-Chain**: No centralized servers or oracles are managing the Dead Man's Switch. The Starknet blockchain is the single source of truth for time and execution.
- **Dynamic UI**: A beautiful, responsive frontend that visually communicates the urgency of the check-in period.

## Deployed Addresses (Starknet Sepolia Testnet)
* **Ghost Vault Contract**: `0x00306da04dc6bec5325b9a9c0137664d77b61bdfafbaffa37a854b9967a3d9e4`

## Local Development
```bash
git clone https://github.com/yoiioy700/ghost-vault.git
cd ghost-vault/frontend
yarn install
yarn dev
```
