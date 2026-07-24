"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";
import { saveWhatsappConnection } from "@/lib/onboarding/actions";

type ConnectionStatus = "idle" | "connecting" | "connected" | "failed";

export default function OnboardingWhatsappStep() {
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [manualDetails, setManualDetails] = useState({
    phoneNumberId: "",
    accessToken: "",
  });

  const handleManualSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setStatus("connecting");
    
    const res = await saveWhatsappConnection({
      phoneNumberId: manualDetails.phoneNumberId,
      accessToken: manualDetails.accessToken,
    });

    if (res.success) {
      setStatus("connected");
    } else {
      setStatus("failed");
    }
  };

  const isManualFormValid = 
    manualDetails.phoneNumberId && 
    manualDetails.accessToken;

  const isFormEmpty = 
    !manualDetails.phoneNumberId && 
    !manualDetails.accessToken;

  // Determination of the Next/Skip label
  const nextLabel = (isFormEmpty && status === "idle") ? <span>Skip</span> : "Next";

  return (
    <div className="card-surface p-10 flex flex-col h-full w-full max-h-[85vh]">
      <div className="flex flex-col gap-6 mb-8 flex-grow overflow-y-auto pr-2 scrollbar-thin">
        
        {status !== "connected" && status !== "failed" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-headline-medium font-bold text-neutral-variant-10 transition-colors">Connect WhatsApp Business API</h1>
              <button 
                type="button" 
                onClick={() => setManualDetails({ phoneNumberId: "MOCK_PHONE_123", accessToken: "MOCK_TOKEN_999" })}
                className="text-label-small font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 transition"
              >
                Auto-fill Mock Data
              </button>
            </div>
            <p className="text-body-medium opacity-60 mb-6 transition-opacity">
              To send messages, you need to connect your WhatsApp Business Account. For this setup, we&apos;ll mock the connection.
            </p>
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-6 w-full">
              <div className="flex flex-col gap-2">
                <label className="text-body-large font-bold text-neutral-variant-20">WhatsApp Phone Number ID</label>
                <input 
                  type="text" 
                  className="input-field h-12 text-body-large border-neutral-variant-80 focus:border-blue-500 transition-colors" 
                  placeholder="e.g. 1042738491..."
                  value={manualDetails.phoneNumberId}
                  onChange={(e) => setManualDetails({...manualDetails, phoneNumberId: e.target.value})}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-body-large font-bold text-neutral-variant-20">System User Access Token</label>
                <input 
                  type="password" 
                  className="input-field h-12 text-body-large border-neutral-variant-80 focus:border-blue-500 transition-colors" 
                  placeholder="EAAGm0..."
                  value={manualDetails.accessToken}
                  onChange={(e) => setManualDetails({...manualDetails, accessToken: e.target.value})}
                  required
                />
              </div>
            </form>
          </div>
        )}

        {(status === "connected" || status === "failed") && (
          <div className="flex flex-col items-center justify-center gap-6 py-10 animate-in fade-in zoom-in-95 duration-500 flex-grow">
             {status === "connected" ? (
               <>
                 <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center text-success mb-2 border border-success/30">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                   </svg>
                 </div>
                 <div className="text-center">
                   <h2 className="text-headline-small text-success font-bold mb-2">Account Connected!</h2>
                   <p className="text-body-large opacity-60">Your WhatsApp Business API is successfully linked.</p>
                 </div>
               </>
             ) : (
               <>
                 <div className="w-20 h-20 rounded-full bg-error/15 flex items-center justify-center text-error mb-2 border border-error/30">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                   </svg>
                 </div>
                 <div className="text-center">
                   <h2 className="text-headline-small text-error font-bold mb-2">Connection Failed</h2>
                   <p className="text-body-large opacity-60 mb-6">We couldn&apos;t verify your credentials.</p>
                   <button onClick={() => setStatus("idle")} className="btn-outline font-bold px-8">Try Again</button>
                 </div>
               </>
             )}
          </div>
        )}
      </div>

      <OnboardingNavigation
        backUrl="/onboarding/getting-started"
        nextUrl={status === "connected" ? "/onboarding/import" : undefined}
        onNext={() => {
          if (status === "connected" || isFormEmpty) {
            router.push("/onboarding/import");
            return;
          }
          if (isManualFormValid) {
            handleManualSubmit();
          } else {
            const form = document.querySelector('form');
            form?.reportValidity();
          }
        }}
        nextLabel={nextLabel}
      />

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
