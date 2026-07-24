"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";
import { saveInitialTemplate } from "@/lib/onboarding/actions";

const PREDEFINED_TEMPLATES = [
  {
    name: "Standard Welcome",
    body: "Hi {first_name}, thanks for reaching out to us via {source}! We'd love to learn more about your needs. When are you free for a quick chat?"
  },
  {
    name: "Follow-up",
    body: "Hey {first_name}, just following up on our previous conversation. Have you had a chance to look at the details I sent?"
  },
  {
    name: "Special Offer",
    body: "Hi {first_name}! Special gift from {source} 🎁: Use code SIGNAL20 for 20% off your next order. Valid for 48 hours!"
  }
];

export default function OnboardingTemplateStep() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState(PREDEFINED_TEMPLATES[0].name);
  const [body, setBody] = useState(PREDEFINED_TEMPLATES[0].body);
  const [loading, setLoading] = useState(false);
  
  const insertVariable = (variable: string) => {
    setBody(prev => prev + ` {${variable}}`);
  };

  const selectTemplate = (t: typeof PREDEFINED_TEMPLATES[0]) => {
    setTemplateName(t.name);
    setBody(t.body);
  };

  const handleNext = async () => {
    setLoading(true);
    const res = await saveInitialTemplate({
      name: templateName,
      body: body
    });
    setLoading(false);

    if (res.success) {
      router.push("/onboarding/complete");
    } else {
      alert("Failed to save template. Please try again.");
    }
  };

  return (
    <div className="card-surface p-10 flex flex-col h-full w-full">
       <h1 className="text-headline-medium mb-2">Create Your First Template</h1>
       <p className="text-body-medium opacity-70 mb-8 border-b pb-8">
         Craft a reusable message template with dynamic placeholders to automatically personalize your outreach.
       </p>
       
       <div className="flex flex-col gap-6 mb-12 flex-grow">
          <div className="flex flex-col lg:flex-row gap-12">
             {/* Left Column: Editor */}
             <div className="flex-1 space-y-8">
                {/* Quick Selection */}
                <div className="space-y-3">
                  <label className="text-label-large font-bold text-primary">Quick Selection</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PREDEFINED_TEMPLATES.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => selectTemplate(t)}
                        className={`p-3 text-left border rounded-xl transition text-body-small hover:border-primary ${templateName === t.name ? 'border-primary bg-primary-container/10 ring-1 ring-primary' : 'bg-neutral-99 opacity-70'}`}
                      >
                        <span className="font-bold block mb-1">{t.name}</span>
                        <span className="opacity-60 line-clamp-2">{t.body}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-dashed">
                  <div className="space-y-2">
                    <label className="text-label-large font-medium">Template Name</label>
                    <input 
                      type="text" 
                      title="Template Name"
                      placeholder="Enter template name..."
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="input-field" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-label-large font-medium">Message Body</label>
                      <span className="text-body-small opacity-50">{body.length}/1024</span>
                    </div>
                    <textarea 
                      rows={6}
                      title="Message Body"
                      placeholder="Type your message here..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="input-field resize-none h-48" 
                    />
                    
                    <div className="p-4 border rounded-xl bg-neutral-99 flex flex-wrap gap-2 mt-2">
                       <span className="text-label-small opacity-60 w-full block mb-1 uppercase tracking-tighter font-bold">Dynamic Variables</span>
                       {["first_name", "last_name", "full_name", "source"].map(variable => (
                         <button 
                           key={variable}
                           onClick={() => insertVariable(variable)}
                           className="px-3 py-1.5 bg-white border rounded-lg text-body-small hover:bg-gray-100 transition shadow-sm text-primary border-primary-container font-medium"
                         >
                           {`{${variable}}`}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
             </div>

             {/* Right Column: Immersive Mobile Preview */}
             <div className="flex-shrink-0 flex flex-col items-center">
                <span className="text-label-medium text-center opacity-60 mb-6 uppercase tracking-widest font-bold">Live Preview</span>
                
                <div className="phone-shell">
                   <div className="phone-screen">
                      {/* WhatsApp Status Bar */}
                      <div className="whatsapp-status-bar">
                         <span>10:42</span>
                         <div className="flex gap-1 items-center">
                            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/></svg>
                            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                         </div>
                      </div>

                      {/* WhatsApp Header */}
                      <div className="whatsapp-nav">
                         <div className="w-9 h-9 rounded-full bg-neutral-300 flex-shrink-0 overflow-hidden border border-white/20">
                            <svg viewBox="0 0 24 24" className="w-full h-full fill-white/60"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-bold leading-tight truncate">John Doe</div>
                            <div className="text-[10px] opacity-80">Online</div>
                         </div>
                         <div className="flex gap-4 px-1">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                         </div>
                      </div>

                      {/* WhatsApp Chat Area */}
                      <div className="whatsapp-chat-bg">
                         <div className="whatsapp-bubble animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
                            <div className="whitespace-pre-wrap break-words">
                               {body.replace(/{first_name}/g, 'John').replace(/{source}/g, 'TikTok').replace(/{last_name}/g, 'Doe').replace(/{full_name}/g, 'John Doe')}
                            </div>
                            <div className="whatsapp-time">
                               <span>10:42 AM</span>
                               <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#53bdeb]"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17l-4.24-4.24-1.41 1.41 5.66 5.66L23.66 7l-1.42-1.41zM5 12h1.41l4.24 4.24-1.41 1.41L5 12z"/></svg>
                            </div>
                         </div>
                      </div>

                      {/* WhatsApp Footer Mock */}
                      <div className="p-2 bg-[#f0f2f5] flex items-center gap-2 border-t border-neutral-200">
                        <div className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center text-neutral-400 text-[12px] shadow-sm">
                          Type a message
                        </div>
                        <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center shadow-sm">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <OnboardingNavigation 
         backUrl="/onboarding/import" 
         nextUrl="/onboarding/complete" 
         onNext={handleNext}
         nextLabel={loading ? "Saving..." : "Next"}
       />
    </div>
  );
}
