"use client";

import { useState } from "react";
import { parseCsvForPreview, importLeads, CsvPreviewResponse, LeadImportResponse } from "@/lib/leads/actions";

interface ImportLeadsViewProps {
  userId: string;
  onBack: () => void;
}

export function ImportLeadsView({ userId, onBack }: ImportLeadsViewProps) {
  const [step, setStep] = useState<"upload" | "map" | "results">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: ""
  });
  const [results, setResults] = useState<LeadImportResponse | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setFile(selectedFile);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await parseCsvForPreview(formData);
    if (res.success) {
      setPreview(res);
      // Attempt auto-mapping
      if (res.headers) {
        const newMapping = { ...mapping };
        res.headers.forEach(header => {
          const h = header.toLowerCase().replace(/[^a-z]/g, "");
          if (h.includes("first") || h === "fname") newMapping.firstName = header;
          if (h.includes("last") || h === "lname") newMapping.lastName = header;
          if (h.includes("phone") || h.includes("mobile") || h.includes("tel") || h === "number") newMapping.phoneNumber = header;
          if (h.includes("email") || h === "mail") newMapping.email = header;
        });
        setMapping(newMapping);
      }
      setStep("map");
    } else {
      setError(res.error || "Failed to parse CSV.");
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!file || !mapping.phoneNumber) {
      setError("Phone number mapping is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await importLeads(formData, mapping);
    if (res.success) {
      setResults(res);
      setStep("results");
    } else {
      setError(res.error || "Import failed.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Back">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        </button>
        <div>
          <h1 className="text-display-small font-bold">Import Leads</h1>
          <p className="text-body-large opacity-70">Bulk upload your contacts via CSV.</p>
        </div>
      </div>

      <div className="card-surface p-8 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium text-primary">Processing...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-error-container text-error border border-error/20 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <p className="text-label-large">{error}</p>
          </div>
        )}

        {step === "upload" && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-neutral-variant rounded-2xl p-12 text-center hover:border-primary/50 transition-colors group cursor-pointer relative">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                title="CSV File Upload"
                aria-label="Upload CSV File"
              />
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              </div>
              <h3 className="text-title-large font-bold mb-2">Upload CSV File</h3>
              <p className="text-body-medium opacity-60 max-w-xs mx-auto">Drag and drop your file here, or click to browse. Only .csv files are supported.</p>
            </div>
            
            <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10">
              <h4 className="text-title-small font-bold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-secondary">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                CSV Formatting Tips
              </h4>
              <ul className="text-body-small opacity-70 space-y-2 list-disc pl-5">
                <li>Include a header row with descriptive names (e.g., "Phone", "Name").</li>
                <li>Phone numbers should ideally be in international format (e.g., +1234567890).</li>
                <li>Ensure there are no empty rows in the middle of your file.</li>
              </ul>
            </div>
          </div>
        )}

        {step === "map" && preview && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h3 className="text-title-large font-bold mb-2">Map Your Columns</h3>
              <p className="text-body-medium opacity-70">Match the columns from your CSV to our system fields.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Phone Number *", field: "phoneNumber", required: true },
                { label: "First Name", field: "firstName" },
                { label: "Last Name", field: "lastName" },
                { label: "Email Address", field: "email" }
              ].map(item => (
                <div key={item.field} className="flex flex-col gap-2">
                  <label htmlFor={`map-${item.field}`} className="text-label-large font-semibold">{item.label}</label>
                  <select 
                    id={`map-${item.field}`}
                    value={mapping[item.field]} 
                    onChange={e => setMapping({ ...mapping, [item.field]: e.target.value })}
                    className={`input-field bg-neutral-99 ${item.required && !mapping[item.field] ? 'border-error/50' : ''}`}
                    title={`Map ${item.label} to CSV column`}
                    aria-label={`Select CSV column for ${item.label}`}
                  >
                    <option value="">Do not import</option>
                    {preview.headers?.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-title-small font-bold">Data Preview</h4>
              <div className="overflow-x-auto rounded-xl border border-neutral-variant bg-neutral-variant-99">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-variant-95">
                      {preview.headers?.map(header => (
                        <th key={header} className="p-3 text-label-small uppercase font-bold opacity-60 border-b border-neutral-variant whitespace-nowrap">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.previewData?.map((row, i) => (
                      <tr key={i} className="border-b border-neutral-variant last:border-0">
                        {preview.headers?.map(header => (
                          <td key={header} className="p-3 text-body-small whitespace-nowrap">{row[header] || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-8">
              <button onClick={() => setStep("upload")} className="btn-outline px-6">Back</button>
              <button 
                onClick={handleImport} 
                disabled={!mapping.phoneNumber} 
                className="btn-primary px-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Leads
              </button>
            </div>
          </div>
        )}

        {step === "results" && results && (
          <div className="text-center space-y-8 py-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-success-container text-success rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-display-small font-bold mb-2">Import Complete!</h3>
              <p className="text-body-large opacity-70">Your leads have been processed successfully.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 bg-success/5 border border-success/10 rounded-2xl">
                <div className="text-display-medium font-bold text-success mb-1">{results.imported}</div>
                <div className="text-label-medium uppercase opacity-60">Imported</div>
              </div>
              <div className="p-6 bg-warning/5 border border-warning/10 rounded-2xl">
                <div className="text-display-medium font-bold text-warning mb-1">{results.skippedDupes}</div>
                <div className="text-label-medium uppercase opacity-60">Skipped (Dupes)</div>
              </div>
              <div className="p-6 bg-error/5 border border-error/10 rounded-2xl">
                <div className="text-display-medium font-bold text-error mb-1">{results.rejectedInvalid}</div>
                <div className="text-label-medium uppercase opacity-60">Rejected</div>
              </div>
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="text-left p-6 bg-error/5 border border-error/10 rounded-2xl">
                <h4 className="text-title-small font-bold mb-3 text-error">Import Errors (Top {results.errors.length})</h4>
                <ul className="text-body-small opacity-70 space-y-1 list-disc pl-5">
                  {results.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            <div className="pt-8">
              <button onClick={onBack} className="btn-primary px-12 py-3">Finish & View Leads</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
