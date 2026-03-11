<div align="center">
  <img src="https://raw.githubusercontent.com/yoiioy700/ghost-vault/main/frontend/public/logo.svg" alt="Ghost Vault Logo" width="180" />

  # Ghost Vault

  **A Decentralized Dead-Man's Switch & Inheritance Protocol Built on Starknet**

  [![Starknet](https://img.shields.io/badge/Starknet-Network-blueviolet?style=flat-square&logo=starknet)](https://starknet.io/)
  [![Cairo](https://img.shields.io/badge/Cairo-1.0-orange?style=flat-square)](https://docs.cairo-lang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
</div>

---

## Overview

Ghost Vault is a trustless, privacy-preserving inheritance protocol that utilizes a chronological heartbeat mechanism on the Starknet blockchain. It solves the critical issue of self-custody asset loss by acting as a decentralized dead-man's switch.

Users deploy a vault, lock their assets, and designate a beneficiary address. As long as the primary owner performs a periodic on-chain "check-in," the assets remain mathematically secured. If the check-in deadline and subsequent grace period expire without activity, the smart contract permits the designated beneficiary to claim the vault's contents.

### Technical Highlights

- **The Heartbeat Mechanism:** Cryptographically reset the vault's timelock with a low-cost Starknet transaction.
- **Trustless Execution:** Asset transfer logic is strictly enforced by Cairo smart contracts, requiring zero intermediary trust.
- **Yield Integration:** Architected to support native yield generation on deposited assets while they remain locked.
- **Starknet Scalability:** Leverages ZK-Rollup architecture to ensure low gas footprint for frequent heartbeat transactions.
- **Optimized Client Interface:** Responsive, client-side application utilizing Next.js App Router, Tailwind CSS v4, and modern Starknet wallet connectors.

---

## Tech Stack

### Protocol (Smart Contracts)
- **Language:** Cairo 1.0
- **Framework:** Scarb
- **Testing & Tooling:** Starknet Foundry (`snforge`, `sncast`)

### Client Application (Frontend)
- **Framework:** Next.js (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion
- **Web3 Integration:** Starknet.js, StarknetKit, `@starknet-react/core`
- **Package Manager:** Yarn

---

## Architecture Flow

The standard lifecycle of a Ghost Vault operates as follows:

1. **Vault Configuration:** User initiates the vault, defining the `check_in_period` (e.g., 90 days), `grace_period`, and the `beneficiary_address`.
2. **Asset Allocation:** Standard Starknet tokens (implementing the `u256` interface) are deposited and locked within the contract.
3. **Heartbeat Maintenance:** The owner executes the `checkin()` function periodically before the deadline to maintain control.
4. **Inheritance Trigger:** If the maximum time threshold is breached, the beneficiary gains the right to execute `trigger_inheritance()` and withdraw the assets.

---

## Local Development

### Prerequisites
Ensure you have the following dependencies active in your environment:
- Node.js (v18+) & Yarn
- Scarb (Cairo package manager)
- Starknet Foundry

### 1. Repository Setup
```bash
git clone https://github.com/yoiioy700/ghost-vault.git
cd ghost-vault
```

### 2. Smart Contracts Environment
Navigate to the contracts directory to compile or test the Cairo codebase.
```bash
cd contracts

# Compile the Cairo contracts
scarb build

# Execute the test suite
snforge test
```

> **Note:** For deployment to Starknet Sepolia/Mainnet, configure your `snfoundry.toml` with the appropriate RPC node and execute `sncast declare` followed by `sncast deploy`.

### 3. Frontend Environment
Navigate to the frontend directory to initialize the local server.
```bash
cd ../frontend

# Install node dependencies
yarn install

# Initialize local development environment
yarn dev
```

Access `http://localhost:3000` to view the client application. Ensure you have Argent X or Braavos installed in your browser to test transaction signing.
