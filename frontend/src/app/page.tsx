"use client";

import { useState } from "react";
import PageContent from "./page-content";
import SetupWizard from "@/components/SetupWizard";
import Dashboard from "@/components/Dashboard";

export default function Page() {
  const [view, setView] = useState<"home" | "setup" | "dashboard">("home");

  return (
    <div className="min-h-screen relative text-white">
      <div className="w-full absolute top-0 left-0 p-6 flex justify-between items-center z-50">
        <div className="font-bold text-xl tracking-tighter cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setView("home")}>
          GHOST<span className="text-brand-500">VAULT</span>
        </div>
      </div>

      <div className="pt-20">
        {view === "home" && <PageContent onNavigate={setView} />}
        {view === "setup" && <SetupWizard />}
        {view === "dashboard" && <Dashboard />}
      </div>
    </div>
  );
}
