import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-landing)] text-[var(--text-dark)] font-sans selection:bg-amber-500/30">

            {/* ---------------- NAVIGATION ---------------- */}
            <nav className="fixed top-0 inset-x-0 h-16 bg-[var(--bg-landing)]/80 backdrop-blur-md border-b border-[var(--border-landing)] z-50 flex items-center justify-between px-6 md:px-12">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-primary)]">
                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight text-[var(--text-dark)]">Ghost Vault</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm font-medium text-[var(--text-dark-muted)] hover:text-[var(--text-dark)] transition-colors">
                        App
                    </Link>
                    <Link href="/dashboard" className="px-5 py-2.5 bg-[var(--text-dark)] hover:bg-black text-[var(--bg-landing)] text-sm font-semibold rounded-full transition-colors flex items-center gap-2 shadow-sm">
                        Launch App
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-24">

                {/* ---------------- HERO SECTION ---------------- */}
                <section className="px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center mb-32 animate-fade-in-up">
                    <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-[var(--text-dark)] mb-6 max-w-4xl leading-[1.1]">
                        Your Crypto Legacy, <br className="hidden md:block" /><span className="text-amber-500">Automated.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--text-dark-muted)] mb-10 max-w-2xl leading-relaxed">
                        Secure your Starknet assets with a trustless Dead Man's Switch protocol. Pass on your wealth automatically without relying on trusted third parties.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black text-base font-semibold rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/20">
                            Secure Your Legacy
                        </Link>
                        <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[var(--border-landing)] hover:bg-black/5 text-[var(--text-dark)] text-base font-medium rounded-full transition-colors">
                            How it Works
                        </a>
                    </div>
                </section>

                {/* ---------------- PRODUCT DEMO / DASHBOARD PREVIEW ---------------- */}
                <section className="px-4 md:px-12 max-w-5xl mx-auto mb-32">
                    <div className="rounded-[32px] bg-[#0F1011] p-2 md:p-4 shadow-2xl ring-1 ring-[#23252A] overflow-hidden">
                        <div className="rounded-[24px] overflow-hidden border border-[#23252A] bg-[#161718] relative aspect-video flex flex-col">
                            {/* Fake browser bar */}
                            <div className="h-12 border-b border-[#23252A] bg-[#0F1011] flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#3E3E44]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#3E3E44]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#3E3E44]"></div>
                                </div>
                                <div className="mx-auto flex h-6 w-1/3 items-center justify-center rounded-md bg-[#1E1F21] text-[10px] text-zinc-500 font-mono">
                                    app.ghostvault.io/dashboard
                                </div>
                            </div>
                            {/* Fake App Content */}
                            <div className="flex-1 p-6 relative">
                                <div className="h-6 w-32 bg-[#23252A] rounded mb-8"></div>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="h-32 bg-[#1E1F21] rounded-xl border border-[#23252A]"></div>
                                    <div className="h-32 bg-[#1E1F21] rounded-xl border border-[#23252A]"></div>
                                    <div className="h-32 bg-red-950/30 rounded-xl border border-red-500/20"></div>
                                </div>
                                <div className="h-48 bg-[#1E1F21] rounded-xl border border-[#23252A]"></div>

                                {/* Overlay gradient to keep focus on hero */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#161718] via-transparent to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------------- TRUST BAR ---------------- */}
                <section className="border-y border-[var(--border-landing)] py-12 mb-32 bg-[var(--bg-landing-card)]">
                    <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div>
                            <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--text-dark-muted)] mb-2">Built on Starknet</h3>
                            <p className="font-display text-2xl font-semibold text-[var(--text-dark)]">Leveraging zk-Rollup security</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-12">
                            <div className="flex flex-col">
                                <span className="font-display text-4xl font-bold text-black mb-1">100%</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dark-muted)]">Non-Custodial</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display text-4xl font-bold text-black mb-1">0</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dark-muted)]">Middlemen</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display text-4xl font-bold text-black mb-1">~4.2%</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dark-muted)]">Idle Yield (APY)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------------- HOW IT WORKS ---------------- */}
                <section id="how-it-works" className="max-w-6xl mx-auto px-6 md:px-12 mb-32">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl font-bold tracking-tight text-[var(--text-dark)] mb-4">How Ghost Vault Works</h2>
                        <p className="text-[var(--text-dark-muted)] max-w-2xl mx-auto text-lg hover:text-red-500 transition-colors">A simple principle to solve the definitive crypto problem.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Step 1 */}
                        <div className="bg-[var(--bg-landing-card)] p-8 rounded-[24px]">
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md">1</div>
                            <h3 className="font-display text-xl font-bold mb-3">Initialize & Deposit</h3>
                            <p className="text-[var(--text-dark-muted)] leading-relaxed">Create your vault contract on Starknet and deposit your assets (xBTC, STRK, ETH). Your funds are immediately secured and start earning yield.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="bg-[var(--bg-landing-card)] p-8 rounded-[24px]">
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md">2</div>
                            <h3 className="font-display text-xl font-bold mb-3">Set Beneficiary</h3>
                            <p className="text-[var(--text-dark-muted)] leading-relaxed">Designate a wallet address that will inherit your assets. Define the countdown period (e.g., 90 days) for the dead man's switch.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="bg-[var(--bg-landing-card)] p-8 rounded-[24px]">
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md">3</div>
                            <h3 className="font-display text-xl font-bold mb-3">Automated Transfer</h3>
                            <p className="text-[var(--text-dark-muted)] leading-relaxed">Check in periodically via the dashboard. If the timer expires before your next check-in, 100% of the vault is automatically transferred.</p>
                        </div>
                    </div>
                </section>

                {/* ---------------- CTA ELEVATED ---------------- */}
                <section className="max-w-4xl mx-auto px-6 md:px-12 mb-20">
                    <div className="bg-[#0F1011] rounded-[32px] p-12 md:p-16 text-center shadow-xl border border-[#23252A] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>

                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white mb-6 relative z-10">
                            Ready to secure your digital wealth?
                        </h2>
                        <p className="text-zinc-400 mb-10 max-w-lg mx-auto relative z-10">
                            Deploy your smart contract vault today and ensure your crypto is never lost forever.
                        </p>
                        <div className="flex justify-center relative z-10">
                            <Link href="/dashboard" className="px-8 py-4 bg-white hover:bg-zinc-200 text-black text-base font-semibold rounded-full transition-colors">
                                Launch Dashboard
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            {/* ---------------- FOOTER ---------------- */}
            <footer className="bg-[#0A0A0A] text-zinc-500 py-12 border-t border-[#1A1A1A]">
                <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#111] flex items-center justify-center border border-white/5">
                            <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <span className="font-display font-medium text-sm text-zinc-400">Ghost Vault</span>
                    </div>
                    <div className="text-sm">
                        Built for the Redefine Hackathon 2026.
                    </div>
                </div>
            </footer>
        </div>
    );
}
