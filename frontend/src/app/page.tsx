"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Clock, EyeOff, Bot } from "lucide-react";
import { GhostVaultLogo } from "@/components/GhostVaultLogo";

// ─── FAQ Data ────────────────────────────────────────────────
const faqs = [
  {
    q: "What happens if I miss a check-in?",
    a: "If you miss your check-in window, a grace period begins. After the grace period expires, your designated beneficiary can withdraw the vault funds. You can always check in again during the grace period to reset the timer.",
  },
  {
    q: "Can I change my beneficiary later?",
    a: "Yes. You can update your beneficiary address at any time through the dashboard. The change takes effect immediately.",
  },
  {
    q: "What tokens does Ghost Vault support?",
    a: "Currently, Ghost Vault natively supports STRK tokens on the Starknet network. More tokens like ETH, xBTC, and USDC will be supported in future updates.",
  },
  {
    q: "Is my vault truly private?",
    a: "We utilize stealth address mechanics at the smart contract level to obscure the link between the vault creator and the final beneficiary, ensuring your on-chain inheritance remains private.",
  },
];

// ─── Animation Variants ──────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

// ─── Component ───────────────────────────────────────────────
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-purple-500/30 font-sans overflow-hidden">
      
      {/* ━━━ NAV ━━━ */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none bg-black/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 transition-colors">
              <GhostVaultLogo className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Ghost Vault
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="/docs" className="hover:text-white transition-colors">Docs</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn-primary py-2.5 px-5 text-sm">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <section className="relative min-h-[100svh] flex items-center justify-center pt-20">
        {/* Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-[120px] opacity-70" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-purple-500/20">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-purple-200">LIVE ON STARKNET</span>
            </motion.div>

            <motion.h1 
              variants={fadeUp}
              className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-[1.05] mb-8"
            >
              Your Crypto Legacy,<br/>
              <span className="text-gradient">Protected Forever</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Privacy-first inheritance vault on StarkNet. No backend.<br className="hidden sm:block"/> No trust. Just code.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link href="/dashboard/setup" className="btn-primary w-full sm:w-auto text-base px-8 py-4">
                Launch App
              </Link>
              <a href="#how-it-works" className="btn-secondary w-full sm:w-auto text-base px-8 py-4">
                Learn More
              </a>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ━━━ BACKED BY ━━━ */}
      <div className="border-y border-white/[0.05] bg-black/50 backdrop-blur-sm relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-semibold mb-8">Backed by</p>
          <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-8">

            {/* Starknet Foundation */}
            <a href="https://www.starknet.io" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity duration-200 group">
              <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4L44 37H4L24 4Z" fill="white" opacity="0.9"/>
                <circle cx="24" cy="32" r="6" fill="#0A0A0F"/>
              </svg>
              <span className="text-sm font-semibold text-zinc-300 tracking-tight">Starknet Foundation</span>
            </a>

            {/* StarkWare */}
            <a href="https://starkware.co" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity duration-200 group">
              <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="16" height="16" rx="3" fill="white" opacity="0.9"/>
                <rect x="26" y="6" width="16" height="16" rx="3" fill="white" opacity="0.5"/>
                <rect x="6" y="26" width="16" height="16" rx="3" fill="white" opacity="0.5"/>
                <rect x="26" y="26" width="16" height="16" rx="3" fill="white" opacity="0.9"/>
              </svg>
              <span className="text-sm font-semibold text-zinc-300 tracking-tight">StarkWare</span>
            </a>

            {/* OpenZeppelin */}
            <a href="https://openzeppelin.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity duration-200 group">
              <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 6C14.059 6 6 14.059 6 24C6 33.941 14.059 42 24 42C33.941 42 42 33.941 42 24C42 14.059 33.941 6 24 6Z" stroke="white" strokeWidth="2.5" opacity="0.9"/>
                <path d="M17 24C17 20.134 20.134 17 24 17C27.866 17 31 20.134 31 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                <circle cx="24" cy="31" r="3" fill="white" opacity="0.9"/>
              </svg>
              <span className="text-sm font-semibold text-zinc-300 tracking-tight">OpenZeppelin</span>
            </a>

            {/* Xverse */}
            <a href="https://www.xverse.app" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity duration-200 group">
              <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8L22 24L8 40H16L24 30L32 40H40L26 24L40 8H32L24 18L16 8H8Z" fill="white" opacity="0.9"/>
              </svg>
              <span className="text-sm font-semibold text-zinc-300 tracking-tight">Xverse</span>
            </a>

          </div>
        </div>
      </div>

      {/* ━━━ MARQUEE ━━━ */}
      <div className="w-full overflow-hidden bg-purple-900/10 border-b border-white/[0.05] py-4 relative z-20">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 mx-4 text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
              <span>Privacy-First</span> <span className="text-purple-500/50">•</span>
              <span>Fully On-Chain</span> <span className="text-purple-500/50">•</span>
              <span>Zero Backend</span> <span className="text-purple-500/50">•</span>
              <span>AI-Powered</span> <span className="text-purple-500/50">•</span>
              <span>StarkNet Native</span> <span className="text-purple-500/50">•</span>
              <span>Autonomous Inheritance</span> <span className="text-purple-500/50">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━ BENTO GRID FEATURES ━━━ */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32 relative z-20">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Why Ghost Vault?</h2>
          <p className="mt-4 text-zinc-400 text-lg">Engineered for security, built for peace of mind.</p>
        </motion.div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]"
        >
          {/* Main Large Card */}
          <motion.div variants={fadeUp} className="lg:col-span-2 lg:row-span-2 glass-panel p-10 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10">
              <Clock className="w-7 h-7 text-purple-400" />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Dead Man's Switch</h3>
              <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
                Automated inheritance triggered entirely on-chain. If you stop checking in within your defined timeframe, your assets safely transfer to your beneficiary.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-panel p-8 flex flex-col justify-between group">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">100% On-Chain</h3>
              <p className="text-sm text-zinc-400">Zero backend servers. All state logic and execution occurs directly on StarkNet.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-panel p-8 flex flex-col justify-between group">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <EyeOff className="w-6 h-6 text-zinc-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Privacy First</h3>
              <p className="text-sm text-zinc-400">Stealth addresses ensure the connection between you and your beneficiary remains hidden.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-panel p-8 flex flex-col justify-between group md:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">AI Guardian</h3>
              <p className="text-sm text-zinc-400">An intelligent agent that monitors your vault health and manages active yield strategies.</p>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* ━━━ HOW IT WORKS STEPS ━━━ */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-32 relative z-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-24">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">How It Works</h2>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-4 gap-12 relative"
          >
            {[
              { step: "01", title: "Create Vault", desc: "Deposit STRK and set your check-in interval" },
              { step: "02", title: "Set Beneficiary", desc: "Assign a stealth address as your designated heir" },
              { step: "03", title: "Stay Active", desc: "Check in periodically to prove you're around" },
              { step: "04", title: "Auto Inherit", desc: "Miss check-ins? Beneficiary can claim the vault" }
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl glass-panel bg-[#0A0A0F] flex items-center justify-center text-xl font-bold text-white mb-6 relative z-10 border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ LIVE STATS ━━━ */}
      <section className="border-y border-white/[0.05] bg-white/[0.02] relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-3 gap-12 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-center"
          >
            {[
              { val: "100%", label: "On-Chain" },
              { val: "0", label: "Backend Servers" },
              { val: "24/7", label: "Always Protected" }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col items-center justify-center pt-8 sm:pt-0">
                <span className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-gradient">{stat.val}</span>
                <span className="text-sm font-semibold tracking-widest uppercase text-zinc-500">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-32 relative z-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              key={i} className="glass-panel overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-lg font-semibold pr-4">{faq.q}</span>
                <span className="text-2xl font-light text-zinc-500 w-6 flex justify-center">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-2 text-zinc-400 leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ━━━ BOTTOM CTA ━━━ */}
      <section className="max-w-5xl mx-auto px-6 pb-32 relative z-20">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className="glass-panel p-16 sm:p-24 text-center relative overflow-hidden group"
        >
          {/* Animated gradient border simulation */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">Ready to Protect Your Legacy?</h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">
              Start securing your crypto inheritance in minutes. Fully on-chain, entirely under your control.
            </p>
            <Link href="/dashboard/setup" className="btn-primary py-4 px-10 text-lg">
              Launch App
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-white/[0.05] bg-[#050508] relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <GhostVaultLogo className="w-5 h-5 text-zinc-600" />
            <span className="text-sm font-bold text-zinc-400">Ghost Vault</span>
            <span className="text-xs text-zinc-600 ml-4 hidden sm:inline-block">© {new Date().getFullYear()} All rights reserved</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://github.com/Seedstr/ghost-vault" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">GitHub</a>
            <a href="https://docs.ghostvault.xyz" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Docs</a>
            <a href="https://twitter.com/ghostvault" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Twitter/X</a>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Built on StarkNet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
