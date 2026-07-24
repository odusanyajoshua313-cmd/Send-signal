"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";
import { importLeads } from "@/lib/leads/actions";

export default function OnboardingImportStep() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      // We'll attempt a "best-guess" auto-mapping for onboarding
      // The user can refine this in the main dashboard later
      const mapping = {
        phoneNumber: "phone", // Common default
        firstName: "first_name",
        lastName: "last_name",
        email: "email"
      };

      const res = await importLeads(formData, mapping);
      
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to import leads. Please ensure your CSV has a 'phone' column.");
        setFile(null);
      }
      setLoading(false);
    }
  };

  return (
    <div className="card-surface p-10 flex flex-col h-full w-full max-h-[85vh]">
      <div className="flex flex-col gap-6 mb-8 flex-grow">
        {!success ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-display-small font-bold mb-2">Import your first leads</h1>
            <p className="text-body-medium opacity-60 mb-10">
              Upload a CSV file with your leads. We&apos;ll help you map the columns in the next step.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <label 
              htmlFor="csv-upload"
              className="group relative flex flex-col items-center justify-center w-full py-16 border-2 border-dashed border-neutral-variant-80 rounded-3xl hover:border-blue-500 hover:bg-[var(--sys-color-roles-pimary-roles-primary-container-color-role)] transition-all duration-300 cursor-pointer"
            >
              <input 
                type="file" 
                accept=".csv"
                id="csv-upload"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-neutral-95 rounded-full text-neutral-variant-30 group-hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <span className="text-title-medium font-bold text-neutral-variant-20">Upload leads (CSV)</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-10 animate-in fade-in zoom-in-95 duration-500 flex-grow">
            <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center text-success mb-2 border border-success/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-headline-small text-success font-bold mb-1">Leads Imported!</h2>
              {file && (
                <p className="text-title-small text-blue-600 font-semibold mb-3 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  {file.name}
                </p>
              )}
              <p className="text-body-large opacity-60">Your lead list has been successfully processed.</p>
            </div>
          </div>
        )}
      </div>

      <OnboardingNavigation
        backUrl="/onboarding/whatsapp"
        nextUrl="/onboarding/template"
        onNext={() => {
          if (success || !file) {
             router.push("/onboarding/template");
          }
        }}
        nextLabel={success ? "Next" : <span>Skip</span>}
      />

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-title-medium font-bold text-neutral-variant-20">Analysing File...</p>
        </div>
      )}

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
