import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

import { Logo } from "@/components/ui/logo";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

export default async function OnboardingWelcomeStep() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  let companyName = "there";

  if (supabaseUser) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: supabaseUser.id },
        select: { companyName: true }
      });
      if (user) {
        companyName = user.companyName;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="card-surface flex flex-col items-center justify-center text-center p-12 py-20 relative overflow-hidden">
       {/* Logo overlay/decoration */}
       <div className="absolute top-8 left-8">
          <Logo size={32} showText={false} />
       </div>

       <div className="welcome-icon">
          👋
       </div>
       <h1 className="text-headline-large mb-4">Welcome, {companyName}!</h1>
       <p className="text-title-small opacity-70 max-w-lg mb-10">
         Send Signal helps you automate personalized WhatsApp campaigns to instantly turn cold leads into warm interactions.
       </p>
       
       <div className="bg-primary-container text-left p-6 rounded-xl border border-primary w-full max-w-lg mb-8">
         <h3 className="text-title-medium mb-3 text-on-primary-container">What Send Signal is about</h3>
         <p className="text-body-medium text-on-primary-container opacity-90 leading-relaxed">
           Send Signal is your ultimate outreach automation platform. It is designed to help you transform cold leads into warm, engaged interactions by enabling you to send highly personalized WhatsApp campaigns seamlessly at scale.
         </p>
       </div>

       <div className="w-full max-w-lg">
         <OnboardingNavigation nextUrl="/onboarding/getting-started" />
       </div>
    </div>
  );
}
