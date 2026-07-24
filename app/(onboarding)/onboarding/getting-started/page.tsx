import { Logo } from "@/components/ui/logo";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

export const dynamic = "force-dynamic";

export default function GettingStartedStep() {
  return (
    <div className="card-surface p-12 py-16 relative overflow-hidden flex flex-col items-center text-center">
       {/* Background Decoration */}
       <div className="absolute -top-24 -right-24 w-64 h-64 bg-sys-primary opacity-5 rounded-full blur-3xl pointer-events-none" />
       
       <div className="icon-container-primary mb-6">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
           <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.433 4.433 0 002.708-2.708 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
         </svg>
       </div>
       
       <h2 className="text-headline-large mb-4">Let&apos;s get you set up!</h2>
       <p className="text-title-small opacity-70 max-w-lg mb-10">
         We&apos;ve designed a quick and simple process to get your account fully operational. You&apos;ll be sending campaigns in no time.
       </p>
       
       <div className="bg-neutral-variant-container text-left p-6 flex flex-col gap-6 rounded-xl border border-neutral-variant w-full max-w-lg mb-8 relative z-10">
         <div className="flex gap-4 items-start">
           <div className="w-8 h-8 flex items-center justify-center rounded-full bg-sys-primary text-white font-bold flex-shrink-0">1</div>
           <div>
             <h4 className="text-title-small font-semibold">Connect WhatsApp</h4>
             <p className="opacity-70 text-body-small">Link your WhatsApp Business Account so you can send and receive messages directly through Send Signal.</p>
           </div>
         </div>
         
         <div className="flex gap-4 items-start">
           <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-neutral-variant text-neutral-500 font-bold flex-shrink-0">2</div>
           <div>
             <h4 className="text-title-small font-semibold opacity-60">Import Leads</h4>
             <p className="opacity-50 text-body-small">Upload your contacts seamlessly to start building your audience.</p>
           </div>
         </div>
         
         <div className="flex gap-4 items-start">
           <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-neutral-variant text-neutral-500 font-bold flex-shrink-0">3</div>
           <div>
             <h4 className="text-title-small font-semibold opacity-60">Create Templates</h4>
             <p className="opacity-50 text-body-small">Set up your first outreach message template to engage your fresh leads.</p>
           </div>
         </div>
       </div>

       <div className="w-full max-w-lg">
         <OnboardingNavigation 
           backUrl="/onboarding/welcome" 
           nextUrl="/onboarding/whatsapp" 
         />
       </div>
    </div>
  );
}
