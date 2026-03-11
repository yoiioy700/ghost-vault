---
sidebar_position: 2
---

# System Architecture

Ghost Vault's architecture is designed to be minimal to reduce attack surfaces, while leveraging Starknet's account abstraction for an optimal user experience.

## Components

The system primarily consists of two main parts:

1. **The Smart Contracts (Cairo 1.0)**
   - Deployed on **Starknet Sepolia** (and Mainnet eventually).
   - Handles the core logical constraints: verifying deposits, tracking timestamps, and enforcing claims.
2. **The Frontend (Next.js & React)**
   - A client-side application hosted on Vercel/similar hosting.
   - Built using `starknet-react` and `starknet.js` to seamlessly interact with user wallets (Argent X, Braavos).

## The Flow of Operations

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Starknet (Controller & Vault)
    participant Beneficiary

    User->>Frontend: Connect Wallet
    User->>Frontend: Enter Beneficiary & Cooldown
    Frontend->>Starknet (Controller & Vault): Deploy new Vault via Multicall
    Starknet (Controller & Vault)-->>Frontend: Vault Deployed
    User->>Frontend: Select amount and Deposit STRK
    Frontend->>Starknet (Controller & Vault): Transfer ERC20 & Register Vault
    
    loop Every few days/weeks
        User->>Frontend: Login and click "Ping"
        Frontend->>Starknet (Controller & Vault): ping() function called, resets timer
    end

    Note over User, Frontend: User becomes inactive...
    Note over Starknet (Controller & Vault): Cooldown period expires

    Beneficiary->>Frontend: Connect Wallet (or via CLI)
    Beneficiary->>Starknet (Controller & Vault): claim() function called
    Starknet (Controller & Vault)-->>Beneficiary: STRK balance transferred to Beneficiary
```

### Data Storage & Indexing
Ghost Vault relies purely on on-chain data currently. Whenever the dashboard loads, the frontend reads directly from the Starknet RPC endpoints to gather information about user vaults, balances, and timestamps.
