"use client";

import { usePathname } from "next/navigation";

const STEPS = [
  { path: "/onboarding/welcome", label: "Welcome" },
  { path: "/onboarding/getting-started", label: "Getting Started" },
  { path: "/onboarding/whatsapp", label: "Connect" },
  { path: "/onboarding/import", label: "Import" },
  { path: "/onboarding/template", label: "Template" },
];

export function ProgressIndicator() {
  const pathname = usePathname();
  
  const isComplete = pathname === "/onboarding/complete";
  const currentIndex = isComplete ? STEPS.length : STEPS.findIndex(s => pathname.startsWith(s.path));
  const progressPercent = (currentIndex / (STEPS.length - 1)) * 100;
  
  if (!isComplete && currentIndex === -1) return null;

  return (
    <div className="w-full max-w-2xl mx-auto pt-8 pb-4 px-6 animate-in fade-in duration-700">
      <style>{`.progress-fill { width: ${progressPercent}% }`}</style>
      <div className="flex items-center justify-between relative">
        {/* Background Track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[6px] rounded-full bg-neutral-90" />
        
        {/* Fill Track */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] progress-fill"
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex || isComplete;
          const isCurrent = idx === currentIndex && !isComplete;
          
          return (
            <div key={idx} className="flex flex-col items-center gap-2 relative z-10 w-12 cursor-default">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-4 ${
                  isCompleted || isCurrent 
                    ? "bg-blue-600 border-blue-100 text-white shadow-lg" 
                    : "bg-white border-neutral-90 text-neutral-400"
                } ${
                  isCurrent ? "scale-110 ring-4 ring-blue-500/20" : "scale-100"
                }`}
              >
                {isCompleted ? (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white animate-in zoom-in duration-300">
                     <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                   </svg>
                ) : (
                  idx + 1
                )}
              </div>
              
              {/* Floating label */}
              <div 
                className={`absolute top-12 whitespace-nowrap text-xs font-semibold px-2 py-1 rounded-md transition-all duration-300 pointer-events-none ${
                  isCurrent 
                    ? "opacity-100 translate-y-0 text-blue-600" 
                    : "opacity-0 translate-y-2"
                }`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Step Counter - matching image placement */}
      <div className="text-center mt-12 mb-4">
        <p className="text-label-medium opacity-60 font-bold uppercase tracking-widest animate-in slide-in-from-top-2 duration-700">
          Step {isComplete ? STEPS.length : currentIndex + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
