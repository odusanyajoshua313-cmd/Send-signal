export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import prisma from "@/lib/prisma";
import { Logo } from "@/components/ui/logo";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";

import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

  if (error || !supabaseUser) {
    redirect('/login');
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: supabaseUser.id } });
    if (!user) {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-onboarding-container">
       <header className="border-b py-4 px-8 flex justify-between items-center border-neutral-variant">
           <Logo size={32} />
           
           <div className="text-body-small opacity-60">
             Account Setup
           </div>
       </header>
       <ProgressIndicator />
       <main className="max-w-3xl mx-auto py-12 px-6">
         {children}
       </main>
    </div>
  );
}
