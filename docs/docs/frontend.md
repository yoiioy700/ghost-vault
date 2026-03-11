---
sidebar_position: 4
---

# Frontend (Next.js & Setup)

The Ghost Vault frontend is an open-source Next.js App Router application customized with robust Tailwind CSS glassmorphism styling to deliver a modern, fluid user experience.

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- A Starknet wallet extension installed in your browser (e.g., Argent X, Braavos).

### Installation

1. Navigate to the `frontend` directory in the repository.
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
- **Next.js**: Core React framework driving the App Router design (`src/app/page.tsx`).
- **Tailwind CSS**: Rapid UI styling. See `globals.css` for custom color palettes and `tailwind.config.ts`.
- **starknet-react**: Simplifies wallet integrations, allowing developers to use `useAccount`, `useReadContract`, and `useSendTransaction` seamlessly within client components.
- **starknet.js**: The foundational library for encoding standard generic ERC20 interaction scripts and multcall transactions.

## Wallet & Multicall Connectivity
One of the most complex parts of the frontend is creating a vault. During setup, users are typically submitting **multicall** transactions (deploying a new vault, and depositing STRK) natively signed by their Starknet wallet relying on `CallData.compile()`. We utilize `useContract` specifically bound to the provider inside `SetupWizard.tsx`.
