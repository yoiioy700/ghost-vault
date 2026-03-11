"use client";

import { useState, useEffect } from "react";
import { HonchoMemory } from "@/lib/honcho";

interface AuthLockProps {
  children: (authMode: "real" | "decoy" | "locked") => React.ReactNode;
  skipAuth?: boolean;
}

export default function AuthLock({ children, skipAuth }: AuthLockProps) {
  const [authMode, setAuthMode] = useState<"real" | "decoy" | "locked">(skipAuth ? "real" : "locked");
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState(false);
  
  // We check if PINs are setup in the wizard. If no PINs are found, we bypass auth.
  // In a real app we'd force them to setup a PIN via the Setup Wizard.
  const [hasPinsSet, setHasPinsSet] = useState<boolean | null>(null);
  
  const [mainPin, setMainPin] = useState("");
  const [duressPin, setDuressPin] = useState("");

  useEffect(() => {
    // Check local storage for PIN preferences set during Wizard
    const prefs = HonchoMemory.load("wizard_prefs");
    if (prefs && prefs.mainPIN && prefs.duressPIN) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasPinsSet(true);
      setMainPin(prefs.mainPIN);
      setDuressPin(prefs.duressPIN);
    } else {
      // For testing, if no PINs are setup, we let them through as "real"
      // or we can force them to go to Setup. For now let's bypass.
      setHasPinsSet(false);
      setAuthMode("real"); 
    }
  }, []);

  const handleKeyPress = (digit: string) => {
    if (pinInput.length < 6) {
      setError(false);
      setPinInput((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = () => {
    if (pinInput === mainPin) {
      setAuthMode("real");
    } else if (pinInput === duressPin) {
      setAuthMode("decoy");
    } else {
      setError(true);
      setPinInput("");
    }
  };

  useEffect(() => {
    // Auto-submit if 4-6 digits and it matches exactly
    if (pinInput.length >= 4) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (pinInput === mainPin) setAuthMode("real");
      else if (pinInput === duressPin) setAuthMode("decoy");
    }
  }, [pinInput, mainPin, duressPin]);

  if (hasPinsSet === null) {
    return <div className="min-h-screen bg-[#050507]" />; // Loading state
  }

  if (authMode !== "locked") {
    return <>{children(authMode)}</>;
  }

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
      
      <div className="p-8 text-center rounded-3xl border border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-md max-w-sm w-full relative z-10 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-violet-500/10 mx-auto mb-6 flex items-center justify-center border border-violet-500/20">
          <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Vault Locked</h2>
        <p className="text-sm text-zinc-500 mb-8">Enter your PIN to access your assets.</p>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 mb-8 h-4">
          {[...Array(Math.max(4, mainPin?.length || 6))].map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                i < pinInput.length ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)] scale-110" : "bg-white/[0.06]"
              } ${error ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" : ""}`} 
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium mb-6 animate-bounce">Incorrect PIN. Try again.</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-violet-500/40 text-xl font-semibold text-white transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <div className="h-14" /> {/* Empty bottom left */}
          <button
            onClick={() => handleKeyPress("0")}
            className="h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-violet-500/40 text-xl font-semibold text-white transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-transparent border border-transparent hover:bg-white/[0.05] text-zinc-500 hover:text-red-400 transition-all active:scale-95 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full mt-6 py-4 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 font-semibold rounded-2xl border border-violet-500/30 transition-all opacity-0 pointer-events-none" // Hidden visually, but logic retained
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
