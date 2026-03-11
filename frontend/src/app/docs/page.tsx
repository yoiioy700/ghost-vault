"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { GhostVaultLogo } from "@/components/GhostVaultLogo";

const CONTRACT_ADDRESS = "0x0315fb4e47f77a02df237a55538e35cfdafb2b32920e9b942fbcd3791f18e0c4";

const NAV_ITEMS = [
  { id: "introduction", label: "Introduction" },
  { id: "how-it-works", label: "How It Works" },
  { id: "smart-contract", label: "Smart Contract" },
  { id: "architecture", label: "Architecture" },
  { id: "stealth-addresses", label: "Stealth Addresses" },
  { id: "tokenomics", label: "Tokenomics" },
  { id: "faq", label: "FAQ" },
  { id: "roadmap", label: "Roadmap" },
];

const FAQS = [
  {
    q: "What happens if I don't check in?",
    a: "Once your check-in window expires, the vault enters an inheritable state. Your designated beneficiary can then call trigger_inheritance to claim the vault funds.",
  },
  {
    q: "Can I change my beneficiary later?",
    a: "Yes, as the vault owner you can update the beneficiary address at any time while the vault is active.",
  },
  {
    q: "What tokens does Ghost Vault support?",
    a: "Currently STRK on StarkNet Sepolia testnet. Multi-token support is planned for future releases.",
  },
  {
    q: "Is my vault truly private?",
    a: "Ghost Vault uses stealth addresses to break the on-chain link between owner and beneficiary. Third parties cannot determine who will inherit your vault.",
  },
  {
    q: "What happens to my vault if StarkNet goes down?",
    a: "Your vault state is secured on-chain. Once StarkNet resumes, all vault functions continue as normal. No data is lost.",
  },
  {
    q: "Is the contract audited?",
    a: "The contract is currently in hackathon/testnet phase. A formal audit is planned before mainnet deployment.",
  },
];

