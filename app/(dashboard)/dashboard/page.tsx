import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

  if (error || !supabaseUser) {
    redirect("/login");
  }

  const userId = supabaseUser.id;
  let companyName = "Send Signal";

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyName: true }
    });

    if (user) {
      companyName = user.companyName;
    }
  } catch {
    redirect("/login");
  }

  return <DashboardView userId={userId} companyName={companyName} />;
}
