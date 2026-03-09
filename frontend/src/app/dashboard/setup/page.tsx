"use client";

import SetupWizard from "@/components/SetupWizard";

export default function SetupPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-[1000px] mx-auto w-full pt-12">
                <SetupWizard />
            </div>
        </div>
    );
}