const CONTRACT_FUNCTIONS = [
  { name: "create_vault", desc: "Create a new vault with deposit and check-in interval" },
  { name: "deposit", desc: "Add more STRK to your vault" },
  { name: "withdraw", desc: "Withdraw funds (owner only, while active)" },
  { name: "check_in", desc: "Reset the dead man's switch timer" },
  { name: "trigger_inheritance", desc: "Beneficiary claims vault after missed check-in" },
  { name: "claim_yield", desc: "Harvest yield from vault deposits" },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-semibold text-zinc-200 pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-4">{a}</p>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileNavOpen(false);
  };

  const sidebarNav = (
    <nav className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium px-3 mb-3">Contents</p>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
            activeSection === item.id
              ? "text-white bg-white/[0.03] border-l-2 border-violet-500 pl-[10px] font-medium"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
          }`}
        >
          {activeSection === item.id && <ChevronRight className="w-3 h-3 text-violet-400 shrink-0" />}
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans" style={{ scrollBehavior: "smooth" }}>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.06),transparent_50%)] pointer-events-none z-0" />

      {/* ─── Top Nav ─── */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center border border-white/[0.08] group-hover:border-violet-500/40 transition-colors">
              <GhostVaultLogo className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors tracking-tight">Ghost Vault</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">App</Link>
            <span className="text-white">Docs</span>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 pt-16 bg-[#0a0a0a] md:hidden">
          <div className="p-6">
            {sidebarNav}
          </div>
        </div>
      )}

      <div className="flex pt-16 relative z-10">
        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden md:flex flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] w-56 bg-[#0a0a0a] border-r border-white/[0.06] z-30 p-4 overflow-y-auto">
          {sidebarNav}
        </aside>

        {/* ─── Main Content ─── */}
        <main className="md:ml-56 flex-1 px-6 md:px-16 py-16 max-w-full">
          <div className="max-w-3xl mx-auto space-y-0">

            {/* ━━━ INTRODUCTION ━━━ */}
            <section id="introduction" className="py-16 border-t border-white/[0.06] first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">Overview</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Introduction</h1>
              <h2 className="text-xl font-semibold text-zinc-300 mb-4">What is Ghost Vault?</h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                A privacy-first inheritance protocol built on StarkNet. Ghost Vault lets you create self-executing crypto vaults that automatically transfer assets to your chosen beneficiary if you become inactive — no lawyers, no middlemen, no trust required.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Ghost Vault leverages Cairo smart contracts to guarantee tamper-proof, autonomous inheritance without any centralized party. Your assets, your rules — enforced by code.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "100% On-Chain", desc: "All state and logic live in the Cairo smart contract. Zero servers." },
                  { label: "Privacy by Default", desc: "Stealth addresses hide the link between owner and beneficiary." },
                  { label: "Self-Executing", desc: "No intervention needed. The contract enforces your wishes autonomously." },
                ].map((c) => (
                  <div key={c.label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-1.5">{c.label}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ━━━ HOW IT WORKS ━━━ */}
            <section id="how-it-works" className="py-16 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">Protocol</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
              <p className="text-zinc-400 leading-relaxed mb-10">Ghost Vault operates as a dead man&apos;s switch — a periodic proof-of-life check that, when missed, triggers autonomous asset transfer.</p>

              <div className="space-y-3 mb-12">
                {[
                  { n: "01", title: "Create a Vault", desc: "Deposit STRK tokens and define your check-in interval (e.g., every 30 days)." },
                  { n: "02", title: "Set a Beneficiary", desc: "Assign a Starknet address as your designated heir using stealth addressing." },
                  { n: "03", title: "Stay Active", desc: "Periodically call check_in to prove you're still alive and reset the timer." },
                  { n: "04", title: "Miss the Deadline", desc: "If you miss the check-in window, the vault enters an inheritable state." },
                  { n: "05", title: "Beneficiary Claims", desc: "The beneficiary calls trigger_inheritance to claim the vault balance." },
                  { n: "06", title: "Automatic Transfer", desc: "The smart contract transfers all vault funds to the beneficiary instantly." },
                ].map((step) => (
                  <div key={step.n} className="flex gap-5 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] group hover:border-white/[0.10] transition-all">
                    <span className="text-xs font-mono font-bold text-violet-500/70 pt-0.5 shrink-0 w-8">{step.n}</span>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">{step.title}</p>
                      <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Flow Diagram */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-6">Check-in Flow</p>
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
                  {[
                    { label: "Owner Deposits", sub: "STRK + beneficiary" },
                    { label: "Timer Starts", sub: "30 / 60 / 90 days" },
                    { label: "Owner Checks In", sub: "Resets timer" },
                    { label: "Timer Expires", sub: "Missed check-in" },
                    { label: "Beneficiary Claims", sub: "Auto-transfer" },
                  ].map((node, i, arr) => (
                    <div key={node.label} className="flex items-center gap-2 w-full md:w-auto">
                      <div className="flex-1 md:flex-none text-center px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] min-w-[96px]">
                        <p className="text-xs font-semibold text-zinc-200">{node.label}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{node.sub}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="hidden md:flex shrink-0 text-zinc-700 text-lg">→</div>
                      )}
                      {i < arr.length - 1 && (
                        <div className="flex md:hidden shrink-0 text-zinc-700">↓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ━━━ SMART CONTRACT ━━━ */}
            <section id="smart-contract" className="py-16 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">Technical</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Smart Contract</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">Built with Cairo 1.0 on StarkNet. Fully open-source, no admin keys, no upgrade proxy — what you deploy is what runs forever.</p>

              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-2">Contract Address (Sepolia Testnet)</p>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 font-mono text-sm text-violet-300 break-all">
                  {CONTRACT_ADDRESS}
                </div>
              </div>

              <div className="mb-10">
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-3">Key Functions</p>
                <div className="overflow-hidden border border-white/[0.06] rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Function</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONTRACT_FUNCTIONS.map((fn, i) => (
                        <tr key={fn.name} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                          <td className="px-5 py-3.5 font-mono text-violet-300 whitespace-nowrap">{fn.name}</td>
                          <td className="px-5 py-3.5 text-zinc-400">{fn.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20">
                <p className="text-sm font-semibold text-emerald-400 mb-1">Security Model</p>
                <p className="text-sm text-zinc-400 leading-relaxed">All state is on-chain. There are no admin keys, no upgrade proxies, and no centralized component that could be compromised. The contract logic is immutable once deployed.</p>
              </div>
            </section>

            {/* ━━━ ARCHITECTURE ━━━ */}
            <section id="architecture" className="py-16 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">System Design</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Architecture</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Zero backend architecture — no servers, no databases. All logic lives in the smart contract, all interaction happens client-side.
              </p>

              {/* Architecture diagram */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-8">
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-8">System Overview</p>
                <div className="flex flex-col gap-4 items-center">
                  {/* Layer 1: User */}
                  <div className="flex gap-4 w-full justify-center">
                    {["ArgentX Wallet", "Braavos Wallet"].map(w => (
                      <div key={w} className="px-4 py-2.5 rounded-lg border border-blue-500/30 bg-blue-500/5 text-xs font-medium text-blue-300 text-center w-36">{w}</div>
                    ))}
                  </div>
                  <div className="text-zinc-700 text-sm">↕ starknet-react</div>
                  {/* Layer 2: Frontend */}
                  <div className="px-6 py-3 rounded-xl border border-violet-500/30 bg-violet-500/5 text-sm font-semibold text-violet-300 w-full max-w-xs text-center">
                    Next.js Frontend
                    <p className="text-[10px] text-violet-500/60 font-normal mt-0.5">starknet-react + starknetkit + Honcho AI</p>
                  </div>
                  <div className="text-zinc-700 text-sm">↕ JSON-RPC</div>
                  {/* Layer 3: StarkNet */}
                  <div className="px-6 py-3 rounded-xl border border-zinc-500/30 bg-zinc-500/5 text-sm font-semibold text-zinc-300 w-full max-w-xs text-center">
                    StarkNet Node (Sepolia)
                  </div>
                  <div className="text-zinc-700 text-sm">↕ Cairo VM</div>
                  {/* Layer 4: Contract */}
                  <div className="px-6 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-sm font-semibold text-emerald-300 w-full max-w-xs text-center">
                    Ghost Vault Cairo Contract
                    <p className="text-[10px] text-emerald-500/60 font-normal mt-0.5">Vault state · Inheritance logic · Yield</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "No Backend", desc: "There is no API server, no database, and no centralized infrastructure." },
                  { label: "Client-side Memory", desc: "User preferences (period, beneficiary) are stored locally via HonchoMemory for UX persistence." },
                  { label: "Multicall Transactions", desc: "Operations like vault creation combine approval, create, and deposit into a single atomic tx." },
                  { label: "Starknet Hooks", desc: "starknet-react provides reactive contract reads and write transactions with auto wallet detection." },
                ].map((item) => (
                  <div key={item.label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-1.5">{item.label}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ━━━ STEALTH ADDRESSES ━━━ */}
            <section id="stealth-addresses" className="py-16 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">Privacy</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Stealth Addresses</h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Standard on-chain transfers expose both the sender and receiver address publicly. Anyone can see that Wallet A transferred funds to Wallet B.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Ghost Vault uses a stealth address scheme so that the link between the vault owner and the beneficiary is hidden. Only the beneficiary can derive the private key needed to claim the inheritance.
              </p>

              {/* Stealth diagram */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-8">
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-6">Privacy Model</p>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">❌ Standard Transfer (Public)</p>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-300">Owner (0xABC)</div>
                      <span className="text-zinc-600 text-sm font-mono">──────────────→</span>
                      <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-300">Beneficiary (0xDEF)</div>
                    </div>
                    <p className="text-xs text-red-400/60 mt-2">On-chain link is visible to anyone</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">✅ Ghost Vault (Private)</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">Owner (0xABC)</div>
                      <span className="text-zinc-600 text-sm font-mono">──→</span>
                      <div className="px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-xs font-mono text-violet-300">Stealth Addr</div>
                      <span className="text-zinc-600 text-sm font-mono">──→</span>
                      <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">Beneficiary</div>
                    </div>
                    <p className="text-xs text-emerald-400/60 mt-2">The stealth address breaks the on-chain link — no observer can connect owner to beneficiary</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-violet-500/[0.05] border border-violet-500/20">
                <p className="text-sm font-semibold text-violet-400 mb-1">Cryptographic Guarantee</p>
                <p className="text-sm text-zinc-400 leading-relaxed">The stealth address is derived from a combination of the owner&apos;s ephemeral key and the beneficiary&apos;s public key. Only the beneficiary can compute the corresponding private key — ensuring exclusive access to the inheritance.</p>
              </div>
            </section>

            {/* ━━━ TOKENOMICS ━━━ */}
            <section id="tokenomics" className="py-16 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">Economics</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Tokenomics</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">Ghost Vault is a protocol-first product. There is no native token. We support existing DeFi tokens on StarkNet.</p>

              <div className="space-y-4">
                {[
                  { label: "Supported Token", value: "STRK (StarkNet Token)", accent: "violet" },
                  { label: "Network", value: "StarkNet Sepolia Testnet (Mainnet planned)", accent: "blue" },
                  { label: "Yield Source", value: "Endur.fi xSTRK integration (~4% APY) — testnet mock for hackathon", accent: "emerald" },
                  { label: "Protocol Fees", value: "None currently. Fee structure to be defined at mainnet launch.", accent: "zinc" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium mb-1">{row.label}</p>
                      <p className="text-sm text-zinc-300">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20">
                <p className="text-sm font-semibold text-amber-400 mb-1">Future Roadmap</p>
                <p className="text-sm text-zinc-400 leading-relaxed">Multi-token support (ETH, xBTC, USDC) and real DeFi yield strategies (Endur, Vesu) are planned for post-hackathon releases.</p>
              </div>
            </section>

            {/* ━━━ FAQ ━━━ */}
            <section id="faq" className="py-16 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">Support</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">FAQ</h2>
              <p className="text-zinc-400 leading-relaxed mb-8">Common questions about how Ghost Vault works.</p>
              <div className="space-y-3">
                {FAQS.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </section>

            {/* ━━━ ROADMAP ━━━ */}
            <section id="roadmap" className="py-16 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-violet-400 font-medium">Vision</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Roadmap</h2>
              <p className="text-zinc-400 leading-relaxed mb-10">Ghost Vault started as a hackathon project and is planned to grow into a full-featured privacy inheritance protocol.</p>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-white/[0.06] hidden sm:block" />
                <div className="space-y-6">
                  {[
                    {
                      phase: "Phase 1",
                      title: "Hackathon MVP",
                      status: "current",
                      items: ["Core vault create + deposit", "Dead man's switch (check-in)", "Beneficiary inheritance trigger", "Stealth address integration", "Yield claim (mock)"],
                    },
                    {
                      phase: "Phase 2",
                      title: "Mainnet Launch",
                      status: "next",
                      items: ["Endur.fi real yield integration", "StarkNet mainnet deployment", "Formal security audit", "Improved UI/UX polishing"],
                    },
                    {
                      phase: "Phase 3",
                      title: "Multi-Token & Privacy V2",
                      status: "future",
                      items: ["ETH, xBTC, USDC vault support", "Stealth address v2 upgrade", "Mobile-first responsive updates", "AI Guardian (Honcho) notifications"],
                    },
                    {
                      phase: "Phase 4",
                      title: "Multi-Chain Expansion",
                      status: "future",
                      items: ["Cross-chain vault bridges", "Advanced DeFi yield strategies", "Social recovery integration", "DAO governance for protocol upgrades"],
                    },
                  ].map((phase, i) => (
                    <div key={phase.phase} className="flex gap-6 sm:pl-12 relative">
                      <div className={`hidden sm:flex absolute left-0 top-1.5 w-8 h-8 rounded-full items-center justify-center text-xs font-bold border shrink-0 ${
                        phase.status === "current"
                          ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                          : phase.status === "next"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-white/[0.03] border-white/[0.08] text-zinc-600"
                      }`}>{i + 1}</div>
                      <div className={`flex-1 p-5 rounded-xl border transition-all ${
                        phase.status === "current"
                          ? "bg-violet-500/[0.05] border-violet-500/20"
                          : "bg-white/[0.02] border-white/[0.06]"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-600">{phase.phase}</span>
                          {phase.status === "current" && (
                            <span className="text-[10px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/30">Current</span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-white mb-3">{phase.title}</h3>
                        <ul className="space-y-1.5">
                          {phase.items.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${phase.status === "current" ? "bg-violet-400" : "bg-zinc-700"}`} />
                              {item}
                              {phase.status === "current" && <span className="text-[10px] text-emerald-500/70 ml-auto">✓</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-16 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                <h3 className="text-xl font-bold mb-2">Ready to try it?</h3>
                <p className="text-sm text-zinc-500 mb-6">Ghost Vault is live on StarkNet Sepolia testnet.</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/dashboard/setup"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    Launch App
                  </Link>
                  <Link href="/"
                    className="px-6 py-2.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 text-sm font-medium transition-all">
                    Back to Home
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
